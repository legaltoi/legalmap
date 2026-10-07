"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchSocialFeed,
  SocialPost,
} from "@/services/socialFeedService";

interface UseSocialFeedOptions {
  query?: string;
  autoRefreshInterval?: number; // ms (ex: 60000 = 1 min)
  initialFetch?: boolean;
}

export interface UseSocialFeedState {
  posts: SocialPost[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isFallback: boolean;
  cooldownLeft: number; // secondes restantes avant de pouvoir rafraîchir à nouveau (anti-spam 10s)
}

const RATE_LIMIT_COOLDOWN_SECONDS = 10;

export function useSocialFeed({
  query = "Manif Nantes OR #ManifNantes",
  autoRefreshInterval = 60000,
  initialFetch = true,
}: UseSocialFeedOptions = {}) {
  const [state, setState] = useState<UseSocialFeedState>({
    posts: [],
    isLoading: initialFetch,
    isRefreshing: false,
    error: null,
    lastUpdated: null,
    isFallback: false,
    cooldownLeft: 0,
  });

  const isMountedRef = useRef(true);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Décompte de temporisation anti-spam (10s)
  const startCooldown = useCallback(() => {
    setState((prev) => ({ ...prev, cooldownLeft: RATE_LIMIT_COOLDOWN_SECONDS }));

    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);

    cooldownTimerRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.cooldownLeft <= 1) {
          if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
          return { ...prev, cooldownLeft: 0 };
        }
        return { ...prev, cooldownLeft: prev.cooldownLeft - 1 };
      });
    }, 1000);
  }, []);

  const loadFeed = useCallback(
    async (isManualRefresh = false) => {
      if (!isMountedRef.current) return;

      if (isManualRefresh && state.cooldownLeft > 0) {
        return; // Protection rate-limit actif
      }

      setState((prev) => ({
        ...prev,
        isLoading: prev.posts.length === 0,
        isRefreshing: isManualRefresh && prev.posts.length > 0,
        error: null,
      }));

      try {
        const { posts, isFallback } = await fetchSocialFeed(query);

        if (!isMountedRef.current) return;

        setState((prev) => ({
          ...prev,
          posts,
          isLoading: false,
          isRefreshing: false,
          error: null,
          lastUpdated: new Date(),
          isFallback,
        }));

        if (isManualRefresh) {
          startCooldown();
        }
      } catch (err: any) {
        if (!isMountedRef.current) return;

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isRefreshing: false,
          error: err?.message || "Impossible de charger le flux en direct.",
        }));
      }
    },
    [query, state.cooldownLeft, startCooldown]
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
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, [loadFeed, autoRefreshInterval, initialFetch]);

  return {
    ...state,
    refetch: () => loadFeed(true),
  };
}
