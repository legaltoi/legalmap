"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabaseClient, CHANNELS, isSupabaseConfigured } from "@/lib/supabase";
import {
  ReportEvent,
  CortegeState,
  ReportCategory,
  SignedCortegePayload,
  AdminZonesState,
  SignedAdminZonesPayload,
} from "@/types";
import { roundCoordinates } from "@/lib/geo";
import { solveProofOfWork } from "@/lib/pow";
import {
  validateInboundReport,
  validateInboundCortege,
  validateInboundAdminZones,
  NANTES_BOUNDS,
} from "@/lib/validation";
import { MAP_UI_CONFIG } from "@/config/mapUi";

interface UseRealtimeOptions {
  onReportReceived?: (report: ReportEvent) => void;
  onCortegeStateReceived?: (state: CortegeState) => void;
  onAdminZonesReceived?: (zones: AdminZonesState) => void;
}

export type RealtimeStatus = "connected" | "connecting" | "offline" | "demo_local";

export function useRealtime({
  onReportReceived,
  onCortegeStateReceived,
  onAdminZonesReceived,
}: UseRealtimeOptions = {}) {
  const [status, setStatus] = useState<RealtimeStatus>(
    isSupabaseConfigured ? "connecting" : "demo_local"
  );
  const [lastPingTime, setLastPingTime] = useState<number>(Date.now());
  const [isSolvingPoW, setIsSolvingPoW] = useState(false);

  // Mémorisation des derniers envois pour le cooldown local anti-rebond (60s par catégorie)
  const categoryCooldownsRef = useRef<Map<ReportCategory, number>>(new Map());

  // Références directes persistantes vers les canaux WebSocket actifs
  const reportsChannelRef = useRef<RealtimeChannel | null>(null);
  const cortegeChannelRef = useRef<RealtimeChannel | null>(null);

  // Sauvegarde des callbacks dans des refs stables
  const onReportRef = useRef(onReportReceived);
  const onCortegeRef = useRef(onCortegeStateReceived);
  const onAdminZonesRef = useRef(onAdminZonesReceived);

  useEffect(() => {
    onReportRef.current = onReportReceived;
  }, [onReportReceived]);

  useEffect(() => {
    onCortegeRef.current = onCortegeStateReceived;
  }, [onCortegeStateReceived]);

  useEffect(() => {
    onAdminZonesRef.current = onAdminZonesReceived;
  }, [onAdminZonesReceived]);

  // Canal miroir local d'appoint (BroadcastChannel Web API)
  const localBcRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel("legalmaps_local_sync");
        localBcRef.current = bc;

        bc.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (type === "NEW_REPORT") {
            const validReport = validateInboundReport(payload);
            if (validReport && onReportRef.current) {
              onReportRef.current(validReport);
            }
          } else if (type === "CORTEGE_STATE") {
            const validCortege = validateInboundCortege(payload);
            if (validCortege && onCortegeRef.current) {
              onCortegeRef.current({
                status: validCortege.data.status,
                head: validCortege.data.head
                  ? { ...validCortege.data.head, updatedAt: validCortege.data.timestamp }
                  : null,
                tail: validCortege.data.tail
                  ? { ...validCortege.data.tail, updatedAt: validCortege.data.timestamp }
                  : null,
                routeCoordinates: validCortege.data.routeCoordinates,
                attendanceFigures: validCortege.data.attendanceFigures ?? null,
                updatedAt: validCortege.data.timestamp,
              });
            }
          } else if (type === "ADMIN_ZONES") {
            const validZones = validateInboundAdminZones(payload);
            if (validZones && onAdminZonesRef.current) {
              const zonesState: AdminZonesState = {
                prohibitedZone: validZones.data.prohibitedZone,
                dispersionZone: validZones.data.dispersionZone,
                updatedAt: validZones.data.timestamp,
              };
              try {
                localStorage.setItem(
                  MAP_UI_CONFIG.STORAGE_KEYS.ADMIN_ZONES_CACHE,
                  JSON.stringify(zonesState)
                );
              } catch {}
              onAdminZonesRef.current(zonesState);
            }
          }
        };

        return () => {
          bc.close();
        };
      } catch (err) {
        console.warn("[BroadcastChannel] Non supporté:", err);
      }
    }
  }, []);

  // Connexion Supabase Realtime WebSocket (Pure Broadcast avec Sanitization stricte)
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setStatus("demo_local");
      return;
    }

    setStatus("connecting");

    // 1. Canal des signalements citoyens
    const reportsChannel = supabase.channel(CHANNELS.REPORTS, {
      config: {
        broadcast: {
          self: false,
          ack: true,
        },
      },
    });

    reportsChannelRef.current = reportsChannel;

    reportsChannel
      .on("broadcast", { event: "new-report" }, (payload) => {
        // Validation stricte Zod + Bounding Box + PoW
        const validReport = validateInboundReport(payload.payload);
        if (validReport) {
          console.info("[Realtime] Signalement reçu via WebSocket :", validReport.category, validReport.id);
          onReportRef.current?.(validReport);
        }
      })
      .subscribe((subStatus) => {
        if (subStatus === "SUBSCRIBED") {
          console.info("[Realtime] Canal reports-stream connecté.");
          setStatus("connected");
          setLastPingTime(Date.now());
        } else if (subStatus === "CLOSED" || subStatus === "CHANNEL_ERROR") {
          console.warn("[Realtime] Déconnexion canal reports-stream :", subStatus);
          setStatus("offline");
        }
      });

    // 2. Canal de l'état officiel du cortège (Broadcast + Presence pour synchroniser les nouveaux arrivants)
    const cortegeChannel = supabase.channel(CHANNELS.CORTEGE, {
      config: {
        broadcast: {
          self: false,
          ack: true,
        },
        presence: {
          key: "cortege-live",
        },
      },
    });

    cortegeChannelRef.current = cortegeChannel;

    cortegeChannel
      .on("broadcast", { event: "cortege-state-update" }, (payload) => {
        // Validation stricte Ed25519 + Anti-rejeu
        const validCortege = validateInboundCortege(payload.payload);
        if (validCortege) {
          console.info("[Realtime] État cortège reçu et validé :", validCortege.data.status);
          onCortegeRef.current?.({
            status: validCortege.data.status,
            head: validCortege.data.head
              ? { ...validCortege.data.head, updatedAt: validCortege.data.timestamp }
              : null,
            tail: validCortege.data.tail
              ? { ...validCortege.data.tail, updatedAt: validCortege.data.timestamp }
              : null,
            routeCoordinates: validCortege.data.routeCoordinates,
            attendanceFigures: validCortege.data.attendanceFigures ?? null,
            updatedAt: validCortege.data.timestamp,
          });
        }
      })
      .on("broadcast", { event: "admin-zones-update" }, (payload) => {
        const validZones = validateInboundAdminZones(payload.payload);
        if (validZones && onAdminZonesRef.current) {
          console.info("[Realtime] Zones admin reçues et validées");
          const zonesState: AdminZonesState = {
            prohibitedZone: validZones.data.prohibitedZone,
            dispersionZone: validZones.data.dispersionZone,
            updatedAt: validZones.data.timestamp,
          };
          try {
            localStorage.setItem(
              MAP_UI_CONFIG.STORAGE_KEYS.ADMIN_ZONES_CACHE,
              JSON.stringify(zonesState)
            );
          } catch {}
          onAdminZonesRef.current(zonesState);
        }
      })
      .on("presence", { event: "sync" }, () => {
        const presenceState = cortegeChannel.presenceState();
        for (const key in presenceState) {
          const presences = presenceState[key] as any[];
          for (const item of presences) {
            if (item?.payload) {
              const validCortege = validateInboundCortege(item.payload);
              if (validCortege) {
                console.info("[Realtime] État cortège synchronisé via Presence :", validCortege.data.status);
                onCortegeRef.current?.({
                  status: validCortege.data.status,
                  head: validCortege.data.head
                    ? { ...validCortege.data.head, updatedAt: validCortege.data.timestamp }
                    : null,
                  tail: validCortege.data.tail
                    ? { ...validCortege.data.tail, updatedAt: validCortege.data.timestamp }
                    : null,
                  routeCoordinates: validCortege.data.routeCoordinates,
                  attendanceFigures: validCortege.data.attendanceFigures ?? null,
                  updatedAt: validCortege.data.timestamp,
                });
              }
            }
            if (item?.zonesPayload) {
              const validZones = validateInboundAdminZones(item.zonesPayload);
              if (validZones && onAdminZonesRef.current) {
                console.info("[Realtime] Zones admin synchronisées via Presence");
                const zonesState: AdminZonesState = {
                  prohibitedZone: validZones.data.prohibitedZone,
                  dispersionZone: validZones.data.dispersionZone,
                  updatedAt: validZones.data.timestamp,
                };
                try {
                  localStorage.setItem(
                    MAP_UI_CONFIG.STORAGE_KEYS.ADMIN_ZONES_CACHE,
                    JSON.stringify(zonesState)
                  );
                } catch {}
                onAdminZonesRef.current(zonesState);
              }
            }
          }
        }
      })
      .subscribe((subStatus) => {
        if (subStatus === "SUBSCRIBED") {
          console.info("[Realtime] Canal cortege-state connecté.");
        }
      });

    return () => {
      reportsChannel.unsubscribe();
      cortegeChannel.unsubscribe();
      reportsChannelRef.current = null;
      cortegeChannelRef.current = null;
    };
  }, []);

  /**
   * Émission sécurisée d'un signalement citoyen :
   * 1. Vérification du Bounding Box géographique de Nantes
   * 2. Cooldown local de 60 secondes par catégorie
   * 3. Résolution de la Preuve de Travail (PoW Hashcash)
   * 4. Diffusion du payload scellé
   */
  const sendReport = useCallback(
    async (category: ReportCategory, rawLat: number, rawLng: number): Promise<boolean> => {
      const now = Date.now();

      // 1. Vérification du Bounding Box géographique
      if (
        rawLat < NANTES_BOUNDS.MIN_LAT ||
        rawLat > NANTES_BOUNDS.MAX_LAT ||
        rawLng < NANTES_BOUNDS.MIN_LNG ||
        rawLng > NANTES_BOUNDS.MAX_LNG
      ) {
        console.warn("[Sécurité] Signalement rejeté : coordonnées hors agglomération nantaise.");
        return false;
      }

      // 2. Cooldown anti-rebond local (60 secondes par catégorie)
      const lastSent = categoryCooldownsRef.current.get(category) || 0;
      if (now - lastSent < 60 * 1000) {
        const remaining = Math.ceil((60 * 1000 - (now - lastSent)) / 1000);
        console.warn(`[Sécurité] Cooldown actif : patientez ${remaining}s pour cette catégorie.`);
        return false;
      }

      // 3. Arrondi de coordonnées pour la vie privée (~100m)
      const rounded = roundCoordinates(rawLat, rawLng, 3);
      const timestamp = now;

      // 4. Résolution de la Preuve de Travail (PoW Hashcash)
      setIsSolvingPoW(true);
      let powSolution: { nonce: string; hash: string };
      try {
        powSolution = await solveProofOfWork(category, rounded.lat, rounded.lng, timestamp);
      } catch (powErr) {
        console.error("[PoW] Échec du calcul de preuve de travail:", powErr);
        setIsSolvingPoW(false);
        return false;
      } finally {
        setIsSolvingPoW(false);
      }

      const report: ReportEvent = {
        id: `rep_${timestamp}_${Math.random().toString(36).substring(2, 7)}`,
        category,
        lat: rounded.lat,
        lng: rounded.lng,
        timestamp,
        powNonce: powSolution.nonce,
      };

      // Enregistrer le cooldown
      categoryCooldownsRef.current.set(category, now);

      // Diffusion locale
      try {
        localBcRef.current?.postMessage({
          type: "NEW_REPORT",
          payload: report,
        });
      } catch (err) {
        console.warn("[LocalBC] Erreur émission locale:", err);
      }

      // Traitement local immédiat
      onReportRef.current?.(report);

      // Diffusion Supabase Realtime si connecté
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const channel = reportsChannelRef.current || supabase.channel(CHANNELS.REPORTS);
          const sendResult = await channel.send({
            type: "broadcast",
            event: "new-report",
            payload: report,
          });
          console.info("[Realtime] Diffusion signalement effectuée :", report.category, sendResult);
          return true;
        } catch (err) {
          console.warn("[Realtime] Échec broadcast report:", err);
          return false;
        }
      }

      return true;
    },
    []
  );

  /**
   * Émission officielle signée cryptographiquement (Ed25519) par l'organisateur
   */
  const sendSignedCortegeState = useCallback(
    async (signedPayload: SignedCortegePayload): Promise<boolean> => {
      // 1. Diffusion locale
      try {
        localBcRef.current?.postMessage({
          type: "CORTEGE_STATE",
          payload: signedPayload,
        });
      } catch (err) {
        console.warn("[LocalBC] Erreur local cortege state:", err);
      }

      // 2. Traitement local
      onCortegeRef.current?.({
        status: signedPayload.data.status,
        head: signedPayload.data.head
          ? { ...signedPayload.data.head, updatedAt: signedPayload.data.timestamp }
          : null,
        tail: signedPayload.data.tail
          ? { ...signedPayload.data.tail, updatedAt: signedPayload.data.timestamp }
          : null,
        routeCoordinates: signedPayload.data.routeCoordinates,
        attendanceFigures: signedPayload.data.attendanceFigures ?? null,
        updatedAt: signedPayload.data.timestamp,
      });

      // 3. Diffusion Supabase Realtime (Broadcast + Presence pour nouveaux arrivants)
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const channel = cortegeChannelRef.current || supabase.channel(CHANNELS.CORTEGE);

          try {
            await channel.track({
              payload: signedPayload,
              updatedAt: Date.now(),
            });
          } catch (pErr) {
            console.warn("[Realtime] Échec channel.track presence:", pErr);
          }

          const sendResult = await channel.send({
            type: "broadcast",
            event: "cortege-state-update",
            payload: signedPayload,
          });
          console.info("[Realtime] Diffusion état cortège effectuée :", signedPayload.data.status, sendResult);
          return true;
        } catch (err) {
          console.warn("[Realtime] Échec envoi broadcast cortege:", err);
          return false;
        }
      }

      return true;
    },
    []
  );

  /**
   * Émission officielle des zones administratives (Ed25519) par l'organisateur
   */
  const sendSignedAdminZones = useCallback(
    async (signedPayload: SignedAdminZonesPayload): Promise<boolean> => {
      const zonesState: AdminZonesState = {
        prohibitedZone: signedPayload.data.prohibitedZone,
        dispersionZone: signedPayload.data.dispersionZone,
        updatedAt: signedPayload.data.timestamp,
      };

      // 1. Sauvegarde locale immédiate pour le mode hors-ligne
      try {
        localStorage.setItem(
          MAP_UI_CONFIG.STORAGE_KEYS.ADMIN_ZONES_CACHE,
          JSON.stringify(zonesState)
        );
      } catch {}

      // 2. Diffusion locale multi-onglets
      try {
        localBcRef.current?.postMessage({
          type: "ADMIN_ZONES",
          payload: signedPayload,
        });
      } catch (err) {
        console.warn("[LocalBC] Erreur local admin zones:", err);
      }

      // 3. Traitement local immédiat
      onAdminZonesRef.current?.(zonesState);

      // 4. Diffusion Supabase Realtime (Broadcast + Presence pour rattrapage)
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const channel = cortegeChannelRef.current || supabase.channel(CHANNELS.CORTEGE);

          try {
            await channel.track({
              zonesPayload: signedPayload,
              updatedAt: Date.now(),
            });
          } catch (pErr) {
            console.warn("[Realtime] Échec channel.track presence zones:", pErr);
          }

          const sendResult = await channel.send({
            type: "broadcast",
            event: "admin-zones-update",
            payload: signedPayload,
          });
          console.info("[Realtime] Diffusion zones effectuée :", sendResult);
          return true;
        } catch (err) {
          console.warn("[Realtime] Échec envoi broadcast zones:", err);
          return false;
        }
      }

      return true;
    },
    []
  );

  return {
    status,
    isConfigured: isSupabaseConfigured,
    lastPingTime,
    isSolvingPoW,
    sendReport,
    sendSignedCortegeState,
    sendSignedAdminZones,
  };
}
