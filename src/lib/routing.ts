/**
 * Service de calcul d'itinéraire strictement PIÉTON calqué sur le réseau viaire et piétonnier
 * Permet d'emprunter librement les zones piétonnes, rues piétonnes, parvis, places, trottoirs et venelles
 * (ex: Rue Crébillon, Place Royale, Place du Commerce, etc. qui sont interdites aux voitures).
 *
 * Utilise en priorité le moteur OpenStreetMap FOSSGIS routed-foot (100% gratuit, 0 clé d'API requise).
 * Bascule sur OSRM public foot en second recours, puis sur interpolation directe si hors-ligne.
 */

const ROUTING_ENDPOINTS = [
  // 1. FOSSGIS OpenStreetMap Foot (Réseau piétonnier européen haute fidélité)
  (coords: string) =>
    `https://routing.openstreetmap.de/routed-foot/route/v1/driving/${coords}?overview=full&geometries=geojson`,
  // 2. Project OSRM Foot (serveur de secours)
  (coords: string) =>
    `https://router.project-osrm.org/route/v1/foot/${coords}?overview=full&geometries=geojson`,
];

export async function fetchWalkingRoute(
  waypoints: [number, number][] // Coordonnées [lng, lat][]
): Promise<[number, number][]> {
  if (waypoints.length < 2) {
    return waypoints;
  }

  // Format attendu : lon1,lat1;lon2,lat2;lon3,lat3
  const coordString = waypoints
    .map(([lng, lat]) => `${lng.toFixed(6)},${lat.toFixed(6)}`)
    .join(";");

  for (let i = 0; i < ROUTING_ENDPOINTS.length; i++) {
    const url = ROUTING_ENDPOINTS[i](coordString);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        continue;
      }

      const data = await res.json();
      if (data.code === "Ok" && data.routes && data.routes[0]?.geometry?.coordinates) {
        const coords = data.routes[0].geometry.coordinates as [number, number][];
        if (coords.length >= 2) {
          return coords;
        }
      }
    } catch {
      // Échec de cet endpoint (timeout ou réseau), tentative avec le suivant
      continue;
    }
  }

  console.warn(
    "[Routing] Aucun serveur piéton disponible (mode hors-ligne ou coupure réseau). Bascule sur interpolation directe."
  );

  // Fallback résilient en mode hors-ligne : ligne directe reliant les points
  return waypoints;
}


