/**
 * Service de Synchronisation Automatique de l'Itinéraire avec GitHub API
 *
 * Permet à la console d'administration de pousser automatiquement le nouveau
 * tracé calculé dans `src/config/cities/nantes.json` sur le dépôt GitHub :
 * https://github.com/legaltoi/legalmap
 *
 * Ce commit déclenche automatiquement le workflow GitHub Actions pour recompiler
 * et redéployer le site statique avec le nouveau parcours officiel en dur.
 */

const REPO_OWNER = "legaltoi";
const REPO_NAME = "legalmap";
const TARGET_FILE_PATH = "src/config/cities/nantes.json";
const TARGET_BRANCH = "main";

export interface SyncRouteParams {
  token: string;
  routeCoordinates: [number, number][];
  headCoords?: { lat: number; lng: number } | null;
  tailCoords?: { lat: number; lng: number } | null;
}

export interface SyncRouteResult {
  success: boolean;
  commitSha?: string;
  commitUrl?: string;
  error?: string;
}

/**
 * Encodage sécurisé UTF-8 vers Base64 compatible navigateur et Node.js
 */
function utf8ToBase64(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    return Buffer.from(str, "utf8").toString("base64");
  }
}

/**
 * Décodage sécurisé Base64 vers UTF-8 compatible navigateur et Node.js
 */
function base64ToUtf8(str: string): string {
  try {
    return decodeURIComponent(escape(atob(str.replace(/\s/g, ""))));
  } catch {
    return Buffer.from(str.replace(/\s/g, ""), "base64").toString("utf8");
  }
}

/**
 * Teste la validité d'un Personal Access Token (PAT) GitHub
 */
export async function testGitHubToken(token: string): Promise<{ valid: boolean; error?: string }> {
  const cleanToken = token.trim();
  if (!cleanToken) {
    return { valid: false, error: "Token vide" };
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${TARGET_FILE_PATH}`, {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (res.status === 200) {
      return { valid: true };
    } else if (res.status === 401 || res.status === 403) {
      return { valid: false, error: "Token non autorisé ou expiré (droits contents:write requis)" };
    } else {
      return { valid: false, error: `Erreur GitHub HTTP ${res.status}` };
    }
  } catch (err: any) {
    return { valid: false, error: err.message || "Erreur réseau vers api.github.com" };
  }
}

/**
 * Injecte les coordonnées dans le fichier nantes.json et effectue un commit via l'API GitHub
 */
export async function syncRouteToNantesJson(params: SyncRouteParams): Promise<SyncRouteResult> {
  const { token, routeCoordinates, headCoords, tailCoords } = params;
  const cleanToken = token.trim();

  if (!cleanToken) {
    return { success: false, error: "Aucun token GitHub fourni pour la synchronisation automatique." };
  }

  if (!routeCoordinates || routeCoordinates.length < 2) {
    return { success: false, error: "Le tracé doit comporter au moins 2 coordonnées." };
  }

  try {
    const fileUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${TARGET_FILE_PATH}`;

    // 1. Récupération du fichier nantes.json actuel et de son SHA
    const getRes = await fetch(fileUrl, {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    });

    if (!getRes.ok) {
      const errText = await getRes.text();
      return {
        success: false,
        error: `Impossible de lire nantes.json sur GitHub (HTTP ${getRes.status}) : ${errText}`,
      };
    }

    const fileData = await getRes.json();
    const currentSha = fileData.sha;
    const rawContent = base64ToUtf8(fileData.content);
    const nantesJson = JSON.parse(rawContent);

    // 2. Mise à jour de l'itinéraire déclaré principal
    if (nantesJson.officialRoute?.features && nantesJson.officialRoute.features.length > 0) {
      // Feature 0 : LineString du tracé
      nantesJson.officialRoute.features[0].geometry.coordinates = routeCoordinates;

      // Feature 1 : Point de départ / rassemblement initial
      if (headCoords && nantesJson.officialRoute.features[1]?.geometry) {
        nantesJson.officialRoute.features[1].geometry.coordinates = [headCoords.lng, headCoords.lat];
      }

      // Feature 3 : Point de dispersion final
      if (tailCoords && nantesJson.officialRoute.features[3]?.geometry) {
        nantesJson.officialRoute.features[3].geometry.coordinates = [tailCoords.lng, tailCoords.lat];
      }
    } else {
      return { success: false, error: "Structure GeoJSON inattendue dans nantes.json." };
    }

    // 3. Préparation du contenu encodé
    const updatedContentStr = JSON.stringify(nantesJson, null, 2) + "\n";
    const encodedContent = utf8ToBase64(updatedContentStr);

    const nowFormatted = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const commitMessage = `chore(cortege): actualisation automatique du tracé officiel (${nowFormatted}) [auto-sync]`;

    // 4. Commit via l'API GitHub
    const putRes = await fetch(fileUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        message: commitMessage,
        content: encodedContent,
        sha: currentSha,
        branch: TARGET_BRANCH,
      }),
    });

    if (!putRes.ok) {
      const putErrText = await putRes.text();
      return {
        success: false,
        error: `Échec du commit sur GitHub (HTTP ${putRes.status}) : ${putErrText}`,
      };
    }

    const putData = await putRes.json();
    const commitSha = putData.commit?.sha?.substring(0, 7) || "commit";
    const commitUrl = putData.commit?.html_url || `https://github.com/${REPO_OWNER}/${REPO_NAME}/commits/main`;

    return {
      success: true,
      commitSha,
      commitUrl,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Erreur inattendue lors de la synchronisation GitHub.",
    };
  }
}
