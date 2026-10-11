/**
 * Moteur d'Analyse Prédictive de Parcours & Décodeur Statistique (Carnets 1, 2 & 3)
 *
 * Croise en temps réel la géométrie du tracé officiel actif sur la carte publique avec :
 * - Les 8 Secteurs Tactiques Urbains de Nantes (Carnet 2)
 * - Les 9 Jalons Historiques Documentés 1955–2026 (Carnet 1)
 * - Les 75 Manifestations Nantaises & Leurs Ratios Préfecture/Syndicats 2006–2024 (Carnet 3)
 * - Les Points d'Intérêt Sanitaires & Juridiques (Eau, Pharmacies, Urgences, Défense)
 */

import {
  CARNET_1_MILESTONES,
  CARNET_2_SECTORS,
  CARNET_3_PROTESTS,
  TacticalSector,
  HistoricalProtest,
  HistoricalMilestone,
} from "@/config/data/nantes-carnets";
import { calculateHaversineDistance } from "@/lib/geo";
import nantesData from "@/config/cities/nantes.json";
import { POI } from "@/types";

export interface RouteSectorMatch {
  sector: TacticalSector;
  proximityType: "TRAVERSÉ" | "PROXIMITÉ";
  minDistanceMeters: number;
  progressionIndex: number; // Position sur le tracé pour tri chronologique (Départ -> Arrivée)
  linkedMilestones: HistoricalMilestone[];
}

export interface RouteAnalysisResult {
  totalDistanceKm: number;
  estimatedCortegeMinutes: number;
  traversedSectors: RouteSectorMatch[];
  chokepoints: RouteSectorMatch[];
  globalVigilanceLevel: "MODÉRÉE" | "ÉLEVÉE" | "CRITIQUE";
  globalVigilanceScore: number; // Sur 100
  matchingProtests: HistoricalProtest[];
  tensionBreakdown: {
    calmOrLowPct: number;
    moderatePct: number;
    highOrVeryHighPct: number;
    dominantTension: string;
  };
  corridorAverageRatio: number;
  corridorMaxUnionCount: number;
  nearbySafePois: Array<{ poi: POI; distanceMeters: number }>;
}

export interface CycleStatisticalSummary {
  cycle: string;
  count: number;
  avgPolice: number;
  avgUnion: number;
  avgRatio: number;
  maxUnion: number;
  highTensionCount: number;
}

/**
 * Calcule la distance minimale (en mètres) entre une polyligne [lng, lat][] et un point cible [lng, lat]
 * et retourne également l'indice du point de la polyligne le plus proche (pour ordonner du Départ à l'Arrivée).
 */
function getMinDistanceToRoute(
  routeCoords: [number, number][],
  targetLng: number,
  targetLat: number
): { minDistanceMeters: number; closestIndex: number } {
  let minDistanceMeters = Infinity;
  let closestIndex = 0;

  for (let i = 0; i < routeCoords.length; i++) {
    const [lng, lat] = routeCoords[i];
    const dist = calculateHaversineDistance(lat, lng, targetLat, targetLng);
    if (dist < minDistanceMeters) {
      minDistanceMeters = dist;
      closestIndex = i;
    }

    // Échantillonnage du point médian du segment pour les longs segments droits
    if (i < routeCoords.length - 1) {
      const [nextLng, nextLat] = routeCoords[i + 1];
      const midLng = (lng + nextLng) / 2;
      const midLat = (lat + nextLat) / 2;
      const midDist = calculateHaversineDistance(midLat, midLng, targetLat, targetLng);
      if (midDist < minDistanceMeters) {
        minDistanceMeters = midDist;
        closestIndex = i;
      }
    }
  }

  return { minDistanceMeters: Math.round(minDistanceMeters), closestIndex };
}

/**
 * Analyse géométrique et historique complète du parcours actif sur la carte publique
 */
export function analyzeOfficialRoute(
  customRouteCoords?: [number, number][]
): RouteAnalysisResult {
  const defaultCoords = (nantesData.officialRoute.features[0]?.geometry?.coordinates || []) as [
    number,
    number
  ][];
  const coords =
    customRouteCoords && customRouteCoords.length >= 2 ? customRouteCoords : defaultCoords;

  // 1. Longueur totale du parcours en kilomètres
  let totalMeters = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const [lng1, lat1] = coords[i];
    const [lng2, lat2] = coords[i + 1];
    totalMeters += calculateHaversineDistance(lat1, lng1, lat2, lng2);
  }
  const totalDistanceKm = Math.round((totalMeters / 1000) * 100) / 100;
  // Vitesse moyenne d'un cortège dense : ~2.2 km/h
  const estimatedCortegeMinutes = Math.max(25, Math.round((totalDistanceKm / 2.2) * 60));

  // 2. Détection des Secteurs Tactiques (Carnet 2) traversés ou jouxtés par le tracé
  const matchedSectors: RouteSectorMatch[] = [];

  for (const sector of CARNET_2_SECTORS) {
    const [sLng, sLat] = sector.coordinates;
    const { minDistanceMeters, closestIndex } = getMinDistanceToRoute(coords, sLng, sLat);

    // Seuil de traversée directe vs proximité immédiate
    const traverseThreshold = sector.radiusMeters + 55;
    const proximityThreshold = sector.radiusMeters + 240;

    if (minDistanceMeters <= proximityThreshold) {
      const proximityType = minDistanceMeters <= traverseThreshold ? "TRAVERSÉ" : "PROXIMITÉ";
      const linkedMilestones = CARNET_1_MILESTONES.filter(
        (m) => m.sectorId === sector.id || sector.linkedEvents.includes(m.id)
      );

      matchedSectors.push({
        sector,
        proximityType,
        minDistanceMeters,
        progressionIndex: closestIndex,
        linkedMilestones,
      });
    }
  }

  // Tri chronologique dans le sens de marche (du point de départ vers la dispersion)
  matchedSectors.sort((a, b) => a.progressionIndex - b.progressionIndex);

  // Goulots d'étranglement & secteurs à risque élevé/critique sur le tracé
  const chokepoints = matchedSectors.filter((m) => m.sector.riskScore >= 4);

  // 3. Croisement avec les 75 manifestations historiques (Carnet 3)
  const activeKeywords = new Set<string>();
  matchedSectors.forEach((m) => {
    m.sector.keywords.forEach((kw) => activeKeywords.add(kw.toLowerCase()));
  });

  let matchingProtests = CARNET_3_PROTESTS.filter((protest) => {
    const routeLower = protest.route.toLowerCase();
    let hits = 0;
    for (const m of matchedSectors) {
      if (m.sector.keywords.some((kw) => routeLower.includes(kw.toLowerCase()))) {
        hits++;
      }
    }
    return hits >= Math.min(2, Math.max(1, matchedSectors.length));
  });

  if (matchingProtests.length === 0) {
    matchingProtests = CARNET_3_PROTESTS.slice(0, 15);
  }

  // 4. Répartition historique des niveaux de tension sur ce corridor
  let calmOrLow = 0;
  let moderate = 0;
  let highOrVeryHigh = 0;

  matchingProtests.forEach((p) => {
    if (p.tensionLevel === "Pacifique" || p.tensionLevel === "Calme" || p.tensionLevel === "Faible") {
      calmOrLow++;
    } else if (p.tensionLevel === "Modérée") {
      moderate++;
    } else {
      highOrVeryHigh++;
    }
  });

  const totalMatched = Math.max(1, matchingProtests.length);
  const calmOrLowPct = Math.round((calmOrLow / totalMatched) * 100);
  const moderatePct = Math.round((moderate / totalMatched) * 100);
  const highOrVeryHighPct = Math.max(0, 100 - calmOrLowPct - moderatePct);

  let dominantTension = "Modérée";
  if (highOrVeryHighPct >= 45) dominantTension = "Forte à Très forte";
  else if (calmOrLowPct >= 50) dominantTension = "Calme à Modérée";

  const corridorAverageRatio =
    Math.round(
      (matchingProtests.reduce((acc, p) => acc + p.ratio, 0) / totalMatched) * 100
    ) / 100;

  const corridorMaxUnionCount = matchingProtests.reduce(
    (max, p) => Math.max(max, p.unionCount),
    0
  );

  // 5. Calcul du score de vigilance topographique global
  const maxRiskScore = matchedSectors.reduce(
    (max, m) => Math.max(max, m.sector.riskScore),
    2
  );
  const rawScore = Math.min(
    96,
    Math.round(maxRiskScore * 12 + chokepoints.length * 8 + highOrVeryHighPct * 0.25)
  );

  let globalVigilanceLevel: "MODÉRÉE" | "ÉLEVÉE" | "CRITIQUE" = "MODÉRÉE";
  if (rawScore >= 75 || chokepoints.some((c) => c.sector.riskLevel === "CRITIQUE" && c.proximityType === "TRAVERSÉ")) {
    globalVigilanceLevel = "CRITIQUE";
  } else if (rawScore >= 52 || chokepoints.length >= 1) {
    globalVigilanceLevel = "ÉLEVÉE";
  }

  // 6. Points d'eau, pharmacies et secours les plus proches du parcours actif
  const nearbySafePois: Array<{ poi: POI; distanceMeters: number }> = [];
  for (const rawPoi of nantesData.pois as POI[]) {
    if (rawPoi.category === "TOILET") continue;
    const { minDistanceMeters } = getMinDistanceToRoute(
      coords,
      rawPoi.coordinates[0],
      rawPoi.coordinates[1]
    );
    if (minDistanceMeters <= 280) {
      nearbySafePois.push({ poi: rawPoi, distanceMeters: minDistanceMeters });
    }
  }
  nearbySafePois.sort((a, b) => a.distanceMeters - b.distanceMeters);

  return {
    totalDistanceKm,
    estimatedCortegeMinutes,
    traversedSectors: matchedSectors,
    chokepoints,
    globalVigilanceLevel,
    globalVigilanceScore: rawScore,
    matchingProtests,
    tensionBreakdown: {
      calmOrLowPct,
      moderatePct,
      highOrVeryHighPct,
      dominantTension,
    },
    corridorAverageRatio,
    corridorMaxUnionCount,
    nearbySafePois: nearbySafePois.slice(0, 8),
  };
}

/**
 * Synthèse statistique globale des 75 manifestations du Carnet 3 (2006–2024)
 */
export function getGlobalObservatoryStats() {
  const totalProtests = CARNET_3_PROTESTS.length;
  const totalPolice = CARNET_3_PROTESTS.reduce((acc, p) => acc + p.policeCount, 0);
  const totalUnion = CARNET_3_PROTESTS.reduce((acc, p) => acc + p.unionCount, 0);
  const avgRatio =
    Math.round(
      (CARNET_3_PROTESTS.reduce((acc, p) => acc + p.ratio, 0) / totalProtests) * 100
    ) / 100;

  const maxRatioProtest = [...CARNET_3_PROTESTS].sort((a, b) => b.ratio - a.ratio)[0];
  const maxAttendanceProtest = [...CARNET_3_PROTESTS].sort(
    (a, b) => b.unionCount - a.unionCount
  )[0];

  // Regroupement par cycle contestataire
  const cycleMap = new Map<string, HistoricalProtest[]>();
  for (const p of CARNET_3_PROTESTS) {
    const arr = cycleMap.get(p.cycle) || [];
    arr.push(p);
    cycleMap.set(p.cycle, arr);
  }

  const cycles: CycleStatisticalSummary[] = [];
  for (const [cycle, list] of cycleMap.entries()) {
    const count = list.length;
    const avgPolice = Math.round(list.reduce((s, x) => s + x.policeCount, 0) / count);
    const avgUnion = Math.round(list.reduce((s, x) => s + x.unionCount, 0) / count);
    const cycleRatio =
      Math.round((list.reduce((s, x) => s + x.ratio, 0) / count) * 100) / 100;
    const maxUnion = list.reduce((m, x) => Math.max(m, x.unionCount), 0);
    const highTensionCount = list.filter(
      (x) => x.tensionLevel === "Forte" || x.tensionLevel === "Très forte"
    ).length;

    cycles.push({
      cycle,
      count,
      avgPolice,
      avgUnion,
      avgRatio: cycleRatio,
      maxUnion,
      highTensionCount,
    });
  }

  cycles.sort((a, b) => b.maxUnion - a.maxUnion);

  return {
    totalProtests,
    totalPolice,
    totalUnion,
    avgRatio,
    maxRatioProtest,
    maxAttendanceProtest,
    cycles,
  };
}
