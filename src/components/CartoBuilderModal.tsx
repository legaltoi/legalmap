"use client";

import React from "react";
import { X, ExternalLink, Globe } from "lucide-react";

interface CartoBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  mapId?: string;
}

export function CartoBuilderModal({
  isOpen,
  onClose,
  mapId = "56fcb7a1-aa65-424e-beaf-24d547f0265a",
}: CartoBuilderModalProps) {
  if (!isOpen) return null;

  const cartoShareUrl = `https://pinea.app.carto.com/map/${mapId}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="carto-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-5xl h-[88vh] bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/90 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-500/20 border border-blue-400/30 rounded-xl text-blue-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 id="carto-modal-title" className="text-sm font-bold text-white flex items-center gap-2">
                Vue CARTO Builder Cloud
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  Workspace Pinea
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Projet cartographique en ligne synchronisé
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={cartoShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-xl font-medium transition-colors"
            >
              <span>Ouvrir dans CARTO</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 rounded-xl transition-colors"
              aria-label="Fermer la vue CARTO"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content: Iframe */}
        <div className="flex-1 w-full bg-[#050507] relative">
          <iframe
            src={cartoShareUrl}
            className="w-full h-full border-0"
            title="CARTO Builder Visualizer"
            allow="geolocation"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
