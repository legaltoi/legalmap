"use client";

import React from "react";
import { Radio } from "lucide-react";

interface ToolbarProps {
  onToggleSocialFeed: () => void;
  isSocialFeedOpen?: boolean;
}

export function Toolbar({ onToggleSocialFeed, isSocialFeedOpen = false }: ToolbarProps) {
  return (
    <div className="pointer-events-auto flex items-center gap-2">
      {/* Bouton de bascule du Flux Live #ManifNantes */}
      <button
        onClick={onToggleSocialFeed}
        className={`group relative flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all touch-manipulation min-h-[44px] shadow-lg border backdrop-blur-xl ${
          isSocialFeedOpen
            ? "bg-rose-600 text-white border-rose-400 shadow-rose-900/40"
            : "bg-black/90 hover:bg-zinc-900 text-rose-300 border-rose-500/40 hover:border-rose-400"
        }`}
        title="Ouvrir le flux en direct X/Twitter #ManifNantes"
        aria-label="Toggle flux live social"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
        </span>
        <Radio className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
        <span className="font-extrabold tracking-wide text-white">Live #ManifNantes</span>
      </button>
    </div>
  );
}

