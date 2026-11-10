"use client";

import React, { useState, useEffect } from "react";
import { Share, PlusSquare, X } from "lucide-react";

const DISMISSED_KEY = "legalmaps_ios_prompt_dismissed";

export function IosInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Vérifier si déjà masqué dans cette session
    try {
      if (sessionStorage.getItem(DISMISSED_KEY) === "1") {
        return;
      }
    } catch {}

    // Détection iOS (iPhone, iPad, iPod)
    const isIos =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    // Détection Safari iOS
    const isSafari =
      /Safari/.test(navigator.userAgent) &&
      !/CriOS|FxiOS|EdgiOS|OPiOS/.test(navigator.userAgent);

    // Détection si l'application tourne DÉJÀ en mode Standalone (PWA installée)
    const isStandalone =
      ("standalone" in window.navigator &&
        Boolean((window.navigator as unknown as { standalone?: boolean }).standalone)) ||
      window.matchMedia("(display-mode: standalone)").matches;

    // Afficher uniquement aux utilisateurs iOS Safari non-standalone
    if (isIos && !isStandalone) {
      // Léger délai pour ne pas parasiter l'apparition de la carte
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    try {
      sessionStorage.setItem(DISMISSED_KEY, "1");
    } catch {}
  };

  if (!showPrompt) return null;

  return (
    <aside
      role="complementary"
      aria-label="Guide d'installation iOS"
      className="fixed bottom-24 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-sm z-30 pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="p-3.5 bg-zinc-950/95 backdrop-blur-xl border border-zinc-700/90 rounded-2xl shadow-2xl text-zinc-100 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0 text-blue-400 mt-0.5">
          <Share className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0 text-xs">
          <div className="flex items-center justify-between gap-1">
            <h4 className="font-bold text-white text-[13px] tracking-tight">
              Installer l&apos;application iOS
            </h4>
            <button
              onClick={handleDismiss}
              aria-label="Fermer"
              className="p-1 -mr-1 -mt-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-zinc-300 mt-1 leading-relaxed">
            Pour l&apos;utiliser en plein écran comme une vraie application sans les barres Safari :
          </p>

          <div className="mt-2 space-y-1.5 text-[11px] font-medium text-zinc-200 bg-zinc-900/80 p-2 rounded-xl border border-zinc-800/80">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-500/30 text-blue-300 flex items-center justify-center font-bold text-[10px]">
                1
              </span>
              <span>
                Appuyez sur <strong className="text-white">Partager</strong> (icône{" "}
                <Share className="w-3 h-3 inline-block mx-0.5 -mt-0.5 text-blue-400" /> dans Safari)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-500/30 text-blue-300 flex items-center justify-center font-bold text-[10px]">
                2
              </span>
              <span>
                Choisissez{" "}
                <strong className="text-white flex-inline items-center gap-1">
                  « Sur l&apos;écran d&apos;accueil »{" "}
                  <PlusSquare className="w-3 h-3 inline-block mx-0.5 -mt-0.5 text-zinc-300" />
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
