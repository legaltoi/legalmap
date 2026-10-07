"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  RefreshCw,
  ExternalLink,
  Radio,
  Share2,
  Copy,
  Check,
  AlertTriangle,
  Heart,
  Repeat2,
  BadgeCheck,
  Image as ImageIcon,
  Video as VideoIcon,
  Clock,
  Sparkles,
} from "lucide-react";
import { useSocialFeed } from "@/hooks/useSocialFeed";
import { SocialPost, formatRelativeTime } from "@/services/socialFeedService";

interface SocialFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SocialFeedModal({ isOpen, onClose }: SocialFeedModalProps) {
  const { posts, isLoading, isRefreshing, error, lastUpdated, isFallback, refetch } =
    useSocialFeed({ autoRefreshInterval: 60000 });

  const [activeFilter, setActiveFilter] = useState<"all" | "media">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filtrage des posts selon l'onglet actif
  const filteredPosts = useMemo(() => {
    if (activeFilter === "media") {
      return posts.filter((p) => Boolean(p.mediaUrl));
    }
    return posts;
  }, [posts, activeFilter]);

  // Copier le lien du tweet
  const handleCopyLink = (post: SocialPost, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(post.url);
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Formatage du texte pour mettre en avant les #hashtags et les @mentions
  const renderFormattedContent = (content: string) => {
    const tokens = content.split(/(\s+)/);
    return tokens.map((token, i) => {
      if (token.startsWith("#")) {
        return (
          <span key={i} className="text-cyan-400 font-semibold hover:underline">
            {token}
          </span>
        );
      }
      if (token.startsWith("@")) {
        return (
          <span key={i} className="text-blue-400 font-medium hover:underline">
            {token}
          </span>
        );
      }
      return <span key={i}>{token}</span>;
    });
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
        {/* Poignée de glissement tactile pour mobile */}
        <div className="sm:hidden w-full flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-zinc-700/80 rounded-full" />
        </div>

        {/* En-tête du modal OLED */}
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
                  Flux Live #ManifNantes
                </h2>
                <span className="hidden xs:inline-block px-2 py-0.5 bg-rose-950/60 border border-rose-500/30 text-rose-300 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase">
                  Direct X
                </span>
              </div>
              <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <span>Veille citoyenne et dépêches du terrain</span>
                {lastUpdated && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-[11px] text-zinc-500">
                      Sync {lastUpdated.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Bouton Rafraîchir */}
            <button
              onClick={() => refetch()}
              disabled={isRefreshing}
              className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all active:scale-95 disabled:opacity-50"
              title="Rafraîchir le flux"
              aria-label="Rafraîchir les messages"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
            </button>

            {/* Bouton Fermer */}
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Barre de filtres et d'état du relais */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-[#0e0e12] border-b border-zinc-800/80 gap-2">
          {/* Onglets de filtrage */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                activeFilter === "all"
                  ? "bg-white text-black shadow-md"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              Tous ({posts.length})
            </button>
            <button
              onClick={() => setActiveFilter("media")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFilter === "media"
                  ? "bg-white text-black shadow-md"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Médias ({posts.filter((p) => p.mediaUrl).length})</span>
            </button>
          </div>

          {/* Badge indicateur du relais */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            {isFallback ? (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 text-[10px]"
                title="Relais de synthèse locale activé (zéro dépendance externe / compatible hors-ligne)"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span className="hidden xs:inline">Synthèse Locale</span>
                <span className="xs:hidden">Local</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>API Directe</span>
              </span>
            )}
          </div>
        </div>

        {/* Zone de contenu déroulante */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 scrollbar-thin scrollbar-thumb-zinc-700">
          {/* 1. État de chargement (Skeletons) */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 animate-pulse space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-zinc-800 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <div className="w-28 h-3.5 bg-zinc-800 rounded" />
                      <div className="w-16 h-2.5 bg-zinc-800/70 rounded" />
                    </div>
                  </div>
                  <div className="w-full h-3 bg-zinc-800/80 rounded" />
                  <div className="w-4/5 h-3 bg-zinc-800/80 rounded" />
                  <div className="w-2/3 h-3 bg-zinc-800/60 rounded" />
                </div>
              ))}
            </div>
          )}

          {/* 2. État d'erreur */}
          {!isLoading && error && (
            <div className="p-4 bg-rose-950/30 border border-rose-500/30 rounded-2xl text-rose-200 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => refetch()}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shrink-0"
              >
                Réessayer
              </button>
            </div>
          )}

          {/* 3. État vide */}
          {!isLoading && !error && filteredPosts.length === 0 && (
            <div className="py-12 text-center text-zinc-500">
              <Radio className="w-8 h-8 mx-auto mb-2 opacity-40 text-zinc-400" />
              <p className="text-sm font-semibold text-zinc-400">Aucun message trouvé pour cette sélection.</p>
              <p className="text-xs text-zinc-600 mt-1">
                Les signalements en direct s&apos;actualisent automatiquement.
              </p>
            </div>
          )}

          {/* 4. Liste des cartes de posts */}
          {!isLoading &&
            filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-[#101014] hover:bg-[#141419] border border-zinc-800/90 rounded-2xl p-4 transition-all shadow-md group"
              >
                {/* En-tête du post */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {/* Avatar ou initiale stylisée */}
                    {post.authorAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-9 h-9 rounded-full object-cover border border-zinc-700"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white uppercase font-mono">
                        {post.authorName.slice(0, 2)}
                      </div>
                    )}

                    <div className="leading-tight">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {post.authorName}
                        </span>
                        {post.authorVerified && (
                          <BadgeCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        @{post.authorHandle}
                      </span>
                    </div>
                  </div>

                  {/* Horodatage relatif */}
                  <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono shrink-0">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    <span>{formatRelativeTime(post.timestamp)}</span>
                  </div>
                </div>

                {/* Contenu textuel */}
                <p className="mt-2.5 text-xs text-zinc-200 leading-relaxed font-sans select-text">
                  {renderFormattedContent(post.content)}
                </p>

                {/* Média attaché (Photo ou Vidéo) */}
                {post.mediaUrl && (
                  <div className="mt-3 relative rounded-xl overflow-hidden border border-zinc-800/80 bg-black aspect-video max-h-64 flex items-center justify-center group/media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.mediaUrl}
                      alt="Média d'illustration"
                      className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {post.mediaType === "video" && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="p-3 bg-rose-600/90 rounded-full text-white shadow-xl flex items-center justify-center">
                          <VideoIcon className="w-5 h-5 fill-current" />
                        </div>
                      </div>
                    )}

                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 backdrop-blur-md rounded-md text-[10px] font-mono text-zinc-300 border border-zinc-700/60">
                      {post.mediaType === "video" ? "Vidéo" : "Image"}
                    </span>
                  </div>
                )}

                {/* Pied de carte : Engagement & Actions externes */}
                <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-center justify-between text-zinc-400 text-[11px]">
                  <div className="flex items-center gap-4">
                    {typeof post.retweetsCount === "number" && (
                      <span className="flex items-center gap-1 text-zinc-400 font-mono hover:text-emerald-400 transition-colors">
                        <Repeat2 className="w-3.5 h-3.5" />
                        <span>{post.retweetsCount}</span>
                      </span>
                    )}
                    {typeof post.likesCount === "number" && (
                      <span className="flex items-center gap-1 text-zinc-400 font-mono hover:text-rose-400 transition-colors">
                        <Heart className="w-3.5 h-3.5" />
                        <span>{post.likesCount}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Copier le lien */}
                    <button
                      onClick={(e) => handleCopyLink(post, e)}
                      className="p-1.5 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-1"
                      title="Copier le lien"
                      aria-label="Copier le lien du message"
                    >
                      {copiedId === post.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-[10px] text-emerald-400 font-mono">Copié</span>
                        </>
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>

                    {/* Ouvrir sur X / Nitter */}
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg font-bold text-[10px] transition-colors"
                      title="Ouvrir la publication originale sur X"
                    >
                      <span>Voir sur X</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
        </div>

        {/* Pied de page informatif RGPD */}
        <footer className="px-5 py-2.5 bg-[#0a0a0d] border-t border-zinc-800/80 text-[11px] text-zinc-500 flex items-center justify-between">
          <span>🔒 Consultation anonyme • Zéro traçage IP</span>
          <span className="font-mono text-[10px] text-zinc-600">LEGALMAPS Live Feed v1.0</span>
        </footer>
      </div>
    </div>
  );
}

/**
 * Bouton d'action flottant rétractable pour ouvrir le flux live depuis la carte
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
      title="Ouvrir le flux Live #ManifNantes"
      aria-label="Flux direct X #ManifNantes"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
      </span>
      <Radio className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
      <span className="text-xs font-black tracking-wide text-white">Live #ManifNantes</span>
    </button>
  );
}
