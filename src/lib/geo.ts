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

/**
 * Génère un anneau de coordonnées [lng, lat][] formant un polygone circulaire géodésique
 */
export function createCirclePolygon(
  center: [number, number], // [lng, lat]
  radiusMeters: number,
  steps: number = 64
): [number, number][] {
  const [centerLng, centerLat] = center;
  const coordinates: [number, number][] = [];
  const radLat = toRadians(centerLat);
  const radLng = toRadians(centerLng);
  const angularDist = radiusMeters / EARTH_RADIUS_METERS;

  for (let i = 0; i <= steps; i++) {
    const bearing = (i * 2 * Math.PI) / steps;
    const lat = Math.asin(
      Math.sin(radLat) * Math.cos(angularDist) +
        Math.cos(radLat) * Math.sin(angularDist) * Math.cos(bearing)
    );
    const lng =
      radLng +
      Math.atan2(
        Math.sin(bearing) * Math.sin(angularDist) * Math.cos(radLat),
        Math.cos(angularDist) - Math.sin(radLat) * Math.sin(lat)
      );

    coordinates.push([(lng * 180) / Math.PI, (lat * 180) / Math.PI]);
  }

  return coordinates;
}

/**
 * Détermine si un point [lng, lat] est à l'intérieur d'un polygone (Ray-casting)
 */
export function isPointInPolygon(
  point: [number, number], // [lng, lat]
  polygon: [number, number][]
): boolean {
  if (!polygon || polygon.length < 3) return false;
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Distance minimale entre un point et un segment de droite [p1, p2] en mètres
 */
function distancePointToSegmentMeters(
  point: [number, number],
  p1: [number, number],
  p2: [number, number]
): number {
  const [x, y] = point;
  const [x1, y1] = p1;
  const [x2, y2] = p2;

  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    return calculateHaversineDistance(y, x, y1, x1);
  }

  // Projection orthogonale
  const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;

  return calculateHaversineDistance(y, x, projY, projX);
}

/**
 * Vérifie si un point [lng, lat] est à l'intérieur ou à moins de thresholdMeters d'un polygone
 */
export function isPointNearPolygon(
  point: [number, number],
  polygon: [number, number][],
  thresholdMeters: number
): boolean {
  if (!polygon || polygon.length < 3) return false;

  // 1. Si déjà à l'intérieur
  if (isPointInPolygon(point, polygon)) return true;

  // 2. Vérification de la distance minimale aux arêtes
  for (let i = 0; i < polygon.length - 1; i++) {
    const dist = distancePointToSegmentMeters(point, polygon[i], polygon[i + 1]);
    if (dist <= thresholdMeters) return true;
  }

  // Fermeture du polygone
  const lastDist = distancePointToSegmentMeters(
    point,
    polygon[polygon.length - 1],
    polygon[0]
  );
  return lastDist <= thresholdMeters;
}


