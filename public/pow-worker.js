/**
 * Web Worker de Proof-of-Work (PoW Hashcash client)
 * Calcule un nonce tel que SHA-256(payload + nonce) commence par le préfixe requis (ex: "0000").
 * Exécution 100% locale sans figer le thread principal de l'interface utilisateur.
 */

self.onmessage = async function (e) {
  const { challenge, difficulty = 4 } = e.data;
  const targetPrefix = "0".repeat(difficulty);
  const encoder = new TextEncoder();

  let nonce = 0;
  const startTime = Date.now();

  while (true) {
    const input = `${challenge}:${nonce}`;
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    
    // Conversion en chaîne hexadécimale rapide
    const hashArray = new Uint8Array(hashBuffer);
    // Vérification rapide sur les 2 premiers octets (si difficulty = 4, les 2 premiers octets doivent être 0x00)
    if (hashArray[0] === 0 && (difficulty < 3 || hashArray[1] < 16)) {
      const hashHex = Array.from(hashArray)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      if (hashHex.startsWith(targetPrefix)) {
        self.postMessage({
          success: true,
          nonce: nonce.toString(),
          hash: hashHex,
          durationMs: Date.now() - startTime,
        });
        return;
      }
    }

    nonce++;

    // Tous les 100 000 itérations, laisser respirer le worker
    if (nonce % 100000 === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }
};
