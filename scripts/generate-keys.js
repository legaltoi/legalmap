/**
 * Script de Génération de Clés Cryptographiques Ed25519 pour LEGALMAPS
 * Génère la paire de clés asymétriques pour l'organisateur du cortège.
 *
 * Utilisation :
 *   node scripts/generate-keys.js
 */

const ed = require("@noble/ed25519");
const { sha512 } = require("@noble/hashes/sha2.js");

// Configuration SHA-512 pour Ed25519
ed.hashes.sha512 = (...m) => sha512(ed.etc.concatBytes(...m));

function generateAdminKeypair() {
  const { secretKey, publicKey } = ed.keygen();

  const privateKeyHex = ed.etc.bytesToHex(secretKey);
  const publicKeyHex = ed.etc.bytesToHex(publicKey);

  console.log("=================================================================");
  console.log("🛡️  LEGALMAPS — GÉNÉRATION DE CLÉS ASYMÉTRIQUES Ed25519");
  console.log("=================================================================\n");

  console.log("1. CLÉ PUBLIQUE (À intégrer dans l'application) :");
  console.log(`   NEXT_PUBLIC_ADMIN_VERIFY_KEY=${publicKeyHex}\n`);
  console.log("   👉 Ajoutez cette ligne dans votre fichier .env.local ou sur Vercel.\n");

  console.log("2. CLÉ PRIVÉE SECRÈTE (POUR L'ORGANISATEUR DU CORTÈGE UNIQUEMENT) :");
  console.log(`   ${privateKeyHex}\n`);

  console.log("3. LIEN D'ACCÈS DIRECT SÉCURISÉ (URL Fragment) :");
  console.log(`   http://localhost:3000/admin#priv=${privateKeyHex}`);
  console.log(`   https://votre-domaine.com/admin#priv=${privateKeyHex}\n`);

  console.log("⚠️  AVERTISSEMENT DE SÉCURITÉ :");
  console.log("   - Ne commitez JAMAIS la clé privée sur Git.");
  console.log("   - Le fragment #priv= n'est jamais envoyé au serveur HTTP (RFC 3986).");
  console.log("   - Sans la clé privée, une usurpation du cortège est mathématiquement impossible.\n");
  console.log("=================================================================");
}

generateAdminKeypair();
