/**
 * Service de récupération du flux social X / Twitter (#ManifNantes)
 * Compatible Next.js 15 export statique pur (côté client).
 * Conforme au RGPD : zéro cookie, zéro tracking, aucune donnée personnelle stockée.
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
  source?: "live_api" | "mock_fallback";
}

export interface FeedState {
  posts: SocialPost[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isFallback: boolean;
}

const DEFAULT_QUERY = "Manif Nantes OR #ManifNantes";

/**
 * Génération de données de secours réalistes et fraîches (calquées sur le moment présent)
 * Garantit que l'interface reste toujours active et fonctionnelle même hors-ligne ou sans clé d'API.
 */
function getRealisticMockPosts(): SocialPost[] {
  const now = Date.now();

  return [
    {
      id: "mock-post-1",
      authorName: "Nantes Live Report",
      authorHandle: "nantes_live",
      authorVerified: true,
      content:
        "La tête de cortège arrive actuellement sur la Place Royale. Forte affluence cet après-midi, ambiance calme et déterminée. #ManifNantes #Nantes",
      createdAt: new Date(now - 3 * 60 * 1000).toISOString(),
      timestamp: now - 3 * 60 * 1000,
      url: "https://x.com/search?q=%23ManifNantes",
      mediaUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
      mediaType: "image",
      likesCount: 142,
      retweetsCount: 38,
      source: "mock_fallback",
    },
    {
      id: "mock-post-2",
      authorName: "Street Medics Nantes",
      authorHandle: "MedicsNantes",
      authorVerified: true,
      content:
        "Rappel : plusieurs points d'eau potable et sérum phy sont accessibles sur le Cours des 50 Otages et près du CHU Hôtel-Dieu. Restez hydratés et attentifs aux personnes vulnérables. #ManifNantes",
      createdAt: new Date(now - 11 * 60 * 1000).toISOString(),
      timestamp: now - 11 * 60 * 1000,
      url: "https://x.com/search?q=%23ManifNantes",
      likesCount: 230,
      retweetsCount: 95,
      source: "mock_fallback",
    },
    {
      id: "mock-post-3",
      authorName: "Presse Océan Direct",
      authorHandle: "presseocean",
      authorVerified: true,
      content:
        "Circulation Naolib : le réseau tramway (Lignes 1, 2 et 3) est temporairement interrompu dans le secteur Commerce. Itinéraire dévié vers Bouffay. #ManifNantes #InfoTrafic",
      createdAt: new Date(now - 22 * 60 * 1000).toISOString(),
      timestamp: now - 22 * 60 * 1000,
      url: "https://x.com/search?q=%23ManifNantes",
      mediaUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80",
      mediaType: "image",
      likesCount: 88,
      retweetsCount: 42,
      source: "mock_fallback",
    },
    {
      id: "mock-post-4",
      authorName: "Union Syndicale 44",
      authorHandle: "in_syndicale44",
      authorVerified: false,
      content:
        "Départ officiel du cortège intersyndical depuis la Place du Miroir d'Eau / Château. Des milliers de personnes réunies pour la défense des droits sociaux. #ManifNantes #Nantes",
      createdAt: new Date(now - 38 * 60 * 1000).toISOString(),
      timestamp: now - 38 * 60 * 1000,
      url: "https://x.com/search?q=%23ManifNantes",
      likesCount: 312,
      retweetsCount: 124,
      source: "mock_fallback",
    },
    {
      id: "mock-post-5",
      authorName: "Observatoire Droit Manif",
      authorHandle: "obs_droits_44",
      authorVerified: true,
      content:
        "La permanence du Barreau des avocats de Nantes est joignable pour assistance juridique en cas de garde à vue ou contrôle d'identité abusif. Numéro d'urgence disponible sur LEGALMAPS. #ManifNantes",
      createdAt: new Date(now - 55 * 60 * 1000).toISOString(),
      timestamp: now - 55 * 60 * 1000,
      url: "https://x.com/search?q=%23ManifNantes",
      likesCount: 184,
      retweetsCount: 79,
      source: "mock_fallback",
    },
    {
      id: "mock-post-6",
      authorName: "Nantes Révoltée",
      authorHandle: "NantesRevoltee",
      authorVerified: false,
      content:
        "Vidéo en direct : Défilé dynamique rue Crébillon en direction de la place Graslin. Ambiance musicale et banderoles citoyennes. #ManifNantes #Nantes",
      createdAt: new Date(now - 74 * 60 * 1000).toISOString(),
      timestamp: now - 74 * 60 * 1000,
      url: "https://x.com/search?q=%23ManifNantes",
      mediaUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
      mediaType: "video",
      likesCount: 420,
      retweetsCount: 153,
      source: "mock_fallback",
    },
  ];
}

/**
 * Récupération asynchrone des derniers posts sur X / Twitter
 * Tente d'appeler l'API configurée (via NEXT_PUBLIC_SOCIAL_FEED_API_URL),
 * et bascule de manière résiliente sur les données simulées fraîches en cas d'échec ou d'absence de configuration.
 */
export async function fetchSocialFeed(query = DEFAULT_QUERY): Promise<{
  posts: SocialPost[];
  isFallback: boolean;
}> {
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
            id: p.id || `remote-${idx}-${Date.now()}`,
            authorName: p.authorName || p.user?.name || "Participant",
            authorHandle: p.authorHandle || p.user?.screen_name || "anonyme",
            authorAvatar: p.authorAvatar || p.user?.profile_image_url_https,
            authorVerified: Boolean(p.authorVerified || p.user?.verified),
            content: p.content || p.text || "",
            createdAt: p.createdAt || p.created_at || new Date().toISOString(),
            timestamp: p.timestamp || (p.created_at ? new Date(p.created_at).getTime() : Date.now()),
            url: p.url || `https://x.com/search?q=%23ManifNantes`,
            mediaUrl: p.mediaUrl || p.entities?.media?.[0]?.media_url_https,
            mediaType: p.mediaType || (p.entities?.media?.[0]?.type === "video" ? "video" : "image"),
            likesCount: p.likesCount || p.favorite_count,
            retweetsCount: p.retweetsCount || p.retweet_count,
            source: "live_api",
          }));

          // Tri chronologique décroissant (du plus récent au plus ancien)
          parsedPosts.sort((a, b) => b.timestamp - a.timestamp);

          return { posts: parsedPosts, isFallback: false };
        }
      }
    } catch (err) {
      console.warn(
        "[SocialFeed] Échec de l'appel API distant (hors-ligne ou CORS). Bascule sur les données simulées :",
        err
      );
    }
  }

  // Fallback résilient avec simulation dynamique fraîche
  const mockPosts = getRealisticMockPosts();
  mockPosts.sort((a, b) => b.timestamp - a.timestamp);
  return { posts: mockPosts, isFallback: true };
}

/**
 * Formatage relatif convivial en français (ex: "il y a 5 min", "il y a 1h")
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
