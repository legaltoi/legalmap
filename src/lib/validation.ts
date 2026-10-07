/**
 * Module de Validation et Sanitization Stricte (Zod + Bounding Box + Cryptographie)
 * Rejette immédiatement tout message mal formé, injecté, rejoué ou hors périmètre.
 */

import { z } from "zod";
import { ReportEvent, SignedCortegePayload, ReportCategory } from "@/types";
import { verifyProofOfWork } from "./pow";
import { verifyCortegeState } from "./crypto";

// Périmètre géographique strict de l'agglomération nantaise
export const NANTES_BOUNDS = {
  MIN_LAT: 47.15,
  MAX_LAT: 47.28,
  MIN_LNG: -1.65,
  MAX_LNG: -1.45,
};

/**
 * Schéma Zod strict pour les signalements citoyens
 * Tout champ surnuméraire (.strict()) ou valeur aberrante est rejeté
 */
export const ReportEventSchema = z
  .object({
    id: z
      .string()
      .min(3)
      .max(64)
      .regex(/^[a-zA-Z0-9_\-]+$/),
    category: z.enum([
      "ZONE_GAZ",
      "VOIE_BLOQUEE",
      "POINT_BLOCAGE",
      "SECOURS_MEDIC",
    ] as const),
    lat: z
      .number()
      .min(NANTES_BOUNDS.MIN_LAT, "Latitude hors agglomération nantaise")
      .max(NANTES_BOUNDS.MAX_LAT, "Latitude hors agglomération nantaise"),
    lng: z
      .number()
      .min(NANTES_BOUNDS.MIN_LNG, "Longitude hors agglomération nantaise")
      .max(NANTES_BOUNDS.MAX_LNG, "Longitude hors agglomération nantaise"),
    timestamp: z.number().int().positive(),
    powNonce: z.string().min(1).max(32),
  })
  .strict();

const CoordinateSchema = z
  .object({
    lat: z.number().min(NANTES_BOUNDS.MIN_LAT).max(NANTES_BOUNDS.MAX_LAT),
    lng: z.number().min(NANTES_BOUNDS.MIN_LNG).max(NANTES_BOUNDS.MAX_LNG),
  })
  .strict();

/**
 * Schéma Zod strict pour l'état du cortège signé par l'organisateur
 */
export const SignedCortegeSchema = z
  .object({
    data: z
      .object({
        status: z.enum(["MOBILE", "IMMOBILE"]),
        head: CoordinateSchema.nullable(),
        tail: CoordinateSchema.nullable(),
        timestamp: z.number().int().positive(),
        nonce: z.string().min(8).max(64),
      })
      .strict(),
    signature: z
      .string()
      .length(128, "Signature Ed25519 hexadécimale attendue (128 hex chars)")
      .regex(/^[0-9a-fA-F]+$/),
  })
  .strict();

/**
 * Valide et filtre un signalement citoyen entrant :
 * 1. Validation de schéma et typage Zod
 * 2. Vérification de la preuve de travail PoW Hashcash SHA-256
 */
export function validateInboundReport(data: unknown): ReportEvent | null {
  try {
    const parsed = ReportEventSchema.safeParse(data);
    if (!parsed.success) {
      console.warn("[Sanitizer] Rejet signalement invalide :", parsed.error.issues);
      return null;
    }

    const report = parsed.data as ReportEvent;

    // 2. Vérification cryptographique de la Preuve de Travail (PoW)
    const isPoWValid = verifyProofOfWork(
      report.category,
      report.lat,
      report.lng,
      report.timestamp,
      report.powNonce
    );

    if (!isPoWValid) {
      console.warn(`[Sanitizer] Rejet signalement ${report.id} : PoW Hashcash invalide`);
      return null;
    }

    return report;
  } catch (err) {
    console.error("[Sanitizer] Erreur de validation signalement:", err);
    return null;
  }
}

/**
 * Valide et filtre un état de cortège officiel entrant :
 * 1. Validation de schéma Zod
 * 2. Vérification de la signature cryptographique Ed25519
 * 3. Vérification de l'anti-rejeu (< 60 secondes)
 */
export function validateInboundCortege(data: unknown): SignedCortegePayload | null {
  try {
    const parsed = SignedCortegeSchema.safeParse(data);
    if (!parsed.success) {
      console.warn("[Sanitizer] Rejet cortège non conforme :", parsed.error.issues);
      return null;
    }

    const signedPayload = parsed.data as SignedCortegePayload;

    // 2. Vérification de la signature asymétrique Ed25519
    const isSigValid = verifyCortegeState(signedPayload);
    if (!isSigValid) {
      console.warn("[Sanitizer] Rejet cortège : signature Ed25519 refusée ou rejeu détecté");
      return null;
    }

    return signedPayload;
  } catch (err) {
    console.error("[Sanitizer] Erreur de validation cortège:", err);
    return null;
  }
}
