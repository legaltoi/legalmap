"use client";

import React from "react";
import { ShieldCheck, Lock, EyeOff, Scale, Server, X } from "lucide-react";

interface LegalNoticeProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LegalNotice({ isOpen, onClose }: LegalNoticeProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-notice-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#0c0c0e] border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#121216]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 id="legal-notice-title" className="text-lg font-bold tracking-tight text-white">
                Mentions Légales & Cadre Juridique
              </h2>
              <p className="text-xs text-zinc-400">
                Article 6-III-2 LCEN &amp; Conformité RGPD Privacy-by-Design
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-zinc-300 leading-relaxed">
          {/* Statut Éditeur */}
          <section className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2 text-white font-semibold">
              <EyeOff className="w-4 h-4 text-emerald-400" />
              <h3>1. Statut d&apos;Éditeur Non Professionnel (Article 6-III-2 LCEN)</h3>
            </div>
            <p>
              En application de l&apos;article 6, III, alinéa 2 de la loi n° 2004-575 du 21 juin 2004
              pour la confiance dans l&apos;économie numérique (LCEN), l&apos;auteur de ce service opère
              à titre strictement personnel, bénévole et non professionnel.
            </p>
            <p className="mt-2 text-zinc-400 text-xs">
              L&apos;anonymat légal de l&apos;éditeur est garanti par la loi, les coordonnées d&apos;identification
              personnelle ayant été transmises et vérifiées auprès de l&apos;hébergeur technique de la plateforme.
            </p>
          </section>

          {/* Hébergeur technique */}
          <section className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2 text-white font-semibold">
              <Server className="w-4 h-4 text-blue-400" />
              <h3>2. Hébergement Technique Public</h3>
            </div>
            <div className="text-xs space-y-1 text-zinc-400 font-mono">
              <p className="text-zinc-200 font-sans font-medium text-sm mb-1">
                Plateforme d&apos;hébergement distribué (GitHub Pages / Static CDN) :
              </p>
              <p>Hébergeur : GitHub, Inc. (GitHub Pages) / Cloudflare, Inc.</p>
              <p>Adresse : 88 Colin P Kelly Jr St, San Francisco, CA 94107, États-Unis</p>
              <p>Support &amp; Signalement abus : support@github.com / abuse@cloudflare.com</p>
            </div>
          </section>

          {/* Protection des données & RGPD */}
          <section className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2 text-white font-semibold">
              <Lock className="w-4 h-4 text-sky-400" />
              <h3>3. Déclaration RGPD &amp; Confidentialité Absolue</h3>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-xs text-zinc-300">
              <li>
                <strong className="text-white">Zéro traceur, zéro cookie :</strong> Aucun cookie
                publicitaire, de session ou de mesure d&apos;audience tiers n&apos;est déposé (dispense
                totale de bandeau de consentement selon les directives CNIL).
              </li>
              <li>
                <strong className="text-white">Zéro persistance de données :</strong> Aucun stockage
                en base de données permanente (PostgreSQL, logs disque ou cloud). Les signalements
                transitent exclusivement en mémoire vive éphémère (WebSocket Broadcast) et disparaissent
                automatiquement après leur délai de validité (5 à 10 minutes).
              </li>
              <li>
                <strong className="text-white">Géolocalisation 100 % locale :</strong> Le positionnement
                utilisateur reste confiné à votre navigateur. Lors de l&apos;envoi d&apos;un signalement, les
                coordonnées sont automatiquement arrondies à 3 décimales (précision ~100m) afin
                d&apos;empêcher toute désanonymisation de votre terminal.
              </li>
            </ul>
          </section>

          {/* Blindage Pénal & Loi sur la Presse */}
          <section className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2 text-white font-semibold">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <h3>4. Objet Sanitaire, Sécurité Civile &amp; Absence de Texte Libre</h3>
            </div>
            <p>
              Ce service est un outil citoyen neutre d&apos;orientation, de prévention sanitaire et
              d&apos;entraide solidaire lors d&apos;événements publics à forte densité dans l&apos;espace urbain nantais.
            </p>
            <p className="mt-2 text-xs text-zinc-400">
              Afin d&apos;exclure toute infraction à la loi du 29 juillet 1881 sur la liberté de la presse
              (diffamation, injures, incitation à des délits) et tout grief de complicité d&apos;entrave ou
              de guet-apens, l&apos;application proscrit tout champ de saisie libre. Les signalements sont
              strictement limités à des faits matériels de voirie et à la réduction des risques sanitaires.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-[#121216] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium text-sm transition-colors"
          >
            Compris et Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

