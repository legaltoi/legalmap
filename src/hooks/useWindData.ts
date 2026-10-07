"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchCurrentWind, WindData } from "@/services/weatherService";

interface UseWindDataOptions {
  enabled?: boolean;
  autoRefreshInterval?: number; // en ms (ex: 180000 = 3 minutes)
}

export function useWindData({
  enabled = true,
  autoRefreshInterval = 180000,
}: UseWindDataOptions = {}) {
  const [windData, setWindData] = useState<WindData | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);

  const loadWind = useCallback(async () => {
    if (!enabled) return;
    setIsLoading((prev) => (!windData ? true : prev));
    setError(null);

    try {
      const data = await fetchCurrentWind();
      if (!isMountedRef.current) return;
      setWindData(data);
      setIsLoading(false);
    } catch (err: any) {
      if (!isMountedRef.current) return;
      setError(err?.message || "Erreur de récupération du vent");
      setIsLoading(false);
    }
  }, [enabled, windData]);

  useEffect(() => {
    isMountedRef.current = true;

    if (enabled) {
      loadWind();
    }

    let intervalId: NodeJS.Timeout | null = null;
    if (enabled && autoRefreshInterval > 0) {
      intervalId = setInterval(() => {
        loadWind();
      }, autoRefreshInterval);
    }

    return () => {
      isMountedRef.current = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [enabled, loadWind, autoRefreshInterval]);

  return {
    windData,
    isLoading,
    error,
    refetch: loadWind,
  };
}
