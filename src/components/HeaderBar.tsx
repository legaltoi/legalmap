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
      className="fixed top-0 left-0 right-0 z-30 pointer-events-none px-2.5 pt-2 sm:px-4 sm:pt-3"
      style={{ paddingTop: "max(8px, env(safe-area-inset-top, 8px))" }}
    >
      <div className="pointer-events-auto max-w-4xl mx-auto bg-black/90 backdrop-blur-xl border border-zinc-800/90 rounded-2xl px-3 py-2 shadow-2xl flex items-center justify-between gap-2">
        {/* Gauche : Marque + État du cortège intégré (zéro superposition sur mobile) */}
        <button
          onClick={onRecenterCity}
          aria-label="Recentrer sur Nantes"
          className="flex items-center gap-2.5 text-left group focus:outline-none min-w-0"
          title="Recentrer sur Nantes"
        >
          <div className="p-2 bg-blue-500/20 border border-blue-400/30 rounded-xl text-blue-400 group-hover:bg-blue-500/30 transition-colors shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-xs sm:text-sm font-black text-white tracking-wider">
                LEGALMAPS
              </span>
              <span className="text-[10px] text-zinc-300 font-semibold bg-zinc-800/90 px-1.5 py-0.5 rounded-md">
                Nantes
              </span>
            </div>

            {/* Sous-titre unifié : État Cortège + Statut Réseau */}
            <div className="flex items-center gap-2 mt-1 text-[10px] font-medium leading-none">
              {cortegeStatus === "MOBILE" ? (
                <span className="flex items-center gap-1 text-cyan-300 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Cortège Mobile
                </span>
              ) : (
                <span className="flex items-center gap-1 text-orange-300 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  Cortège Immobile
                </span>
              )}
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-1 text-zinc-400">
                <span className={`w-1.5 h-1.5 rounded-full ${statusDotColor}`} />
                <span>{statusLabel}</span>
              </span>
            </div>
          </div>
        </button>

        {/* Centre (Desktop uniquement) : Détail TTL & Validation */}
        <div className="hidden md:flex items-center gap-2">
          {cortegeStatus === "MOBILE" ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-cyan-950/40 border border-cyan-500/40 rounded-full text-cyan-300 text-xs font-bold">
              <PlayCircle className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Cortège Mobile</span>
              <span className="text-[10px] font-normal text-cyan-400/80">(TTL 5m)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-950/40 border border-orange-500/40 rounded-full text-orange-300 text-xs font-bold">
              <PauseCircle className="w-3.5 h-3.5 text-orange-400" />
              <span>Cortège Immobile</span>
              <span className="text-[10px] font-normal text-orange-400/80">(TTL 10m)</span>
            </div>
          )}

          {pendingCount > 0 && (
            <div className="text-[10px] text-zinc-400 font-mono bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-800">
              {pendingCount} en validation
            </div>
          )}
        </div>

        {/* Droite : Actions principales aérées */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onOpenObservatory && (
            <button
              onClick={onOpenObservatory}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-500/15 hover:bg-indigo-500/25 active:bg-indigo-500/35 border border-indigo-500/35 rounded-xl text-indigo-200 text-xs font-bold transition-all touch-manipulation min-h-[38px]"
              title="Parcours, Chiffres & 8 Zones"
            >
              <BarChart3 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="hidden sm:inline">Infos &amp; Chiffres</span>
              <span className="sm:hidden">Infos</span>
            </button>
          )}

          <button
            onClick={onOpenLegalSheet}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/15 hover:bg-amber-500/25 active:bg-amber-500/35 border border-amber-500/35 rounded-xl text-amber-200 text-xs font-bold transition-all touch-manipulation min-h-[38px]"
            title="Droits & Numéros d'urgence"
          >
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">Droits &amp; Secours</span>
            <span className="sm:hidden">Droits</span>
          </button>

          <button
            onClick={onOpenLegalNotice}
            aria-label="Mentions légales"
            className="p-2 text-zinc-400 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors touch-manipulation min-h-[38px] min-w-[38px] flex items-center justify-center"
            title="Mentions Légales & RGPD"
          >
            <Scale className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
