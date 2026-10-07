"use client";

import React from "react";
import {
  Shield,
  Scale,
  Wifi,
  WifiOff,
  Navigation,
  PauseCircle,
  PlayCircle,
  HelpCircle,
  Layers,
  Radio,
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
  onOpenSocialFeed?: () => void;
}

export function HeaderBar({
  cortegeStatus,
  realtimeStatus,
  pendingCount,
  onOpenLegalSheet,
  onOpenLegalNotice,
  onRecenterCity,
  onOpenSocialFeed,
}: HeaderBarProps) {
  const getStatusBadge = () => {
    switch (realtimeStatus) {
      case "connected":
        return (
          <span
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400 font-medium"
            title="Connecté au relais Supabase Broadcast (zéro persistance)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Direct
          </span>
        );
      case "demo_local":
        return (
          <span
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-[10px] text-sky-400 font-medium"
            title="Mode relais local PWA / Hors-ligne (BroadcastChannel)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            Local PWA
          </span>
        );
      case "offline":
      default:
        return (
          <span
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-400 font-medium"
            title="Hors-ligne - Tuiles et fiches locales actives"
          >
            <WifiOff className="w-3 h-3 text-amber-400" />
            Hors-ligne
          </span>
        );
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-30 pointer-events-none p-2 sm:p-3"
      style={{ paddingTop: "max(8px, env(safe-area-inset-top, 8px))" }}
    >
      <div className="pointer-events-auto max-w-4xl mx-auto bg-black/85 backdrop-blur-xl border border-zinc-800/80 rounded-2xl px-3 py-2 shadow-xl flex items-center justify-between gap-2">
        {/* Left: Brand & City */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRecenterCity}
            aria-label="Recentrer sur Nantes"
            className="flex items-center gap-2 text-left group focus:outline-none"
            title="Recentrer sur le parcours"
          >
            <div className="p-1.5 bg-blue-500/20 border border-blue-400/30 rounded-xl text-blue-400 group-hover:bg-blue-500/30 transition-colors">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xs font-black text-white tracking-wider">LEGALMAPS</span>
                <span className="text-[10px] text-zinc-400 font-medium bg-zinc-800/80 px-1.5 py-0.5 rounded-md">
                  Nantes
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                Carto Citoyenne &amp; Sécurité
              </div>
            </div>
          </button>
        </div>

        {/* Center: Cortege Movement Banner */}
        <div className="hidden sm:flex items-center gap-2">
          {cortegeStatus === "MOBILE" ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-950/40 border border-cyan-500/40 rounded-full text-cyan-300 text-xs font-bold shadow-sm">
              <PlayCircle className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Cortège Mobile</span>
              <span className="text-[10px] font-normal text-cyan-400/80">(TTL 5m)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-950/40 border border-orange-500/40 rounded-full text-orange-300 text-xs font-bold shadow-sm">
              <PauseCircle className="w-3.5 h-3.5 text-orange-400" />
              <span>Cortège Immobile</span>
              <span className="text-[10px] font-normal text-orange-400/80">(TTL 10m)</span>
            </div>
          )}

          {pendingCount > 0 && (
            <div
              className="text-[10px] text-zinc-400 font-mono bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800"
              title="Signalements individuels en attente d'un 2ème rapport de consensus dans les 100m"
            >
              {pendingCount} en validation
            </div>
          )}
        </div>

        {/* Right: Status & Action Toggles */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {getStatusBadge()}

          {/* Bouton Flux Live X / #ManifNantes */}
          {onOpenSocialFeed && (
            <button
              onClick={onOpenSocialFeed}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 active:bg-rose-500/35 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-bold transition-all touch-manipulation min-h-[36px]"
              title="Flux Live X/Twitter #ManifNantes"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span className="hidden xs:inline">Flux Live</span>
              <span className="xs:hidden">Live</span>
            </button>
          )}

          {/* Droits & Fiches Réflexes Button */}
          <button
            onClick={onOpenLegalSheet}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 active:bg-amber-500/35 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-bold transition-all touch-manipulation min-h-[36px]"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Droits &amp; Secours</span>
            <span className="xs:hidden">Droits</span>
          </button>

          {/* Mentions Légales LCEN */}
          <button
            onClick={onOpenLegalNotice}
            aria-label="Mentions légales"
            className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors touch-manipulation min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Mentions Légales & RGPD (Article 6-III-2 LCEN)"
          >
            <Scale className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Cortege Banner Underneath */}
      <div className="sm:hidden mt-1.5 flex justify-center pointer-events-auto">
        {cortegeStatus === "MOBILE" ? (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-black/85 backdrop-blur-md border border-cyan-500/30 rounded-full text-cyan-300 text-[11px] font-bold">
            <PlayCircle className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>Cortège Mobile (TTL 5 min)</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-black/85 backdrop-blur-md border border-orange-500/30 rounded-full text-orange-300 text-[11px] font-bold">
            <PauseCircle className="w-3 h-3 text-orange-400" />
            <span>Cortège Immobile (TTL 10 min)</span>
          </div>
        )}
      </div>
    </header>
  );
}

