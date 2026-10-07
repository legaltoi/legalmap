/**
 * Utilitaires géographiques et calculs de distance
 * Conforme au RGPD : fonctions d'anonymisation GPS (arrondi à 3 décimales).
 */

const EARTH_RADIUS_METERS = 6371000;

/**
 * Calcule la distance orthodromique entre deux points GPS en mètres (Formule de Haversine)
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const radLat1 = toRadians(lat1);
  const radLat2 = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) *
      Math.sin(dLon / 2) *
      Math.cos(radLat1) *
      Math.cos(radLat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Arrondit les coordonnées GPS à 3 décimales (précision ~100m).
 * Impératif de vie privée : empêche le traçage individuel d'un terminal.
 */
export function roundCoordinates(
  lat: number,
  lng: number,
  decimals: number = 3
): { lat: number; lng: number } {
  const factor = Math.pow(10, decimals);
  return {
    lat: Math.round(lat * factor) / factor,
    lng: Math.round(lng * factor) / factor,
  };
}

/**
 * Calcule le centre de gravité (barycentre) d'une liste de points GPS
 */
export function calculateCentroid(
  points: Array<{ lat: number; lng: number }>
): { lat: number; lng: number } {
  if (points.length === 0) {
    return { lat: 0, lng: 0 };
  }

  const sum = points.reduce(
    (acc, pt) => ({
      lat: acc.lat + pt.lat,
      lng: acc.lng + pt.lng,
    }),
    { lat: 0, lng: 0 }
  );

  return {
    lat: sum.lat / points.length,
    lng: sum.lng / points.length,
  };
}

/**
 * Formate un delta temporel en format lisible (ex: "3 min")
 */
export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return "Expiré";
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSecs = seconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${remainingSecs < 10 ? "0" : ""}${remainingSecs}s`;
  }
  return `${remainingSecs}s`;
}

