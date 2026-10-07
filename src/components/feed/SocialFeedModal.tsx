"use client";

import React, { useState } from "react";
import {
  X,
  RefreshCw,
  ExternalLink,
  Radio,
  AlertTriangle,
  Heart,
  Repeat2,
  BadgeCheck,
  Image as ImageIcon,
  Video as VideoIcon,
  Clock,
  Minimize2,
  Maximize2,
  ShieldCheck,
  Share2,
  Check,
  Copy,
} from "lucide-react";
import { useSocialFeed } from "@/hooks/useSocialFeed";
import { SocialPost, formatRelativeTime, OFFICIAL_X_SEARCH_URL } from "@/services/socialFeedService";

interface SocialFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SocialFeedModal({ isOpen, onClose }: SocialFeedModalProps) {
  const { posts, isLoading, isRefreshing, error, lastUpdated, isFallback, cooldownLeft, refetch } =
    useSocialFeed({ query: "Manif Nantes OR #ManifNantes", autoRefreshInterval: 60000 });

  const [isMinimized, setIsMinimized] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (post: SocialPost, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(post.url);
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

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
      className={`fixed z-50 transition-all duration-300 ${
        // Sur Mobile (<768px): Bottom Sheet / Drawer collapsible max 60vh
        // Sur Desktop (>=768px): Floating right-side panel w-96 max-h-[80vh]
        "inset-x-0 bottom-0 md:inset-auto md:right-4 md:bottom-24 md:w-96"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={`w-full bg-[#000000] border-t md:border border-slate-800 rounded-t-3xl md:rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden text-zinc-100 transition-all ${
          isMinimized
            ? "max-h-16"
            : "max-h-[60vh] md:max-h-[80vh]"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 12px)" }}
      >
        {/* Poignée tactile mobile (Min 44px tap target) */}
        <div
          onClick={() => setIsMinimized(!isMinimized)}
          className="md:hidden w-full flex items-center justify-center pt-2.5 pb-1 cursor-pointer min-h-[44px]"
        >
          <div className="w-12 h-1.5 bg-zinc-700/80 rounded-full" />
        </div>

        {/* En-tête OLED (Slate-800 borders) */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800/90 bg-[#070709]">
          <div className="flex items-center gap-2.5">
            <div className="relative p-1.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-400 flex items-center justify-center">
              <Radio className="w-4 h-4 animate-pulse text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 id="social-feed-title" className="text-xs font-black text-white tracking-wider uppercase">
                  Live #ManifNantes
                </h2>
                <span className="px-1.5 py-0.5 bg-rose-950/60 border border-rose-500/30 text-rose-300 rounded text-[9px] font-mono font-bold">
                  LCEN 6-III-2
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono">
                {lastUpdated
                  ? `Sync ${lastUpdated.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
                  : "Lecture seule en direct"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Bouton Rafraîchir avec rate-limit protection 10s */}
            <button
              onClick={() => refetch()}
              disabled={isRefreshing || cooldownLeft > 0}
              className="px-2 py-1.5 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-slate-800 rounded-xl transition-all active:scale-95 disabled:opacity-50 min-h-[36px] min-w-[36px] flex items-center justify-center gap-1 text-[10px] font-mono"
              title={cooldownLeft > 0 ? `Attendez ${cooldownLeft}s avant de rafraîchir` : "Rafraîchir le flux (anti-spam 10s)"}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
              {cooldownLeft > 0 && <span className="text-amber-400 font-bold">{cooldownLeft}s</span>}
            </button>

            {/* Bouton Réduire / Agrandir (Desktop) */}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hidden md:flex p-1.5 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-slate-800 rounded-xl transition-colors min-h-[36px] min-w-[36px] items-center justify-center"
              title={isMinimized ? "Agrandir le panneau" : "Réduire le panneau"}
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Bouton Fermer */}
            <button
              onClick={onClose}
              aria-label="Fermer le flux live"
              className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-slate-800 rounded-xl transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Corps du flux si non réduit */}
        {!isMinimized && (
          <>
            {/* Zone de contenu déroulante */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 scrollbar-thin scrollbar-thumb-zinc-800">
              {/* 1. SKELETON LOADER */}
              {isLoading && (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="bg-zinc-900/60 border border-slate-800 rounded-2xl p-3.5 animate-pulse space-y-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-zinc-800 rounded-full" />
                        <div className="space-y-1 flex-1">
                          <div className="w-24 h-3 bg-zinc-800 rounded" />
                          <div className="w-14 h-2 bg-zinc-800/70 rounded" />
                        </div>
                      </div>
                      <div className="w-full h-2.5 bg-zinc-800/80 rounded" />
                      <div className="w-3/4 h-2.5 bg-zinc-800/70 rounded" />
                    </div>
                  ))}
                </div>
              )}

              {/* 2. ERROR STATE */}
              {!isLoading && error && (
                <div className="p-3.5 bg-rose-950/40 border border-rose-500/40 rounded-2xl text-rose-200 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{error}</span>
                  </div>
                  <button
                    onClick={() => refetch()}
                    disabled={cooldownLeft > 0}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold rounded-xl text-[11px] shrink-0 min-h-[36px]"
                  >
                    Réessayer
                  </button>
                </div>
              )}

              {/* 3. EMPTY STATE */}
              {!isLoading && !error && posts.length === 0 && (
                <div className="py-8 text-center text-zinc-500">
                  <Radio className="w-7 h-7 mx-auto mb-2 opacity-30 text-zinc-400" />
                  <p className="text-xs font-semibold text-zinc-400">Aucune publication récente détectée.</p>
                  <a
                    href={OFFICIAL_X_SEARCH_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-cyan-400 font-bold hover:underline mt-2"
                  >
                    <span>Consulter directement sur X</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* 4. POSTS LIST (READ-ONLY) */}
              {!isLoading &&
                posts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-[#09090c] hover:bg-[#0d0d12] border border-slate-800 rounded-2xl p-3.5 transition-all shadow-md group"
                  >
                    {/* Header post */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {post.authorAvatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={post.authorAvatar}
                            alt={post.authorName}
                            className="w-8 h-8 rounded-full object-cover border border-zinc-800"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-white uppercase font-mono">
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
                          <span className="text-[10px] text-zinc-400 font-mono">
                            @{post.authorHandle}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono shrink-0">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        <span>{formatRelativeTime(post.timestamp)}</span>
                      </div>
                    </div>

                    {/* Contenu textuel */}
                    <p className="mt-2 text-xs text-zinc-200 leading-relaxed font-sans select-text">
                      {renderFormattedContent(post.content)}
                    </p>

                    {/* Média attaché (sans proxying / stockage binaire) */}
                    {post.mediaUrl && (
                      <div className="mt-2.5 relative rounded-xl overflow-hidden border border-slate-800 bg-black aspect-video max-h-48 flex items-center justify-center group/media">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={post.mediaUrl}
                          alt="Média d'illustration"
                          className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        {post.mediaType === "video" && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="p-2.5 bg-rose-600/90 rounded-full text-white shadow-xl flex items-center justify-center">
                              <VideoIcon className="w-4 h-4 fill-current" />
                            </div>
                          </div>
                        )}
                        <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/80 rounded text-[9px] font-mono text-zinc-300 border border-zinc-700/60">
                          {post.mediaType === "video" ? "Vidéo" : "Image"}
                        </span>
                      </div>
                    )}

                    {/* Actions & Liens externes originaux */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-zinc-400 text-[10px]">
                      <div className="flex items-center gap-3 font-mono text-zinc-400">
                        {typeof post.retweetsCount === "number" && (
                          <span className="flex items-center gap-1">
                            <Repeat2 className="w-3 h-3 text-zinc-500" />
                            <span>{post.retweetsCount}</span>
                          </span>
                        )}
                        {typeof post.likesCount === "number" && (
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-zinc-500" />
                            <span>{post.likesCount}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleCopyLink(post, e)}
                          className="p-1 hover:text-white hover:bg-zinc-800 rounded transition-colors flex items-center gap-1 min-h-[36px]"
                          title="Copier le lien"
                        >
                          {copiedId === post.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-zinc-400" />
                          )}
                        </button>

                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg font-bold text-[10px] transition-colors min-h-[36px]"
                          title="Voir sur le site officiel de l'hébergeur"
                        >
                          <span>Voir sur X</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
            </div>

            {/* Pied de page avec Disclaimer Légal LCEN Art. 6-III-2 obligatoire */}
            <footer className="px-3.5 py-2.5 bg-[#050507] border-t border-slate-800 text-[10px] text-zinc-400 leading-tight">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-300 mb-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Disclaimer Légal (LCEN Art. 6-III-2)</span>
              </div>
              <p className="text-[10px] text-zinc-400">
                Flux d&apos;information public non modéré, responsabilité de l&apos;hébergeur d&apos;origine. Lecture seule, 0 collecte, 0 cookie.
              </p>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
