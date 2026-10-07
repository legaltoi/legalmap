import { ReportCategoryMetadata, ReportCategory } from "@/types";

export const REPORT_CATEGORIES: Record<ReportCategory, ReportCategoryMetadata> = {
  ZONE_GAZ: {
    id: "ZONE_GAZ",
    label: "Zone de Gaz / Lacrymogène",
    shortLabel: "Zone Gaz",
    description: "Émanations de gaz lacrymogènes ou déploiement d'agents dispersants.",
    color: "#f59e0b", // Amber 500
    badgeBg: "rgba(245, 158, 11, 0.15)",
    borderColor: "#fbbf24",
    iconName: "alert-triangle",
    legalRationale:
      "Alerte sanitaire préventive pour personnes vulnérables (asthmatiques, enfants) et réduction des risques chimiques.",
  },
  VOIE_BLOQUEE: {
    id: "VOIE_BLOQUEE",
    label: "Voie Bloquée / Circulation Coupée",
    shortLabel: "Voie Bloquée",
    description: "Rue impraticable, nasse de circulation, barriérage hermétique.",
    color: "#ef4444", // Red 500
    badgeBg: "rgba(239, 68, 68, 0.15)",
    borderColor: "#f87171",
    iconName: "ban",
    legalRationale:
      "Information factuelle de voirie pour prévenir les écrasements de foule et garantir les voies d'évacuation civile.",
  },
  POINT_BLOCAGE: {
    id: "POINT_BLOCAGE",
    label: "Rassemblement / Blocage Pacifique",
    shortLabel: "Point Blocage",
    description: "Rassemblement citoyen fixe, chaîne humaine pacifique, point d'arrêt.",
    color: "#8b5cf6", // Purple 500
    badgeBg: "rgba(139, 92, 246, 0.15)",
    borderColor: "#a78bfa",
    iconName: "users",
    legalRationale:
      "Constat de circulation de fait pour l'orientation des participants et des usagers de l'espace public.",
  },
  SECOURS_MEDIC: {
    id: "SECOURS_MEDIC",
    label: "Secouristes Bénévoles Actifs",
    shortLabel: "Secours Médic",
    description: "Point de premiers secours civils, secouristes de rue intervenant.",
    color: "#10b981", // Emerald 500
    badgeBg: "rgba(16, 185, 129, 0.15)",
    borderColor: "#34d399",
    iconName: "cross",
    legalRationale:
      "Facilitation de l'accès aux soins d'urgence vitale et aux premiers secours sans entrave.",
  },
};

export const CONSENSUS_CONFIG = {
  CLUSTER_RADIUS_METERS: 100, // Rayon géographique d'agrégation
  MIN_REPORTS_THRESHOLD: 2, // Seuil minimal d'occurrences pour affichage public
  SLIDING_WINDOW_MS: 5 * 60 * 1000, // 5 minutes de fenêtre glissante pour l'agrégation
  TTL_MOBILE_MS: 5 * 60 * 1000, // 5 minutes si cortège MOBILE
  TTL_IMMOBILE_MS: 10 * 60 * 1000, // 10 minutes si cortège IMMOBILE
  CLEANUP_INTERVAL_MS: 5 * 1000, // Vérification d'expiration toutes les 5 secondes
};

