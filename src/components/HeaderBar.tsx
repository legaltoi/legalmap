"use client";

import React from "react";
import {
  Shield,
  Scale,
  PauseCircle,
  PlayCircle,
  HelpCircle,
  BarChart3,
} from "lucide-react";
import { CortegeMovementStatus } from "@/types";
import { RealtimeStatus } from "@/hooks/useRealtime";

interface HeaderBarProps {
  cortegeStatus: CortegeMovementStatus;
  realtimeStatus: RealtimeStatus;
  pendingCount: number;
  onOpenLegalSheet: () => void;
  onOpenLegalNotice: () => void;
  onRecenterCity: () => void;
  onOpenObservatory?: () => void;
}

export function HeaderBar({
  cortegeStatus,
  realtimeStatus,
  pendingCount,
  onOpenLegalSheet,
  onOpenLegalNotice,
  onRecenterCity,
  onOpenObservatory,
}: HeaderBarProps) {
  const statusDotColor =
    realtimeStatus === "connected"
      ? "bg-emerald-400"
      : realtimeStatus === "demo_local"
      ? "bg-sky-400"
      : "bg-amber-400";

  const statusLabel =
    realtimeStatus === "connected"
      ? "Direct"
      : realtimeStatus === "demo_local"
      ? "Local"
      : "Hors-ligne";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-30 pointer-events-none px-2.5 sm:px-4"
      style={{ paddingTop: "max(10px, env(safe-area-inset-top, 10px))" }}
    >
      <div className="pointer-events-auto max-w-5xl mx-auto bg-zinc-950/92 backdrop-blur-xl border border-zinc-800/90 rounded-2xl px-3.5 py-2.5 sm:px-5 sm:py-3 shadow-[0_8px_32px_rgba(0,0,0,0.75)] flex items-center justify-between gap-3">
        {/* Gauche : Identité + État du cortège lisible */}
        <button
          onClick={onRecenterCity}
          aria-label="Recentrer sur Nantes"
          className="flex items-center gap-2.5 sm:gap-3 text-left group focus:outline-none min-w-0"
          title="Recentrer sur Nantes"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-500/15 border border-blue-400/30 rounded-xl text-blue-400 group-hover:bg-blue-500/25 transition-colors flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 leading-tight">
              <span className="text-xs sm:text-sm font-black text-white tracking-wider">
                LEGALMAPS
              </span>
              <span className="text-[10px] text-zinc-300 font-semibold bg-zinc-800/90 border border-zinc-700/70 px-1.5 py-0.5 rounded-md">
                Nantes
              </span>
            </div>

            {/* Sous-titre aéré : État Cortège + Statut Réseau */}
            <div className="flex items-center gap-2 mt-1 text-[10.5px] sm:text-[11px] font-medium leading-none">
              {cortegeStatus === "MOBILE" ? (
                <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                  <span className="truncate">Cortège Mobile</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-orange-300 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                  <span className="truncate">Cortège Immobile</span>
                </span>
              )}
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-1 text-zinc-400 shrink-0">
                <span className={`w-1.5 h-1.5 rounded-full ${statusDotColor}`} />
                <span>{statusLabel}</span>
              </span>
            </div>
          </div>
        </button>

        {/* Centre (Grand écran uniquement) : Détail TTL & Validation */}
        <div className="hidden lg:flex items-center gap-2.5">
          {cortegeStatus === "MOBILE" ? (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-950/40 border border-cyan-500/35 rounded-full text-cyan-200 text-xs font-semibold">
              <PlayCircle className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Cortège en mouvement</span>
              <span className="text-[10px] font-mono text-cyan-400/80">(TTL 5m)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-950/40 border border-orange-500/35 rounded-full text-orange-200 text-xs font-semibold">
              <PauseCircle className="w-3.5 h-3.5 text-orange-400" />
              <span>Cortège statique</span>
              <span className="text-[10px] font-mono text-orange-400/80">(TTL 10m)</span>
            </div>
          )}

          {pendingCount > 0 && (
            <div className="text-[11px] text-zinc-300 font-mono bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
              {pendingCount} en validation
            </div>
          )}
        </div>

        {/* Droite : Actions principales espacées et lisibles */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {onOpenObservatory && (
            <button
              onClick={onOpenObservatory}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 bg-indigo-500/15 hover:bg-indigo-500/25 active:bg-indigo-500/35 border border-indigo-500/35 rounded-xl text-indigo-100 text-xs font-bold transition-all touch-manipulation min-h-[38px] sm:min-h-[40px]"
              title="Parcours, Chiffres & Topographie"
            >
              <BarChart3 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="hidden sm:inline">Parcours &amp; Chiffres</span>
              <span className="sm:hidden">Infos</span>
            </button>
          )}

          <button
            onClick={onOpenLegalSheet}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 bg-amber-500/15 hover:bg-amber-500/25 active:bg-amber-500/35 border border-amber-500/35 rounded-xl text-amber-100 text-xs font-bold transition-all touch-manipulation min-h-[38px] sm:min-h-[40px]"
            title="Droits & Numéros d'urgence"
          >
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">Droits &amp; Secours</span>
            <span className="sm:hidden">Droits</span>
          </button>

          <button
            onClick={onOpenLegalNotice}
            aria-label="Mentions légales"
            className="w-[38px] h-[38px] sm:w-[40px] sm:h-[40px] text-zinc-300 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors touch-manipulation flex items-center justify-center shrink-0"
            title="Mentions Légales & RGPD"
          >
            <Scale className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
