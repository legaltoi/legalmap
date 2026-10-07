/**
 * Types TypeScript du système LEGALMAPS (Durcissement Cryptographique & Sécurité)
 * Aucun champ libre, qualification factuelle et sanitaire stricte.
 */

export type ReportCategory =
  | "ZONE_GAZ"
  | "VOIE_BLOQUEE"
  | "POINT_BLOCAGE"
  | "SECOURS_MEDIC";

export interface ReportCategoryMetadata {
  id: ReportCategory;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  iconName: "alert-triangle" | "ban" | "users" | "cross";
  legalRationale: string;
}

/**
 * Signalement brut émis par un client via Supabase Broadcast
 * Aucune persistance en base, uniquement en mémoire volatile.
 * Les coordonnées GPS sont obligatoirement arrondies à 3 décimales (~100m).
 * Comporte obligatoirement une preuve de travail (PoW Hashcash) pour contrer les attaques Sybil.
 */
export interface ReportEvent {
  id: string;
  category: ReportCategory;
  lat: number; // Arrondi à 3 décimales (ex: 47.218)
  lng: number; // Arrondi à 3 décimales (ex: -1.554)
  timestamp: number; // Date.now()
  powNonce: string; // Nonce validant le challenge SHA-256 Hashcash
}

/**
 * Marqueur consolidé par l'algorithme de consensus spatio-temporel
 * N'apparaît sur la carte publique que si >= MIN_REPORTS_THRESHOLD (ex: 2 ou 3)
 */
export interface ConsensusMarker {
  id: string;
  category: ReportCategory;
  lat: number;
  lng: number;
  reportCount: number;
  firstReportTime: number;
  lastReportTime: number;
  expiresAt: number; // Timestamp d'expiration automatique (TTL)
  ttlDurationMs: number; // Durée totale du TTL (ex: 300_000ms ou 600_000ms)
}

/**
 * État officiel du cortège diffusé par les organisateurs
 */
export type CortegeMovementStatus = "MOBILE" | "IMMOBILE";

export interface CortegePoint {
  lat: number;
  lng: number;
  updatedAt: number;
}

export interface CortegeState {
  status: CortegeMovementStatus;
  head: CortegePoint | null;
  tail: CortegePoint | null;
  updatedAt: number;
}

/**
 * Payload officiel signé cryptographiquement par l'organisateur (Ed25519)
 */
export interface SignedCortegePayload {
  data: {
    status: CortegeMovementStatus;
    head: { lat: number; lng: number } | null;
    tail: { lat: number; lng: number } | null;
    timestamp: number;
    nonce: string;
  };
  signature: string; // Signature Ed25519 (hexadécimal 128 caractères)
}

/**
 * Point d'intérêt statique d'urgence sanitaire et vitale
 */
export type POICategory = "HOSPITAL" | "PHARMACY" | "WATER" | "EMERGENCY";

export interface POI {
  id: string;
  name: string;
  category: POICategory;
  coordinates: [number, number]; // [lng, lat]
  address: string;
  phone?: string;
  emergencyInfo?: string;
}

/**
 * Configuration cartographique et parcours officiel de la ville
 */
export interface CityConfig {
  id: string;
  name: string;
  region: string;
  center: [number, number];
  defaultZoom: number;
  minZoom: number;
  maxZoom: number;
  bounds: [[number, number], [number, number]];
  officialRoute: {
    type: "FeatureCollection";
    features: Array<{
      type: "Feature";
      properties: {
        name: string;
        description?: string;
        type?: "route" | "start" | "rally_point" | "dispersal";
      };
      geometry: {
        type: "LineString" | "Point";
        coordinates: any;
      };
    }>;
  };
  pois: POI[];
}
