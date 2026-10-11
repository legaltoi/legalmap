"use client";

import React, { useState } from "react";
import { Wind, RefreshCw, X, ShieldAlert, Thermometer } from "lucide-react";
import { WindData } from "@/services/weatherService";

interface WindBadgeProps {
  windData: WindData | null;
  isLoading: boolean;
  onRefresh?: () => void;
  onClose?: () => void;
}

/**
 * Aiguille de vent SVG minimaliste et fine
 */
function MinimalWindArrow({ deg, size = 18 }: { deg: number; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="transition-transform duration-500 ease-out"
      style={{ transform: `rotate(${deg}deg)` }}
    >
      <line
        x1="12"
        y1="20"
        x2="12"
        y2="4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeOpacity="0.85"
      />
      <path
        d="M8.5 8.5L12 4L15.5 8.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="20" r="1.4" fill="currentColor" fillOpacity="0.45" />
    </svg>
  );
}

export function WindBadge({ windData, isLoading, onRefresh, onClose }: WindBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!windData && !isLoading) return null;

  return (
    <>
      {/* 1. Pillule HUD minimaliste et discrète sous la barre de filtres */}
      <div
        className="absolute left-0 right-0 z-20 pointer-events-none select-none animate-in fade-in duration-200 px-2.5 sm:px-4"
        style={{ top: "calc(max(10px, env(safe-area-inset-top, 10px)) + 118px)" }}
      >
        <div className="max-w-5xl mx-auto flex justify-start">
          <div
            onClick={() => setIsExpanded(true)}
            className="pointer-events-auto group cursor-pointer bg-zinc-950/90 hover:bg-zinc-900 backdrop-blur-md border border-zinc-800 hover:border-cyan-500/40 rounded-full px-3.5 py-1.5 shadow-lg transition-all flex items-center gap-2 text-zinc-200"
            title="Détails du vent et dispersion"
          >
            <span className="text-cyan-300/90 flex items-center justify-center">
              <MinimalWindArrow deg={windData ? windData.blowToDeg : 0} size={16} />
            </span>
            <span className="text-[11px] font-bold text-white tracking-tight">
              {isLoading ? "..." : `${windData?.speedKmh} km/h`}
            </span>
            {windData && (
              <span className="text-[10px] text-zinc-400 font-mono">
                {windData.cardinalFrom} → {windData.cardinalTo}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Fiche minimaliste au clic */}
      {isExpanded && windData && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setIsExpanded(false)}
        >
          <div
            className="w-full max-w-xs bg-[#0b0b0f] border border-zinc-800 rounded-3xl p-4 shadow-2xl text-zinc-100 flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">
                  <MinimalWindArrow deg={windData.blowToDeg} size={20} />
                </span>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    Vent en direct • Nantes
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-mono">{windData.source}</p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-2.5">
                <span className="text-[9px] text-zinc-500 font-mono uppercase">Vitesse</span>
                <div className="text-base font-black text-white mt-0.5">
                  {windData.speedKmh} <span className="text-[10px] font-normal text-zinc-400">km/h</span>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  Rafales {windData.gustsKmh} km/h
                </div>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-2.5">
                <span className="text-[9px] text-zinc-500 font-mono uppercase">Souffle vers</span>
                <div className="text-base font-black text-cyan-300 mt-0.5">
                  {windData.cardinalTo} ({windData.blowToDeg}°)
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  Vient de {windData.cardinalFrom}
                </div>
              </div>
            </div>

            <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-2.5 text-[11px] text-zinc-300 leading-relaxed">
              <span className="text-amber-300 font-bold">⚠️ Gaz : </span>
              {windData.gasAdvice}
            </div>

            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
              <span className="flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-rose-400" />
                {windData.temperatureC} °C
              </span>
              <div className="flex items-center gap-1.5">
                {onRefresh && (
                  <button
                    onClick={onRefresh}
                    className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Actualiser
                  </button>
                )}
                {onClose && (
                  <button
                    onClick={() => {
                      setIsExpanded(false);
                      onClose();
                    }}
                    className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800"
                  >
                    Masquer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
