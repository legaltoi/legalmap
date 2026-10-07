/**
 * Service de liaison avec le flux réel X / Twitter (#ManifNantes)
 * Référé exclusivement et directement à la page réseau :
 * https://x.com/search?q=Nantes%20manif&src=typed_query&f=live
 *
 * RÈGLE STRICTE : ZÉRO DONNÉE INVENTÉE OU FABRIQUÉE.
 * Tout contenu affiché provient directement du réseau ou renvoie de manière transparente
 * vers le flux en direct sur la plateforme X officielle.
 */

export const OFFICIAL_X_LIVE_URL =
  "https://x.com/search?q=Nantes%20manif&src=typed_query&f=live";

export const OFFICIAL_X_MEDIA_URL =
  "https://x.com/search?q=Nantes%20manif&src=typed_query&f=media";

export const OFFICIAL_X_HASHTAG_URL =
  "https://x.com/search?q=%23ManifNantes&src=typed_query&f=live";

export const OFFICIAL_X_APP_DEEP_LINK =
  "twitter://search?query=Nantes%20manif";

export interface SocialPost {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar?: string;
  authorVerified?: boolean;
  content: string;
  createdAt: string;
  timestamp: number;
  url: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  likesCount?: number;
  retweetsCount?: number;
  source: "live_api";
}

export interface FeedFetchResult {
  posts: SocialPost[];
  isConfigured: boolean;
  officialUrl: string;
}

/**
 * Récupération stricte depuis le réseau via API / proxy configuré.
 * En l'absence d'API ou si aucun post réel n'est renvoyé par le réseau,
 * AUCUNE donnée fictive n'est inventée : la liste reste vide et le composant
 * redirige directement vers la page en direct officielle.
 */
export async function fetchSocialFeed(query = "Nantes manif"): Promise<FeedFetchResult> {
  const apiUrl = process.env.NEXT_PUBLIC_SOCIAL_FEED_API_URL;

  if (apiUrl) {
    try {
      const url = new URL(apiUrl);
      url.searchParams.set("q", query);
      url.searchParams.set("f", "live");
      url.searchParams.set("count", "30");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url.toString(), {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const rawPosts = Array.isArray(data) ? data : data.posts || data.data;

        if (Array.isArray(rawPosts) && rawPosts.length > 0) {
          const parsedPosts: SocialPost[] = rawPosts.map((p: any, idx: number) => ({
            id: p.id || `x-${idx}-${p.timestamp || Date.now()}`,
            authorName: p.authorName || p.user?.name || "Auteur X",
            authorHandle: p.authorHandle || p.user?.screen_name || "x",
            authorAvatar: p.authorAvatar || p.user?.profile_image_url_https,
            authorVerified: Boolean(p.authorVerified || p.user?.verified),
            content: p.content || p.text || "",
            createdAt: p.createdAt || p.created_at || new Date().toISOString(),
            timestamp: p.timestamp || (p.created_at ? new Date(p.created_at).getTime() : Date.now()),
            url: p.url || `https://x.com/${p.authorHandle || p.user?.screen_name || "i"}/status/${p.id}`,
            mediaUrl: p.mediaUrl || p.entities?.media?.[0]?.media_url_https,
            mediaType: p.mediaType || (p.entities?.media?.[0]?.type === "video" ? "video" : "image"),
            likesCount: typeof p.likesCount === "number" ? p.likesCount : p.favorite_count,
            retweetsCount: typeof p.retweetsCount === "number" ? p.retweetsCount : p.retweet_count,
            source: "live_api",
          }));

          parsedPosts.sort((a, b) => b.timestamp - a.timestamp);

          return {
            posts: parsedPosts,
            isConfigured: true,
            officialUrl: OFFICIAL_X_LIVE_URL,
          };
        }
      }
    } catch (err) {
      console.warn("[SocialFeed] Erreur lors de l'appel au point d'accès réseau :", err);
    }
  }

  // ZÉRO MOCK : aucun post inventé
  return {
    posts: [],
    isConfigured: Boolean(apiUrl),
    officialUrl: OFFICIAL_X_LIVE_URL,
  };
}

/**
 * Formatage relatif convivial en français (ex: "Il y a 5 min", "Il y a 1 h")
 */
export function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);

  if (diffSec < 60) {
    return "À l'instant";
  }

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `Il y a ${diffMin} min`;
  }

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return `Il y a ${diffHours} h`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `Il y a ${diffDays} j`;
}
