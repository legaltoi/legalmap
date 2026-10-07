"use client";

import React, { useState } from "react";
import { Wind, Navigation2, RefreshCw, X, ShieldAlert, Thermometer, Compass, ChevronRight } from "lucide-react";
import { WindData } from "@/services/weatherService";

interface WindBadgeProps {
  windData: WindData | null;
  isLoading: boolean;
  onRefresh?: () => void;
  onClose?: () => void;
}

export function WindBadge({ windData, isLoading, onRefresh, onClose }: WindBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!windData && !isLoading) return null;

  return (
    <>
      {/* 1. Badge HUD compact flottant sur la carte */}
      <div className="absolute top-28 left-3 sm:left-4 z-20 pointer-events-auto select-none animate-in fade-in duration-200">
        <div
          onClick={() => setIsExpanded(true)}
          className="group cursor-pointer bg-black/90 hover:bg-zinc-950 active:scale-[0.98] backdrop-blur-xl border border-cyan-500/40 hover:border-cyan-400 rounded-2xl p-2.5 shadow-2xl transition-all flex items-center gap-2.5 max-w-xs text-zinc-100"
          title="Cliquez pour voir les détails de dispersion du vent"
        >
          {/* Boussole rotative montrant la direction de souffle */}
          <div className="relative w-9 h-9 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center shrink-0 shadow-inner">
            <div
              className="transition-transform duration-500 ease-out"
              style={{
                transform: `rotate(${windData ? windData.blowToDeg : 0}deg)`,
              }}
            >
              <Navigation2 className="w-5 h-5 text-cyan-400 fill-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
            </div>
            <span className="sr-only">Direction : {windData?.blowToDeg}°</span>
          </div>

          {/* Informations principales */}
          <div className="leading-tight pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white tracking-tight">
                {isLoading ? "Actualisation..." : `${windData?.speedKmh} km/h`}
              </span>
              {windData && (
                <span className="text-[10px] text-cyan-300 font-mono font-bold bg-cyan-950/60 px-1 py-0.2 rounded border border-cyan-500/30">
                  {windData.cardinalFrom}
                </span>
              )}
            </div>
            <div className="text-[10px] text-zinc-400 font-medium flex items-center gap-1 mt-0.5">
              <span className="text-zinc-300">Souffle :</span>
              <span className="text-cyan-400 font-mono font-bold">{windData?.cardinalTo}</span>
              <ChevronRight className="w-3 h-3 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Modale / Fiche tactique détaillée au clic */}
      {isExpanded && windData && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setIsExpanded(false)}
        >
          <div
            className="w-full max-w-sm bg-[#0a0a0d] border border-cyan-500/40 rounded-3xl p-5 shadow-2xl text-zinc-100 flex flex-col gap-4 animate-in slide-in-from-bottom-2 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-500/15 border border-cyan-500/30 rounded-2xl text-cyan-400">
                  <Wind className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Vent &amp; Dispersion en direct
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono">{windData.source}</p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-xl transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Vitesse & Direction */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-[#121217] border border-zinc-800 rounded-2xl p-3 flex flex-col justify-between">
                <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">Vitesse Moyenne</span>
                <div className="text-xl font-black text-white mt-1">
                  {windData.speedKmh} <span className="text-xs font-normal text-zinc-400">km/h</span>
                </div>
                <div className="text-[10px] text-cyan-300 font-mono mt-1">
                  Rafales : {windData.gustsKmh} km/h
                </div>
              </div>

              <div className="bg-[#121217] border border-zinc-800 rounded-2xl p-3 flex flex-col justify-between">
                <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">Axe du Souffle</span>
                <div className="text-lg font-black text-cyan-400 mt-1 flex items-center gap-1.5">
                  <div
                    className="w-4 h-4 transition-transform inline-block"
                    style={{ transform: `rotate(${windData.blowToDeg}deg)` }}
                  >
                    <Navigation2 className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                  </div>
                  <span>{windData.blowToDeg}°</span>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono mt-1">
                  {windData.cardinalFrom} ➔ {windData.cardinalTo}
                </div>
              </div>
            </div>

            {/* Fiche tactique : Propagation des Gaz Lacrymogènes */}
            <div className="bg-gradient-to-br from-amber-950/40 via-zinc-900 to-black border border-amber-500/40 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-black text-amber-300 uppercase tracking-wide">
                  Impact Sanitaire : Gaz Lacrymogène
                </span>
              </div>
              <p className="text-xs text-zinc-200 leading-relaxed">
                {windData.gasAdvice}
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                <span>Échelle Beaufort : {windData.beaufortScale}/12</span>
                <span className="text-amber-400 font-bold">{windData.beaufortDescription}</span>
              </div>
            </div>

            {/* Température & Horodatage */}
            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono px-1">
              <span className="flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                {windData.temperatureC} °C à Nantes
              </span>
              <span>
                Sync {new Date(windData.updatedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1 border-t border-zinc-800">
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="flex-1 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 active:scale-95 border border-zinc-700 text-zinc-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                  <span>Actualiser le vent</span>
                </button>
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  className="py-2 px-3 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-bold transition-colors"
                >
                  Masquer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
