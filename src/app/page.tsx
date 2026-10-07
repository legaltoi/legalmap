"use client";

import React, { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { HeaderBar } from "@/components/HeaderBar";
import { ActionDock } from "@/components/ActionDock";
import { LegalSheet } from "@/components/LegalSheet";
import { LegalNotice } from "@/components/LegalNotice";
import { useRealtime } from "@/hooks/useRealtime";
import { useConsensus } from "@/hooks/useConsensus";
import { CortegeState, ReportCategory } from "@/types";
import nantesData from "@/config/cities/nantes.json";

// Import dynamique de MapView pour éviter toute erreur de SSR (window is not defined)
const MapView = dynamic(
  () => import("@/components/MapView").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[#050507] flex flex-col items-center justify-center text-zinc-400">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-mono">Chargement du moteur cartographique...</span>
      </div>
    ),
  }
);

const PUBLIC_CORTEGE_STORAGE_KEY = "legalmaps_public_cortege_state";

export default function HomePage() {
  // État officiel du cortège (par défaut MOBILE au démarrage)
  const [cortegeState, setCortegeState] = useState<CortegeState>({
    status: "MOBILE",
    head: null,
    tail: null,
    updatedAt: Date.now(),
  });

  // Réhydratation locale de l'état officiel du cortège si reçu récemment (< 6h)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(PUBLIC_CORTEGE_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && typeof saved === "object" && Date.now() - (saved.updatedAt || 0) < 6 * 3600 * 1000) {
          setCortegeState(saved);
        }
      }
    } catch {}
  }, []);

  // Position GPS locale de l'utilisateur (zéro transmission réseau brute)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Modales d'information
  const [isLegalSheetOpen, setIsLegalSheetOpen] = useState(false);
  const [isLegalNoticeOpen, setIsLegalNoticeOpen] = useState(false);

  // Mode de pointage direct sur carte
  const [activeCategoryToPoint, setActiveCategoryToPoint] = useState<ReportCategory | null>(null);

  // 1. Moteur de consensus spatio-temporel (Rayon 100m, seuil 2-3, TTL dynamique 5/10 min)
  const { publicMarkers, pendingCount, addIncomingReport } = useConsensus({
    cortegeStatus: cortegeState.status,
  });

  // 2. Moteur de transmission temps réel (Supabase Broadcast pur / Fallback local)
  const {
    status: realtimeStatus,
    sendReport,
    isSolvingPoW,
  } = useRealtime({
    onReportReceived: (report) => {
      addIncomingReport(report);
    },
    onCortegeStateReceived: (state) => {
      setCortegeState(state);
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(PUBLIC_CORTEGE_STORAGE_KEY, JSON.stringify(state));
        }
      } catch {}
    },
  });

  // Émission d'un signalement citoyen (zéro texte libre)
  const handleTriggerReport = useCallback(
    async (category: ReportCategory, coords?: { lat: number; lng: number }) => {
      // Coordonnées cibles : position GPS fournie, ou position locale connue, ou centre de Nantes
      const targetLat = coords?.lat ?? userLocation?.lat ?? nantesData.center[1];
      const targetLng = coords?.lng ?? userLocation?.lng ?? nantesData.center[0];

      await sendReport(category, targetLat, targetLng);
    },
    [sendReport, userLocation]
  );

  // Clic sur la carte en mode pointage manuel
  const handleMapClick = useCallback(
    async (coords: { lat: number; lng: number }) => {
      if (!activeCategoryToPoint) return;

      await sendReport(activeCategoryToPoint, coords.lat, coords.lng);
      setActiveCategoryToPoint(null);
    },
    [activeCategoryToPoint, sendReport]
  );

  // Passage en mode sélection sur carte
  const handleSelectMapMode = useCallback((category: ReportCategory) => {
    setActiveCategoryToPoint(category);
  }, []);

  // Détection initiale de la position GPS en local (optionnel et silencieux)
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          // Échec silencieux, l'utilisateur pourra cliquer sur le bouton GPS quand il le souhaite
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  return (
    <main className="relative w-screen h-[100dvh] overflow-hidden bg-black font-sans">
      {/* 1. Barre de statut et en-tête */}
      <HeaderBar
        cortegeStatus={cortegeState.status}
        realtimeStatus={realtimeStatus}
        pendingCount={pendingCount}
        onOpenLegalSheet={() => setIsLegalSheetOpen(true)}
        onOpenLegalNotice={() => setIsLegalNoticeOpen(true)}
        onRecenterCity={() => {
          // Rechargement doux de la vue centre
          const event = new CustomEvent("recenter-nantes");
          window.dispatchEvent(event);
        }}
      />

      {/* 2. Carte MapLibre GL pleine page */}
      <div className="absolute inset-0 z-0">
        <MapView
          consensusMarkers={publicMarkers}
          cortegeState={cortegeState}
          userLocation={userLocation}
          isMapSelectActive={Boolean(activeCategoryToPoint)}
          onMapClickReport={handleMapClick}
          onUserLocationFound={(coords) => setUserLocation(coords)}
        />
      </div>

      {/* 3. Barre d'action rapide tactile (4 boutons légaux normalisés) */}
      <ActionDock
        onTriggerReport={handleTriggerReport}
        userLocation={userLocation}
        onSelectMapLocationMode={handleSelectMapMode}
        isMapSelectActive={Boolean(activeCategoryToPoint)}
        isSolvingPoW={isSolvingPoW}
      />

      {/* 4. Modales de fiches réflexes et mentions légales */}
      <LegalSheet
        isOpen={isLegalSheetOpen}
        onClose={() => setIsLegalSheetOpen(false)}
      />

      <LegalNotice
        isOpen={isLegalNoticeOpen}
        onClose={() => setIsLegalNoticeOpen(false)}
      />
    </main>
  );
}

