/**
 * Service de récupération du flux social X/Twitter (#ManifNantes)
 * Compatible Next.js 15 (export statique pur, 100 % client-side).
 * Respect du RGPD (0 cookie, 0 log IP, aucun stockage en base de données).
 */

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
}

export interface FeedFetchResult {
  posts: SocialPost[];
  isFallback: boolean;
}

const DEFAULT_QUERY = "Manif Nantes OR #ManifNantes";
export const OFFICIAL_X_SEARCH_URL = "https://x.com/search?q=Nantes%20manif&src=typed_query&f=live";

/**
 * Mock data de secours réalistes contextualisées sur Nantes.
 * Utilisées lorsque l'API distante n'est pas configurée ou en cas de coupure réseau.
 */
function getFallbackMockPosts(): SocialPost[] {
  const now = Date.now();

  return [
    {
      id: "mock-post-1",
      authorName: "Nantes Live Report",
      authorHandle: "nantes_live",
      authorVerified: true,
      content:
        "La tête de cortège s'engage actuellement sur la Place Royale. Ambiance calme et affluence importante pour la mobilisation cet après-midi. #ManifNantes #Nantes",
      createdAt: new Date(now - 4 * 60 * 1000).toISOString(),
      timestamp: now - 4 * 60 * 1000,
      url: "https://x.com/search?q=%23ManifNantes",
      mediaUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
      mediaType: "image",
      likesCount: 154,
      retweetsCount: 42,
    },
    {
      id: "mock-post-2",
      authorName: "Street Medics Nantes",
      authorHandle: "MedicsNantes",
      authorVerified: true,
      content:
        "Rappel de sécurité : plusieurs points d'eau potable et sérum physiologique sont disponibles Cours des 50 Otages et près du CHU. Restez hydratés. #ManifNantes",
      createdAt: new Date(now - 12 * 60 * 1000).toISOString(),
      timestamp: now - 12 * 60 * 1000,
      url: "https://x.com/search?q=%23ManifNantes",
      likesCount: 245,
      retweetsCount: 98,
    },
    {
      id: "mock-post-3",
      authorName: "Presse Océan Direct",
      authorHandle: "presseocean",
      authorVerified: true,
      content:
        "Info trafic Naolib : interruption temporaire du réseau de tramway (lignes 1, 2, 3) dans le secteur Commerce. Déviations en cours par Bouffay. #ManifNantes",
      createdAt: new Date(now - 25 * 60 * 1000).toISOString(),
      timestamp: now - 25 * 60 * 1000,
      url: "https://x.com/search?q=%23ManifNantes",
      mediaUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80",
      mediaType: "image",
      likesCount: 92,
      retweetsCount: 39,
    },
    {
      id: "mock-post-4",
      authorName: "Union Syndicale 44",
      authorHandle: "in_syndicale44",
      authorVerified: false,
      content:
        "Départ officiel du cortège intersyndical depuis le Miroir d'Eau. Les rassemblements se poursuivent dans le calme en direction de la place Graslin. #ManifNantes",
      createdAt: new Date(now - 45 * 60 * 1000).toISOString(),
      timestamp: now - 45 * 60 * 1000,
      url: "https://x.com/search?q=%23ManifNantes",
      likesCount: 320,
      retweetsCount: 115,
    },
    {
      id: "mock-post-5",
      authorName: "Observatoire Droit Manif",
      authorHandle: "obs_droits_44",
      authorVerified: true,
      content:
        "La permanence du Barreau des avocats de Nantes assure la défense des droits. Numéros d'urgence juridique accessibles directement dans l'application. #ManifNantes",
      createdAt: new Date(now - 60 * 60 * 1000).toISOString(),
      timestamp: now - 60 * 60 * 1000,
      url: "https://x.com/search?q=%23ManifNantes",
      likesCount: 198,
      retweetsCount: 84,
    },
  ];
}

/**
 * Récupère les posts depuis l'API distante si configurée, sinon bascule sur le mock fallback.
 */
export async function fetchSocialFeed(query: string = DEFAULT_QUERY): Promise<FeedFetchResult> {
  const apiUrl = process.env.NEXT_PUBLIC_SOCIAL_FEED_API_URL;

  if (apiUrl) {
    try {
      const url = new URL(apiUrl);
      url.searchParams.set("q", query);
      url.searchParams.set("count", "20");

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
            id: p.id || `post-${idx}-${Date.now()}`,
            authorName: p.authorName || p.user?.name || "Auteur X",
            authorHandle: p.authorHandle || p.user?.screen_name || "anonyme",
            authorAvatar: p.authorAvatar || p.user?.profile_image_url_https,
            authorVerified: Boolean(p.authorVerified || p.user?.verified),
            content: p.content || p.text || "",
            createdAt: p.createdAt || p.created_at || new Date().toISOString(),
            timestamp: p.timestamp || (p.created_at ? new Date(p.created_at).getTime() : Date.now()),
            url: p.url || `https://x.com/search?q=%23ManifNantes`,
            mediaUrl: p.mediaUrl || p.entities?.media?.[0]?.media_url_https,
            mediaType: p.mediaType || (p.entities?.media?.[0]?.type === "video" ? "video" : "image"),
            likesCount: typeof p.likesCount === "number" ? p.likesCount : p.favorite_count,
            retweetsCount: typeof p.retweetsCount === "number" ? p.retweetsCount : p.retweet_count,
          }));

          parsedPosts.sort((a, b) => b.timestamp - a.timestamp);
          return { posts: parsedPosts, isFallback: false };
        }
      }
    } catch (err) {
      console.warn("[SocialFeed] Échec API distante, bascule sur les données fallback :", err);
    }
  }

  const fallbackPosts = getFallbackMockPosts();
  fallbackPosts.sort((a, b) => b.timestamp - a.timestamp);
  return { posts: fallbackPosts, isFallback: true };
}

/**
 * Formatage du temps relatif en français
 */
export function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);

  if (diffSec < 60) return "À l'instant";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Il y a ${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  return `Il y a ${diffDays} j`;
}
