/**
 * Moteur de rendu cartographique SunderS (Surveillance under Surveillance)
 * Basé sur : CCCHH SunderS mirror (https://sunders.hamburg.ccc.de/)
 * Code source d'origine : osmcamera by khris78 [CC-BY-SA / MIT / GPLv3 / WTFPL]
 * Cônes de vision : inspiré de Leaflet-Semicircle [MIT]
 * Données : OpenStreetMap contributors [ODbL / CC BY-SA]
 */

import camerasData from "@/config/data/nantes-cameras.json";

export interface SundersCameraNode {
  id: string;
  lat: number;
  lon: number;
  type?: string; // "dome" | "fixed" | "panning" | "guard" | "traffic" | "panorama"
  zone?: string; // "public" | "outdoor" | "indoor" | "traffic" | "private"
  sZone?: string;
  mount?: string; // "pole" | "street_lamp" | "wall" | "ceiling"
  dir?: number; // 0..360
  h?: number; // 3..12m
  op?: string;
}

export const SUNDERS_CAMERAS: SundersCameraNode[] = camerasData as SundersCameraNode[];

/**
 * Couleur officielle SunderS selon la zone observée (leafletembed_functions.js : getFocusColor)
 * - Rouge (#d40055) : Voie publique / espace public (surveillance=public)
 * - Bleu (#3b82f6 / #0055d4) : Extérieur privé/bâtiment (surveillance=outdoor)
 * - Vert (#10b981 / #00d455) : Intérieur accessible (surveillance=indoor)
 * - Gris/Ambre (#a1a1aa) : Non spécifié
 */
export function getSundersColor(zone?: string): string {
  if (zone === "public" || zone === "traffic") return "#f43f5e"; // Rouge SunderS haute lisibilité OLED
  if (zone === "outdoor") return "#3b82f6"; // Bleu SunderS
  if (zone === "indoor") return "#10b981"; // Vert SunderS
  return "#a1a1aa"; // Neutre
}

export function getSundersZoneLabel(zone?: string): string {
  if (zone === "public") return "Voie publique";
  if (zone === "outdoor") return "Extérieur";
  if (zone === "indoor") return "Intérieur";
  if (zone === "traffic") return "Trafic routier";
  return "Zone surveillée";
}

export function getSundersTypeLabel(type?: string): string {
  if (type === "dome" || type === "panorama" || type === "panorama_with_ptz") {
    return "Dôme 360°";
  }
  if (type === "fixed") return "Caméra fixe";
  if (type === "panning") return "Caméra motorisée (PTZ)";
  if (type === "guard") return "Poste de garde";
  if (type === "traffic") return "Capteur trafic / ALPR";
  return "Caméra de vidéosurveillance";
}

export function getSundersMountLabel(mount?: string): string {
  if (mount === "pole") return "Mât dédié";
  if (mount === "street_lamp") return "Lampadaire";
  if (mount === "wall") return "Façade / Mur";
  if (mount === "ceiling") return "Plafond / Arche";
  return "Support standard";
}

/**
 * Projette un point à `distanceMeters` selon un cap `bearingDeg` (0° = Nord, 90° = Est)
 */
function destinationPoint(
  lon: number,
  lat: number,
  distanceMeters: number,
  bearingDeg: number
): [number, number] {
  const rad = (bearingDeg * Math.PI) / 180;
  const dLat = (distanceMeters * Math.cos(rad)) / 111320;
  const dLon =
    (distanceMeters * Math.sin(rad)) / (111320 * Math.cos((lat * Math.PI) / 180));
  return [Number((lon + dLon).toFixed(6)), Number((lat + dLat).toFixed(6))];
}

/**
 * Génère un secteur angulaire (équivalent Leaflet-Semicircle de SunderS) ou un cercle 360° (dôme)
 */
function buildCameraFovPolygon(cam: SundersCameraNode): [number, number][][] | null {
  const height = cam.h ?? 5;
  const radiusMeters = height * 6.5; // Identique à SunderS getRadiusForHeight(h)

  // 1. Caméra directionnelle (fixe ou orientée) -> Cône de visée de 60° d'ouverture
  if (typeof cam.dir === "number") {
    const spreadDeg = cam.type === "panning" ? 110 : 58;
    const startAngle = cam.dir - spreadDeg / 2;
    const endAngle = cam.dir + spreadDeg / 2;
    const steps = 8;
    const ring: [number, number][] = [[cam.lon, cam.lat]];
    for (let i = 0; i <= steps; i++) {
      const angle = startAngle + ((endAngle - startAngle) * i) / steps;
      ring.push(destinationPoint(cam.lon, cam.lat, radiusMeters, angle));
    }
    ring.push([cam.lon, cam.lat]);
    return [ring];
  }

  // 2. Caméra dôme sans direction restreinte -> Halo circulaire 360° (rayon plus compact 22m)
  if (cam.type === "dome" || cam.type === "panorama") {
    const domeRadius = Math.min(24, radiusMeters * 0.65);
    const steps = 14;
    const ring: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
      const angle = (360 * i) / steps;
      ring.push(destinationPoint(cam.lon, cam.lat, domeRadius, angle));
    }
    return [ring];
  }

  return null;
}

let cachedPointsGeoJson: any = null;
let cachedConesGeoJson: any = null;

/**
 * Retourne les GeoJSON (Points + Cônes de vision Leaflet-Semicircle) pour MapLibre GL
 */
export function getSundersGeoJson() {
  if (cachedPointsGeoJson && cachedConesGeoJson) {
    return { pointsGeoJson: cachedPointsGeoJson, conesGeoJson: cachedConesGeoJson };
  }

  const pointFeatures: any[] = [];
  const coneFeatures: any[] = [];

  for (const cam of SUNDERS_CAMERAS) {
    const color = getSundersColor(cam.zone);
    pointFeatures.push({
      type: "Feature",
      properties: {
        id: cam.id,
        lat: cam.lat,
        lon: cam.lon,
        type: cam.type || "camera",
        zone: cam.zone || "unknown",
        mount: cam.mount || "",
        dir: cam.dir ?? -1,
        op: cam.op || "",
        color,
      },
      geometry: {
        type: "Point",
        coordinates: [cam.lon, cam.lat],
      },
    });

    const poly = buildCameraFovPolygon(cam);
    if (poly) {
      coneFeatures.push({
        type: "Feature",
        properties: {
          id: cam.id,
          color,
        },
        geometry: {
          type: "Polygon",
          coordinates: poly,
        },
      });
    }
  }

  cachedPointsGeoJson = {
    type: "FeatureCollection",
    features: pointFeatures,
  };

  cachedConesGeoJson = {
    type: "FeatureCollection",
    features: coneFeatures,
  };

  return { pointsGeoJson: cachedPointsGeoJson, conesGeoJson: cachedConesGeoJson };
}
