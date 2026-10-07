"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchSocialFeed,
  SocialPost,
  FeedState,
} from "@/services/socialFeedService";

interface UseSocialFeedOptions {
  query?: string;
  autoRefreshInterval?: number; // en ms (0 pour désactiver le rafraîchissement auto)
  initialFetch?: boolean;
}

export function useSocialFeed({
  query,
  autoRefreshInterval = 60000,
  initialFetch = true,
}: UseSocialFeedOptions = {}) {
  const [state, setState] = useState<FeedState>({
    posts: [],
    isLoading: initialFetch,
    isRefreshing: false,
    error: null,
    lastUpdated: null,
    isFallback: false,
  });

  const isMountedRef = useRef(true);

  const loadFeed = useCallback(
    async (isManualRefresh = false) => {
      if (!isMountedRef.current) return;

      setState((prev) => ({
        ...prev,
        isLoading: prev.posts.length === 0,
        isRefreshing: isManualRefresh && prev.posts.length > 0,
        error: null,
      }));

      try {
        const { posts, isFallback } = await fetchSocialFeed(query);

        if (!isMountedRef.current) return;

        setState({
          posts,
          isLoading: false,
          isRefreshing: false,
          error: null,
          lastUpdated: new Date(),
          isFallback,
        });
      } catch (err: any) {
        if (!isMountedRef.current) return;

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isRefreshing: false,
          error:
            err?.message ||
            "Impossible de charger les derniers messages. Veuillez réessayer.",
        }));
      }
    },
    [query]
  );

  // Chargement initial et gestion de l'intervalle de rafraîchissement automatique
  useEffect(() => {
    isMountedRef.current = true;

    if (initialFetch) {
      loadFeed();
    }

    let intervalId: NodeJS.Timeout | null = null;
    if (autoRefreshInterval > 0) {
      intervalId = setInterval(() => {
        loadFeed();
      }, autoRefreshInterval);
    }

    return () => {
      isMountedRef.current = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [loadFeed, autoRefreshInterval, initialFetch]);

  return {
    ...state,
    refetch: () => loadFeed(true),
  };
}
