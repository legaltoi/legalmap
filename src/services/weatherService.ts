/**
 * Service de données météorologiques et de vent en temps réel (LEGALMAPS Nantes)
 * Compatible Next.js 15 (export statique 100 % client-side).
 *
 * Utilise par défaut Open-Meteo (modèle haute résolution Météo-France AROME / ECMWF) :
 * - 100 % gratuit et sans inscription
 * - 0 clé d'API requise (aucun risque de fuite de clé dans le build client)
 * - 0 cookie, 0 traçage (conforme RGPD)
 * - Compatible avec un proxy personnalisé WeatherNext 3 via NEXT_PUBLIC_WEATHER_API_URL
 */

export interface WindData {
  speedKmh: number; // Vitesse moyenne du vent à 10m (km/h)
  directionDeg: number; // Direction d'où vient le vent (0-360°, 0=Nord, 90=Est)
  blowToDeg: number; // Direction vers laquelle le vent souffle ((directionDeg + 180) % 360)
  gustsKmh: number; // Rafales de vent (km/h)
  temperatureC: number; // Température (°C)
  cardinalFrom: string; // ex: "NNO"
  cardinalTo: string; // ex: "SSE"
  cardinalLabel: string; // ex: "Nord-Nord-Ouest"
  dispersionLabel: string; // ex: "Vers le Sud-Sud-Est"
  beaufortScale: number; // Échelle de Beaufort (0 à 12)
  beaufortDescription: string; // ex: "Jolie brise (feuilles et brindilles agitées)"
  gasDispersionRisk: "FAIBLE" | "MODERE" | "ELEVE" | "TRES_ELEVE";
  gasAdvice: string; // Conseil tactique d'évacuation face aux gaz lacrymogènes
  updatedAt: number; // Horodatage en ms
  source: string; // Nom de la source météo
}

const NANTES_COORDS = {
  lat: 47.2184,
  lng: -1.5536,
};

const CARDINALS = [
  { min: 348.75, max: 360, from: "N", to: "S", label: "Nord", disp: "Vers le Sud" },
  { min: 0, max: 11.25, from: "N", to: "S", label: "Nord", disp: "Vers le Sud" },
  { min: 11.25, max: 33.75, from: "NNE", to: "SSO", label: "Nord-Nord-Est", disp: "Vers le Sud-Sud-Ouest" },
  { min: 33.75, max: 56.25, from: "NE", to: "SO", label: "Nord-Est", disp: "Vers le Sud-Ouest" },
  { min: 56.25, max: 78.75, from: "ENE", to: "OSO", label: "Est-Nord-Est", disp: "Vers l'Ouest-Sud-Ouest" },
  { min: 78.75, max: 101.25, from: "E", to: "O", label: "Est", disp: "Vers l'Ouest" },
  { min: 101.25, max: 123.75, from: "ESE", to: "ONO", label: "Est-Sud-Est", disp: "Vers l'Ouest-Nord-Ouest" },
  { min: 123.75, max: 146.25, from: "SE", to: "NO", label: "Sud-Est", disp: "Vers le Nord-Ouest" },
  { min: 146.25, max: 168.75, from: "SSE", to: "NNO", label: "Sud-Sud-Est", disp: "Vers le Nord-Nord-Ouest" },
  { min: 168.75, max: 191.25, from: "S", to: "N", label: "Sud", disp: "Vers le Nord" },
  { min: 191.25, max: 213.75, from: "SSO", to: "NNE", label: "Sud-Sud-Ouest", disp: "Vers le Nord-Nord-Est" },
  { min: 213.75, max: 236.25, from: "SO", to: "NE", label: "Sud-Ouest", disp: "Vers le Nord-Est" },
  { min: 236.25, max: 258.75, from: "OSO", to: "ENE", label: "Ouest-Sud-Ouest", disp: "Vers l'Est-Nord-Est" },
  { min: 258.75, max: 281.25, from: "O", to: "E", label: "Ouest", disp: "Vers l'Est" },
  { min: 281.25, max: 303.75, from: "ONO", to: "ESE", label: "Ouest-Nord-Ouest", disp: "Vers l'Est-Sud-Est" },
  { min: 303.75, max: 326.25, from: "NO", to: "SE", label: "Nord-Ouest", disp: "Vers le Sud-Est" },
  { min: 326.25, max: 348.75, from: "NNO", to: "SSE", label: "Nord-Nord-Ouest", disp: "Vers le Sud-Sud-Est" },
];

function getCardinal(deg: number) {
  const normalized = ((deg % 360) + 360) % 360;
  for (const c of CARDINALS) {
    if (normalized >= c.min && normalized < c.max) {
      return c;
    }
  }
  return CARDINALS[0];
}

function getBeaufort(speedKmh: number): { scale: number; description: string } {
  if (speedKmh < 1) return { scale: 0, description: "Calme (fumée monte droit)" };
  if (speedKmh <= 5) return { scale: 1, description: "Très légère brise (fumée indique la direction)" };
  if (speedKmh <= 11) return { scale: 2, description: "Légère brise (feuilles frémissent)" };
  if (speedKmh <= 19) return { scale: 3, description: "Petite brise (feuilles constamment en mouvement)" };
  if (speedKmh <= 28) return { scale: 4, description: "Jolie brise (poussière et papiers soulevés)" };
  if (speedKmh <= 38) return { scale: 5, description: "Bonne brise (arbustes balancés)" };
  if (speedKmh <= 49) return { scale: 6, description: "Vent frais (grosses branches agitées)" };
  if (speedKmh <= 61) return { scale: 7, description: "Grand frais (arbres entiers agités)" };
  if (speedKmh <= 74) return { scale: 8, description: "Coup de vent (brise des rameaux)" };
  return { scale: 9, description: "Fort coup de vent (danger de circulation)" };
}

function getGasDispersionAdvice(speedKmh: number, dispLabel: string): {
  risk: "FAIBLE" | "MODERE" | "ELEVE" | "TRES_ELEVE";
  advice: string;
} {
  if (speedKmh < 6) {
    return {
      risk: "TRES_ELEVE",
      advice: "Vent très faible : les gaz lacrymogènes stagnent longuement dans les rues. Évacuer les cuvettes et zones confinées.",
    };
  }
  if (speedKmh <= 19) {
    return {
      risk: "MODERE",
      advice: `Dérive modérée ${dispLabel.toLowerCase()}. Évacuer de préférence perpendiculairement à l'axe du vent pour sortir du panache.`,
    };
  }
  if (speedKmh <= 35) {
    return {
      risk: "ELEVE",
      advice: `Vent soutenu : propagation rapide du panache gazeux ${dispLabel.toLowerCase()}. Attention aux rues parallèles sous le vent.`,
    };
  }
  return {
    risk: "TRES_ELEVE",
    advice: `Fortes rafales : dispersion erratique et tourbillons entre les immeubles. Protection respiratoire et oculaire indispensable.`,
  };
}

// Cache volatile en mémoire (durée de validité 3 minutes pour éviter les requêtes superflues)
let cachedWindData: WindData | null = null;
let lastFetchTimestamp = 0;
const CACHE_DURATION_MS = 180_000;

/**
 * Récupère les données de vent en temps réel pour Nantes
 */
export async function fetchCurrentWind(lat = NANTES_COORDS.lat, lng = NANTES_COORDS.lng): Promise<WindData> {
  const now = Date.now();
  if (cachedWindData && now - lastFetchTimestamp < CACHE_DURATION_MS) {
    return cachedWindData;
  }

  const customApiUrl = process.env.NEXT_PUBLIC_WEATHER_API_URL;
  let sourceName = "Open-Meteo (Météo-France AROME)";

  try {
    let url: string;
    if (customApiUrl) {
      sourceName = "WeatherNext 3 / Relais Météo";
      url = `${customApiUrl}?lat=${lat}&lng=${lng}`;
    } else {
      url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m&wind_speed_unit=kmh&timezone=Europe%2FParis`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Erreur HTTP météo ${res.status}`);
    }

    const data = await res.json();
    const current = data.current || data;

    const speedKmh = Math.round((current.wind_speed_10m ?? current.wind_speed ?? 12) * 10) / 10;
    const directionDeg = Math.round((current.wind_direction_10m ?? current.wind_direction ?? 0) % 360);
    const blowToDeg = (directionDeg + 180) % 360;
    const gustsKmh = Math.round((current.wind_gusts_10m ?? current.wind_gusts ?? speedKmh * 1.4) * 10) / 10;
    const temperatureC = Math.round((current.temperature_2m ?? current.temperature ?? 18) * 10) / 10;

    const card = getCardinal(directionDeg);
    const beaufort = getBeaufort(speedKmh);
    const gasInfo = getGasDispersionAdvice(speedKmh, card.disp);

    const result: WindData = {
      speedKmh,
      directionDeg,
      blowToDeg,
      gustsKmh,
      temperatureC,
      cardinalFrom: card.from,
      cardinalTo: card.to,
      cardinalLabel: card.label,
      dispersionLabel: card.disp,
      beaufortScale: beaufort.scale,
      beaufortDescription: beaufort.description,
      gasDispersionRisk: gasInfo.risk,
      gasAdvice: gasInfo.advice,
      updatedAt: now,
      source: sourceName,
    };

    cachedWindData = result;
    lastFetchTimestamp = now;
    return result;
  } catch (err) {
    console.warn("[WeatherService] Impossible de récupérer les données météo en direct, bascule locale :", err);

    // Fallback gracieux en cas de coupure réseau (ex: mode avion)
    if (cachedWindData) {
      return cachedWindData;
    }

    // Valeur de secours par défaut à Nantes (vent d'Ouest-Sud-Ouest modéré classique)
    const fallbackDeg = 240;
    const card = getCardinal(fallbackDeg);
    const beaufort = getBeaufort(15);
    const gasInfo = getGasDispersionAdvice(15, card.disp);

    return {
      speedKmh: 15.0,
      directionDeg: fallbackDeg,
      blowToDeg: (fallbackDeg + 180) % 360,
      gustsKmh: 28.0,
      temperatureC: 18.0,
      cardinalFrom: card.from,
      cardinalTo: card.to,
      cardinalLabel: card.label,
      dispersionLabel: card.disp,
      beaufortScale: beaufort.scale,
      beaufortDescription: beaufort.description,
      gasDispersionRisk: gasInfo.risk,
      gasAdvice: gasInfo.advice,
      updatedAt: now,
      source: "Estimation locale (Hors-ligne)",
    };
  }
}
