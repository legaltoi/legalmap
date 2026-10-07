/**
 * Module de Preuve de Travail (PoW - Proof of Work Anti-Sybil)
 * Protège le réseau contre les inondations de faux signalements par scripts/bots.
 * Chaque émission nécessite de résoudre un challenge Hashcash SHA-256.
 */

import { sha256 } from "@noble/hashes/sha2.js";
import { ReportCategory } from "@/types";

export const POW_DIFFICULTY = 4; // 4 zéros hexadécimaux ("0000" = 16^4 = 65 536 hashs en moyenne)
export const MAX_REPORT_TIMESTAMP_DRIFT_MS = 90 * 1000; // 90 secondes de tolérance horloge

/**
 * Construit la chaîne de challenge canonique
 */
export function buildChallengeString(
  category: ReportCategory,
  lat: number,
  lng: number,
  timestamp: number
): string {
  return `${category}:${lat.toFixed(3)}:${lng.toFixed(3)}:${timestamp}`;
}

/**
 * Résout le challenge PoW via Web Worker ou fallback in-thread
 */
export async function solveProofOfWork(
  category: ReportCategory,
  lat: number,
  lng: number,
  timestamp: number,
  difficulty: number = POW_DIFFICULTY
): Promise<{ nonce: string; hash: string }> {
  const challenge = buildChallengeString(category, lat, lng, timestamp);

  // 1. Essai avec le Web Worker dédié (ne bloque pas le thread UI)
  if (typeof window !== "undefined" && window.Worker) {
    try {
      return await new Promise((resolve, reject) => {
        const worker = new Worker("/pow-worker.js");
        const timeout = setTimeout(() => {
          worker.terminate();
          reject(new Error("PoW Worker Timeout"));
        }, 15000);

        worker.onmessage = (e) => {
          clearTimeout(timeout);
          worker.terminate();
          if (e.data.success) {
            resolve({ nonce: e.data.nonce, hash: e.data.hash });
          } else {
            reject(new Error("PoW Worker Failed"));
          }
        };

        worker.onerror = (err) => {
          clearTimeout(timeout);
          worker.terminate();
          reject(err);
        };

        worker.postMessage({ challenge, difficulty });
      });
    } catch (workerErr) {
      console.warn("[PoW] Fallback in-thread (Worker non disponible):", workerErr);
    }
  }

  // 2. Fallback in-thread optimisé avec @noble/hashes
  return solveInThread(challenge, difficulty);
}

/**
 * Résolution synchrone / in-thread du challenge
 */
export function solveInThread(
  challenge: string,
  difficulty: number = POW_DIFFICULTY
): { nonce: string; hash: string } {
  const targetPrefix = "0".repeat(difficulty);
  const encoder = new TextEncoder();
  let nonce = 0;

  while (true) {
    const input = `${challenge}:${nonce}`;
    const hashBytes = sha256(encoder.encode(input));

    // Optimisation : test rapide du premier octet
    if (hashBytes[0] === 0 && (difficulty < 3 || hashBytes[1] < 16)) {
      const hashHex = Array.from(hashBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      if (hashHex.startsWith(targetPrefix)) {
        return { nonce: nonce.toString(), hash: hashHex };
      }
    }
    nonce++;
  }
}

/**
 * Vérifie instantanément (< 0.1ms) la validité du PoW d'un signalement reçu
 */
export function verifyProofOfWork(
  category: ReportCategory,
  lat: number,
  lng: number,
  timestamp: number,
  nonce: string,
  difficulty: number = POW_DIFFICULTY
): boolean {
  if (!nonce || typeof nonce !== "string") {
    return false;
  }

  // 1. Vérification de la fraîcheur temporelle (anti-rejeu / anti-spam différé)
  const drift = Math.abs(Date.now() - timestamp);
  if (drift > MAX_REPORT_TIMESTAMP_DRIFT_MS) {
    console.warn(`[PoW] Rejet : Timestamp trop décalé (${drift}ms)`);
    return false;
  }

  // 2. Vérification mathématique du hash SHA-256
  const challenge = buildChallengeString(category, lat, lng, timestamp);
  const input = `${challenge}:${nonce}`;
  const hashBytes = sha256(new TextEncoder().encode(input));
  const targetPrefix = "0".repeat(difficulty);

  const hashHex = Array.from(hashBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const isValid = hashHex.startsWith(targetPrefix);
  if (!isValid) {
    console.warn(`[PoW] Rejet : Puzzle cryptographique invalide (hash: ${hashHex})`);
  }

  return isValid;
}
