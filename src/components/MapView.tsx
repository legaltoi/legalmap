"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import * as pmtiles from "pmtiles";
import "maplibre-gl/dist/maplibre-gl.css";

import { ConsensusMarker, CortegeState, POI, POICategory, ReportCategory } from "@/types";
import nantesData from "@/config/cities/nantes.json";
import nantesBaseGeoJson from "@/config/cities/nantes-base.json";
import { REPORT_CATEGORIES } from "@/config/categories";
import { formatTimeRemaining } from "@/lib/geo";
import {
  Locate,
  Crosshair,
  Compass,
  MapPin,
  Layers,
  Phone,
  X,
  AlertCircle,
  Navigation,
} from "lucide-react";

export const POI_META: Record<
  POICategory,
  { label: string; icon: string; border: string; bg: string; text: string; badge: string }
> = {
  WATER: {
    label: "Eau & Rinçage",
    icon: "💧",
    border: "border-sky-400/80",
    bg: "bg-sky-950/85",
    text: "text-sky-300",
    badge: "bg-sky-500/10 border-sky-500/30 text-sky-400",
  },
  PHARMACY: {
    label: "Pharmacie",
    icon: "💊",
    border: "border-emerald-400/80",
    bg: "bg-emerald-950/85",
    text: "text-emerald-300",
    badge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  },
  HOSPITAL: {
    label: "Urgences & Soins",
    icon: "🏥",
    border: "border-red-400/80",
    bg: "bg-red-950/85",
    text: "text-red-300",
    badge: "bg-red-500/10 border-red-500/30 text-red-400",
  },
  EMERGENCY: {
    label: "Droits & Juridique",
    icon: "⚖️",
    border: "border-purple-400/80",
    bg: "bg-purple-950/85",
    text: "text-purple-300",
    badge: "bg-purple-500/10 border-purple-500/30 text-purple-400",
  },
  TOILET: {
    label: "Toilettes",
    icon: "🚻",
    border: "border-zinc-500/80",
    bg: "bg-zinc-900/90",
    text: "text-zinc-300",
    badge: "bg-zinc-500/10 border-zinc-500/30 text-zinc-400",
  },
};

// Enregistrement du protocole PMTiles natif avec résolution d'URL relative
let isProtocolAdded = false;
if (typeof window !== "undefined" && !isProtocolAdded) {
  const protocol = new pmtiles.Protocol();
  maplibregl.addProtocol("pmtiles", (params, abortController) => {
    let url = params.url;
    if (url.startsWith("pmtiles:///") || !url.includes("://http")) {
      const path = url.replace(/^pmtiles:\/\//, "");
      const fullUrl = `${window.location.origin}${path.startsWith("/") ? "" : "/"}${path}`;
      params = { ...params, url: `pmtiles://${fullUrl}` };
    }
    return protocol.tile(params, abortController);
  });
  isProtocolAdded = true;
}

interface MapViewProps {
  consensusMarkers: ConsensusMarker[];
  cortegeState: CortegeState;
  userLocation: { lat: number; lng: number } | null;
  onMapClickReport?: (coords: { lat: number; lng: number }) => void;
  isMapSelectActive?: boolean;
  onUserLocationFound?: (coords: { lat: number; lng: number }) => void;
}

export function MapView({
  consensusMarkers,
  cortegeState,
  userLocation,
  onMapClickReport,
  isMapSelectActive = false,
  onUserLocationFound,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // Stockage des markers DOM pour mise à jour fine
  const consensusMarkersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const cortegeHeadMarkerRef = useRef<maplibregl.Marker | null>(null);
  const cortegeTailMarkerRef = useRef<maplibregl.Marker | null>(null);
  const userLocationMarkerRef = useRef<maplibregl.Marker | null>(null);
  const poiItemsRef = useRef<Map<string, { marker: maplibregl.Marker; category: POICategory }>>(new Map());
  const [poiCategoryFilter, setPoiCategoryFilter] = useState<"ALL" | POICategory>("ALL");

  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [selectedConsensus, setSelectedConsensus] = useState<ConsensusMarker | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  const cortegeStateRef = useRef(cortegeState);
  cortegeStateRef.current = cortegeState;

  // Détection du chemin de base pour GitHub Pages
  const basePath =
    typeof window !== "undefined" && window.location.pathname.startsWith("/legalmap")
      ? "/legalmap"
      : "";
  const pmtilesUrl = `pmtiles://${basePath}/tiles/nantes.pmtiles`;

  // Style vectoriel en ligne : OpenFreeMap Dark (OpenMapTiles standard pour MapLibre GL)
  const onlineStyleUrl = "https://tiles.openfreemap.org/styles/dark";

  // Style cartographique vectoriel sombre 100 % hors-ligne (mode avion / fallback local)
  const offlineDarkStyle: maplibregl.StyleSpecification = {
    version: 8,
    name: "LegalMaps Offline Dark Vector",
    sources: {
      "nantes-pmtiles": {
        type: "vector",
        url: pmtilesUrl,
      },
      "nantes-offline-base": {
        type: "geojson",
        data: nantesBaseGeoJson as any,
      },
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: {
          "background-color": "#060608",
        },
      },
      // Eau : La Loire et l'Erdre
      {
        id: "water-fill",
        type: "fill",
        source: "nantes-offline-base",
        filter: ["==", "class", "water"],
        paint: {
          "fill-color": "#081321",
          "fill-opacity": 0.95,
        },
      },
      {
        id: "water-outline",
        type: "line",
        source: "nantes-offline-base",
        filter: ["==", "class", "water"],
        paint: {
          "line-color": "#112a45",
          "line-width": 1.5,
        },
      },
      // Parcs et espaces verts
      {
        id: "park-fill",
        type: "fill",
        source: "nantes-offline-base",
        filter: ["==", "class", "park"],
        paint: {
          "fill-color": "#07170f",
          "fill-opacity": 0.8,
        },
      },
      // Rues secondaires nantaises
      {
        id: "streets-secondary",
        type: "line",
        source: "nantes-offline-base",
        filter: ["==", "class", "street"],
        paint: {
          "line-color": "#181824",
          "line-width": 2.5,
        },
      },
      // Grands boulevards et axes principaux de Nantes
      {
        id: "streets-primary",
        type: "line",
        source: "nantes-offline-base",
        filter: ["==", "class", "primary"],
        paint: {
          "line-color": "#252538",
          "line-width": 4.5,
        },
      },
      // Couches vectorielles PMTiles complémentaires (si disponibles)
      {
        id: "pmtiles-streets-layer",
        type: "line",
        source: "nantes-pmtiles",
        "source-layer": "streets",
        paint: {
          "line-color": "#1f1f2e",
          "line-width": 2,
        },
      },
    ],
  };

  // Initialisation de la carte MapLibre
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    const initialStyle = isOnline ? onlineStyleUrl : offlineDarkStyle;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: nantesData.center as [number, number],
      zoom: nantesData.defaultZoom,
      minZoom: nantesData.minZoom,
      maxZoom: nantesData.maxZoom,
      attributionControl: false,
    });

    // Contrôles de navigation officiels MapLibre GL
    map.addControl(
      new maplibregl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true,
      }),
      "top-right"
    );

    map.addControl(
      new maplibregl.ScaleControl({
        maxWidth: 100,
        unit: "metric",
      }),
      "bottom-left"
    );

    map.addControl(
      new maplibregl.AttributionControl({
        compact: true,
      }),
      "bottom-right"
    );

    let hasFallenBack = false;
    // Événement d'erreur non bloquant avec bascule automatique vers le style hors-ligne
    map.on("error", (e) => {
      console.warn("[MapLibre Event]:", e);
      if (
        !hasFallenBack &&
        (e.error?.message?.includes("Failed to fetch") ||
          e.error?.message?.includes("NetworkError") ||
          (e as any).status === 404)
      ) {
        hasFallenBack = true;
        console.info("[LegalMaps] Bascule automatique sur le style hors-ligne local.");
        map.setStyle(offlineDarkStyle);
      }
    });

    // Fournit une image transparente de secours pour tout motif manquant (ex: "wood-pattern" dans OpenFreeMap)
    map.on("styleimagemissing", (e) => {
      try {
        if (!map.hasImage(e.id)) {
          map.addImage(e.id, {
            width: 1,
            height: 1,
            data: new Uint8Array([0, 0, 0, 0]),
          });
        }
      } catch {
        // Ignorer silencieusement si déjà inséré
      }
    });

    const triggerResize = () => {
      if (map) {
        map.resize();
      }
    };

    const attachLayersAndPois = () => {
      setMapLoaded(true);
      triggerResize();

      // 1. Ajout de la source du parcours officiel GeoJSON de Nantes (ou tracé dynamique actualisé)
      const dynamicRoute = cortegeStateRef.current?.routeCoordinates;
      const initialRouteData =
        dynamicRoute && dynamicRoute.length >= 2
          ? {
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  properties: {
                    name: "Parcours Officiel Actualisé",
                    description: "Itinéraire dynamique recalculé sur la voirie",
                    type: "route",
                  },
                  geometry: {
                    type: "LineString",
                    coordinates: dynamicRoute,
                  },
                },
              ],
            }
          : (nantesData.officialRoute as any);

      if (!map.getSource("official-route-source")) {
        map.addSource("official-route-source", {
          type: "geojson",
          data: initialRouteData,
        });
      } else {
        const routeSource = map.getSource("official-route-source") as maplibregl.GeoJSONSource | undefined;
        if (routeSource) {
          routeSource.setData(initialRouteData);
        }
      }

      // Lueur d'arrière-plan du tracé (Halo Cyan)
      if (!map.getLayer("route-halo")) {
        map.addLayer({
          id: "route-halo",
          type: "line",
          source: "official-route-source",
          filter: ["==", "$type", "LineString"],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": "#06b6d4",
            "line-width": 10,
            "line-opacity": 0.35,
            "line-blur": 4,
          },
        });
      }

      // Ligne principale du tracé officiel
      if (!map.getLayer("route-main")) {
        map.addLayer({
          id: "route-main",
          type: "line",
          source: "official-route-source",
          filter: ["==", "$type", "LineString"],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": "#22d3ee",
            "line-width": 4.5,
          },
        });
      }

      // 2. Création des POIs statiques (Eau, Pharmacie, Urgences, Juridique, Toilettes)
      if (poiItemsRef.current.size === 0) {
        nantesData.pois.forEach((poi) => {
          const cat = poi.category as POICategory;
          const meta = POI_META[cat] || POI_META.WATER;

          const el = document.createElement("div");
          el.className = "poi-marker cursor-pointer group transition-transform duration-150 hover:scale-125 z-10 hover:z-30";
          el.setAttribute("title", poi.name);

          el.innerHTML = `
            <div class="w-6 h-6 rounded-full border ${meta.border} ${meta.bg} flex items-center justify-center shadow-md backdrop-blur-sm text-[11px] select-none hover:border-white transition-colors">
              ${meta.icon}
            </div>
          `;

          el.addEventListener("click", (e) => {
            e.stopPropagation();
            setSelectedPoi(poi as POI);
          });

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat(poi.coordinates as [number, number])
            .addTo(map);

          poiItemsRef.current.set(poi.id, { marker, category: cat });
        });
      }
    };

    map.on("load", attachLayersAndPois);
    map.on("styledata", attachLayersAndPois);

    // Clic sur la carte (pour le mode sélection d'un point)
    map.on("click", (e) => {
      if (onMapClickReport) {
        onMapClickReport({
          lat: e.lngLat.lat,
          lng: e.lngLat.lng,
        });
      }
    });

    // Forcer le recalcul de dimension du canvas WebGL dès que le DOM est stabilisé
    const resizeTimer1 = setTimeout(triggerResize, 100);
    const resizeTimer2 = setTimeout(triggerResize, 500);
    const resizeTimer3 = setTimeout(triggerResize, 1200);
    window.addEventListener("resize", triggerResize);

    mapRef.current = map;

    return () => {
      clearTimeout(resizeTimer1);
      clearTimeout(resizeTimer2);
      clearTimeout(resizeTimer3);
      window.removeEventListener("resize", triggerResize);
      poiItemsRef.current.forEach(({ marker }) => marker.remove());
      poiItemsRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Filtrage dynamique des POIs sur la carte selon la catégorie sélectionnée
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    poiItemsRef.current.forEach(({ marker, category }) => {
      const isVisible = poiCategoryFilter === "ALL" || poiCategoryFilter === category;
      const el = marker.getElement();
      if (el) {
        el.style.display = isVisible ? "block" : "none";
      }
    });
  }, [poiCategoryFilter, mapLoaded]);

  // Détection & mise à jour du pointeur de géolocalisation locale utilisateur
  useEffect(() => {
    if (!mapRef.current) return;

    if (userLocation) {
      if (!userLocationMarkerRef.current) {
        const el = document.createElement("div");
        el.className = "user-location-marker pointer-events-none";
        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <div class="w-8 h-8 rounded-full bg-blue-500/25 animate-ping absolute"></div>
            <div class="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-xl relative z-10 flex items-center justify-center">
              <div class="w-2 h-2 rounded-full bg-white"></div>
            </div>
          </div>
        `;

        userLocationMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat([userLocation.lng, userLocation.lat])
          .addTo(mapRef.current);
      } else {
        userLocationMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
      }
    } else if (userLocationMarkerRef.current) {
      userLocationMarkerRef.current.remove();
      userLocationMarkerRef.current = null;
    }
  }, [userLocation]);

  // Synchronisation des marqueurs de consensus
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;
    const currentMarkers = consensusMarkersRef.current;
    const activeIds = new Set(consensusMarkers.map((m) => m.id));

    // Suppression des marqueurs qui ont expiré et ont été purgés de mémoire
    for (const [id, marker] of currentMarkers.entries()) {
      if (!activeIds.has(id)) {
        marker.remove();
        currentMarkers.delete(id);
      }
    }

    // Ajout ou mise à jour des marqueurs actifs
    consensusMarkers.forEach((markerData) => {
      const meta = REPORT_CATEGORIES[markerData.category];
      const remainingMs = Math.max(0, markerData.expiresAt - Date.now());
      const remainingText = markerData.isPending
        ? "1/2 en cours"
        : formatTimeRemaining(remainingMs);
      const isPending = Boolean(markerData.isPending);

      if (currentMarkers.has(markerData.id)) {
        // Mise à jour de la position et de l'affichage du temps restant
        const marker = currentMarkers.get(markerData.id)!;
        marker.setLngLat([markerData.lng, markerData.lat]);

        const el = marker.getElement();
        const badgeEl = el.querySelector(".marker-badge");
        const timeEl = el.querySelector(".marker-time");
        if (badgeEl) badgeEl.textContent = isPending ? "1/2 ⏳" : `x${markerData.reportCount}`;
        if (timeEl) timeEl.textContent = remainingText;
      } else {
        // Création d'un nouveau marqueur animé
        const el = document.createElement("div");
        el.className = "consensus-marker cursor-pointer";
        const pingAnimation = isPending ? "animate-pulse opacity-30" : "animate-ping opacity-40";
        const borderClass = isPending ? "border-dashed opacity-85" : "border-solid";

        el.innerHTML = `
          <div class="relative flex flex-col items-center group">
            <div class="w-10 h-10 rounded-full flex items-center justify-center border-2 ${borderClass} shadow-2xl relative" style="background-color: ${meta.badgeBg}; border-color: ${meta.borderColor}; box-shadow: 0 0 16px ${meta.color}66;">
              <div class="w-12 h-12 rounded-full absolute -inset-1 ${pingAnimation}" style="background-color: ${meta.color};"></div>
              <span class="text-xs font-black text-white relative z-10 marker-badge">${isPending ? "1/2 ⏳" : `x${markerData.reportCount}`}</span>
            </div>
            <div class="mt-1 px-1.5 py-0.5 rounded-md bg-black/90 border border-zinc-700 text-[9px] font-mono font-bold text-zinc-200 tracking-tight shadow marker-time">
              ${remainingText}
            </div>
          </div>
        `;

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          setSelectedConsensus(markerData);
        });

        const newMarker = new maplibregl.Marker({ element: el })
          .setLngLat([markerData.lng, markerData.lat])
          .addTo(map);

        currentMarkers.set(markerData.id, newMarker);
      }
    });
  }, [consensusMarkers, mapLoaded]);

  // Synchronisation des positions de la Tête, Fin et du Tracé Bleu du Cortège
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    // 1. Tête de cortège
    if (cortegeState.head) {
      if (!cortegeHeadMarkerRef.current) {
        const el = document.createElement("div");
        el.className = "cortege-head-marker cursor-pointer";
        el.innerHTML = `
          <div class="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500 border-2 border-white shadow-xl text-black font-black text-xs">
            <span>🚩</span> Tête
          </div>
        `;
        cortegeHeadMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat([cortegeState.head.lng, cortegeState.head.lat])
          .addTo(map);
      } else {
        cortegeHeadMarkerRef.current.setLngLat([cortegeState.head.lng, cortegeState.head.lat]);
      }
    } else if (cortegeHeadMarkerRef.current) {
      cortegeHeadMarkerRef.current.remove();
      cortegeHeadMarkerRef.current = null;
    }

    // 2. Fin de cortège
    if (cortegeState.tail) {
      if (!cortegeTailMarkerRef.current) {
        const el = document.createElement("div");
        el.className = "cortege-tail-marker cursor-pointer";
        el.innerHTML = `
          <div class="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500 border-2 border-white shadow-xl text-black font-black text-xs">
            <span>🏁</span> Fin
          </div>
        `;
        cortegeTailMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat([cortegeState.tail.lng, cortegeState.tail.lat])
          .addTo(map);
      } else {
        cortegeTailMarkerRef.current.setLngLat([cortegeState.tail.lng, cortegeState.tail.lat]);
      }
    } else if (cortegeTailMarkerRef.current) {
      cortegeTailMarkerRef.current.remove();
      cortegeTailMarkerRef.current = null;
    }

    // 3. Mise à jour dynamique du tracé bleu calqué sur les routes
    const routeSource = map.getSource("official-route-source") as maplibregl.GeoJSONSource | undefined;
    if (routeSource) {
      if (cortegeState.routeCoordinates && cortegeState.routeCoordinates.length >= 2) {
        routeSource.setData({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {
                name: "Parcours Officiel Actualisé",
                description: "Itinéraire dynamique recalculé sur la voirie",
                type: "route",
              },
              geometry: {
                type: "LineString",
                coordinates: cortegeState.routeCoordinates,
              },
            },
          ],
        });
      }
    }
  }, [cortegeState, mapLoaded]);

  // Action : Localisation GPS locale
  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        onUserLocationFound?.({ lat: latitude, lng: longitude });

        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [longitude, latitude],
            zoom: 15.5,
            essential: true,
          });
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn("Erreur géolocalisation:", err.message);
        alert("Impossible d'obtenir votre position GPS (vérifiez les autorisations du navigateur).");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 15000,
      }
    );
  }, [onUserLocationFound]);

  // Action : Recentrer sur le parcours officiel
  const handleRecenterRoute = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: nantesData.center as [number, number],
      zoom: nantesData.defaultZoom,
      essential: true,
    });
  }, []);

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      {/* Conteneur de carte MapLibre */}
      <div
        ref={mapContainerRef}
        className={`w-full h-full ${isMapSelectActive ? "cursor-crosshair" : "cursor-grab"}`}
      />

      {/* Barre de filtres POI minimaliste */}
      <div className="absolute top-16 left-3 right-3 sm:left-4 sm:right-auto z-20 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setPoiCategoryFilter("ALL")}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md transition-all whitespace-nowrap shadow-sm ${
            poiCategoryFilter === "ALL"
              ? "bg-white text-black border-white shadow-md scale-105"
              : "bg-black/80 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700"
          }`}
        >
          Tous ({nantesData.pois.length})
        </button>
        {(["WATER", "PHARMACY", "HOSPITAL", "EMERGENCY", "TOILET"] as POICategory[]).map((cat) => {
          const meta = POI_META[cat];
          const count = nantesData.pois.filter((p) => p.category === cat).length;
          const isActive = poiCategoryFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setPoiCategoryFilter(isActive ? "ALL" : cat)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md transition-all flex items-center gap-1 whitespace-nowrap shadow-sm ${
                isActive
                  ? `${meta.bg} ${meta.text} border-current shadow-md scale-105`
                  : "bg-black/80 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700"
              }`}
            >
              <span>{meta.icon}</span>
              <span>{meta.label}</span>
              <span className="text-[9px] opacity-75 font-mono">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Boutons d'action flottants latéraux (Recentrement, GPS) */}
      <div className="absolute right-3 bottom-28 sm:bottom-24 z-20 flex flex-col gap-2">
        {/* Recentrer sur ma position GPS */}
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          className="p-3 bg-black/90 hover:bg-zinc-900 border border-zinc-700/80 rounded-2xl text-blue-400 shadow-2xl transition-all active:scale-90 flex items-center justify-center min-h-[48px] min-w-[48px]"
          title="Centrer sur ma position GPS"
          aria-label="Recentrer sur ma position"
        >
          <Locate className={`w-5 h-5 ${isLocating ? "animate-spin text-blue-300" : ""}`} />
        </button>

        {/* Recentrer sur le tracé de Nantes */}
        <button
          onClick={handleRecenterRoute}
          className="p-3 bg-black/90 hover:bg-zinc-900 border border-zinc-700/80 rounded-2xl text-cyan-400 shadow-2xl transition-all active:scale-90 flex items-center justify-center min-h-[48px] min-w-[48px]"
          title="Centrer sur le parcours officiel"
          aria-label="Recentrer sur le parcours"
        >
          <Compass className="w-5 h-5" />
        </button>
      </div>

      {/* POI Modal / Detail Card */}
      {selectedPoi && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 sm:inset-auto sm:top-28 sm:left-4 z-40 flex items-end sm:items-start justify-center p-4 bg-black/60 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none"
        >
          <div className="w-full max-w-sm bg-[#101014] border border-zinc-700 rounded-3xl p-4 shadow-2xl text-zinc-100 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between">
              <div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono border ${POI_META[selectedPoi.category]?.badge || "text-cyan-400 border-cyan-500/30"}`}>
                  <span>{POI_META[selectedPoi.category]?.icon}</span>
                  <span>{POI_META[selectedPoi.category]?.label || "Point Utile"}</span>
                </span>
                <h4 className="font-bold text-sm text-white mt-1.5">{selectedPoi.name}</h4>
                <p className="text-xs text-zinc-400 mt-0.5">{selectedPoi.address}</p>
              </div>
              <button
                onClick={() => setSelectedPoi(null)}
                aria-label="Fermer"
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedPoi.emergencyInfo && (
              <div className="mt-3 p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 leading-relaxed">
                {selectedPoi.emergencyInfo}
              </div>
            )}

            <div className="mt-3 flex gap-2">
              {selectedPoi.phone && (
                <a
                  href={`tel:${selectedPoi.phone.replace(/\s+/g, "")}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Appeler ({selectedPoi.phone})
                </a>
              )}
              <button
                onClick={() => {
                  if (mapRef.current) {
                    mapRef.current.flyTo({
                      center: selectedPoi.coordinates as [number, number],
                      zoom: 16.5,
                      essential: true,
                    });
                  }
                  setSelectedPoi(null);
                }}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-xl text-xs font-bold transition-colors border border-zinc-700 flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                Centrer la vue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Consensus Marker Detail Card */}
      {selectedConsensus && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 sm:inset-auto sm:top-20 sm:left-4 z-40 flex items-end sm:items-start justify-center p-4 bg-black/60 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none"
        >
          <div className="w-full max-w-sm bg-[#101014] border border-zinc-700 rounded-3xl p-4 shadow-2xl text-zinc-100 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: REPORT_CATEGORIES[selectedConsensus.category].color }}
                />
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {REPORT_CATEGORIES[selectedConsensus.category].label}
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    Validé par {selectedConsensus.reportCount} signalements citoyens
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedConsensus(null)}
                aria-label="Fermer"
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 mt-3 leading-relaxed">
              {REPORT_CATEGORIES[selectedConsensus.category].description}
            </p>

            <div className="mt-3 p-2 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">Purge automatique dans :</span>
              <span className="font-bold text-amber-400">
                {formatTimeRemaining(Math.max(0, selectedConsensus.expiresAt - Date.now()))}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

