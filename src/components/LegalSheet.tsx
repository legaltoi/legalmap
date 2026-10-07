"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  HelpCircle,
  Activity,
  PhoneCall,
  ChevronDown,
  X,
  Copy,
  Check,
  AlertTriangle,
  HeartPulse,
} from "lucide-react";

interface LegalSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "gav" | "controles" | "secours";

export function LegalSheet({ isOpen, onClose }: LegalSheetProps) {
  const [activeTab, setActiveTab] = useState<TabType>("gav");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-sheet-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="w-full sm:max-w-2xl max-h-[90dvh] sm:max-h-[85vh] bg-[#09090b] border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-100"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
      >
        {/* Handle bar for mobile touch drag */}
        <div className="sm:hidden w-full flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-zinc-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80 bg-[#121216]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 id="legal-sheet-title" className="text-base font-bold text-white tracking-tight">
                Fiches Réflexes Juridiques &amp; Médicales
              </h2>
              <p className="text-xs text-zinc-400">100 % Disponibles hors-ligne</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-zinc-800/80 bg-[#0e0e12] px-3 py-2 gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("gav")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "gav"
                ? "bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-red-400" />
            Garde à Vue (GAV)
          </button>

          <button
            onClick={() => setActiveTab("controles")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "controles"
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            }`}
          >
            <HelpCircle className="w-4 h-4 text-sky-400" />
            Contrôles 78-2 CPP
          </button>

          <button
            onClick={() => setActiveTab("secours")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "secours"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            }`}
          >
            <HeartPulse className="w-4 h-4 text-emerald-400" />
            Secours &amp; Gaz Lacrymo
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs sm:text-sm text-zinc-300 overscroll-contain">
          {/* TAB 1: GARDE À VUE */}
          {activeTab === "gav" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Le Mantra Absolu */}
              <div className="p-4 bg-red-950/30 border-2 border-red-500/50 rounded-2xl shadow-inner">
                <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-1 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  Règle d&apos;or en cas d&apos;interpellation
                </div>
                <p className="text-white text-base font-extrabold my-2 bg-red-500/10 p-3 rounded-xl border border-red-500/30 text-center font-mono">
                  &laquo; Je souhaite garder le silence, voir un médecin et être assisté d&apos;un avocat commis d&apos;office. &raquo;
                </p>
                <p className="text-zinc-300 text-xs">
                  Article 63-1 du CPP : Vous avez le droit absolu de vous taire. Tout ce que vous dites
                  avant ou sans avocat sera consigné sur procès-verbal. Ne répondez qu&apos;à votre état civil.
                </p>
              </div>

              {/* Vos 4 Droits fondamentaux */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <span className="font-bold text-white block mb-1">1. Droit à un avocat</span>
                  <p className="text-zinc-400 text-xs">
                    Dès la 1ère heure (art. 63-4 CPP). Exigez l&apos;avocat commis d&apos;office. Aucune audition
                    ne doit commencer sans lui.
                  </p>
                </div>

                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <span className="font-bold text-white block mb-1">2. Examen médical</span>
                  <p className="text-zinc-400 text-xs">
                    Droit automatique (art. 63-3 CPP). Exigez la constatation de toute douleur, blessure ou
                    état de choc physique/psychologique.
                  </p>
                </div>

                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <span className="font-bold text-white block mb-1">3. Prévenir un proche</span>
                  <p className="text-zinc-400 text-xs">
                    Vous avez le droit de faire prévenir une personne de confiance ou votre employeur
                    (art. 63-2 CPP) dans les 3 heures.
                  </p>
                </div>

                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <span className="font-bold text-white block mb-1">4. Durée légale</span>
                  <p className="text-zinc-400 text-xs">
                    24h maximum. Prolongation possible de 24h uniquement sur décision motivée du Procureur
                    de la République.
                  </p>
                </div>
              </div>

              {/* Contact Barreau de Nantes */}
              <div className="p-4 bg-zinc-900/90 border border-zinc-700/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-white text-sm">
                    Permanence Barreau de Nantes (Maison de l&apos;Avocat)
                  </div>
                  <div className="text-xs text-zinc-400">
                    Avocats de permanence pénale et gardes à vue
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="tel:0240204840"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    02 40 20 48 40
                  </a>
                  <button
                    onClick={() => copyToClipboard("0240204840", "barreau")}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-colors"
                    title="Copier le numéro"
                  >
                    {copiedText === "barreau" ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTRÔLES DANS L'ESPACE PUBLIC */}
          {activeTab === "controles" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 bg-sky-950/20 border border-sky-500/40 rounded-2xl">
                <h3 className="font-bold text-sky-400 text-sm mb-1">
                  Article 78-2 du Code de Procédure Pénale
                </h3>
                <p className="text-xs text-zinc-300">
                  Un contrôle d&apos;identité ne peut pas être arbitraire. Il doit être fondé sur des indices
                  laissant présumer qu&apos;une personne a commis ou s&apos;apprête à commettre une infraction,
                  ou sur des réquisitions écrites du Procureur délimitées dans l&apos;espace et le temps.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <h4 className="font-semibold text-white mb-1">Fouille de sac &amp; Effets personnels</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Les forces de l&apos;ordre ne peuvent fouiller un sac qu&apos;avec votre accord exprès, OU en cas de
                    flagrant délit, OU sur réquisition spéciale écrite du Procureur de la République.
                    Vous pouvez demander à voir l&apos;arrêté ou la réquisition.
                  </p>
                </div>

                <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <h4 className="font-semibold text-white mb-1">Palpation de sécurité</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    La palpation n&apos;est pas une fouille à corps : elle doit être superficielle, par-dessus
                    les vêtements, et strictement effectuée par une personne du même sexe.
                  </p>
                </div>

                <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <h4 className="font-semibold text-white mb-1">Droit de filmer les opérations</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    <strong className="text-zinc-200">Il est légal de filmer la police :</strong> Les
                    forces de l&apos;ordre dans l&apos;espace public n&apos;ont pas de droit à l&apos;image opposable aux
                    citoyens (Décision du Conseil constitutionnel n° 2021-817 DC ; Circulaire du Ministère
                    de l&apos;Intérieur du 23 décembre 2008). Veillez à conserver une distance de sécurité raisonnable.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SECOURS & GAZ LACRYMOGÈNES */}
          {activeTab === "secours" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/40 rounded-2xl">
                <h3 className="font-bold text-emerald-400 text-sm mb-1 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Conduite à tenir face aux gaz lacrymogènes (CS / Poivre)
                </h3>
                <ul className="mt-2 space-y-2 text-xs text-zinc-300 list-disc pl-4">
                  <li>
                    <strong className="text-white">NE JAMAIS FROTTER :</strong> Le frottement et la sueur
                    écrasent les micro-cristaux chimiques sur la cornée et amplifient la brûlure.
                  </li>
                  <li>
                    <strong className="text-white">Rinçage oculaire :</strong> Rincer abondamment au sérum
                    physiologique de l&apos;angle interne de l&apos;œil vers l&apos;extérieur (pour ne pas contaminer l&apos;autre œil).
                  </li>
                  <li>
                    <strong className="text-white">Lentilles de contact :</strong> Les retirer immédiatement
                    avec des mains décontaminées et les jeter (les cristaux s&apos;y incrustent durablement).
                  </li>
                  <li>
                    <strong className="text-white">Peau et vêtements :</strong> Laver à grande eau froide et
                    au savon doux. Éviter l&apos;eau chaude qui ouvre les pores. Changer les couches extérieures de vêtements.
                  </li>
                </ul>
              </div>

              {/* Numéros d'urgence vitale */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <a
                  href="tel:15"
                  className="p-3 bg-red-950/40 border border-red-500/40 hover:bg-red-900/50 rounded-xl flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="text-red-400 font-bold text-xs uppercase">SAMU</div>
                    <div className="text-white font-extrabold text-base">15</div>
                  </div>
                  <PhoneCall className="w-4 h-4 text-red-400" />
                </a>

                <a
                  href="tel:18"
                  className="p-3 bg-amber-950/40 border border-amber-500/40 hover:bg-amber-900/50 rounded-xl flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="text-amber-400 font-bold text-xs uppercase">Pompiers</div>
                    <div className="text-white font-extrabold text-base">18</div>
                  </div>
                  <PhoneCall className="w-4 h-4 text-amber-400" />
                </a>

                <a
                  href="tel:112"
                  className="p-3 bg-blue-950/40 border border-blue-500/40 hover:bg-blue-900/50 rounded-xl flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="text-blue-400 font-bold text-xs uppercase">Urgence UE</div>
                    <div className="text-white font-extrabold text-base">112</div>
                  </div>
                  <PhoneCall className="w-4 h-4 text-blue-400" />
                </a>

                <a
                  href="sms:114"
                  className="p-3 bg-purple-950/40 border border-purple-500/40 hover:bg-purple-900/50 rounded-xl flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="text-purple-400 font-bold text-xs uppercase">SMS Sourd 114</div>
                    <div className="text-white font-extrabold text-base">114</div>
                  </div>
                  <PhoneCall className="w-4 h-4 text-purple-400" />
                </a>
              </div>

              {/* CHU Nantes Urgences */}
              <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                <div className="font-semibold text-white">Urgences Adultes CHU Hôtel-Dieu Nantes</div>
                <div className="text-xs text-zinc-400 mt-0.5">
                  1 Place Alexis-Ricordeau — 02 40 08 33 33 (24h/24)
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800/80 bg-[#121216] flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Fermer les Fiches
          </button>
        </div>
      </div>
    </div>
  );
}

