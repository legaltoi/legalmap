/**
 * Suite de Tests Complète de Cybersécurité et Validation Moteur pour LEGALMAPS :
 * 1. Géodésie & Anonymisation RGPD (3 décimales, Haversine, barycentre)
 * 2. Moteur de Consensus Spatio-temporel (seuil 2-3, rayon 100m, TTL dynamique)
 * 3. Cryptographie Asymétrique Ed25519 (signature organisateur, altération, anti-rejeu 60s)
 * 4. Preuve de Travail (PoW Hashcash SHA-256 anti-sybil)
 * 5. Sanitization Stricte Zod & Bounding Box Agglo Nantaise
 */

const { calculateHaversineDistance, roundCoordinates, calculateCentroid } = require("../src/lib/geo.ts");
const { signCortegeState, verifyCortegeState, derivePublicKey, DEFAULT_ADMIN_VERIFY_KEY } = require("../src/lib/crypto.ts");
const { solveInThread, verifyProofOfWork, buildChallengeString } = require("../src/lib/pow.ts");
const { validateInboundReport, validateInboundCortege, NANTES_BOUNDS } = require("../src/lib/validation.ts");

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ ÉCHEC : ${message}`);
    process.exit(1);
  } else {
    passedTests++;
    console.log(`✅ SUCCÈS : ${message}`);
  }
}

console.log("=== 1. TEST GÉODÉSIQUE & CONFIDENTIALITÉ RGPD ===");
const raw = { lat: 47.21837492, lng: -1.55362198 };
const rounded = roundCoordinates(raw.lat, raw.lng, 3);
assert(rounded.lat === 47.218, "Latitude arrondie à 3 décimales (47.218)");
assert(rounded.lng === -1.554, "Longitude arrondie à 3 décimales (-1.554)");

const distCommerceRoyale = calculateHaversineDistance(47.2132, -1.5583, 47.2151, -1.5588);
assert(distCommerceRoyale > 200 && distCommerceRoyale < 260, `Distance Commerce-Royale valide : ${Math.round(distCommerceRoyale)}m`);

const p1 = { lat: 47.218, lng: -1.5536 };
const p2 = { lat: 47.2183, lng: -1.5539 };
const distP1P2 = calculateHaversineDistance(p1.lat, p1.lng, p2.lat, p2.lng);
assert(distP1P2 < 100, `Rayon de consensus respecté (<100m) : ${Math.round(distP1P2)}m`);

const centroid = calculateCentroid([p1, p2]);
assert(Math.abs(centroid.lat - 47.21815) < 0.0001, "Barycentre latitude correct");
assert(Math.abs(centroid.lng - -1.55375) < 0.0001, "Barycentre longitude correct");

console.log("\n=== 2. TEST CRYPTOGRAPHIQUE ASYMÉTRIQUE Ed25519 (ORGANISATEUR) ===");
// Test avec la paire de clé par défaut
const testPrivKey = "4deac1e425dd49c9318f27fa672f427075180256d363ac70265feedd0a3c9649";
const derivedPub = derivePublicKey(testPrivKey);
assert(derivedPub === DEFAULT_ADMIN_VERIFY_KEY, "La clé publique dérivée correspond à la clé de vérification enregistrée");

const validMessageData = {
  status: "MOBILE",
  head: { lat: 47.215, lng: -1.554 },
  tail: { lat: 47.213, lng: -1.558 },
  timestamp: Date.now(),
  nonce: "nonce_test_12345",
};

const signedPayload = signCortegeState(validMessageData, testPrivKey);
assert(typeof signedPayload.signature === "string" && signedPayload.signature.length === 128, "Signature Ed25519 valide générée (128 hex chars)");

const isVerified = verifyCortegeState(signedPayload, derivedPub);
assert(isVerified === true, "Vérification Ed25519 réussie pour un message authentique et frais");

// Test altération du payload
const tamperedPayload = {
  ...signedPayload,
  data: {
    ...signedPayload.data,
    status: "IMMOBILE", // Altéré frauduleusement
  },
};
assert(verifyCortegeState(tamperedPayload, derivedPub) === false, "Rejet immédiat d'un message altéré ou corrompu");

// Test anti-rejeu (message trop vieux de 70 secondes)
const expiredPayload = signCortegeState(
  {
    ...validMessageData,
    timestamp: Date.now() - 70 * 1000,
  },
  testPrivKey
);
assert(verifyCortegeState(expiredPayload, derivedPub) === false, "Rejet anti-rejeu : message antérieur à 60 secondes refusé");

console.log("\n=== 3. TEST DE PREUVE DE TRAVAIL (PoW HASHCASH ANTI-SYBIL) ===");
const powCat = "ZONE_GAZ";
const powLat = 47.218;
const powLng = -1.554;
const powTs = Date.now();
const challenge = buildChallengeString(powCat, powLat, powLng, powTs);

const powSolution = solveInThread(challenge, 4);
assert(powSolution.hash.startsWith("0000"), `Preuve de travail résolue avec 4 zéros : ${powSolution.hash}`);

const isPoWValid = verifyProofOfWork(powCat, powLat, powLng, powTs, powSolution.nonce, 4);
assert(isPoWValid === true, "Vérification PoW réussie avec le nonce correct");

const isFakePoWValid = verifyProofOfWork(powCat, powLat, powLng, powTs, "nonce_faux", 4);
assert(isFakePoWValid === false, "Rejet d'un faux nonce de preuve de travail");

console.log("\n=== 4. TEST SANITIZATION STRICTE ZOD & BOUNDING BOX NANTES ===");
// 1. Signalement valide
const validReport = {
  id: "rep_valid_123",
  category: "ZONE_GAZ",
  lat: 47.218,
  lng: -1.554,
  timestamp: powTs,
  powNonce: powSolution.nonce,
};
assert(validateInboundReport(validReport) !== null, "Signalement valide et dans le périmètre nantais accepté");

// 2. Signalement hors périmètre (Paris : 48.85, 2.35)
const outOfBoundsReport = {
  ...validReport,
  id: "rep_paris",
  lat: 48.8566,
  lng: 2.3522,
};
assert(validateInboundReport(outOfBoundsReport) === null, "Rejet immédiat d'un signalement hors de l'agglomération nantaise");

// 3. Signalement avec injection de champ malveillant ou code
const maliciousReport = {
  ...validReport,
  id: "rep_hack",
  maliciousScript: "<script>alert('xss')</script>",
};
assert(validateInboundReport(maliciousReport) === null, "Rejet strict Zod (.strict()) d'un payload avec champs non autorisés");

// 4. État du cortège validé via validateInboundCortege
assert(validateInboundCortege(signedPayload) !== null, "Validation sanitization réussie pour l'état officiel signé du cortège");

console.log(`\n🎉 TOUS LES TESTS DE CYBERSÉCURITÉ ET MOTEUR SONT VALIDÉS (${passedTests}/${totalTests}) !`);
