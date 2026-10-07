/**
 * Service de calcul d'itinéraire piéton calqué sur le réseau viaire
 * Utilise l'API OpenStreetMap / Project OSRM (100% gratuit, 0 clé d'API requise).
 * Comprend un fallback direct si hors-ligne ou si le serveur de routage est inaccessible.
 */

export async function fetchWalkingRoute(
  waypoints: [number, number][] // Coordonnées [lng, lat][]
): Promise<[number, number][]> {
  if (waypoints.length < 2) {
    return waypoints;
  }

  try {
    // Format attendu par OSRM : lon1,lat1;lon2,lat2;lon3,lat3
    const coordString = waypoints
      .map(([lng, lat]) => `${lng.toFixed(6)},${lat.toFixed(6)}`)
      .join(";");

    const url = `https://router.project-osrm.org/route/v1/foot/${coordString}?overview=full&geometries=geojson`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`OSRM HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data.code === "Ok" && data.routes && data.routes[0]?.geometry?.coordinates) {
      const coords = data.routes[0].geometry.coordinates as [number, number][];
      if (coords.length >= 2) {
        return coords;
      }
    }
  } catch (err) {
    console.warn(
      "[Routing] Impossible de joindre le serveur OSRM (mode hors-ligne ou coupure réseau). Bascule sur interpolation directe :",
      err
    );
  }

  // Fallback résilient en mode hors-ligne : ligne directe reliant les points
  return waypoints;
}

