/**
 * Module Cryptographique LEGALMAPS
 * - Signature asymétrique Ed25519 pour l'authentification de l'organisateur du cortège.
 * - Protection anti-rejeu (fenêtre temporelle max 60 secondes).
 * - Clé privée JAMAIS injectée dans le bundle (fournie uniquement via l'URL fragment #priv=...).
 */

import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha2.js";
import { CortegeMovementStatus } from "@/types";

// Configuration du hachage SHA-512 pour Ed25519
ed.hashes.sha512 = (...m) => sha512(ed.etc.concatBytes(...m));

// Clé publique par défaut pour le développement local (remplacée en prod par NEXT_PUBLIC_ADMIN_VERIFY_KEY)
export const DEFAULT_ADMIN_VERIFY_KEY =
  "909b69715acf5dbc959e1e23c00bdf8868d694214b8cf5d5751f28a8867dce4c";

export interface CortegeMessageData {
  status: CortegeMovementStatus;
  head: { lat: number; lng: number } | null;
  tail: { lat: number; lng: number } | null;
  routeCoordinates?: [number, number][]; // Tracé bleu le long des rues [lng, lat][]
  timestamp: number; // Date.now() en millisecondes
  nonce: string; // Entropie anti-rejeu
}

export interface SignedCortegePayload {
  data: CortegeMessageData;
  signature: string; // Signature Ed25519 encodée en hexadécimal (128 caractères hex)
}

/**
 * Sérialise les données du message de manière déterministe (canonique)
 */
export function canonicalizeMessage(data: CortegeMessageData): Uint8Array {
  const canonicalObject = {
    head: data.head ? { lat: Number(data.head.lat.toFixed(3)), lng: Number(data.head.lng.toFixed(3)) } : null,
    nonce: data.nonce,
    routeCoordinates:
      data.routeCoordinates && Array.isArray(data.routeCoordinates) && data.routeCoordinates.length > 0
        ? data.routeCoordinates.map(([lng, lat]) => [Number(lng.toFixed(5)), Number(lat.toFixed(5))])
        : null,
    status: data.status,
    tail: data.tail ? { lat: Number(data.tail.lat.toFixed(3)), lng: Number(data.tail.lng.toFixed(3)) } : null,
    timestamp: data.timestamp,
  };
  return new TextEncoder().encode(JSON.stringify(canonicalObject));
}

/**
 * Signe un état de cortège avec la clé privée Ed25519 de l'organisateur (64 octets hex)
 */
export function signCortegeState(
  data: CortegeMessageData,
  privateKeyHex: string
): SignedCortegePayload {
  const cleanPrivHex = privateKeyHex.trim().toLowerCase();
  const privBytes = ed.etc.hexToBytes(cleanPrivHex);
  const messageBytes = canonicalizeMessage(data);

  // Signature Ed25519
  const sigBytes = ed.sign(messageBytes, privBytes);
  const signature = ed.etc.bytesToHex(sigBytes);

  return {
    data,
    signature,
  };
}

/**
 * Vérifie l'authenticité et la fraîcheur d'un état de cortège reçu
 * - Signature Ed25519 valide par rapport à la clé publique
 * - Anti-rejeu : timestamp dans une fenêtre de 60 secondes maximum
 */
export function verifyCortegeState(
  payload: SignedCortegePayload,
  publicKeyHex: string = process.env.NEXT_PUBLIC_ADMIN_VERIFY_KEY || DEFAULT_ADMIN_VERIFY_KEY
): boolean {
  try {
    if (!payload || !payload.data || !payload.signature) {
      return false;
    }

    const { data, signature } = payload;
    const now = Date.now();

    // 1. Protection Anti-Rejeu : Rejeter tout message datant de plus de 60 secondes
    const timeDelta = Math.abs(now - data.timestamp);
    if (timeDelta > 60 * 1000) {
      console.warn(`[Crypto] Rejet message expiré ou rejoué : delta = ${timeDelta}ms (max 60000ms)`);
      return false;
    }

    // 2. Vérification de la signature Ed25519
    const cleanPubHex = publicKeyHex.trim().toLowerCase();
    const pubBytes = ed.etc.hexToBytes(cleanPubHex);
    const sigBytes = ed.etc.hexToBytes(signature.trim().toLowerCase());
    const messageBytes = canonicalizeMessage(data);

    const isValid = ed.verify(sigBytes, messageBytes, pubBytes);
    if (!isValid) {
      console.warn("[Crypto] Rejet : Signature Ed25519 invalide ou altérée.");
    }

    return isValid;
  } catch (err) {
    console.error("[Crypto] Erreur lors de la vérification Ed25519:", err);
    return false;
  }
}

/**
 * Utilitaire pour dériver la clé publique à partir d'une clé privée hex
 */
export function derivePublicKey(privateKeyHex: string): string {
  const cleanPrivHex = privateKeyHex.trim().toLowerCase();
  const privBytes = ed.etc.hexToBytes(cleanPrivHex);
  const pubBytes = ed.getPublicKey(privBytes);
  return ed.etc.bytesToHex(pubBytes);
}
