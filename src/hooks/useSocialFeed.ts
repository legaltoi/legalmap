"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchSocialFeed,
  SocialPost,
  OFFICIAL_X_LIVE_URL,
} from "@/services/socialFeedService";

interface UseSocialFeedOptions {
  query?: string;
  autoRefreshInterval?: number; // en ms (0 pour désactiver le rafraîchissement auto)
  initialFetch?: boolean;
}

export interface UseSocialFeedState {
  posts: SocialPost[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isConfigured: boolean;
  officialUrl: string;
}

export function useSocialFeed({
  query = "Nantes manif",
  autoRefreshInterval = 60000,
  initialFetch = true,
}: UseSocialFeedOptions = {}) {
  const [state, setState] = useState<UseSocialFeedState>({
    posts: [],
    isLoading: initialFetch,
    isRefreshing: false,
    error: null,
    lastUpdated: null,
    isConfigured: false,
    officialUrl: OFFICIAL_X_LIVE_URL,
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
        const { posts, isConfigured, officialUrl } = await fetchSocialFeed(query);

        if (!isMountedRef.current) return;

        setState({
          posts,
          isLoading: false,
          isRefreshing: false,
          error: null,
          lastUpdated: new Date(),
          isConfigured,
          officialUrl,
        });
      } catch (err: any) {
        if (!isMountedRef.current) return;

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isRefreshing: false,
          error:
            err?.message ||
            "Erreur lors de la récupération des données réseau.",
        }));
      }
    },
    [query]
  );

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
