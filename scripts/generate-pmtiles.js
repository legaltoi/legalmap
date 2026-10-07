const fs = require('fs');
const path = require('path');

// Crée un conteneur PMTiles v3 valide conforme à la spécification v3
function createMinimalPMTiles() {
  const headerSize = 127;
  const metadata = JSON.stringify({
    name: "Nantes Minimal Vector Offline Base",
    attribution: "OpenStreetMap contributors / LegalMaps",
    format: "pbf",
    minzoom: 10,
    maxzoom: 16,
    vector_layers: [
      { id: "streets", fields: { name: "string", highway: "string" } },
      { id: "buildings", fields: { name: "string" } },
      { id: "water", fields: { name: "string" } }
    ]
  });
  const metadataBytes = Buffer.from(metadata, 'utf-8');

  // Root directory: 1 octet varint (0x00 = 0 entrées)
  const rootDir = Buffer.from([0x00]);

  const rootDirOffset = headerSize;
  const rootDirLength = rootDir.length;
  const metadataOffset = rootDirOffset + rootDirLength;
  const metadataLength = metadataBytes.length;
  const tileDataOffset = metadataOffset + metadataLength;
  const tileDataLength = 0;

  const buffer = Buffer.alloc(headerSize + rootDirLength + metadataLength);

  // Magic 'PMTiles'
  buffer.write("PMTiles", 0, 7, "ascii");
  buffer.writeUInt8(3, 7); // version 3

  // Helper pour écrire uint64 en little endian
  function writeBigUInt64(val, offset) {
    buffer.writeBigUInt64LE(BigInt(val), offset);
  }

  writeBigUInt64(rootDirOffset, 8);
  writeBigUInt64(rootDirLength, 16);
  writeBigUInt64(metadataOffset, 24);
  writeBigUInt64(metadataLength, 32);
  writeBigUInt64(0, 40); // leaf directory offset
  writeBigUInt64(0, 48); // leaf directory length
  writeBigUInt64(tileDataOffset, 56);
  writeBigUInt64(tileDataLength, 64);
  writeBigUInt64(0, 72); // num addressed tiles
  writeBigUInt64(0, 80); // num tile entries
  writeBigUInt64(0, 88); // num tile contents

  buffer.writeUInt8(1, 96); // clustered: true
  buffer.writeUInt8(0, 97); // internalCompression: none (0)
  buffer.writeUInt8(0, 98); // tileCompression: none (0)
  buffer.writeUInt8(1, 99); // tileType: 1 (MVT)
  buffer.writeUInt8(10, 100); // minZoom
  buffer.writeUInt8(18, 101); // maxZoom

  // Coordonnées de Nantes en microdegrés (* 1e7)
  buffer.writeInt32LE(Math.round(-1.65 * 1e7), 102); // minLon
  buffer.writeInt32LE(Math.round(47.16 * 1e7), 106); // minLat
  buffer.writeInt32LE(Math.round(-1.45 * 1e7), 110); // maxLon
  buffer.writeInt32LE(Math.round(47.28 * 1e7), 114); // maxLat
  buffer.writeUInt8(14, 118); // centerZoom
  buffer.writeInt32LE(Math.round(-1.5536 * 1e7), 119); // centerLon
  buffer.writeInt32LE(Math.round(47.2173 * 1e7), 123); // centerLat

  // Copier le répertoire racine et les métadonnées
  rootDir.copy(buffer, rootDirOffset);
  metadataBytes.copy(buffer, metadataOffset);

  const outputPath = path.join(__dirname, '../public/tiles/nantes.pmtiles');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Fichier PMTiles v3 minimal créé avec succès : ${outputPath} (${buffer.length} octets)`);
}

createMinimalPMTiles();

