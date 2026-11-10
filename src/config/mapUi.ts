/**
 * Configuration UI & Paramètres Graphiques des Calques Cartographiques LEGALMAPS
 * - Couleurs, opacités, cadences d'animation et seuils de distance
 * - Zones d'interdiction de manifester (Arrêtés préfectoraux)
 * - Zones de dispersion citoyenne et issues de secours logiques
 */

export const MAP_UI_CONFIG = {
  // 1. Zone d'interdiction de manifester (Arrêté préfectoral)
  PROHIBITED_ZONE: {
    fillColor: "#ef4444", // Rouge vif
    fillOpacity: 0.16,
    strokeColor: "#f87171",
    strokeWidth: 2,
    strokeDasharray: [3, 2.5], // Ligne en pointillés
    glowColor: "#dc2626",
    glowWidth: 5,
    glowOpacity: 0.35,
    approachThresholdMeters: 250, // Seuil d'approche pour déclencher l'alerte sobre
    labelBg: "rgba(185, 28, 28, 0.90)",
    labelBorder: "rgba(248, 113, 113, 0.50)",
    labelTextColor: "#fecaca",
  },

  // 2. Zone de dispersion en cours (Alerte d'évacuation sanitaire)
  DISPERSION_ZONE: {
    fillColor: "#f97316", // Orange vif
    fillOpacityBase: 0.22,
    fillOpacityPulseMax: 0.38,
    strokeColor: "#fb923c",
    strokeWidth: 2.5,
    strokeDasharray: [3, 2],
    glowColor: "#ea580c",
    defaultRadiusMeters: 250, // 250m par défaut
    minRadiusMeters: 100,
    maxRadiusMeters: 800,
    defaultTtlMinutes: 10, // 10 minutes par défaut
    defaultTtlMs: 10 * 60 * 1000,
    pulseSpeedMs: 1800, // Durée d'un cycle de pulsation douce
  },

  // 3. Issues logiques et corridors de secours
  SAFE_EXITS: {
    maxExitsToShow: 3, // Afficher les 2 à 3 meilleures issues
    pinColor: "#22c55e", // Vert émeraude
    textColor: "#86efac",
    borderColor: "#16a34a",
    badgeBg: "rgba(5, 46, 22, 0.92)",
    nearbyPoiHighlightRadiusMeters: 350, // Rayon pour considérer un POI comme proche d'une issue
  },

  // Stockage local hors-ligne
  STORAGE_KEYS: {
    ADMIN_ZONES_CACHE: "legalmaps_cached_admin_zones",
    ADMIN_ZONES_DRAFT: "legalmaps_admin_zones_draft",
  },
} as const;
