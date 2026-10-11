"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  AlertTriangle,
  Ban,
  Users,
  ShieldAlert,
  HeartPulse,
  GraduationCap,
  Check,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { ConsensusMarker, ReportCategory } from "@/types";
import { REPORT_CATEGORIES, CONSENSUS_CONFIG } from "@/config/categories";
import { NANTES_LYCEES, LyceeItem } from "@/config/data/nantes-lycees";
import { calculateHaversineDistance } from "@/lib/geo";

interface ActionDockProps {
  onTriggerReport: (
    category: ReportCategory,
    coords?: { lat: number; lng: number }
  ) => Promise<void>;
  userLocation: { lat: number; lng: number } | null;
  onSelectMapLocationMode?: (category: ReportCategory) => void;
  isMapSelectActive?: boolean;
  isSolvingPoW?: boolean;
  consensusMarkers?: ConsensusMarker[];
}

export function ActionDock({
  onTriggerReport,
  userLocation,
  onSelectMapLocationMode,
  isMapSelectActive = false,
  isSolvingPoW = false,
  consensusMarkers = [],
}: ActionDockProps) {
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | null>(null);
  const [lyceeQuery, setLyceeQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Décompte de temporisation anti-spam (5 secondes en mémoire)
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const handleButtonClick = (cat: ReportCategory) => {
    if (cooldownSeconds > 0 || isSubmitting) return;

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(40);
      } catch {}
    }

    setLyceeQuery("");
    setSelectedCategory(cat);
  };

  const handleConfirmReport = async (useCurrentGps: boolean) => {
    if (!selectedCategory) return;

    if (!useCurrentGps && onSelectMapLocationMode) {
      onSelectMapLocationMode(selectedCategory);
      setSelectedCategory(null);
      return;
    }

    setIsSubmitting(true);
    try {
      const coords = userLocation || undefined;
      await onTriggerReport(selectedCategory, coords);

      setSuccessMessage(
        `Signalement « ${REPORT_CATEGORIES[selectedCategory].shortLabel} » émis`
      );
      setCooldownSeconds(5);
      setSelectedCategory(null);

      setTimeout(() => {
        setSuccessMessage(null);
      }, 2800);
    } catch (err) {
      console.error("Erreur émission signalement:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportLyceeBlocus = async (lycee: LyceeItem) => {
    if (isSubmitting || cooldownSeconds > 0) return;
    setIsSubmitting(true);
    try {
      await onTriggerReport("BLOCUS_LYCEE", {
        lat: lycee.coordinates[1],
        lng: lycee.coordinates[0],
      });

      window.dispatchEvent(
        new CustomEvent("focus-map-coords", {
          detail: { coords: lycee.coordinates, zoom: 16 },
        })
      );

      setSuccessMessage(`Signalement Blocus « ${lycee.shortName} » pris en compte`);
      setCooldownSeconds(5);
      setSelectedCategory(null);

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Erreur signalement blocus lycée:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLyceeBlocusCount = (lycee: LyceeItem): number => {
    const match = consensusMarkers.find(
      (m) =>
        m.category === "BLOCUS_LYCEE" &&
        calculateHaversineDistance(
          lycee.coordinates[1],
          lycee.coordinates[0],
          m.lat,
          m.lng
        ) <= 180
    );
    return match ? match.reportCount : 0;
  };

  const filteredLycees = useMemo(() => {
    const q = lyceeQuery.trim().toLowerCase();
    if (!q) return NANTES_LYCEES;
    return NANTES_LYCEES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.shortName.toLowerCase().includes(q) ||
        l.district.toLowerCase().includes(q)
    );
  }, [lyceeQuery]);

  const getIcon = (cat: ReportCategory) => {
    switch (cat) {
      case "ZONE_GAZ":
        return <AlertTriangle className="w-5 h-5" />;
      case "VOIE_BLOQUEE":
        return <Ban className="w-5 h-5" />;
      case "POINT_BLOCAGE":
        return <Users className="w-5 h-5" />;
      case "SECOURS_MEDIC":
        return <HeartPulse className="w-5 h-5" />;
      case "BLOCUS_LYCEE":
        return <GraduationCap className="w-5 h-5" />;
    }
  };

  return (
    <>
      {/* Floating Action Dock */}
      <nav
        aria-label="Actions de signalement citoyen"
        className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none flex flex-col items-center justify-end p-3 sm:pb-6"
        style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom, 16px))" }}
      >
        {/* Success toast */}
        {successMessage && (
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-auto mb-3 px-4 py-2 bg-emerald-500/90 border border-emerald-400 text-white rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2"
          >
            <Check className="w-4 h-4" />
            {successMessage}
          </div>
        )}

        {/* PoW computation indicator banner */}
        {isSolvingPoW && (
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-auto mb-3 px-4 py-2 bg-amber-600/90 border border-amber-400 text-white rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-pulse"
          >
            <ShieldAlert className="w-4 h-4" />
            Sécurisation PoW en cours...
          </div>
        )}

        {/* Map Selection Mode indicator banner */}
        {isMapSelectActive && (
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-auto mb-3 px-4 py-2 bg-blue-600 border border-blue-400 text-white rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-pulse"
          >
            <MapPin className="w-4 h-4" />
            Touchez la carte pour placer le signalement
          </div>
        )}

        {/* The 5 Action Buttons Container */}
        <div className="pointer-events-auto w-full max-w-lg bg-black/90 backdrop-blur-xl border border-zinc-800 rounded-3xl p-2 shadow-2xl flex items-center justify-between gap-1.5">
          {/* 1. ZONE_GAZ */}
          <button
            onClick={() => handleButtonClick("ZONE_GAZ")}
            disabled={cooldownSeconds > 0}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl transition-all duration-150 active:scale-95 touch-manipulation min-h-[56px] ${
              cooldownSeconds > 0
                ? "opacity-40 cursor-not-allowed bg-zinc-900"
                : "bg-amber-500/15 hover:bg-amber-500/25 active:bg-amber-500/30 text-amber-300 border border-amber-500/30 shadow-sm"
            }`}
          >
            <span className="text-amber-400 mb-0.5">{getIcon("ZONE_GAZ")}</span>
            <span className="text-[10px] sm:text-[11px] font-bold tracking-tight text-white leading-tight">
              Gaz
            </span>
          </button>

          {/* 2. VOIE_BLOQUEE */}
          <button
            onClick={() => handleButtonClick("VOIE_BLOQUEE")}
            disabled={cooldownSeconds > 0}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl transition-all duration-150 active:scale-95 touch-manipulation min-h-[56px] ${
              cooldownSeconds > 0
                ? "opacity-40 cursor-not-allowed bg-zinc-900"
                : "bg-red-500/15 hover:bg-red-500/25 active:bg-red-500/30 text-red-300 border border-red-500/30 shadow-sm"
            }`}
          >
            <span className="text-red-400 mb-0.5">{getIcon("VOIE_BLOQUEE")}</span>
            <span className="text-[10px] sm:text-[11px] font-bold tracking-tight text-white leading-tight">
              Voie Bloquée
            </span>
          </button>

          {/* 3. POINT_BLOCAGE */}
          <button
            onClick={() => handleButtonClick("POINT_BLOCAGE")}
            disabled={cooldownSeconds > 0}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl transition-all duration-150 active:scale-95 touch-manipulation min-h-[56px] ${
              cooldownSeconds > 0
                ? "opacity-40 cursor-not-allowed bg-zinc-900"
                : "bg-purple-500/15 hover:bg-purple-500/25 active:bg-purple-500/30 text-purple-300 border border-purple-500/30 shadow-sm"
            }`}
          >
            <span className="text-purple-400 mb-0.5">{getIcon("POINT_BLOCAGE")}</span>
            <span className="text-[10px] sm:text-[11px] font-bold tracking-tight text-white leading-tight">
              Blocage
            </span>
          </button>

          {/* 4. BLOCUS_LYCEE (Consensus 5 users) */}
          <button
            onClick={() => handleButtonClick("BLOCUS_LYCEE")}
            disabled={cooldownSeconds > 0}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl transition-all duration-150 active:scale-95 touch-manipulation min-h-[56px] ${
              cooldownSeconds > 0
                ? "opacity-40 cursor-not-allowed bg-zinc-900"
                : "bg-orange-500/15 hover:bg-orange-500/25 active:bg-orange-500/30 text-orange-300 border border-orange-500/30 shadow-sm"
            }`}
          >
            <span className="text-orange-400 mb-0.5">{getIcon("BLOCUS_LYCEE")}</span>
            <span className="text-[10px] sm:text-[11px] font-bold tracking-tight text-white leading-tight">
              Blocus Lycée
            </span>
          </button>

          {/* 5. SECOURS_MEDIC */}
          <button
            onClick={() => handleButtonClick("SECOURS_MEDIC")}
            disabled={cooldownSeconds > 0}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl transition-all duration-150 active:scale-95 touch-manipulation min-h-[56px] ${
              cooldownSeconds > 0
                ? "opacity-40 cursor-not-allowed bg-zinc-900"
                : "bg-emerald-500/15 hover:bg-emerald-500/25 active:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 shadow-sm"
            }`}
          >
            <span className="text-emerald-400 mb-0.5">{getIcon("SECOURS_MEDIC")}</span>
            <span className="text-[10px] sm:text-[11px] font-bold tracking-tight text-white leading-tight">
              Médic
            </span>
          </button>
        </div>

        {/* Cooldown notice if active */}
        {cooldownSeconds > 0 && (
          <div className="pointer-events-auto mt-1.5 text-[10px] text-zinc-500 font-mono tracking-wider">
            Temporisation anti-spam : {cooldownSeconds}s
          </div>
        )}
      </nav>

      {/* Modal de confirmation ou sélection de Lycée */}
      {selectedCategory && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
        >
          <div className="w-full max-w-sm bg-[#101014] border border-zinc-800 rounded-3xl p-4 shadow-2xl flex flex-col text-zinc-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div
                  className="p-2 rounded-xl"
                  style={{
                    backgroundColor: REPORT_CATEGORIES[selectedCategory].badgeBg,
                    color: REPORT_CATEGORIES[selectedCategory].color,
                  }}
                >
                  {getIcon(selectedCategory)}
                </div>
                <div>
                  <h3 id="confirm-modal-title" className="font-bold text-sm text-white">
                    {REPORT_CATEGORIES[selectedCategory].label}
                  </h3>
                  <p className="text-[10px] text-zinc-400">
                    {selectedCategory === "BLOCUS_LYCEE"
                      ? `Affiché sur la carte dès ${CONSENSUS_CONFIG.BLOCUS_REPORTS_THRESHOLD} signalements`
                      : "Affiché dès 2 signalements convergents"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                aria-label="Fermer"
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedCategory === "BLOCUS_LYCEE" ? (
              /* Sélecteur rapide des 26 Lycées de Nantes */
              <div className="pt-3 space-y-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={lyceeQuery}
                    onChange={(e) => setLyceeQuery(e.target.value)}
                    placeholder="Rechercher un lycée (Clemenceau, Livet, Guist'hau...)"
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500/50"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                  {filteredLycees.map((lycee) => {
                    const count = getLyceeBlocusCount(lycee);
                    const isConfirmed =
                      count >= CONSENSUS_CONFIG.BLOCUS_REPORTS_THRESHOLD;
                    return (
                      <button
                        key={lycee.id}
                        disabled={isSubmitting}
                        onClick={() => handleReportLyceeBlocus(lycee)}
                        className="w-full text-left p-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800/90 hover:border-orange-500/40 transition-all flex items-center justify-between gap-2 group"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white group-hover:text-orange-300 truncate">
                            🎓 {lycee.shortName}
                          </div>
                          <div className="text-[10px] text-zinc-500 truncate">
                            {lycee.district}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 border ${
                            isConfirmed
                              ? "bg-orange-500/20 text-orange-300 border-orange-500/50"
                              : count > 0
                              ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                              : "bg-zinc-800 text-zinc-400 border-zinc-700"
                          }`}
                        >
                          {isConfirmed
                            ? `🔥 BLOCUS (${count}/5)`
                            : `Signaler (${count}/5)`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Confirmation standard pour les 4 alertes de rue */
              <>
                <div className="py-3 space-y-2.5">
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {REPORT_CATEGORIES[selectedCategory].description}
                  </p>
                  <div className="p-2.5 bg-zinc-900/90 border border-zinc-800/80 rounded-2xl text-[11px] text-zinc-400">
                    🔒 Anonyme (coordonnées arrondies à 100m, zéro cookie).
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => handleConfirmReport(true)}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs rounded-2xl transition-all shadow-md touch-manipulation min-h-[46px]"
                  >
                    <MapPin className="w-4 h-4" />
                    {userLocation
                      ? "À ma position GPS actuelle"
                      : "Au centre de la zone"}
                  </button>

                  <button
                    onClick={() => handleConfirmReport(false)}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-200 font-semibold text-xs rounded-2xl transition-colors touch-manipulation min-h-[42px]"
                  >
                    Pointer sur la carte
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
