"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  ShieldAlert,
  BarChart3,
  MapPin,
  Search,
  Filter,
  Compass,
  BookOpen,
  AlertTriangle,
  Activity,
  Scale,
  Clock,
  Route,
  Users,
  CheckCircle2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Info,
  Sparkles,
  Landmark,
} from "lucide-react";
import {
  CARNET_1_MILESTONES,
  CARNET_2_SECTORS,
  CARNET_3_PROTESTS,
  TacticalSector,
  HistoricalMilestone,
  ProtestTensionLevel,
} from "@/config/data/nantes-carnets";
import {
  analyzeOfficialRoute,
  getGlobalObservatoryStats,
} from "@/lib/routeAnalyzer";
import { OfficialAttendanceFigures } from "@/types";
import nantesData from "@/config/cities/nantes.json";

export type ObservatoryTab = "route" | "stats" | "topo";

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

export function ObservatoryModal({
  isOpen,
  onClose,
  initialTab = "route",
  routeCoordinates,
  liveAttendance,
  isTacticalLayerEnabled,
  onToggleTacticalLayer,
  onFocusSectorOnMap,
  onFocusCoordinatesOnMap,
}: ObservatoryModalProps) {
  const [activeTab, setActiveTab] = useState<ObservatoryTab>(initialTab);

  // Synchroniser l'onglet initial quand la modale s'ouvre sur un onglet précis
  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // États de filtrage pour l'Observatoire des 75 manifestations (Carnet 3)
  const [selectedCycle, setSelectedCycle] = useState<string>("ALL");
  const [selectedTension, setSelectedTension] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "unionDesc" | "ratioDesc">("date");
  const [showEurecamDetails, setShowEurecamDetails] = useState<boolean>(false);
  const [expandedSectorId, setExpandedSectorId] = useState<string | null>(
    "cours-50-otages"
  );

  // 1. Analyse prédictive du parcours actif (Croisement Carnet 2 + Carnet 3)
  const routeAnalysis = useMemo(
    () => analyzeOfficialRoute(routeCoordinates),
    [routeCoordinates]
  );

  // 2. Statistiques consolidées des 75 manifestations (Carnet 3)
  const globalStats = useMemo(() => getGlobalObservatoryStats(), []);

  // 3. Chiffres officiels du Jour J (direct Supabase ou persistés dans nantes.json)
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

  // 4. Liste filtrée et triée des 75 manifestations
  const filteredProtests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = CARNET_3_PROTESTS.filter((p) => {
      if (selectedCycle !== "ALL" && p.cycle !== selectedCycle) return false;
      if (selectedTension !== "ALL" && p.tensionLevel !== selectedTension) return false;
      if (q) {
        const hay =
          `${p.id} ${p.dateFormatted} ${p.year} ${p.cycle} ${p.title} ${p.route} ${p.sources}`.toLowerCase();
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
  }, [selectedCycle, selectedTension, searchQuery, sortBy]);

  if (!isOpen) return null;

  const uniqueCycles = Array.from(new Set(CARNET_3_PROTESTS.map((p) => p.cycle)));

  // Calculs en direct pour les chiffres du jour J
  const liveGap =
    activeAttendance?.unionCount != null && activeAttendance?.policeCount != null
      ? Math.abs(activeAttendance.unionCount - activeAttendance.policeCount)
      : null;
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
      aria-label="Observatoire Statistique, Topographie Tactique et Analyseur de Parcours"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="w-full sm:max-w-4xl max-h-[92dvh] sm:max-h-[88vh] bg-[#050507] border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100">
        {/* En-tête de la modale */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 bg-zinc-950/90 border-b border-zinc-800/80 flex flex-col gap-3 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-base font-black tracking-wide text-white">
                    OBSERVATOIRE &amp; INTELLIGENCE TOPOGRAPHIQUE
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    Nantes 1955–2026
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Croisement des 3 Carnets d&apos;archives : 8 secteurs tactiques, 9 jalons historiques &amp; 75 mobilisations
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Interrupteur direct du calque cartographique Mémoire & Topographie */}
              <button
                onClick={onToggleTacticalLayer}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  isTacticalLayerEnabled
                    ? "bg-amber-500/20 text-amber-300 border-amber-400/60 shadow-sm"
                    : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                }`}
                title="Afficher ou masquer les 8 halos tactiques et jalons historiques sur la carte"
              >
                {isTacticalLayerEnabled ? (
                  <>
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden md:inline">Calque Carte : Actif</span>
                    <span className="md:hidden">Calque ON</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="hidden md:inline">Afficher Calque Carte</span>
                    <span className="md:hidden">Calque OFF</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                aria-label="Fermer l'observatoire"
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Barre d'onglets responsive (3 modules) */}
          <div className="grid grid-cols-3 gap-1.5 bg-zinc-900/90 p-1 rounded-2xl border border-zinc-800/80">
            <button
              onClick={() => setActiveTab("route")}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "route"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Route className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">1. Analyse Parcours</span>
            </button>

            <button
              onClick={() => setActiveTab("stats")}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "stats"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">2. Bataille Chiffres</span>
              {activeAttendance && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("topo")}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "topo"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">3. Mémoire &amp; 8 Zones</span>
            </button>
          </div>
        </div>

        {/* Corps scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* =====================================================================
              ONGLET 1 : 🛡️ ANALYSEUR PRÉDICTIF DE PARCOURS (CARNET 2 + CARNET 3)
             ===================================================================== */}
          {activeTab === "route" && (
            <div className="space-y-5">
              {/* Bandeau synthèse du diagnostic automatique */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-zinc-900/95 to-zinc-950 border border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        Diagnostic Automatique du Tracé Actif
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${
                          routeAnalysis.globalVigilanceLevel === "CRITIQUE"
                            ? "bg-red-500/20 text-red-300 border-red-500/40"
                            : routeAnalysis.globalVigilanceLevel === "ÉLEVÉE"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        }`}
                      >
                        Vigilance {routeAnalysis.globalVigilanceLevel} (
                        {routeAnalysis.globalVigilanceScore}/100)
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white mt-1.5">
                       Croisement Topographique (Carnet 2) &amp; Précédents (Carnet 3)
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Analyse géométrique en temps réel du tracé bleu déclaré sur la carte publique.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (!isTacticalLayerEnabled) onToggleTacticalLayer();
                      onClose();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 self-start sm:self-center transition-all shrink-0"
                  >
                    <Compass className="w-4 h-4" />
                    Voir les zones sur la carte
                  </button>
                </div>

                {/* 4 Métriques clés du parcours */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-black/60 border border-zinc-800/80">
                    <div className="text-[10px] text-zinc-400 font-mono">
                      DISTANCE &amp; DURÉE CORTÈGE
                    </div>
                    <div className="text-base font-black text-white mt-1">
                      {routeAnalysis.totalDistanceKm} km
                    </div>
                    <div className="text-[11px] text-cyan-400 font-mono">
                      ~{routeAnalysis.estimatedCortegeMinutes} min (rythme 2,2 km/h)
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/60 border border-zinc-800/80">
                    <div className="text-[10px] text-zinc-400 font-mono">
                      SECTEURS TACTIQUES
                    </div>
                    <div className="text-base font-black text-amber-300 mt-1">
                      {routeAnalysis.traversedSectors.length} / 8 zones
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      dont {routeAnalysis.chokepoints.length} goulot(s) critique(s)
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/60 border border-zinc-800/80">
                    <div className="text-[10px] text-zinc-400 font-mono">
                      PRÉCÉDENTS SUR CE TRACÉ
                    </div>
                    <div className="text-base font-black text-indigo-300 mt-1">
                      {routeAnalysis.matchingProtests.length} manifs
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Ratio moyen :{" "}
                      <span className="text-white font-bold">
                        {routeAnalysis.corridorAverageRatio}x
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/60 border border-zinc-800/80">
                    <div className="text-[10px] text-zinc-400 font-mono">
                      TENSION HISTORIQUE
                    </div>
                    <div className="text-sm font-black text-orange-300 mt-1 truncate">
                      {routeAnalysis.tensionBreakdown.dominantTension}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Pic historique :{" "}
                      {routeAnalysis.corridorMaxUnionCount.toLocaleString("fr-FR")}{" "}
                      pers.
                    </div>
                  </div>
                </div>

                {/* Barre de répartition historique des tensions sur ce corridor */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400 font-medium">
                      Profil de tension observé sur les{" "}
                      <strong className="text-white">
                        {routeAnalysis.matchingProtests.length} cortèges historiques
                      </strong>{" "}
                      empruntant ces axes :
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden flex bg-zinc-900 border border-zinc-800">
                    <div
                      style={{ width: `${routeAnalysis.tensionBreakdown.calmOrLowPct}%` }}
                      className="bg-emerald-500 h-full transition-all"
                      title={`Pacifique / Calme / Faible : ${routeAnalysis.tensionBreakdown.calmOrLowPct}%`}
                    />
                    <div
                      style={{ width: `${routeAnalysis.tensionBreakdown.moderatePct}%` }}
                      className="bg-amber-500 h-full transition-all"
                      title={`Tension Modérée : ${routeAnalysis.tensionBreakdown.moderatePct}%`}
                    />
                    <div
                      style={{
                        width: `${routeAnalysis.tensionBreakdown.highOrVeryHighPct}%`,
                      }}
                      className="bg-red-500 h-full transition-all"
                      title={`Tension Forte à Très forte : ${routeAnalysis.tensionBreakdown.highOrVeryHighPct}%`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Pacifique / Calme ({routeAnalysis.tensionBreakdown.calmOrLowPct}%)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Modérée ({routeAnalysis.tensionBreakdown.moderatePct}%)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Forte / Très forte (
                      {routeAnalysis.tensionBreakdown.highOrVeryHighPct}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Chronologie des Secteurs Tactiques rencontrés sur le parcours */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    Séquence Topographique du Parcours (Départ → Arrivée)
                  </h4>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    Cliquez sur une zone pour l&apos;inspecter sur la carte
                  </span>
                </div>

                <div className="space-y-2.5">
                  {routeAnalysis.traversedSectors.map((match, idx) => {
                    const { sector, proximityType, minDistanceMeters, linkedMilestones } =
                      match;
                    return (
                      <div
                        key={sector.id}
                        className="p-3.5 rounded-2xl bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800/90 transition-all space-y-2.5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-mono font-bold flex items-center justify-center text-white shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-lg">{sector.icon}</span>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-white">
                                  {sector.name}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                                    proximityType === "TRAVERSÉ"
                                      ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                                      : "bg-zinc-800 text-zinc-300 border-zinc-700"
                                  }`}
                                >
                                  {proximityType === "TRAVERSÉ"
                                    ? "TRAVERSÉ PAR LE CORTÈGE"
                                    : `À PROXIMITÉ (${minDistanceMeters}m)`}
                                </span>
                                <span
                                  className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border"
                                  style={{
                                    backgroundColor: `${sector.color}20`,
                                    color: sector.color,
                                    borderColor: `${sector.color}50`,
                                  }}
                                >
                                  Risque {sector.riskLevel} • {sector.tacticalType}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              onFocusSectorOnMap(sector);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-cyan-300 text-xs font-bold border border-zinc-700 flex items-center gap-1.5 self-start sm:self-center shrink-0"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            Cibler sur la carte
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                          <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800/70">
                            <div className="text-[10px] font-mono text-zinc-400 uppercase mb-1">
                              Dispositif FDO &amp; Doctrines
                            </div>
                            <ul className="space-y-1 text-zinc-300 text-[11px]">
                              {sector.policeDeployment.map((item, i) => (
                                <li key={i}>• {item}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800/70">
                            <div className="text-[10px] font-mono text-amber-400/90 uppercase mb-1">
                              Armes &amp; Risques Topographiques
                            </div>
                            <ul className="space-y-1 text-zinc-300 text-[11px]">
                              {sector.weaponsAndRisks.map((item, i) => (
                                <li key={i}>• {item}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800/70">
                            <div className="text-[10px] font-mono text-emerald-400/90 uppercase mb-1">
                              Secours, Défense &amp; Précédents
                            </div>
                            <ul className="space-y-1 text-zinc-300 text-[11px]">
                              {sector.medicalAndLegalSupport.map((item, i) => (
                                <li key={i}>• {item}</li>
                              ))}
                              {sector.documentedIncidents.slice(0, 1).map((inc, i) => (
                                <li key={`inc-${i}`} className="text-rose-300/90">
                                  • Archive : {inc}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {linkedMilestones.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            <span className="text-[10px] font-mono text-zinc-400">
                              Jalons Carnet 1 liés :
                            </span>
                            {linkedMilestones.map((m) => (
                              <span
                                key={m.id}
                                className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono"
                              >
                                {m.badgeLabel} ({m.dateFormatted})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Points d'eau, Pharmacies & Urgences à moins de 280m du tracé actif */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Points d&apos;Eau, Pharmacies &amp; Secours sur ce Parcours (&lt; 280m)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {routeAnalysis.nearbySafePois.map(({ poi, distanceMeters }) => (
                    <button
                      key={poi.id}
                      onClick={() => {
                        onFocusCoordinatesOnMap(
                          poi.coordinates as [number, number],
                          16.5
                        );
                        onClose();
                      }}
                      className="p-2.5 rounded-xl bg-black/60 hover:bg-zinc-900 border border-zinc-800 text-left flex items-center justify-between gap-2 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {poi.name}
                        </div>
                        <div className="text-[11px] text-zinc-400 truncate">
                          {poi.address}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold shrink-0">
                        à {distanceMeters}m
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              ONGLET 2 : 📊 BATAILLE DES CHIFFRES & DÉCODEUR STATISTIQUE (CARNETS 1 & 3)
             ===================================================================== */}
          {activeTab === "stats" && (
            <div className="space-y-5">
              {/* 1. Bandeau Chiffres du Jour J (Synchronisé avec /admin) */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-zinc-900/90 to-rose-950/50 border border-indigo-500/40 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      Chiffres Officiels du Jour (Direct Coordination /Admin)
                    </span>
                  </div>
                  {activeAttendance && (
                    <span className="text-[10px] font-mono text-zinc-400">
                      Actualisé à{" "}
                      {new Date(activeAttendance.updatedAt).toLocaleTimeString(
                        "fr-FR",
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </span>
                  )}
                </div>

                {activeAttendance ? (
                  <div className="space-y-3">
                    {(activeAttendance.label || activeAttendance.cycle) && (
                      <div className="text-xs font-bold text-indigo-300">
                        {activeAttendance.label || activeAttendance.cycle}
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-3 rounded-xl bg-black/70 border border-sky-500/30">
                        <div className="text-[10px] font-mono text-sky-400 uppercase">
                          Préfecture / Police
                        </div>
                        <div className="text-lg font-black text-white mt-0.5">
                          {activeAttendance.policeCount != null
                            ? activeAttendance.policeCount.toLocaleString("fr-FR")
                            : "Non comm."}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-black/70 border border-rose-500/30">
                        <div className="text-[10px] font-mono text-rose-400 uppercase">
                          Organisateurs / Syndicats
                        </div>
                        <div className="text-lg font-black text-white mt-0.5">
                          {activeAttendance.unionCount != null
                            ? activeAttendance.unionCount.toLocaleString("fr-FR")
                            : "Non comm."}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-black/70 border border-amber-500/30">
                        <div className="text-[10px] font-mono text-amber-400 uppercase">
                          Écart &amp; Ratio du Jour
                        </div>
                        <div className="text-lg font-black text-amber-300 mt-0.5">
                          {liveRatio ? `${liveRatio}x` : "—"}
                        </div>
                        {liveGap != null && (
                          <div className="text-[10px] font-mono text-zinc-400">
                            Écart : +{liveGap.toLocaleString("fr-FR")} pers.
                          </div>
                        )}
                      </div>

                      <div className="p-3 rounded-xl bg-black/70 border border-zinc-800">
                        <div className="text-[10px] font-mono text-zinc-400 uppercase">
                          Tiers / Médias / Comparaison
                        </div>
                        <div className="text-sm font-bold text-zinc-200 mt-1">
                          {activeAttendance.thirdPartyCount != null
                            ? `${activeAttendance.thirdPartyCount.toLocaleString("fr-FR")} (Tiers)`
                            : liveRatio
                            ? liveRatio > globalStats.avgRatio
                              ? `Supérieur à la moy. (${globalStats.avgRatio}x)`
                              : `Proche de la moy. (${globalStats.avgRatio}x)`
                            : "En attente"}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-black/50 border border-zinc-800/80 text-xs text-zinc-400 flex items-center justify-between gap-3">
                    <span>
                      Aucun décompte officiel du jour n&apos;a encore été signé et diffusé par le poste de coordination (<strong>/admin</strong>). Consultez ci-dessous l&apos;historique intégral des 75 manifestations nantaises (2006–2024).
                    </span>
                  </div>
                )}
              </div>

              {/* 2. Quatre cartes KPI globales (Carnet 3 : 75 mobilisations) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase">
                    CORPUS HISTORIQUE (CARNET 3)
                  </div>
                  <div className="text-xl font-black text-white mt-1">
                    {globalStats.totalProtests} manifs
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    14 cycles sociaux (2006–2024)
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <div className="text-[10px] font-mono text-indigo-400 uppercase">
                    RATIO MOYEN NANTAIS (ORG/PRÉF)
                  </div>
                  <div className="text-xl font-black text-indigo-300 mt-1">
                    {globalStats.avgRatio}x
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Syndicats vs Préfecture 44
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <div className="text-[10px] font-mono text-rose-400 uppercase">
                    RECORD DE MOBILISATION (2006–24)
                  </div>
                  <div className="text-xl font-black text-rose-300 mt-1">
                    {globalStats.maxAttendanceProtest.unionCount.toLocaleString("fr-FR")}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5 truncate">
                    {globalStats.maxAttendanceProtest.dateFormatted} (Préf:{" "}
                    {globalStats.maxAttendanceProtest.policeCount.toLocaleString("fr-FR")}
                    ) — et 150k en 1984
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <div className="text-[10px] font-mono text-amber-400 uppercase">
                    PLUS FORT ÉCART RELATIF
                  </div>
                  <div className="text-xl font-black text-amber-300 mt-1">
                    {globalStats.maxRatioProtest.ratio}x
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5 truncate">
                    {globalStats.maxRatioProtest.title} (
                    {globalStats.maxRatioProtest.dateFormatted})
                  </div>
                </div>
              </div>

              {/* 3. Focus Méthodologique Carnet 1 : Controverse Eurecam / Cabinet Occurrence */}
              <div className="rounded-2xl bg-zinc-900/70 border border-amber-500/30 overflow-hidden">
                <button
                  onClick={() => setShowEurecamDetails((prev) => !prev)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Scale className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-amber-300">
                        Décodeur Scientifique (Carnet 1 • EVT-06 &amp; EVT-07) : Pourquoi les chiffres divergent-ils ?
                      </span>
                      <p className="text-[11px] text-zinc-400">
                        Étude du capteur thermique/vidéo Eurecam (Cabinet Occurrence) &amp; spécificités topographiques de Nantes
                      </p>
                    </div>
                  </div>
                  {showEurecamDetails ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                  )}
                </button>

                {showEurecamDetails && (
                  <div className="px-4 pb-4 pt-2 border-t border-zinc-800/80 text-xs text-zinc-300 space-y-2.5 leading-relaxed">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-black/50 border border-zinc-800">
                        <div className="font-bold text-white mb-1">
                          1. L&apos;étalonnage Eurecam / Occurrence (EVT-06 &amp; EVT-07)
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          • <strong>16 nov. 2017 (EVT-06)</strong> : Test d&apos;étalonnage sur cortège linéaire calme (CGT : 40 000 | Police : 8 000 | Occurrence : 8 250, écart max 8 % avec recomptage vidéo BFM/Le Monde/TF1).
                          <br />• <strong>22 mars 2018 (EVT-07)</strong> : Grève fonction publique et cheminots (CGT : ~500 000 national | Police : 49 000 | Occurrence : 47 800). Ouverture de la controverse technico-scientifique analysée par <em>Émile Provendier (Revue française de science politique / Mondes Sociaux)</em> sur l&apos;effet « boîte noire » algorithmique et le choix d&apos;un point fixe unique.
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-black/50 border border-zinc-800">
                        <div className="font-bold text-white mb-1">
                          2. Biais topographiques propres à Nantes (Carnet 2)
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          • <strong>Cours des 50-Otages</strong> : Positionnement policier sur points hauts pour comptage sur voie resserrée, mais scissions fréquentes entre cortège de tête et carré syndical.
                          <br />• <strong>Place Royale / Graslin &amp; Commerce</strong> : Ruelles commerçantes étroites, déviations forcées vers les quais et dispersions par gaz rendent impossible tout comptage exhaustif par capteur fixe unique.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Comparateur visuel par Cycle Contestataire */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Comparatif par Mouvement Social à Nantes (Moyenne Préfecture vs Syndicats)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {globalStats.cycles.map((c) => {
                    const unionPct = Math.min(
                      100,
                      Math.round((c.avgUnion / 55000) * 100)
                    );
                    const policePct = Math.min(
                      100,
                      Math.round((c.avgPolice / 55000) * 100)
                    );
                    return (
                      <button
                        key={c.cycle}
                        onClick={() =>
                          setSelectedCycle(
                            selectedCycle === c.cycle ? "ALL" : c.cycle
                          )
                        }
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedCycle === c.cycle
                            ? "bg-indigo-950/50 border-indigo-500/60 ring-1 ring-indigo-500/40"
                            : "bg-black/50 hover:bg-zinc-900 border-zinc-800/80"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-bold text-white truncate">
                            {c.cycle}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold shrink-0">
                            Ratio {c.avgRatio}x ({c.count} dates)
                          </span>
                        </div>
                        <div className="space-y-1 text-[10px] font-mono">
                          <div className="flex items-center gap-2">
                            <span className="w-16 text-sky-400">
                              Préf. ~{c.avgPolice.toLocaleString("fr-FR")}
                            </span>
                            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${Math.max(4, policePct)}%` }}
                                className="h-full bg-sky-400 rounded-full"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-16 text-rose-400">
                              Org. ~{c.avgUnion.toLocaleString("fr-FR")}
                            </span>
                            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${Math.max(6, unionPct)}%` }}
                                className="h-full bg-rose-500 rounded-full"
                              />
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Explorateur Interactif des 75 Manifestations (NTE-001 à NTE-075) */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Registre Intégral des 75 Manifestations ({filteredProtests.length}{" "}
                    affichées)
                  </h4>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Recherche texte */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Chercher parcours, année, source..."
                        className="pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Filtre Cycle */}
                    <select
                      value={selectedCycle}
                      onChange={(e) => setSelectedCycle(e.target.value)}
                      className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="ALL">Tous les mouvements (14)</option>
                      {uniqueCycles.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>

                    {/* Filtre Tension */}
                    <select
                      value={selectedTension}
                      onChange={(e) => setSelectedTension(e.target.value)}
                      className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="ALL">Toutes tensions</option>
                      <option value="Pacifique">Pacifique</option>
                      <option value="Calme">Calme</option>
                      <option value="Faible">Faible</option>
                      <option value="Modérée">Modérée</option>
                      <option value="Forte">Forte</option>
                      <option value="Très forte">Très forte</option>
                    </select>

                    {/* Tri */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="date">Trier : Plus récentes</option>
                      <option value="unionDesc">Trier : Forte affluence</option>
                      <option value="ratioDesc">Trier : Plus fort ratio</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {filteredProtests.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono text-zinc-500">
                            {p.id}
                          </span>
                          <span className="text-xs font-bold text-indigo-300 font-mono">
                            {p.dateFormatted}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[10px] font-medium">
                            {p.cycle}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              TENSION_BADGE_STYLE[p.tensionLevel]
                            }`}
                          >
                            Tension : {p.tensionLevel}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-white">
                          {p.title}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono truncate">
                          📍 Parcours : {p.route}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          Sources : {p.sources}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 bg-black/60 px-3 py-2 rounded-xl border border-zinc-800/80">
                        <div className="text-right">
                          <div className="text-[10px] text-sky-400 font-mono">
                            Préfecture
                          </div>
                          <div className="text-xs font-bold text-white font-mono">
                            {p.policeCount.toLocaleString("fr-FR")}
                          </div>
                        </div>
                        <div className="text-zinc-600 font-bold">vs</div>
                        <div className="text-right">
                          <div className="text-[10px] text-rose-400 font-mono">
                            Syndicats
                          </div>
                          <div className="text-xs font-bold text-white font-mono">
                            {p.unionCount.toLocaleString("fr-FR")}
                          </div>
                        </div>
                        <div className="pl-2 border-l border-zinc-800 text-right">
                          <div className="text-[10px] text-amber-400 font-mono">
                            Ratio
                          </div>
                          <div className="text-xs font-black text-amber-300 font-mono">
                            {p.ratio}x
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              ONGLET 3 : 🗺️ MÉMOIRE DES LIEUX & LES 8 SECTEURS TACTIQUES (CARNETS 1 & 2)
             ===================================================================== */}
          {activeTab === "topo" && (
            <div className="space-y-6">
              {/* 1. Les 8 Secteurs Stratégiques de Nantes (Carnet 2) */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Carnet 2 : Les 8 Secteurs Tactiques Urbains de Nantes
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Topographie du maintien de l&apos;ordre, statut juridique RAA, armement documenté et acteurs de secours.
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {CARNET_2_SECTORS.map((sector) => {
                    const isExpanded = expandedSectorId === sector.id;
                    return (
                      <div
                        key={sector.id}
                        className="rounded-2xl bg-zinc-900/75 border border-zinc-800 overflow-hidden transition-all"
                      >
                        <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <button
                            onClick={() =>
                              setExpandedSectorId(isExpanded ? null : sector.id)
                            }
                            className="flex items-center gap-3 text-left flex-1"
                          >
                            <span className="text-xl">{sector.icon}</span>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-white">
                                  {sector.name}
                                </span>
                                <span
                                  className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border"
                                  style={{
                                    backgroundColor: `${sector.color}20`,
                                    color: sector.color,
                                    borderColor: `${sector.color}50`,
                                  }}
                                >
                                  {sector.riskLevel} • {sector.tacticalType}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-400 mt-0.5">
                                {sector.roleAndLegal.join(" • ")}
                              </p>
                            </div>
                          </button>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                onFocusSectorOnMap(sector);
                                onClose();
                              }}
                              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                            >
                              <Compass className="w-3.5 h-3.5" />
                              Voir Halo sur Carte
                            </button>
                            <button
                              onClick={() =>
                                setExpandedSectorId(isExpanded ? null : sector.id)
                              }
                              className="p-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-4 pb-4 pt-2 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                            <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800/80">
                              <div className="text-[10px] font-mono text-sky-400 uppercase mb-1">
                                1. Rôle Cortège &amp; Statut Juridique
                              </div>
                              <ul className="space-y-1 text-zinc-300 text-[11px]">
                                {sector.roleAndLegal.map((x, i) => (
                                  <li key={i}>• {x}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800/80">
                              <div className="text-[10px] font-mono text-indigo-400 uppercase mb-1">
                                2. Dispositif des Forces de l&apos;Ordre
                              </div>
                              <ul className="space-y-1 text-zinc-300 text-[11px]">
                                {sector.policeDeployment.map((x, i) => (
                                  <li key={i}>• {x}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800/80">
                              <div className="text-[10px] font-mono text-amber-400 uppercase mb-1">
                                3. Typologie des Armes &amp; Risques
                              </div>
                              <ul className="space-y-1 text-zinc-300 text-[11px]">
                                {sector.weaponsAndRisks.map((x, i) => (
                                  <li key={i}>• {x}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800/80">
                              <div className="text-[10px] font-mono text-rose-400 uppercase mb-1">
                                4. Incidents &amp; Précédents Documentés
                              </div>
                              <ul className="space-y-1 text-zinc-300 text-[11px]">
                                {sector.documentedIncidents.map((x, i) => (
                                  <li key={i}>• {x}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800/80">
                              <div className="text-[10px] font-mono text-emerald-400 uppercase mb-1">
                                5. Acteurs de Secours &amp; Défense
                              </div>
                              <ul className="space-y-1 text-zinc-300 text-[11px]">
                                {sector.medicalAndLegalSupport.map((x, i) => (
                                  <li key={i}>• {x}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800/80">
                              <div className="text-[10px] font-mono text-zinc-400 uppercase mb-1">
                                6. Flux, Transports &amp; Sources
                              </div>
                              <ul className="space-y-1 text-zinc-300 text-[11px]">
                                {sector.flowAndTransport.map((x, i) => (
                                  <li key={i}>• {x}</li>
                                ))}
                                <li className="text-zinc-500 pt-1">
                                  Sources : {sector.sources.join(", ")}
                                </li>
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Frise Chronologique des 9 Jalons Historiques (Carnet 1 : 1955–2026) */}
              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Carnet 1 : Les 9 Jalons Historiques &amp; Mémoriels (1955–2026)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {CARNET_1_MILESTONES.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex flex-col justify-between gap-2.5"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                            {evt.id} • {evt.dateFormatted}
                          </span>
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
                            className="text-[11px] font-bold text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            <MapPin className="w-3 h-3" />
                            Localiser
                          </button>
                        </div>

                        <h4 className="text-xs font-bold text-white">
                          {evt.context}
                        </h4>
                        <div className="text-[11px] text-zinc-400">
                          📍 {evt.locationText}
                        </div>

                        <div className="p-2 rounded-xl bg-black/50 border border-zinc-800/80 space-y-1 text-[11px]">
                          <div>
                            <span className="text-zinc-500">Effectifs : </span>
                            <span className="text-zinc-200">
                              Org: {evt.unionCountText} | Police:{" "}
                              {evt.policeCountText}
                              {evt.thirdPartyCountText !== "Non disponible"
                                ? ` | Tiers: ${evt.thirdPartyCountText}`
                                : ""}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-500">Armement / FDO : </span>
                            <span className="text-zinc-300">{evt.weaponsUsed}</span>
                          </div>
                          <div>
                            <span className="text-rose-400/90 font-medium">
                              Bilan sanitaire :{" "}
                            </span>
                            <span className="text-zinc-200">{evt.medicalToll}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500">Bilan judiciaire : </span>
                            <span className="text-zinc-300">{evt.judicialToll}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[10px] text-zinc-500 font-mono">
                        Réf : {evt.sources}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pied de modale légal & informatif */}
        <div className="px-4 py-2.5 bg-zinc-950 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 shrink-0">
          <span>
            Sources : Archives Patrimonia Nantes, RAA Préfecture 44, Défenseur des droits, Rapports AN, Intersyndicale 44.
          </span>
          <span className="font-mono text-zinc-400 hidden sm:inline">
            100% Statique &amp; Zéro Tracking RGPD
          </span>
        </div>
      </div>
    </div>
  );
}
