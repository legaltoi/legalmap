# ⚡ Guide de Configuration Supabase (100 % Gratuit & ZÉRO SQL)

Ce guide détaille pas-à-pas la configuration du relais temps réel pour **LEGALMAPS**.

> [!IMPORTANT]
> **Pourquoi le protocole Supabase Broadcast pur ?**
> - **Zéro persistance** : Les données transitent uniquement dans la mémoire vive éphémère du serveur WebSocket de client à client.
> - **Zéro table SQL** : Aucune création de table, aucune migration, aucun stockage disque.
> - **Immunité légale et technique** : En cas de saisie ou réquisition, il n'existe **aucune base de données, aucun log d'IP, aucun historique à extraire**.
> - **100 % gratuit** : Le plan gratuit de Supabase inclut jusqu'à 2 millions de messages temps réel et 200 connexions concurrentes simultanées sans débourser un centime.

---

## Étape 1 : Créer un projet Supabase gratuit

1. Rendez-vous sur [supabase.com](https://supabase.com) et connectez-vous (ou créez un compte gratuit).
2. Cliquez sur le bouton vert **New Project**.
3. Renseignez les informations de base :
   - **Name** : `legalmaps-nantes` (ou le nom de votre ville)
   - **Database Password** : Générez un mot de passe fort (note : vous n'aurez jamais besoin de vous connecter à la base SQL). -> fhdsuohgpriueqhòofhre3489999
   - **Region** : Choisissez une région européenne proche pour minimiser la latence (ex: `EU (Frankfurt)`, `EU (Ireland)` ou `EU (London)`).
   - **Pricing Plan** : `Free Tier` ($0/mois).
4. Cliquez sur **Create new project** et patientez environ 1 à 2 minutes pendant l'initialisation de l'infrastructure.

---

## Étape 2 : Récupérer les identifiants d'API publique

1. Dans le tableau de bord de votre projet Supabase, cliquez sur l'icône **Project Settings** (l'engrenage en bas à gauche de la barre latérale).
2. Cliquez sur le menu **API**.
3. Dans la section **Project API keys** et **Project URL**, repérez les deux valeurs publiques :
   - **Project URL** : une URL ressemblant à `https://elpnscywkpsljrxkluij.supabase.co
   - **Project API Keys** -> `anon` / `public` : une clé JWT publique débutant par `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscG5zY3l3a3BzbGpyeGtsdWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzNjM3NzQsImV4cCI6MjEwNjkzOTc3NH0.MCuxluF1d1XflF3KtkvGJBRBI6Xw1ASILuJCTqB0EHU'

> [!NOTE]
> La clé `anon` (publique) est conçue par Supabase pour être exposée côté client dans les navigateurs. Ne renseignez **jamais** la clé `service_role` (secrète).

---

## Étape 3 : Faut-il toucher à la base de données ou au SQL ?

**NON. Absolument rien.**
- N'ouvrez pas le SQL Editor.
- Ne créez aucune table.
- N'activez aucune table dans "Database > Replication".

Le système **LEGALMAPS** utilise exclusivement les canaux de diffusion WebSocket éphémères (`Broadcast channels`) :
- `reports-stream` : flux des signalements de voirie et alertes sanitaires.
- `cortege-state` : diffusion de l'état officiel (Mobile / Immobile) et de la position de la tête et fin de cortège.

Ces messages transitent en socket volatile sans jamais écrire une seule ligne dans Postgres.

---

## Étape 4 : Configurer le fichier `.env.local`

Dans la racine du projet `LEGALMAPS`, créez ou éditez le fichier `.env.local` :

```bash
# Relais Supabase Realtime (Pure Broadcast)
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Clé PUBLIQUE de vérification du cortège (Ed25519)
# La clé privée ne réside que dans l'URL de l'organisateur (#priv=...)
# Générée via : node scripts/generate-keys.js
NEXT_PUBLIC_ADMIN_VERIFY_KEY=909b69715acf5dbc959e1e23c00bdf8868d694214b8cf5d5751f28a8867dce4c
```

---

## Étape 5 : Test et validation du fonctionnement

1. Lancez l'application en local :
   ```bash
   npm run dev
   ```
2. Ouvrez [http://localhost:3000](http://localhost:3000) dans deux fenêtres de navigateur distinctes (ou sur mobile et desktop) :
   - Observez le badge en haut à droite : il doit indiquer **Direct** avec une pastille verte clignotante.
   - Cliquez sur un bouton d'action (ex: `Zone Gaz`) dans le premier navigateur (le puzzle PoW Hashcash est résolu automatiquement).
   - Cliquez une deuxième fois sur le même bouton ou dans le deuxième navigateur dans un rayon de 100m.
   - **Constat immédiat** : Le seuil de consensus (2 signalements) est franchi et le marqueur animé apparaît en direct sur les deux écrans avec son compte à rebours d'auto-destruction !
3. Testez l'espace organisateur sécurisé Ed25519 :
   - Rendez-vous sur `http://localhost:3000/admin#priv=4deac1e425dd49c9318f27fa672f427075180256d363ac70265feedd0a3c9649`.
   - Basculez sur `Cortège Immobile` et cliquez sur **Signer & Diffuser en Direct**.
   - Observez la vérification instantanée de la signature Ed25519 par tous les clients et le passage du compte à rebours à 10 minutes !

---

## Étape 6 : Déploiement en production (100 % Gratuit)

Vous pouvez déployer cette PWA gratuitement sur **Vercel** ou **Cloudflare Pages** :

### Déploiement sur Vercel :
1. Poussez le dépôt sur GitHub / GitLab.
2. Importez le projet dans Vercel.
3. Dans **Environment Variables**, ajoutez :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ADMIN_SECRET_KEY`
4. Cliquez sur **Deploy**. Votre application est en ligne, chiffrée en HTTPS, avec Service Worker PWA actif.

