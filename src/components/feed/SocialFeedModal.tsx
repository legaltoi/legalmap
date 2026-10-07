"use client";

import React, { useState } from "react";
import {
  X,
  RefreshCw,
  ExternalLink,
  Radio,
  Copy,
  Check,
  AlertTriangle,
  Heart,
  Repeat2,
  BadgeCheck,
  Image as ImageIcon,
  Video as VideoIcon,
  Clock,
  Smartphone,
  Globe,
  Share2,
} from "lucide-react";
import { useSocialFeed } from "@/hooks/useSocialFeed";
import {
  OFFICIAL_X_LIVE_URL,
  OFFICIAL_X_MEDIA_URL,
  OFFICIAL_X_HASHTAG_URL,
  OFFICIAL_X_APP_DEEP_LINK,
  SocialPost,
  formatRelativeTime,
} from "@/services/socialFeedService";

interface SocialFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SocialFeedModal({ isOpen, onClose }: SocialFeedModalProps) {
  const { posts, isLoading, isRefreshing, error, lastUpdated, isConfigured, refetch } =
    useSocialFeed({ query: "Nantes manif", autoRefreshInterval: 60000 });

  const [hasCopiedUrl, setHasCopiedUrl] = useState(false);

  const handleCopyUrl = (url: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setHasCopiedUrl(true);
      setTimeout(() => setHasCopiedUrl(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="social-feed-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl max-h-[92dvh] sm:max-h-[85vh] bg-[#09090b] border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100 select-text"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Poignée tactile mobile */}
        <div className="sm:hidden w-full flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-zinc-700/80 rounded-full" />
        </div>

        {/* En-tête OLED */}
        <header className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/80 bg-[#121216]">
          <div className="flex items-center gap-3">
            <div className="relative p-2 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-400 flex items-center justify-center">
              <Radio className="w-5 h-5 animate-pulse text-rose-400" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="social-feed-title" className="text-base font-extrabold text-white tracking-tight">
                  Flux Live X — Nantes Manif
                </h2>
                <span className="hidden xs:inline-block px-2 py-0.5 bg-rose-950/60 border border-rose-500/30 text-rose-300 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase">
                  f=live
                </span>
              </div>
              <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5 font-mono truncate max-w-xs sm:max-w-md">
                <span>x.com/search?q=Nantes manif&amp;f=live</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => refetch()}
              disabled={isRefreshing}
              className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all active:scale-95 disabled:opacity-50"
              title="Rafraîchir"
              aria-label="Rafraîchir"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
            </button>

            <button
              onClick={onClose}
              aria-label="Fermer"
              className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Corps du modal */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700">
          {/* Module 1 : Carte d'accès réseau direct vers x.com/search */}
          <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-[#101014] to-black border border-zinc-700/80 rounded-3xl p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold font-mono tracking-wide uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                  Flux Réseau Réel
                </span>
                <h3 className="text-base font-black text-white mt-2">
                  Dépêches &amp; Vidéos en direct sur X
                </h3>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                  Accédez directement aux publications et vidéos diffusées en temps réel à Nantes, sans intermédiaire ni filtrage.
                </p>
              </div>
            </div>

            {/* Bouton d'action principal 1-clic */}
            <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row gap-2.5">
              <a
                href={OFFICIAL_X_LIVE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 bg-white hover:bg-zinc-200 active:scale-[0.99] text-black font-extrabold text-xs rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Globe className="w-4 h-4 text-black" />
                <span>Ouvrir x.com/search (Flux en direct)</span>
                <ExternalLink className="w-3.5 h-3.5 text-black" />
              </a>

              <a
                href={OFFICIAL_X_APP_DEEP_LINK}
                className="py-3 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 active:scale-[0.99] text-zinc-200 hover:text-white font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2"
                title="Ouvrir directement dans l'application mobile X"
              >
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">Ouvrir dans l&apos;App X</span>
                <span className="sm:hidden">App X</span>
              </a>
            </div>
          </div>

          {/* Module 2 : Raccourcis de recherche ciblés tirés directement de x.com */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-1 font-mono">
              Filtres Réseau Disponibles (100 % Réels)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Raccourci 1 : En direct */}
              <a
                href={OFFICIAL_X_LIVE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-[#111115] hover:bg-[#16161c] border border-zinc-800 rounded-2xl flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 group-hover:bg-rose-500/20 transition-colors">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                      Nantes manif — En direct
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      f=live • Chronologique strict
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
              </a>

              {/* Raccourci 2 : Médias / Vidéos */}
              <a
                href={OFFICIAL_X_MEDIA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-[#111115] hover:bg-[#16161c] border border-zinc-800 rounded-2xl flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                    <VideoIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      Photos &amp; Vidéos de terrain
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      f=media • Visuels seuls
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
              </a>

              {/* Raccourci 3 : #ManifNantes */}
              <a
                href={OFFICIAL_X_HASHTAG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-[#111115] hover:bg-[#16161c] border border-zinc-800 rounded-2xl flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                    <span className="font-mono font-black text-xs">#</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                      Hashtag #ManifNantes
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      Fil officiel du mot-dièse
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
              </a>

              {/* Raccourci 4 : Copier l'URL officielle */}
              <button
                onClick={() => handleCopyUrl(OFFICIAL_X_LIVE_URL)}
                className="p-3 bg-[#111115] hover:bg-[#16161c] border border-zinc-800 rounded-2xl flex items-center justify-between text-left group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {hasCopiedUrl ? "Lien officiel copié !" : "Partager le lien X direct"}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      Presse-papier sécurisé
                    </div>
                  </div>
                </div>
                {hasCopiedUrl ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
                )}
              </button>
            </div>
          </div>

          {/* Module 3 : Affichage des publications réelles (si fournies par un point d'accès réseau réel) */}
          {posts.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-1 font-mono">
                Messages Récupérés du Réseau ({posts.length})
              </h4>

              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-[#101014] hover:bg-[#141419] border border-zinc-800 rounded-2xl p-4 transition-all shadow-md group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {post.authorAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.authorAvatar}
                          alt={post.authorName}
                          className="w-9 h-9 rounded-full object-cover border border-zinc-700"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white uppercase font-mono">
                          {post.authorName.slice(0, 2)}
                        </div>
                      )}

                      <div className="leading-tight">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-white">{post.authorName}</span>
                          {post.authorVerified && (
                            <BadgeCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-400 font-mono">
                          @{post.authorHandle}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono shrink-0">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      <span>{formatRelativeTime(post.timestamp)}</span>
                    </div>
                  </div>

                  <p className="mt-2.5 text-xs text-zinc-200 leading-relaxed font-sans select-text whitespace-pre-wrap">
                    {post.content}
                  </p>

                  {post.mediaUrl && (
                    <div className="mt-3 relative rounded-xl overflow-hidden border border-zinc-800 bg-black aspect-video max-h-64 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.mediaUrl}
                        alt="Média X"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-center justify-end">
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg font-bold text-[10px] transition-colors"
                    >
                      <span>Voir sur X</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Information d'intégrité réseau */}
          <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl text-[11px] text-zinc-400 leading-relaxed">
            <span className="font-semibold text-zinc-300">Intégrité des données : </span>
            Afin de respecter la stricte exactitude de l&apos;information et les conditions d&apos;utilisation, LEGALMAPS ne génère aucune donnée artificielle. La consultation s&apos;effectue directement sur la requête temps réel de la plateforme X.
          </div>
        </div>

        {/* Pied de page */}
        <footer className="px-5 py-2.5 bg-[#0a0a0d] border-t border-zinc-800/80 text-[11px] text-zinc-500 flex items-center justify-between">
          <span className="truncate">Réf : https://x.com/search?q=Nantes manif&amp;f=live</span>
          <span className="font-mono text-[10px] text-zinc-600 shrink-0">100% Réseau</span>
        </footer>
      </div>
    </div>
  );
}

/**
 * Bouton d'action flottant tactile pour ouvrir le flux live officiel depuis la carte
 */
export function SocialFeedTriggerButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative flex items-center gap-2 px-3 py-2 bg-black/90 hover:bg-zinc-900 active:scale-95 border border-rose-500/40 hover:border-rose-400 rounded-2xl text-rose-300 shadow-2xl backdrop-blur-xl transition-all touch-manipulation min-h-[44px]"
      title="Ouvrir le flux en direct X #ManifNantes"
      aria-label="Flux direct X #ManifNantes"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
      </span>
      <Radio className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
      <span className="text-xs font-black tracking-wide text-white">Live X #ManifNantes</span>
    </button>
  );
}
