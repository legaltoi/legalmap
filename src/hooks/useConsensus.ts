"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ReportEvent, ConsensusMarker, CortegeMovementStatus } from "@/types";
import { calculateHaversineDistance, calculateCentroid } from "@/lib/geo";
import { CONSENSUS_CONFIG } from "@/config/categories";

interface InternalCluster {
  id: string;
  category: ReportEvent["category"];
  reports: ReportEvent[];
  centroid: { lat: number; lng: number };
  firstReportTime: number;
  lastReportTime: number;
  validatedAt: number | null; // Timestamp où le seuil a été atteint pour la 1ère fois
}

interface UseConsensusOptions {
  cortegeStatus?: CortegeMovementStatus;
  threshold?: number; // Seuil minimum (défaut: 2)
  radiusMeters?: number; // Rayon de cluster (défaut: 100m)
}

export function useConsensus({
  cortegeStatus = "MOBILE",
  threshold = CONSENSUS_CONFIG.MIN_REPORTS_THRESHOLD,
  radiusMeters = CONSENSUS_CONFIG.CLUSTER_RADIUS_METERS,
}: UseConsensusOptions = {}) {
  // Liste des marqueurs publics validés par consensus et affichés sur la carte
  const [publicMarkers, setPublicMarkers] = useState<ConsensusMarker[]>([]);

  // Compteur indicatif des signalements individuels en attente de corroboration (non affichés)
  const [pendingCount, setPendingCount] = useState<number>(0);

  // Clusters internes en mémoire vive (zéro persistance disque)
  const clustersRef = useRef<Map<string, InternalCluster>>(new Map());
  const cortegeStatusRef = useRef<CortegeMovementStatus>(cortegeStatus);

  useEffect(() => {
    cortegeStatusRef.current = cortegeStatus;
  }, [cortegeStatus]);

  /**
   * Calcule la durée de vie (TTL) selon la mobilité du cortège
   * Mobile : 5 minutes (la foule avance, le risque se déplace)
   * Immobile : 10 minutes (statique, risque plus persistant)
   */
  const getTtlDuration = useCallback((status: CortegeMovementStatus): number => {
    return status === "MOBILE"
      ? CONSENSUS_CONFIG.TTL_MOBILE_MS
      : CONSENSUS_CONFIG.TTL_IMMOBILE_MS;
  }, []);

  /**
   * Re-calcule les marqueurs publics visibles et purge les éléments expirés
   */
  const refreshMarkers = useCallback(() => {
    const now = Date.now();
    const currentStatus = cortegeStatusRef.current;
    const currentTtl = getTtlDuration(currentStatus);

    const validPublicList: ConsensusMarker[] = [];
    let pendingReportsTotal = 0;

    const clusters = clustersRef.current;

    for (const [clusterId, cluster] of clusters.entries()) {
      // 1. Filtrer les rapports trop anciens de la fenêtre glissante s'il n'est pas encore validé
      if (!cluster.validatedAt) {
        cluster.reports = cluster.reports.filter(
          (r) => now - r.timestamp <= CONSENSUS_CONFIG.SLIDING_WINDOW_MS
        );

        if (cluster.reports.length === 0) {
          clusters.delete(clusterId);
          continue;
        }

        // Recalculer le centroïde si des rapports ont été purgés
        cluster.centroid = calculateCentroid(cluster.reports);
      }

      const reportCount = cluster.reports.length;

      // 2. Vérification du seuil de consensus (>= 2 ou 3)
      if (reportCount >= threshold) {
        if (!cluster.validatedAt) {
          cluster.validatedAt = now;
        }

        // Le TTL démarre ou est prolongé par le dernier rapport reçu
        const expiresAt = cluster.lastReportTime + currentTtl;

        // Si le délai TTL est écoulé, on détruit immédiatement le marqueur sans laisser de trace
        if (now >= expiresAt) {
          clusters.delete(clusterId);
          continue;
        }

        validPublicList.push({
          id: cluster.id,
          category: cluster.category,
          lat: cluster.centroid.lat,
          lng: cluster.centroid.lng,
          reportCount,
          firstReportTime: cluster.firstReportTime,
          lastReportTime: cluster.lastReportTime,
          expiresAt,
          ttlDurationMs: currentTtl,
        });
      } else {
        // En attente de corroboration (1 signalement) : affiché en mode préventif indicatif
        pendingReportsTotal += reportCount;
        validPublicList.push({
          id: cluster.id,
          category: cluster.category,
          lat: cluster.centroid.lat,
          lng: cluster.centroid.lng,
          reportCount,
          firstReportTime: cluster.firstReportTime,
          lastReportTime: cluster.lastReportTime,
          expiresAt: cluster.lastReportTime + CONSENSUS_CONFIG.SLIDING_WINDOW_MS,
          ttlDurationMs: CONSENSUS_CONFIG.SLIDING_WINDOW_MS,
          isPending: true,
        });
      }
    }

    setPublicMarkers(validPublicList);
    setPendingCount(pendingReportsTotal);
  }, [getTtlDuration, threshold]);

  /**
   * Intègre un nouveau signalement brut dans les clusters en mémoire
   */
  const addIncomingReport = useCallback(
    (report: ReportEvent) => {
      const now = Date.now();
      const clusters = clustersRef.current;

      let matchedClusterId: string | null = null;
      let minDistance = Infinity;

      // Recherche d'un cluster existant de même catégorie dans le rayon de 100m
      for (const [id, cluster] of clusters.entries()) {
        if (cluster.category !== report.category) continue;

        const dist = calculateHaversineDistance(
          report.lat,
          report.lng,
          cluster.centroid.lat,
          cluster.centroid.lng
        );

        if (dist <= radiusMeters && dist < minDistance) {
          minDistance = dist;
          matchedClusterId = id;
        }
      }

      if (matchedClusterId) {
        // Ajout au cluster existant
        const existing = clusters.get(matchedClusterId)!;
        existing.reports.push(report);
        existing.centroid = calculateCentroid(existing.reports);
        existing.lastReportTime = Math.max(existing.lastReportTime, report.timestamp);
      } else {
        // Création d'un nouveau cluster en attente de consensus
        const newId = `cluster_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        clusters.set(newId, {
          id: newId,
          category: report.category,
          reports: [report],
          centroid: { lat: report.lat, lng: report.lng },
          firstReportTime: report.timestamp,
          lastReportTime: report.timestamp,
          validatedAt: null,
        });
      }

      refreshMarkers();
    },
    [radiusMeters, refreshMarkers]
  );

  // Nettoyage régulier en arrière-plan (toutes les 5 secondes) pour purger les marqueurs expirés
  useEffect(() => {
    const timer = setInterval(() => {
      refreshMarkers();
    }, CONSENSUS_CONFIG.CLEANUP_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [refreshMarkers]);

  // Si le statut du cortège change (MOBILE <-> IMMOBILE), rafraîchir les expirations
  useEffect(() => {
    refreshMarkers();
  }, [cortegeStatus, refreshMarkers]);

  return {
    publicMarkers,
    pendingCount,
    addIncomingReport,
    refreshMarkers,
  };
}

