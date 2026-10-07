# 🛡️ LEGALMAPS — Information, Sécurité & Orientation Citoyenne

> **Application web progressive (PWA) d'information citoyenne, de sécurité et d'orientation pour les manifestations et mouvements sociaux, initialement configurée pour la métropole de Nantes.**

---

## 🏛️ Les 4 Piliers du Blindage Juridique Strict (Droit Français)

Pour garantir une immunité juridique absolue à l'éditeur et aux usagers :

1. **Interdiction absolue du texte libre** : Aucun champ de saisie libre, aucun tchat, aucun formulaire de commentaire. Les interactions reposent exclusivement sur 4 boutons d'état pré-définis. Cela exclut d'office toute infraction à la loi du 29 juillet 1881 sur la liberté de la presse (diffamation, injures, provocation à des délits, appels à la violence).
2. **Qualification factuelle et sanitaire des signalements** :
   - **Interdit** : Désigner ou cibler des unités de police (ex. : « BAC », « CRS », « BRAV-M »), ce qui pourrait être qualifié d'aide au ciblage ou de guet-apens pénal.
   - **Obligatoire** : Qualifier uniquement des **obstacles matériels de voirie** ou des **risques sanitaires objectifs** :
     - `ZONE_GAZ` : Présence d'émanations de gaz lacrymogènes / canon à eau (réduction des risques sanitaires).
     - `VOIE_BLOQUEE` : Rue impraticable, nasse, circulation coupée (liberté d'aller et venir / sécurité des personnes).
     - `POINT_BLOCAGE` : Rassemblement citoyen fixe / blocage revendicatif pacifique (lycées, carrefours, gares).
     - `SECOURS_MEDIC` : Présence de secouristes bénévoles / premiers soins actifs.
3. **Statut d'éditeur non professionnel (Article 6-III-2 LCEN)** :
   - Modale légale intégrée stipulant le statut d'éditeur non professionnel préservant son anonymat personnel, et mentionnant les coordonnées d'identification de l'hébergeur public (Vercel / Cloudflare).
4. **RGPD & Privacy-by-Design radical** :
   - Aucun cookie de session, aucun local storage contenant des identifiants uniques.
   - La géolocalisation reste **100 % locale** (calculée dans le navigateur). En cas d'envoi d'un signalement, seules les coordonnées GPS brutes arrondies (3 décimales, précision ~100m) sont transmises au flux éphémère.

---

## 🔒 Durcissement Cybersécurité & Anti-Sybil

1. **Authentification Asymétrique Ed25519 de l'Organisateur** :
   - Zéro mot de passe ou clé secrète dans le bundle client.
   - Clé publique `NEXT_PUBLIC_ADMIN_VERIFY_KEY` intégrée dans l'application.
   - Clé privée résidant **uniquement** dans l'ancre d'URL de l'organisateur (`/admin#priv=CLE_PRIVEE_HEX`).
   - Tout ordre de régulation (cortège mobile/immobile, tête, fin) est **signé cryptographiquement** avec un nonce et vérifié par tous les clients.
   - Fenêtre anti-rejeu stricte : messages rejetés s'ils datent de plus de 60 secondes.
2. **Preuve de Travail Anti-Sybil (PoW Hashcash)** :
   - Avant de diffuser un signalement, le terminal résout un challenge SHA-256 dans un Web Worker (`public/pow-worker.js`).
   - Coût imperceptible pour un citoyen (~200ms), mais mathématiquement rédhibitoire pour un bot cherchant à inonder le réseau de faux signalements.
3. **Périmètre Géographique Strict (Bounding Box Nantes)** :
   - Rejet immédiat de tout signalement hors de l'agglomération nantaise (`[47.15, -1.65]` à `[47.28, -1.45]`).
4. **Sanitization Stricte Zod (.strict())** :
   - Rejet de tout message comportant des champs superflus, des types anormaux ou des tentatives d'injection XSS.
5. **Content Security Policy (CSP) Stricte & Isolation HTTP** :
   - Blocage de tout appel tiers non autorisé, interdiction d'inclusion dans une iframe (`frame-ancestors 'none'`), `Permissions-Policy` restrictive.

---

## 🚀 Stack Technique & Performance

- **Framework** : [Next.js](https://nextjs.org/) 15 (App Router, React 19, TypeScript).
- **Cryptographie** : `@noble/ed25519` + `@noble/hashes` (Ed25519, SHA-512, SHA-256 Hashcash).
- **Validation** : [Zod](https://zod.dev/) pour la sanitization des flux entrants.
- **Styling** : [Tailwind CSS](https://tailwindcss.com/) (thème sombre OLED pour économiser la batterie sur mobile et garantir un contraste maximal en plein soleil).
- **Cartographie** : [MapLibre GL](https://maplibre.org/) + protocole [PMTiles](https://protomaps.com/) pour tuiles vectorielles locales servies depuis `/public/tiles/nantes.pmtiles`.
- **Temps réel (100 % gratuit & sans base)** : Supabase Realtime via le protocole **Broadcast pur** (données en mémoire vive éphémère de client à client, zéro écriture en base SQL, zéro log d'IP, zéro coût).
- **PWA & Offline** : Service Worker personnalisé (`/public/sw.js`) assurant la mise en cache complète des fiches juridiques, des assets et de la cartographie.

---

## ⚙️ Spécifications Fonctionnelles

### A. Moteur de consensus local & suppression dynamique (TTL)
- **Algorithme de seuil (Consensus)** :
  - Un signalement individuel émis par un utilisateur n'est pas affiché immédiatement à la foule pour éliminer trolls et fausses rumeurs.
  - Le marqueur n'apparaît publiquement que si **au moins 2 à 3 signalements** de même catégorie sont émis dans un rayon géographique de **100 mètres** sur une fenêtre glissante de **5 minutes**.
- **Durée de vie (TTL) dynamique** :
  - Si le cortège est déclaré `MOBILE` : le marqueur disparaît après **5 minutes**.
  - Si le cortège est déclaré `IMMOBILE` : le marqueur disparaît après **10 minutes**.
  - À expiration, le marqueur est purgé de la mémoire vive de l'application sans laisser la moindre trace.

### B. Gestion cryptographique du cortège officiel
- Accès discret sans compte utilisateur : `/admin#priv=CLE_PRIVEE_HEX`.
- Commandes organisateur :
  1. Bascule du statut : bouton `Cortège Mobile` / `Cortège Immobile`.
  2. Placement ou déplacement sur la carte de la `Tête de cortège` et de la `Fin de cortège`.
  3. Signature Ed25519 et diffusion sur le canal prioritaire `cortege-state`.

### C. Fiches réflexes 100 % hors-ligne
Accessibles via le bouton permanent **Droits & Secours** :
- **Garde à vue (GAV)** : Droit strict au silence ("Je n'ai rien à déclarer"), avocat commis d'office dès la 1ère heure (Barreau de Nantes : 02 40 20 48 40), médecin, appel à un proche.
- **Contrôles dans l'espace public** : Art. 78-2 du CPP, palpations de sécurité, fouilles de sacs, droit de filmer la police.
- **Premiers secours & Gaz lacrymogènes** : Décontamination oculaire (sérum phy uniquement, ne jamais frotter), retrait des lentilles, numéros d'urgence (15, 18, 112, 114).

---

## 🛠️ Installation & Démarrage

### 1. Cloner et installer les dépendances
```bash
git clone https://github.com/legaltoi/legalmap.git
cd legalmap
npm install
```

### 2. Générer les clés de l'organisateur
```bash
node scripts/generate-keys.js
```
Copiez la clé publique obtenue dans `.env.local` :
```env
NEXT_PUBLIC_ADMIN_VERIFY_KEY=votre_cle_publique_hex
```

### 3. Lancer en local
```bash
npm run dev
```
Rendez-vous sur [http://localhost:3000](http://localhost:3000).

Pour accéder à la console de régulation :
`http://localhost:3000/admin#priv=VOTRE_CLE_PRIVEE_HEX`.

---

## 📁 Architecture du Projet

```text
├── public/
│   ├── icons/                   # Icônes SVG et PNG (192x192, 512x512)
│   ├── tiles/
│   │   └── nantes.pmtiles       # Conteneur cartographique vectoriel local
│   ├── manifest.json            # Manifeste PWA installable
│   ├── pow-worker.js            # Web Worker de Preuve de Travail (Hashcash)
│   └── sw.js                    # Service Worker Offline-First
├── src/
│   ├── app/
│   │   ├── admin/page.tsx       # Console de régulation organisateur (Ed25519)
│   │   ├── globals.css          # Styles OLED, reset tactile 300ms, animations
│   │   ├── layout.tsx           # Layout racine PWA
│   │   └── page.tsx             # Interface principale (Carte + Dock)
│   ├── components/
│   │   ├── ActionDock.tsx       # 4 boutons légaux normalisés (PoW intégré, zéro texte)
│   │   ├── HeaderBar.tsx        # Bandeau cortège, statut réseau et accès fiches
│   │   ├── LegalNotice.tsx      # Mentions légales strictes Art 6-III-2 LCEN & RGPD
│   │   ├── LegalSheet.tsx       # Fiches réflexes GAV, 78-2 CPP & Urgences médicales
│   │   └── MapView.tsx          # Moteur MapLibre GL, consensus animé et POIs Nantes
│   ├── config/
│   │   ├── categories.ts        # Définition des 4 états et paramètres algorithmiques
│   │   └── cities/nantes.json   # Tracé officiel, POIs sanitaires et coordonnées Nantes
│   ├── hooks/
│   │   ├── useConsensus.ts      # Moteur d'agrégation spatio-temporelle et purge TTL
│   │   └── useRealtime.ts       # Supabase Broadcast + validation Zod + PoW + Ed25519
│   ├── lib/
│   │   ├── crypto.ts            # Signature et vérification Ed25519 avec anti-rejeu
│   │   ├── geo.ts               # Formule de Haversine & arrondi GPS 100m
│   │   ├── pow.ts               # Moteur Hashcash SHA-256 client
│   │   ├── supabase.ts          # Client Supabase sans persistance
│   │   └── validation.ts        # Schémas Zod et Bounding Box Nantes
│   └── types/
│       └── index.ts             # Typages TypeScript stricts
├── scripts/
│   ├── generate-keys.js         # Générateur de paire de clés Ed25519
│   ├── generate-pmtiles.js      # Générateur d'en-tête PMTiles v3 valide
│   └── test-engine.js           # 18 tests unitaires validés (Ed25519, PoW, Zod, Geo)
├── SETUP_SUPABASE.md            # Guide de configuration gratuit sans SQL
└── README.md
```

---

## ⚖️ Avertissement Légal
Cette application est un dispositif d'information factuelle, de sécurisation civile et de réduction des risques sanitaires. Elle ne constitue en aucun cas une incitation à des infractions ou attroupements non déclarés.
