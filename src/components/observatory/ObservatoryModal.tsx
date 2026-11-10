"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  BarChart3,
  MapPin,
  Search,
  Compass,
  BookOpen,
  Route,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Landmark,
  Info,
  Flame,
  Calendar,
  ShieldAlert,
  Users,
  Table as TableIcon,
  LayoutGrid,
} from "lucide-react";
import {
  CARNET_1_MILESTONES,
  CARNET_2_SECTORS,
  CARNET_3_PROTESTS,
  RECENT_MOBILISATIONS_2026,
  RECENT_MOBILISATIONS_CITATIONS,
  TacticalSector,
  ProtestTensionLevel,
} from "@/config/data/nantes-carnets";
import {
  analyzeOfficialRoute,
  getGlobalObservatoryStats,
} from "@/lib/routeAnalyzer";
import { OfficialAttendanceFigures } from "@/types";
import nantesData from "@/config/cities/nantes.json";

export type ObservatoryTab = "recent" | "route" | "stats" | "topo";

interface ObservatoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: ObservatoryTab;
  routeCoordinates?: [number, number][];
  liveAttendance?: OfficialAttendanceFigures | null;
  isTacticalLayerEnabled: boolean;
  onToggleTacticalLayer: () => void;
  onFocusSectorOnMap: (sector: TacticalSector) => void;
  onFocusCoordinatesOnMap: (coords: [number, number], zoom?: number) => void;
}

const TENSION_BADGE_STYLE: Record<ProtestTensionLevel, string> = {
  Pacifique: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Calme: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  Faible: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  Modérée: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Forte: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  "Très forte": "bg-red-500/20 text-red-300 border-red-500/40",
};

/**
 * Met en valeur et injecte les infobulles sur les citations [1] à [27]
 */
function renderFormattedCell(text: string) {
  const parts = text.split(/(\[\d+\])/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (/^\[\d+\]$/.test(part)) {
          const desc = RECENT_MOBILISATIONS_CITATIONS[part];
          return (
            <span
              key={i}
              title={desc ? `${part} : ${desc}` : part}
              className="inline-block px-1 py-0.2 mx-0.5 text-[10px] font-mono font-bold rounded bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 cursor-help transition-colors hover:bg-indigo-500/40 hover:text-white"
            >
              {part}
            </span>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </span>
  );
}

export function ObservatoryModal({
  isOpen,
  onClose,
  initialTab = "recent",
  routeCoordinates,
  liveAttendance,
  isTacticalLayerEnabled,
  onToggleTacticalLayer,
  onFocusSectorOnMap,
  onFocusCoordinatesOnMap,
}: ObservatoryModalProps) {
  const [activeTab, setActiveTab] = useState<ObservatoryTab>(initialTab);

  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const [recentScope, setRecentScope] = useState<"ALL" | "NANTES" | "NATIONAL">("ALL");
  const [recentSearchQuery, setRecentSearchQuery] = useState<string>("");
  const [recentDisplayMode, setRecentDisplayMode] = useState<"table" | "cards">("table");
  const [showRecentSources, setShowRecentSources] = useState<boolean>(false);

  const filteredRecentMobilisations = useMemo(() => {
    const q = recentSearchQuery.trim().toLowerCase();
    return RECENT_MOBILISATIONS_2026.filter((item) => {
      if (recentScope === "NANTES" && item.isNational) return false;
      if (recentScope === "NATIONAL" && !item.isNational) return false;
      if (q) {
        const hay =
          `${item.dateFormatted} ${item.location} ${item.unionOrPressCountText} ${item.policeOrOfficialCountText} ${item.contextAndToll} ${item.highlightBadge || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [recentScope, recentSearchQuery]);

  const [selectedCycle, setSelectedCycle] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "unionDesc" | "ratioDesc">("date");
  const [showEurecamNote, setShowEurecamNote] = useState<boolean>(false);
  const [expandedSectorId, setExpandedSectorId] = useState<string | null>(null);

  const routeAnalysis = useMemo(
    () => analyzeOfficialRoute(routeCoordinates),
    [routeCoordinates]
  );

  const globalStats = useMemo(() => getGlobalObservatoryStats(), []);

  const activeAttendance: OfficialAttendanceFigures | null = useMemo(() => {
    if (
      liveAttendance &&
      (liveAttendance.policeCount !== null ||
        liveAttendance.unionCount !== null ||
        liveAttendance.thirdPartyCount !== null)
    ) {
      return liveAttendance;
    }
    const staticAtt = (nantesData as any).officialAttendance as
      | OfficialAttendanceFigures
      | undefined;
    if (
      staticAtt &&
      (staticAtt.policeCount !== null ||
        staticAtt.unionCount !== null ||
        staticAtt.thirdPartyCount !== null)
    ) {
      return staticAtt;
    }
    return null;
  }, [liveAttendance]);

  const filteredProtests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = CARNET_3_PROTESTS.filter((p) => {
      if (selectedCycle !== "ALL" && p.cycle !== selectedCycle) return false;
      if (q) {
        const hay =
          `${p.dateFormatted} ${p.year} ${p.cycle} ${p.title} ${p.route}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === "unionDesc") {
      return [...list].sort((a, b) => b.unionCount - a.unionCount);
    }
    if (sortBy === "ratioDesc") {
      return [...list].sort((a, b) => b.ratio - a.ratio);
    }
    return [...list].sort((a, b) => b.dateIso.localeCompare(a.dateIso));
  }, [selectedCycle, searchQuery, sortBy]);

  if (!isOpen) return null;

  const liveRatio =
    activeAttendance?.unionCount != null &&
    activeAttendance?.policeCount != null &&
    activeAttendance.policeCount > 0
      ? Math.round((activeAttendance.unionCount / activeAttendance.policeCount) * 100) /
        100
      : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Observatoire et Parcours"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="w-full sm:max-w-3xl lg:max-w-4xl max-h-[90dvh] sm:max-h-[86vh] bg-[#07070a] border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100">
        {/* En-tête minimaliste */}
        <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800/80 flex flex-col gap-2.5 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                <Landmark className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-black tracking-wide text-white">
                OBSERVATOIRE &amp; TACTIQUE
              </h2>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={onToggleTacticalLayer}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all ${
                  isTacticalLayerEnabled
                    ? "bg-amber-500/20 text-amber-300 border-amber-400/60"
                    : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                }`}
              >
                {isTacticalLayerEnabled ? (
                  <>
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>Zones Carte : ON</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Zones Carte : OFF</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                aria-label="Fermer"
                className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 4 Onglets épurés et responsives */}
          <div className="grid grid-cols-4 gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800/80">
            <button
              onClick={() => setActiveTab("recent")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === "recent"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Flame className="w-3.5 h-3.5 shrink-0 text-rose-400" />
              <span className="hidden sm:inline">Octobre 2026</span>
              <span className="sm:hidden">Oct. 26</span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
            </button>

            <button
              onClick={() => setActiveTab("route")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === "route"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Route className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Parcours</span>
              <span className="sm:hidden">Tracé</span>
            </button>

            <button
              onClick={() => setActiveTab("stats")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === "stats"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Archives &amp; Ratios</span>
              <span className="sm:hidden">Archives</span>
              {activeAttendance && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("topo")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === "topo"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">8 Zones &amp; Dates</span>
              <span className="sm:hidden">8 Zones</span>
            </button>
          </div>
        </div>

        {/* Contenu scrollable minimaliste */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* =====================================================================
              ONGLET 0 : 🔥 MOBILISATIONS RÉCENTES (OCTOBRE 2026 - NANTES & FRANCE)
             ===================================================================== */}
          {activeTab === "recent" && (
            <div className="space-y-4">
              {/* Bandeau d'en-tête */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-indigo-950/30 to-zinc-900/60 border border-rose-500/30 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      <Flame className="w-4 h-4 text-rose-400" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-white tracking-wide">
                        MOUVEMENT SOCIAL OCTOBRE 2026
                      </h3>
                      <p className="text-[11px] text-zinc-400">
                        Observatoire contradictoire Nantes (centre-ville &amp; campus) &amp; France entière
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-mono font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <span>10 DATES CONSOLIDÉES</span>
                  </div>
                </div>
              </div>

              {/* 4 Cartes Synthèse Chiffrée */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center">
                  <div className="text-[10px] text-zinc-400 font-mono flex items-center justify-center gap-1">
                    <Calendar className="w-3 h-3 text-cyan-400" />
                    <span>DATES CLÉS</span>
                  </div>
                  <div className="text-base font-black text-white mt-0.5">10 journées</div>
                  <div className="text-[10px] text-zinc-500 font-mono">7 Nantes • 3 France</div>
                </div>

                <div className="p-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center">
                  <div className="text-[10px] text-rose-400 font-mono flex items-center justify-center gap-1">
                    <Users className="w-3 h-3 text-rose-400" />
                    <span>PIC NANTES</span>
                  </div>
                  <div className="text-base font-black text-rose-300 mt-0.5">20k à 50k</div>
                  <div className="text-[10px] text-zinc-500 font-mono">17 oct. (FSU/CA)</div>
                </div>

                <div className="p-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center">
                  <div className="text-[10px] text-indigo-400 font-mono flex items-center justify-center gap-1">
                    <Landmark className="w-3 h-3 text-indigo-400" />
                    <span>PIC NATIONAL</span>
                  </div>
                  <div className="text-base font-black text-indigo-300 mt-0.5">~800 000</div>
                  <div className="text-[10px] text-zinc-500 font-mono">17 oct. (550k Min. Int.)</div>
                </div>

                <div className="p-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center">
                  <div className="text-[10px] text-amber-400 font-mono flex items-center justify-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-amber-400" />
                    <span>SÉCURITÉ</span>
                  </div>
                  <div className="text-base font-black text-amber-300 mt-0.5">860+ arrest.</div>
                  <div className="text-[10px] text-zinc-500 font-mono">102 policiers / 47+ médics</div>
                </div>
              </div>

              {/* Filtres géographiques & Mode d'affichage */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                {/* Pills de filtre */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                  <button
                    onClick={() => setRecentScope("ALL")}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap transition-all ${
                      recentScope === "ALL"
                        ? "bg-white text-black border-white"
                        : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                    }`}
                  >
                    Toutes (10)
                  </button>
                  <button
                    onClick={() => setRecentScope("NANTES")}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap transition-all flex items-center gap-1 ${
                      recentScope === "NANTES"
                        ? "bg-cyan-500/20 text-cyan-200 border-cyan-400/50"
                        : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    <span>📍 Nantes &amp; 44 (7)</span>
                  </button>
                  <button
                    onClick={() => setRecentScope("NATIONAL")}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap transition-all flex items-center gap-1 ${
                      recentScope === "NATIONAL"
                        ? "bg-indigo-500/20 text-indigo-200 border-indigo-400/50"
                        : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    <span>🇫🇷 France (3)</span>
                  </button>
                </div>

                {/* Switch Table vs Cartes */}
                <div className="flex items-center gap-1 self-end sm:self-auto bg-zinc-900/90 p-0.5 rounded-xl border border-zinc-800">
                  <button
                    onClick={() => setRecentDisplayMode("table")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                      recentDisplayMode === "table"
                        ? "bg-zinc-800 text-white shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                    title="Vue tableau comparatif"
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>Tableau</span>
                  </button>
                  <button
                    onClick={() => setRecentDisplayMode("cards")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                      recentDisplayMode === "cards"
                        ? "bg-zinc-800 text-white shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                    title="Vue fiches détaillées"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Fiches</span>
                  </button>
                </div>
              </div>

              {/* Champ de recherche */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={recentSearchQuery}
                  onChange={(e) => setRecentSearchQuery(e.target.value)}
                  placeholder="Rechercher par date, lieu, mot-clé (Tertre, LBD, Fnac, AG)..."
                  className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* VUE 1 : TABLEAU COMPARATIF CONFORME À LA DEMANDE */}
              {recentDisplayMode === "table" && (
                <div className="border border-zinc-800/90 rounded-2xl overflow-hidden bg-zinc-950/70 shadow-inner">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-300 font-mono text-[10px] uppercase tracking-wider">
                          <th className="py-2.5 px-3 min-w-[110px]">Date</th>
                          <th className="py-2.5 px-3 min-w-[140px]">Lieu / Périmètre</th>
                          <th className="py-2.5 px-3 min-w-[210px] text-rose-300">
                            Syndicats / Organisateurs / Presse
                          </th>
                          <th className="py-2.5 px-3 min-w-[190px] text-sky-300">
                            Police / Préfecture / Ministère
                          </th>
                          <th className="py-2.5 px-3 min-w-[250px] text-amber-300">
                            Contexte &amp; Bilan Humain / Judiciaire
                          </th>
                          <th className="py-2.5 px-2 min-w-[44px] text-center">Carte</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
                        {filteredRecentMobilisations.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-zinc-900/50 transition-colors align-top"
                          >
                            <td className="py-2.5 px-3 font-mono font-bold whitespace-nowrap">
                              <div className="text-white flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                                <span>{item.dateFormatted}</span>
                              </div>
                              {item.highlightBadge && (
                                <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] font-sans font-bold bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                                  {item.highlightBadge}
                                </span>
                              )}
                            </td>

                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                    item.isNational
                                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                      : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                  }`}
                                >
                                  {item.isNational ? "France" : "Nantes"}
                                </span>
                              </div>
                              <div className="text-[11px] font-semibold text-zinc-300 mt-1">
                                {item.location}
                              </div>
                            </td>

                            <td className="py-2.5 px-3 text-[11px] text-zinc-200">
                              <div className="space-y-0.5 leading-relaxed">
                                {renderFormattedCell(item.unionOrPressCountText)}
                              </div>
                            </td>

                            <td className="py-2.5 px-3 text-[11px] text-zinc-300">
                              <div className="space-y-0.5 leading-relaxed">
                                {renderFormattedCell(item.policeOrOfficialCountText)}
                              </div>
                            </td>

                            <td className="py-2.5 px-3 text-[11px] text-zinc-300">
                              <div className="space-y-1 leading-relaxed">
                                {renderFormattedCell(item.contextAndToll)}
                              </div>
                            </td>

                            <td className="py-2.5 px-2 text-center">
                              {item.coordinates ? (
                                <button
                                  onClick={() => {
                                    if (item.coordinates) {
                                      onFocusCoordinatesOnMap(item.coordinates, 16);
                                      onClose();
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center justify-center"
                                  title="Localiser sur la carte"
                                >
                                  <MapPin className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <span className="text-zinc-600 text-xs">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* VUE 2 : FICHES DÉTAILLÉES (TACTIQUES & TOUCH-FRIENDLY) */}
              {recentDisplayMode === "cards" && (
                <div className="space-y-2.5">
                  {filteredRecentMobilisations.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2.5 hover:border-zinc-700 transition-all"
                    >
                      {/* Haut de carte */}
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold">
                            {item.dateFormatted}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                              item.isNational
                                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                            }`}
                          >
                            {item.location}
                          </span>
                          {item.highlightBadge && (
                            <span className="px-2 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 text-[10px] font-mono border border-zinc-700">
                              {item.highlightBadge}
                            </span>
                          )}
                        </div>

                        {item.coordinates && (
                          <button
                            onClick={() => {
                              if (item.coordinates) {
                                onFocusCoordinatesOnMap(item.coordinates, 16);
                                onClose();
                              }
                            }}
                            className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-cyan-300 text-[11px] font-bold border border-zinc-700 flex items-center gap-1 shrink-0"
                          >
                            <MapPin className="w-3 h-3" />
                            Carte
                          </button>
                        )}
                      </div>

                      {/* 2 Boîtes Chiffres Contradictoires */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-black/50 border border-rose-500/20 space-y-1">
                          <div className="text-[10px] font-mono text-rose-400 font-bold uppercase">
                            📢 Décompte Manifestants / Presse / Syndicats
                          </div>
                          <div className="text-zinc-200 leading-snug">
                            {renderFormattedCell(item.unionOrPressCountText)}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-black/50 border border-sky-500/20 space-y-1">
                          <div className="text-[10px] font-mono text-sky-400 font-bold uppercase">
                            👮 Décompte Police / Préfecture / Ministère
                          </div>
                          <div className="text-zinc-300 leading-snug">
                            {renderFormattedCell(item.policeOrOfficialCountText)}
                          </div>
                        </div>
                      </div>

                      {/* Contexte & Bilan */}
                      <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs text-zinc-300 space-y-1">
                        <div className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                          ⚖️ Contexte, Déroulement &amp; Bilan Humain / Judiciaire
                        </div>
                        <div className="leading-relaxed">
                          {renderFormattedCell(item.contextAndToll)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Section Accordéon : Index des sources et citations [1] à [27] */}
              <div className="pt-2 border-t border-zinc-800/80">
                <button
                  onClick={() => setShowRecentSources((prev) => !prev)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs text-indigo-300 font-medium text-left transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Index des sources et citations référencées ([1] à [27])</span>
                  </span>
                  {showRecentSources ? (
                    <ChevronUp className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                  )}
                </button>

                {showRecentSources && (
                  <div className="mt-2 p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 text-[11px] animate-in fade-in duration-150">
                    <div className="text-zinc-400 text-[10px] font-mono">
                      Correspondance des renvois bibliographiques et sources officielles / presse locale :
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[220px] overflow-y-auto pr-1">
                      {Object.entries(RECENT_MOBILISATIONS_CITATIONS).map(([tag, desc]) => (
                        <div
                          key={tag}
                          className="p-1.5 rounded-lg bg-zinc-900/70 border border-zinc-800/70 flex items-baseline gap-2"
                        >
                          <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold shrink-0">
                            {tag}
                          </span>
                          <span className="text-zinc-300 text-[11px]">{desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =====================================================================
              ONGLET 1 : 🛡️ PARCOURS (DIAGNOSTIC MINIMALISTE)
             ===================================================================== */}
          {activeTab === "route" && (
            <div className="space-y-4">
              {/* 3 Cartes KPI ultra-visuelles */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center">
                  <div className="text-[10px] text-zinc-400 font-mono">TRACÉ</div>
                  <div className="text-sm sm:text-base font-black text-white mt-0.5">
                    {routeAnalysis.totalDistanceKm} km
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono">
                    ~{routeAnalysis.estimatedCortegeMinutes} min
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center">
                  <div className="text-[10px] text-zinc-400 font-mono">SECTEURS</div>
                  <div className="text-sm sm:text-base font-black text-amber-300 mt-0.5">
                    {routeAnalysis.traversedSectors.length} zones
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    {routeAnalysis.chokepoints.length} point(s) chaud(s)
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center">
                  <div className="text-[10px] text-zinc-400 font-mono">VIGILANCE</div>
                  <div
                    className={`text-sm sm:text-base font-black mt-0.5 ${
                      routeAnalysis.globalVigilanceLevel === "CRITIQUE"
                        ? "text-red-400"
                        : routeAnalysis.globalVigilanceLevel === "ÉLEVÉE"
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {routeAnalysis.globalVigilanceLevel}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    {routeAnalysis.matchingProtests.length} précédents
                  </div>
                </div>
              </div>

              {/* Barre visuelle de tension historique */}
              <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">
                    Historique sur ce tracé ({routeAnalysis.matchingProtests.length} manifs)
                  </span>
                  <span className="font-mono text-zinc-300">
                    Ratio moy. <strong>{routeAnalysis.corridorAverageRatio}x</strong>
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-zinc-950 border border-zinc-800">
                  <div
                    style={{ width: `${routeAnalysis.tensionBreakdown.calmOrLowPct}%` }}
                    className="bg-emerald-500 h-full"
                  />
                  <div
                    style={{ width: `${routeAnalysis.tensionBreakdown.moderatePct}%` }}
                    className="bg-amber-500 h-full"
                  />
                  <div
                    style={{ width: `${routeAnalysis.tensionBreakdown.highOrVeryHighPct}%` }}
                    className="bg-red-500 h-full"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span className="text-emerald-400">
                    Calme {routeAnalysis.tensionBreakdown.calmOrLowPct}%
                  </span>
                  <span className="text-amber-400">
                    Modérée {routeAnalysis.tensionBreakdown.moderatePct}%
                  </span>
                  <span className="text-red-400">
                    Forte {routeAnalysis.tensionBreakdown.highOrVeryHighPct}%
                  </span>
                </div>
              </div>

              {/* Liste épurée des zones sur le parcours */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Zones traversées (Départ → Arrivée)
                </div>

                {routeAnalysis.traversedSectors.map((match, idx) => {
                  const { sector, proximityType, minDistanceMeters } = match;
                  return (
                    <div
                      key={sector.id}
                      className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-2.5"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="w-5 h-5 rounded-full bg-zinc-800 text-[10px] font-mono font-bold flex items-center justify-center text-zinc-300">
                            {idx + 1}
                          </span>
                          <span>{sector.icon}</span>
                          <span className="text-xs font-bold text-white truncate">
                            {sector.shortName}
                          </span>
                          <span
                            className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase"
                            style={{
                              backgroundColor: `${sector.color}20`,
                              color: sector.color,
                            }}
                          >
                            {sector.riskLevel}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {proximityType === "TRAVERSÉ"
                              ? "• Sur le tracé"
                              : `• à ${minDistanceMeters}m`}
                          </span>
                        </div>

                        {/* 2 tags synthétiques */}
                        <div className="text-[11px] text-zinc-400 truncate">
                          {sector.weaponsAndRisks[0]} • {sector.policeDeployment[0]}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onFocusSectorOnMap(sector);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-cyan-300 text-[11px] font-bold border border-zinc-700 flex items-center gap-1 shrink-0"
                      >
                        <MapPin className="w-3 h-3" />
                        Carte
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Points d'eau & Secours proches en pastilles compactes */}
              {routeAnalysis.nearbySafePois.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    Eau &amp; Secours sur le tracé
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {routeAnalysis.nearbySafePois.slice(0, 6).map(({ poi, distanceMeters }) => (
                      <button
                        key={poi.id}
                        onClick={() => {
                          onFocusCoordinatesOnMap(
                            poi.coordinates as [number, number],
                            16.5
                          );
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-200 flex items-center gap-1.5 transition-colors"
                      >
                        <span>
                          {poi.category === "WATER"
                            ? "💧"
                            : poi.category === "PHARMACY"
                            ? "💊"
                            : poi.category === "HOSPITAL"
                            ? "🏥"
                            : "⚖️"}
                        </span>
                        <span className="truncate max-w-[160px]">
                          {poi.name.replace("Point d'Eau Potable - ", "")}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">
                          {distanceMeters}m
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              ONGLET 2 : 📊 CHIFFRES (DIRECT + ARCHIVES & RATIOS)
             ===================================================================== */}
          {activeTab === "stats" && (
            <div className="space-y-4">
              {/* Alerte / Raccourci direct vers le Mouvement Récent 2026 */}
              <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                    <Flame className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Mobilisations Récentes : Octobre 2026</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-500/30 text-rose-200 font-mono font-bold">
                        10 DATES
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate">
                      Nantes (17 &amp; 31 oct.), Campus Tertre, et bilans nationaux consolidés
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("recent")}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-xs font-bold shrink-0 transition-colors"
                >
                  Voir tableau
                </button>
              </div>

              {/* Chiffres du Jour J (si diffusés par /admin) */}
              {activeAttendance ? (
                <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      EN DIRECT • {activeAttendance.label || "Mobilisation du jour"}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {new Date(activeAttendance.updatedAt).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-black/60 border border-sky-500/30">
                      <div className="text-[10px] text-sky-400 font-mono">PRÉFECTURE</div>
                      <div className="text-base font-black text-white">
                        {activeAttendance.policeCount != null
                          ? activeAttendance.policeCount.toLocaleString("fr-FR")
                          : "—"}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-black/60 border border-rose-500/30">
                      <div className="text-[10px] text-rose-400 font-mono">SYNDICATS</div>
                      <div className="text-base font-black text-white">
                        {activeAttendance.unionCount != null
                          ? activeAttendance.unionCount.toLocaleString("fr-FR")
                          : "—"}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-black/60 border border-amber-500/30">
                      <div className="text-[10px] text-amber-400 font-mono">RATIO</div>
                      <div className="text-base font-black text-amber-300">
                        {liveRatio ? `${liveRatio}x` : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-3.5 py-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between gap-2 flex-wrap">
                  <span>Comptage du jour : en attente des estimations</span>
                  <span className="font-mono text-indigo-400">Archives 2006–2026 actives</span>
                </div>
              )}

              {/* 3 KPI Résumé Historique + Bouton info Eurecam */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 font-mono">ARCHIVES</div>
                  <div className="text-base font-black text-white">{globalStats.totalProtests} manifs</div>
                  <div className="text-[10px] text-zinc-500">2006–2026</div>
                </div>
                <div className="p-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <div className="text-[10px] text-indigo-400 font-mono">RATIO MOYEN</div>
                  <div className="text-base font-black text-indigo-300">
                    {globalStats.avgRatio}x
                  </div>
                  <div className="text-[10px] text-zinc-500">Synd. / Préf.</div>
                </div>
                <div className="p-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <div className="text-[10px] text-rose-400 font-mono">RECORD</div>
                  <div className="text-base font-black text-rose-300">80 000</div>
                  <div className="text-[10px] text-zinc-500">2023 (150k en 84)</div>
                </div>
              </div>

              {/* Note méthodologique compacte (1 clic) */}
              <div>
                <button
                  onClick={() => setShowEurecamNote((prev) => !prev)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs text-amber-300 font-medium text-left gap-2"
                >
                  <span className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Pourquoi cet écart ? (Méthodologie Eurecam / Occurrence)</span>
                  </span>
                  {showEurecamNote ? (
                    <ChevronUp className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                  )}
                </button>
                {showEurecamNote && (
                  <div className="mt-1.5 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-[11px] text-zinc-300 space-y-1">
                    <p>
                      • <strong>Capteur Eurecam / Occurrence (2017–2018)</strong> : Testé sur parcours linéaire (écart 8% avec recomptage vidéo sur axe droit, mais contesté sur les cortèges denses ou scindés — <em>É. Provendier, RFSP</em>).
                    </p>
                    <p>
                      • <strong>Spécificité Nantes</strong> : Comptage policier depuis les points hauts du Cours des 50-Otages, faussé lors des scissions ou déviations par les ruelles (Place Royale / Commerce).
                    </p>
                  </div>
                )}
              </div>

              {/* Filtres rapides par Mouvement Social (Pills horizontales) */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                <button
                  onClick={() => setSelectedCycle("ALL")}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${
                    selectedCycle === "ALL"
                      ? "bg-white text-black border-white"
                      : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                  }`}
                >
                  Tous ({globalStats.totalProtests})
                </button>
                {globalStats.cycles.map((c) => (
                  <button
                    key={c.cycle}
                    onClick={() =>
                      setSelectedCycle(selectedCycle === c.cycle ? "ALL" : c.cycle)
                    }
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap flex items-center gap-1 ${
                      selectedCycle === c.cycle
                        ? "bg-indigo-600 text-white border-indigo-400"
                        : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    <span>{c.cycle}</span>
                    <span className="text-[10px] font-mono opacity-80">
                      ({c.avgRatio}x)
                    </span>
                  </button>
                ))}
              </div>

              {/* Barre de recherche & tri */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrer par date, mot-clé, rue..."
                    className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none"
                >
                  <option value="date">Date</option>
                  <option value="unionDesc">+ Mobilisées</option>
                  <option value="ratioDesc">+ Fort Ratio</option>
                </select>
              </div>

              {/* Liste compacte des 75 manifestations */}
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                {filteredProtests.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-indigo-300 font-mono">
                          {p.dateFormatted}
                        </span>
                        <span className="text-[11px] font-semibold text-white truncate">
                          {p.title}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                            TENSION_BADGE_STYLE[p.tensionLevel]
                          }`}
                        >
                          {p.tensionLevel}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono truncate mt-0.5">
                        {p.route}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 font-mono text-right">
                      <div>
                        <div className="text-[9px] text-sky-400">PRÉF</div>
                        <div className="text-xs font-bold text-zinc-200">
                          {p.policeCount.toLocaleString("fr-FR")}
                        </div>
                      </div>
                      <div className="text-zinc-600 text-[10px]">/</div>
                      <div>
                        <div className="text-[9px] text-rose-400">SYND</div>
                        <div className="text-xs font-bold text-white">
                          {p.unionCount.toLocaleString("fr-FR")}
                        </div>
                      </div>
                      <div className="pl-1.5 border-l border-zinc-800">
                        <div className="text-[9px] text-amber-400">RATIO</div>
                        <div className="text-xs font-black text-amber-300">
                          {p.ratio}x
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =====================================================================
              ONGLET 3 : 🏛️ 8 ZONES TACTIQUES & 9 DATES CLÉS (MINIMALISTE)
             ===================================================================== */}
          {activeTab === "topo" && (
            <div className="space-y-4">
              {/* Grille compacte des 8 Zones Tactiques */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Topographie Urbaine • 8 Zones Sensibles
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CARNET_2_SECTORS.map((sector) => {
                    const isExpanded = expandedSectorId === sector.id;
                    return (
                      <div
                        key={sector.id}
                        className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between gap-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            onClick={() =>
                              setExpandedSectorId(isExpanded ? null : sector.id)
                            }
                            className="text-left min-w-0 flex-1"
                          >
                            <div className="flex items-center gap-1.5">
                              <span>{sector.icon}</span>
                              <span className="text-xs font-bold text-white truncate">
                                {sector.shortName}
                              </span>
                              <span
                                className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase shrink-0"
                                style={{
                                  backgroundColor: `${sector.color}20`,
                                  color: sector.color,
                                }}
                              >
                                {sector.riskLevel}
                              </span>
                            </div>
                            <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                              {sector.tacticalType}
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              onFocusSectorOnMap(sector);
                              onClose();
                            }}
                            className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1 shrink-0"
                          >
                            <Compass className="w-3 h-3" />
                            Carte
                          </button>
                        </div>

                        <div className="text-[11px] text-zinc-300 space-y-0.5 bg-black/40 p-2 rounded-xl border border-zinc-800/70">
                          <div className="truncate">• {sector.policeDeployment[0]}</div>
                          <div className="truncate text-amber-300/90">
                            • {sector.weaponsAndRisks[0]}
                          </div>
                          {isExpanded && (
                            <div className="pt-1 mt-1 border-t border-zinc-800 space-y-0.5 text-zinc-400">
                              <div>• {sector.documentedIncidents[0]}</div>
                              <div className="text-emerald-300/90">
                                • {sector.medicalAndLegalSupport[0]}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Les 9 Jalons Historiques en liste ultra-concise */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  Chronologie &amp; Mémoire des Lieux (1955–2026)
                </div>

                <div className="space-y-1.5">
                  {CARNET_1_MILESTONES.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold shrink-0">
                            {evt.dateFormatted}
                          </span>
                          <span className="text-xs font-bold text-white truncate">
                            {evt.context}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {evt.medicalToll}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const linkedSec = CARNET_2_SECTORS.find(
                            (s) => s.id === evt.sectorId
                          );
                          if (linkedSec) {
                            onFocusSectorOnMap(linkedSec);
                          } else {
                            onFocusCoordinatesOnMap(evt.coordinates, 16);
                          }
                          onClose();
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-cyan-400 shrink-0"
                        title="Localiser sur la carte"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
