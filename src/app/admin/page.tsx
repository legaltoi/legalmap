"use client";

import React, { useState, useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import * as pmtiles from "pmtiles";
import "maplibre-gl/dist/maplibre-gl.css";
import { useRealtime } from "@/hooks/useRealtime";
import { CortegeMovementStatus } from "@/types";
import {
  signCortegeState,
  derivePublicKey,
  DEFAULT_ADMIN_VERIFY_KEY,
  CortegeMessageData,
} from "@/lib/crypto";
import nantesData from "@/config/cities/nantes.json";
import nantesBaseGeoJson from "@/config/cities/nantes-base.json";

// Enregistrement du protocole PMTiles natif avec résolution d'URL relative
let isProtocolAdded = false;
if (typeof window !== "undefined" && !isProtocolAdded) {
  const protocol = new pmtiles.Protocol();
  maplibregl.addProtocol("pmtiles", (params, abortController) => {
    let url = params.url;
    if (url.startsWith("pmtiles:///") || !url.includes("://http")) {
      const path = url.replace(/^pmtiles:\/\//, "");
      const fullUrl = `${window.location.origin}${path.startsWith("/") ? "" : "/"}${path}`;
      params = { ...params, url: `pmtiles://${fullUrl}` };
    }
    return protocol.tile(params, abortController);
  });
  isProtocolAdded = true;
}
import {
  ShieldCheck,
  PlayCircle,
  PauseCircle,
  Flag,
  Check,
  AlertTriangle,
  Lock,
  ArrowLeft,
  RefreshCw,
  MapPin,
  Trash2,
  Key,
} from "lucide-react";
import Link from "next/link";

const EXPECTED_PUBLIC_VERIFY_KEY =
  process.env.NEXT_PUBLIC_ADMIN_VERIFY_KEY || DEFAULT_ADMIN_VERIFY_KEY;

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [privateKey, setPrivateKey] = useState<string>("");
  const [inputKey, setInputKey] = useState<string>("");
  const [authError, setAuthError] = useState(false);

  // État local du cortège
  const [cortegeStatus, setCortegeStatus] = useState<CortegeMovementStatus>("MOBILE");
  const [headCoords, setHeadCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [tailCoords, setTailCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Mode de placement sur carte ('head' | 'tail' | null)
  const [placementMode, setPlacementMode] = useState<"head" | "tail" | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [lastBroadcastTime, setLastBroadcastTime] = useState<number | null>(null);
  const [lastBroadcastSig, setLastBroadcastSig] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const headMarkerRef = useRef<maplibregl.Marker | null>(null);
  const tailMarkerRef = useRef<maplibregl.Marker | null>(null);

  const { status: realtimeStatus, sendSignedCortegeState } = useRealtime({
    onCortegeStateReceived: (state) => {
      setCortegeStatus(state.status);
      if (state.head) setHeadCoords({ lat: state.head.lat, lng: state.head.lng });
      if (state.tail) setTailCoords({ lat: state.tail.lat, lng: state.tail.lng });
    },
  });

  // Vérification de la clé privée Ed25519 via l'ancre d'URL (#priv=...)
  useEffect(() => {
    const checkHashKey = () => {
      if (typeof window === "undefined") return;
      const hash = window.location.hash;
      const match = hash.match(/#priv=([0-9a-fA-F]{64,128})/);
      if (match && match[1]) {
        const priv = match[1].toLowerCase();
        try {
          const derivedPub = derivePublicKey(priv);
          if (derivedPub.toLowerCase() === EXPECTED_PUBLIC_VERIFY_KEY.toLowerCase()) {
            setPrivateKey(priv);
            setIsAuthenticated(true);
            setAuthError(false);
            return;
          }
        } catch {
          // Erreur de dérivation
        }
      }
      setIsAuthenticated(false);
    };

    checkHashKey();
    window.addEventListener("hashchange", checkHashKey);
    return () => window.removeEventListener("hashchange", checkHashKey);
  }, []);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputKey.trim().toLowerCase();
    try {
      const derivedPub = derivePublicKey(clean);
      if (derivedPub.toLowerCase() === EXPECTED_PUBLIC_VERIFY_KEY.toLowerCase()) {
        setPrivateKey(clean);
        if (typeof window !== "undefined") {
          window.location.hash = `#priv=${clean}`;
        }
        setIsAuthenticated(true);
        setAuthError(false);
      } else {
        setAuthError(true);
      }
    } catch {
      setAuthError(true);
    }
  };

  const placementModeRef = useRef<"head" | "tail" | null>(null);
  placementModeRef.current = placementMode;

  // Initialisation de la carte d'administration
  useEffect(() => {
    if (!isAuthenticated || !mapContainerRef.current || mapRef.current) return;

    const basePath =
      typeof window !== "undefined" && window.location.pathname.startsWith("/legalmap")
        ? "/legalmap"
        : "";
    const pmtilesUrl = `pmtiles://${basePath}/tiles/nantes.pmtiles`;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          "nantes-pmtiles": {
            type: "vector",
            url: pmtilesUrl,
          },
          "nantes-offline-base": {
            type: "geojson",
            data: nantesBaseGeoJson as any,
          },
        },
        layers: [
          {
            id: "background",
            type: "background",
            paint: {
              "background-color": "#060608",
            },
          },
          {
            id: "water-fill",
            type: "fill",
            source: "nantes-offline-base",
            filter: ["==", "class", "water"],
            paint: {
              "fill-color": "#081321",
              "fill-opacity": 0.95,
            },
          },
          {
            id: "water-outline",
            type: "line",
            source: "nantes-offline-base",
            filter: ["==", "class", "water"],
            paint: {
              "line-color": "#112a45",
              "line-width": 1.5,
            },
          },
          {
            id: "park-fill",
            type: "fill",
            source: "nantes-offline-base",
            filter: ["==", "class", "park"],
            paint: {
              "fill-color": "#07170f",
              "fill-opacity": 0.8,
            },
          },
          {
            id: "streets-secondary",
            type: "line",
            source: "nantes-offline-base",
            filter: ["==", "class", "street"],
            paint: {
              "line-color": "#181824",
              "line-width": 2.5,
            },
          },
          {
            id: "streets-primary",
            type: "line",
            source: "nantes-offline-base",
            filter: ["==", "class", "primary"],
            paint: {
              "line-color": "#252538",
              "line-width": 4.5,
            },
          },
          {
            id: "pmtiles-streets-layer",
            type: "line",
            source: "nantes-pmtiles",
            "source-layer": "streets",
            paint: {
              "line-color": "#1f1f2e",
              "line-width": 2,
            },
          },
        ],
      },
      center: nantesData.center as [number, number],
      zoom: 14.5,
    });

    map.on("error", (e) => {
      console.warn("[Admin MapLibre Event]:", e);
    });

    const triggerResize = () => {
      if (map) {
        map.resize();
      }
    };

    map.on("load", () => {
      triggerResize();
      map.addSource("official-route", {
        type: "geojson",
        data: nantesData.officialRoute as any,
      });

      map.addLayer({
        id: "route-line",
        type: "line",
        source: "official-route",
        filter: ["==", "$type", "LineString"],
        paint: {
          "line-color": "#22d3ee",
          "line-width": 4,
          "line-opacity": 0.8,
        },
      });
    });

    map.on("click", (e) => {
      const lat = Math.round(e.lngLat.lat * 1000) / 1000;
      const lng = Math.round(e.lngLat.lng * 1000) / 1000;

      const currentMode = placementModeRef.current;
      if (currentMode === "head") {
        setHeadCoords({ lat, lng });
        setPlacementMode(null);
      } else if (currentMode === "tail") {
        setTailCoords({ lat, lng });
        setPlacementMode(null);
      }
    });

    const resizeTimer1 = setTimeout(triggerResize, 100);
    const resizeTimer2 = setTimeout(triggerResize, 500);
    const resizeTimer3 = setTimeout(triggerResize, 1200);
    window.addEventListener("resize", triggerResize);

    mapRef.current = map;

    return () => {
      clearTimeout(resizeTimer1);
      clearTimeout(resizeTimer2);
      clearTimeout(resizeTimer3);
      window.removeEventListener("resize", triggerResize);
      map.remove();
      mapRef.current = null;
    };
  }, [isAuthenticated]);

  // Synchronisation des marqueurs sur la carte d'administration
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Tête de cortège
    if (headCoords) {
      if (!headMarkerRef.current) {
        const el = document.createElement("div");
        el.className = "p-1.5 bg-cyan-500 rounded-full border-2 border-white text-xs font-bold shadow-lg";
        el.innerHTML = "🚩 Tête";
        headMarkerRef.current = new maplibregl.Marker({ element: el, draggable: true })
          .setLngLat([headCoords.lng, headCoords.lat])
          .addTo(map);

        headMarkerRef.current.on("dragend", () => {
          const lngLat = headMarkerRef.current!.getLngLat();
          setHeadCoords({
            lat: Math.round(lngLat.lat * 1000) / 1000,
            lng: Math.round(lngLat.lng * 1000) / 1000,
          });
        });
      } else {
        headMarkerRef.current.setLngLat([headCoords.lng, headCoords.lat]);
      }
    } else if (headMarkerRef.current) {
      headMarkerRef.current.remove();
      headMarkerRef.current = null;
    }

    // Fin de cortège
    if (tailCoords) {
      if (!tailMarkerRef.current) {
        const el = document.createElement("div");
        el.className = "p-1.5 bg-orange-500 rounded-full border-2 border-white text-xs font-bold shadow-lg";
        el.innerHTML = "🏁 Fin";
        tailMarkerRef.current = new maplibregl.Marker({ element: el, draggable: true })
          .setLngLat([tailCoords.lng, tailCoords.lat])
          .addTo(map);

        tailMarkerRef.current.on("dragend", () => {
          const lngLat = tailMarkerRef.current!.getLngLat();
          setTailCoords({
            lat: Math.round(lngLat.lat * 1000) / 1000,
            lng: Math.round(lngLat.lng * 1000) / 1000,
          });
        });
      } else {
        tailMarkerRef.current.setLngLat([tailCoords.lng, tailCoords.lat]);
      }
    } else if (tailMarkerRef.current) {
      tailMarkerRef.current.remove();
      tailMarkerRef.current = null;
    }
  }, [headCoords, tailCoords]);

  // Signature asymétrique Ed25519 et diffusion officielle
  const handleBroadcastSignedState = async () => {
    if (!privateKey) {
      alert("Clé privée non disponible pour la signature.");
      return;
    }

    setIsBroadcasting(true);
    const now = Date.now();

    const messageData: CortegeMessageData = {
      status: cortegeStatus,
      head: headCoords ? { lat: headCoords.lat, lng: headCoords.lng } : null,
      tail: tailCoords ? { lat: tailCoords.lat, lng: tailCoords.lng } : null,
      timestamp: now,
      nonce: `nonce_${now}_${Math.random().toString(36).substring(2, 10)}`,
    };

    // Signature cryptographique Ed25519
    const signedPayload = signCortegeState(messageData, privateKey);

    await sendSignedCortegeState(signedPayload);
    setIsBroadcasting(false);
    setLastBroadcastTime(now);
    setLastBroadcastSig(signedPayload.signature.substring(0, 16) + "...");
  };

  // Formulaire d'authentification par clé privée si non authentifié
  if (isAuthenticated === false) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Espace Organisateur Sécurisé</h1>
              <p className="text-xs text-zinc-400 font-mono">Authentification asymétrique Ed25519</p>
            </div>
          </div>

          <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
            Pour réguler le cortège, fournissez la clé privée d&apos;émission. La clé publique correspondante
            vérifie chaque ordre sur les téléphones des manifestants.
          </p>

          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-priv-input" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Clé privée Ed25519 (64 hex caractères)
              </label>
              <input
                id="admin-priv-input"
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="Ex: 4a2b8f... (ou via lien #priv=...)"
                className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
              {authError && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Clé privée invalide ou non reconnue
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
            >
              Déverrouiller avec Ed25519
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between text-xs text-zinc-500">
            <Link href="/" className="hover:text-zinc-300 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Retour à la carte publique
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Dashboard d'administration sécurisé
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header Admin */}
      <header className="px-4 py-3 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            aria-label="Retour à la carte publique"
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider text-cyan-400">
                CONSOLE ORGANISATEUR
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[9px] text-emerald-400 font-mono flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Ed25519 Signé
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">
              Diffusion certifiée • Relais {realtimeStatus}
            </p>
          </div>
        </div>

        <button
          onClick={handleBroadcastSignedState}
          disabled={isBroadcasting}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-colors active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isBroadcasting ? "animate-spin" : ""}`} />
          Signer &amp; Diffuser en Direct
        </button>
      </header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden">
        {/* Panel gauche : Commandes */}
        <div className="p-4 bg-zinc-900/60 border-r border-zinc-800 space-y-5 overflow-y-auto">
          {/* 1. Statut Mobile / Immobile */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
              1. Statut de Mobilité du Cortège
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCortegeStatus("MOBILE")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                  cortegeStatus === "MOBILE"
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md"
                    : "bg-zinc-800/60 border-zinc-700 text-zinc-400"
                }`}
              >
                <PlayCircle className="w-5 h-5 mb-1 text-cyan-400" />
                Cortège Mobile
                <span className="text-[10px] font-normal opacity-75">TTL 5 min</span>
              </button>

              <button
                onClick={() => setCortegeStatus("IMMOBILE")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                  cortegeStatus === "IMMOBILE"
                    ? "bg-orange-500/20 border-orange-400 text-orange-300 shadow-md"
                    : "bg-zinc-800/60 border-zinc-700 text-zinc-400"
                }`}
              >
                <PauseCircle className="w-5 h-5 mb-1 text-orange-400" />
                Cortège Immobile
                <span className="text-[10px] font-normal opacity-75">TTL 10 min</span>
              </button>
            </div>
          </div>

          {/* 2. Position Tête */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5" /> 2. Tête de Cortège
              </span>
              {headCoords && (
                <button
                  onClick={() => setHeadCoords(null)}
                  className="text-zinc-500 hover:text-red-400 p-1"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {headCoords ? (
              <div className="text-xs font-mono text-zinc-300 bg-black/60 p-2 rounded-lg border border-zinc-800">
                Lat: {headCoords.lat.toFixed(3)}, Lng: {headCoords.lng.toFixed(3)}
              </div>
            ) : (
              <div className="text-xs text-zinc-500 mb-2">Non positionnée</div>
            )}

            <button
              onClick={() => setPlacementMode("head")}
              className={`w-full mt-2 py-2 px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                placementMode === "head"
                  ? "bg-cyan-500 text-black border-cyan-400 animate-pulse"
                  : "bg-zinc-800 hover:bg-zinc-700 text-cyan-300 border-zinc-700"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              {placementMode === "head"
                ? "Cliquez sur la carte pour placer"
                : "Placer / Déplacer la Tête"}
            </button>
          </div>

          {/* 3. Position Fin */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5" /> 3. Fin de Cortège
              </span>
              {tailCoords && (
                <button
                  onClick={() => setTailCoords(null)}
                  className="text-zinc-500 hover:text-red-400 p-1"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {tailCoords ? (
              <div className="text-xs font-mono text-zinc-300 bg-black/60 p-2 rounded-lg border border-zinc-800">
                Lat: {tailCoords.lat.toFixed(3)}, Lng: {tailCoords.lng.toFixed(3)}
              </div>
            ) : (
              <div className="text-xs text-zinc-500 mb-2">Non positionnée</div>
            )}

            <button
              onClick={() => setPlacementMode("tail")}
              className={`w-full mt-2 py-2 px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                placementMode === "tail"
                  ? "bg-orange-500 text-black border-orange-400 animate-pulse"
                  : "bg-zinc-800 hover:bg-zinc-700 text-orange-300 border-zinc-700"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              {placementMode === "tail"
                ? "Cliquez sur la carte pour placer"
                : "Placer / Déplacer la Fin"}
            </button>
          </div>

          {/* Info signature */}
          {lastBroadcastTime && (
            <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 space-y-1 font-mono">
              <div className="flex items-center gap-1.5 font-sans font-bold">
                <Check className="w-4 h-4 text-emerald-400" />
                Signé &amp; Diffusé à {new Date(lastBroadcastTime).toLocaleTimeString()}
              </div>
              <div className="text-[10px] text-zinc-400 break-all">
                Sig: {lastBroadcastSig}
              </div>
            </div>
          )}
        </div>

        {/* Panel droit : Carte */}
        <div className="md:col-span-2 relative min-h-[350px]">
          <div ref={mapContainerRef} className="w-full h-full" />
          {placementMode && (
            <div className="absolute top-4 left-4 right-4 z-20 bg-blue-600 text-white p-2.5 rounded-xl text-center text-xs font-bold shadow-2xl animate-pulse">
              Touchez un point sur la carte pour placer la {placementMode === "head" ? "Tête" : "Fin"} de cortège
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
