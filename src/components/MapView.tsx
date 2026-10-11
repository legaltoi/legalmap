"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import * as pmtiles from "pmtiles";
import "maplibre-gl/dist/maplibre-gl.css";

import { ConsensusMarker, CortegeState, POI, POICategory, ReportCategory } from "@/types";
import nantesData from "@/config/cities/nantes.json";
import nantesBaseGeoJson from "@/config/cities/nantes-base.json";
import { REPORT_CATEGORIES, CONSENSUS_CONFIG } from "@/config/categories";
import { formatTimeRemaining, calculateHaversineDistance } from "@/lib/geo";
import {
  Locate,
  Compass,
  Phone,
  X,
  Wind,
  Landmark,
  Cctv,
  GraduationCap,
  ExternalLink,
  Check,
} from "lucide-react";
import { useWindData } from "@/hooks/useWindData";
import { WindBadge } from "@/components/weather/WindBadge";
import {
  CARNET_1_MILESTONES,
  CARNET_2_SECTORS,
  TacticalSector,
} from "@/config/data/nantes-carnets";
import { NANTES_LYCEES, LyceeItem } from "@/config/data/nantes-lycees";
import {
  getSundersGeoJson,
  SundersCameraNode,
  getSundersColor,
  getSundersZoneLabel,
  getSundersTypeLabel,
  getSundersMountLabel,
} from "@/lib/sundersGeoJson";
import { analyzeOfficialRoute } from "@/lib/routeAnalyzer";
import { ObservatoryTab } from "@/components/observatory/ObservatoryModal";

const WIND_STORAGE_KEY = "legalmaps_show_wind";
const CAMERAS_STORAGE_KEY = "legalmaps_show_cameras";

/**
 * Grille des points d'observation du vent sur Nantes (coordonnées exactes OSM)
 */
const WIND_GRID_POINTS: [number, number][] = [
  [-1.56213, 47.21349], // Graslin
  [-1.55825, 47.21431], // Royale
  [-1.55830, 47.21330], // Commerce
  [-1.55342, 47.21477], // Bouffay
  [-1.54908, 47.21503], // Miroir d'Eau / Château
  [-1.55543, 47.21790], // 50 Otages
  [-1.55892, 47.21750], // Bretagne
  [-1.55414, 47.22006], // Préfecture
  [-1.55311, 47.21210], // CHU Hôtel-Dieu
  [-1.54207, 47.21757], // Gare Nord
  [-1.55232, 47.22753], // Waldeck-Rousseau
  [-1.55796, 47.21164], // Gloriette / Feydeau
];

/**
 * Génère le GeoJSON des 8 polygones / halos tactiques du Carnet 2
 */
function buildTacticalSectorsGeoJson() {
  return {
    type: "FeatureCollection" as const,
    features: CARNET_2_SECTORS.map((sec) => ({
      type: "Feature" as const,
      properties: {
        id: sec.id,
        name: sec.name,
        shortName: sec.shortName,
        riskLevel: sec.riskLevel,
        color: sec.color,
      },
      geometry: {
        type: "Polygon" as const,
        coordinates: sec.polygon,
      },
    })),
  };
}

export const POI_META: Record<
  POICategory,
  { label: string; icon: string; border: string; bg: string; text: string; badge: string }
> = {
  WATER: {
    label: "Eau",
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
    label: "Soins",
    icon: "🏥",
    border: "border-red-400/80",
    bg: "bg-red-950/85",
    text: "text-red-300",
    badge: "bg-red-500/10 border-red-500/30 text-red-400",
  },
  EMERGENCY: {
    label: "Juridique",
    icon: "⚖️",
    border: "border-purple-400/80",
    bg: "bg-purple-950/85",
    text: "text-purple-300",
    badge: "bg-purple-500/10 border-purple-500/30 text-purple-400",
  },
  TOILET: {
    label: "WC",
    icon: "🚻",
    border: "border-zinc-500/80",
    bg: "bg-zinc-900/90",
    text: "text-zinc-300",
    badge: "bg-zinc-500/10 border-zinc-500/30 text-zinc-400",
  },
};

// Enregistrement du protocole PMTiles natif
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
  onTriggerReport?: (
    category: ReportCategory,
    coords?: { lat: number; lng: number }
  ) => Promise<void>;
  isMapSelectActive?: boolean;
  onUserLocationFound?: (coords: { lat: number; lng: number }) => void;
  isTacticalLayerEnabled?: boolean;
  onToggleTacticalLayer?: () => void;
  onOpenObservatory?: (tab?: ObservatoryTab) => void;
}

export function MapView({
  consensusMarkers,
  cortegeState,
  userLocation,
  onMapClickReport,
  onTriggerReport,
  isMapSelectActive = false,
  onUserLocationFound,
  isTacticalLayerEnabled = false,
  onToggleTacticalLayer,
  onOpenObservatory,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // Stockage des markers DOM
  const consensusMarkersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const cortegeHeadMarkerRef = useRef<maplibregl.Marker | null>(null);
  const cortegeTailMarkerRef = useRef<maplibregl.Marker | null>(null);
  const userLocationMarkerRef = useRef<maplibregl.Marker | null>(null);
  const poiItemsRef = useRef<Map<string, { marker: maplibregl.Marker; category: POICategory }>>(new Map());
  const lyceeMarkersRef = useRef<Map<string, { marker: maplibregl.Marker; lycee: LyceeItem }>>(new Map());
  const tacticalMarkersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const windMarkersRef = useRef<maplibregl.Marker[]>([]);

  const [poiCategoryFilter, setPoiCategoryFilter] = useState<"ALL" | "LYCEE" | POICategory>("ALL");
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [selectedLycee, setSelectedLycee] = useState<LyceeItem | null>(null);
  const [selectedCamera, setSelectedCamera] = useState<SundersCameraNode | null>(null);
  const [selectedConsensus, setSelectedConsensus] = useState<ConsensusMarker | null>(null);
  const [selectedTacticalSector, setSelectedTacticalSector] = useState<TacticalSector | null>(null);
  const [isReportingBlocus, setIsReportingBlocus] = useState(false);
  const [blocusSentToast, setBlocusSentToast] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Analyse prédictive en temps réel du tracé officiel actif (Carnet 2 + Carnet 3)
  const routeAnalysis = React.useMemo(
    () => analyzeOfficialRoute(cortegeState.routeCoordinates),
    [cortegeState.routeCoordinates]
  );

  // Bascule du vent et de la vue Caméras SunderS
  const [isWindEnabled, setIsWindEnabled] = useState(false);
  const [isCamerasEnabled, setIsCamerasEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem(WIND_STORAGE_KEY) === "true") {
        setIsWindEnabled(true);
      }
      if (localStorage.getItem(CAMERAS_STORAGE_KEY) === "true") {
        setIsCamerasEnabled(true);
      }
    } catch {}
  }, []);

  const handleToggleWind = useCallback(() => {
    setIsWindEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(WIND_STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  }, []);

  const handleToggleCameras = useCallback(() => {
    setIsCamerasEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(CAMERAS_STORAGE_KEY, String(next));
      } catch {}
      if (!next) setSelectedCamera(null);
      return next;
    });
  }, []);

  const {
    windData,
    isLoading: isWindLoading,
    refetch: refetchWind,
  } = useWindData({ enabled: isWindEnabled });

  const cortegeStateRef = useRef(cortegeState);
  cortegeStateRef.current = cortegeState;

  const basePath =
    typeof window !== "undefined" && window.location.pathname.startsWith("/legalmap")
      ? "/legalmap"
      : "";
  const pmtilesUrl = `pmtiles://${basePath}/tiles/nantes.pmtiles`;
  const onlineStyleUrl = "https://tiles.openfreemap.org/styles/dark";

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
        paint: { "background-color": "#060608" },
      },
      {
        id: "water-fill",
        type: "fill",
        source: "nantes-offline-base",
        filter: ["==", "class", "water"],
        paint: { "fill-color": "#081321", "fill-opacity": 0.95 },
      },
      {
        id: "water-outline",
        type: "line",
        source: "nantes-offline-base",
        filter: ["==", "class", "water"],
        paint: { "line-color": "#112a45", "line-width": 1.5 },
      },
      {
        id: "park-fill",
        type: "fill",
        source: "nantes-offline-base",
        filter: ["==", "class", "park"],
        paint: { "fill-color": "#07170f", "fill-opacity": 0.8 },
      },
      {
        id: "streets-secondary",
        type: "line",
        source: "nantes-offline-base",
        filter: ["==", "class", "street"],
        paint: { "line-color": "#181824", "line-width": 2.5 },
      },
      {
        id: "streets-primary",
        type: "line",
        source: "nantes-offline-base",
        filter: ["==", "class", "primary"],
        paint: { "line-color": "#252538", "line-width": 4.5 },
      },
      {
        id: "pmtiles-streets-layer",
        type: "line",
        source: "nantes-pmtiles",
        "source-layer": "streets",
        paint: { "line-color": "#1f1f2e", "line-width": 2 },
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

    map.addControl(
      new maplibregl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true,
      }),
      "top-right"
    );

    map.addControl(
      new maplibregl.ScaleControl({ maxWidth: 100, unit: "metric" }),
      "bottom-left"
    );

    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-right"
    );

    let hasFallenBack = false;
    map.on("error", (e) => {
      if (
        !hasFallenBack &&
        (e.error?.message?.includes("Failed to fetch") ||
          e.error?.message?.includes("NetworkError") ||
          (e as any).status === 404)
      ) {
        hasFallenBack = true;
        map.setStyle(offlineDarkStyle);
      }
    });

    map.on("styleimagemissing", (e) => {
      try {
        if (!map.hasImage(e.id)) {
          map.addImage(e.id, {
            width: 1,
            height: 1,
            data: new Uint8Array([0, 0, 0, 0]),
          });
        }
      } catch {}
    });

    const triggerResize = () => {
      if (map) map.resize();
    };

    const attachLayersAndPois = () => {
      setMapLoaded(true);
      triggerResize();

      // 1. Source du parcours officiel
      const dynamicRoute = cortegeStateRef.current?.routeCoordinates;
      const initialRouteData =
        dynamicRoute && dynamicRoute.length >= 2
          ? {
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  properties: { name: "Parcours Officiel Actualisé", type: "route" },
                  geometry: { type: "LineString", coordinates: dynamicRoute },
                },
              ],
            }
          : (nantesData.officialRoute as any);

      if (!map.getSource("official-route-source")) {
        map.addSource("official-route-source", {
          type: "geojson",
          data: initialRouteData,
        });
      }

      if (!map.getLayer("route-halo")) {
        map.addLayer({
          id: "route-halo",
          type: "line",
          source: "official-route-source",
          filter: ["==", "$type", "LineString"],
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": "#06b6d4",
            "line-width": 10,
            "line-opacity": 0.35,
            "line-blur": 4,
          },
        });
      }

      if (!map.getLayer("route-main")) {
        map.addLayer({
          id: "route-main",
          type: "line",
          source: "official-route-source",
          filter: ["==", "$type", "LineString"],
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": "#22d3ee",
            "line-width": 4.5,
          },
        });
      }

      // 2. Calque « Topographie Tactique & Mémoire des Lieux » (Carnet 2 : 8 zones)
      if (!map.getSource("tactical-sectors-source")) {
        map.addSource("tactical-sectors-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        map.addLayer({
          id: "tactical-sectors-fill",
          type: "fill",
          source: "tactical-sectors-source",
          paint: {
            "fill-color": ["get", "color"],
            "fill-opacity": 0.16,
          },
        });

        map.addLayer({
          id: "tactical-sectors-outline",
          type: "line",
          source: "tactical-sectors-source",
          paint: {
            "line-color": ["get", "color"],
            "line-width": 2,
            "line-opacity": 0.8,
            "line-dasharray": [3, 2],
          },
        });
      }

      // 3. Calques « Caméras de Surveillance SunderS / OpenStreetMap » (Cônes Leaflet-Semicircle + Nœuds)
      if (!map.getSource("sunders-cones-source")) {
        map.addSource("sunders-cones-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        map.addLayer({
          id: "sunders-cones-fill",
          type: "fill",
          source: "sunders-cones-source",
          paint: {
            "fill-color": ["get", "color"],
            "fill-opacity": 0.14,
          },
        });

        map.addLayer({
          id: "sunders-cones-outline",
          type: "line",
          source: "sunders-cones-source",
          paint: {
            "line-color": ["get", "color"],
            "line-width": 1,
            "line-opacity": 0.45,
          },
        });
      }

      if (!map.getSource("sunders-points-source")) {
        map.addSource("sunders-points-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        map.addLayer({
          id: "sunders-cameras-circle",
          type: "circle",
          source: "sunders-points-source",
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              12,
              2.5,
              15,
              4.8,
              17,
              7,
            ],
            "circle-color": ["get", "color"],
            "circle-stroke-width": 1.2,
            "circle-stroke-color": "#09090b",
            "circle-opacity": 0.9,
          },
        });
      }

      // 4. Création des POIs statiques (Eau, Pharmacie, Soins, Juridique, WC)
      if (poiItemsRef.current.size === 0) {
        nantesData.pois.forEach((poi) => {
          const cat = poi.category as POICategory;
          const meta = POI_META[cat] || POI_META.WATER;

          const el = document.createElement("div");
          el.className =
            "poi-marker cursor-pointer group transition-transform duration-150 hover:scale-125 z-10 hover:z-30";
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

      // 5. Création des 26 Lycées de Nantes (Signalement Blocus au bout de 5 users)
      if (lyceeMarkersRef.current.size === 0) {
        NANTES_LYCEES.forEach((lycee) => {
          const el = document.createElement("div");
          el.className =
            "lycee-marker cursor-pointer group transition-transform duration-150 hover:scale-115 z-15 hover:z-30";
          el.setAttribute("title", `${lycee.name} (${lycee.district})`);

          el.innerHTML = `
            <div class="w-7 h-7 rounded-full border border-orange-400/75 bg-orange-950/90 flex items-center justify-center shadow-md backdrop-blur-sm text-xs select-none hover:border-white transition-colors">
              🎓
            </div>
          `;

          el.addEventListener("click", (e) => {
            e.stopPropagation();
            setSelectedLycee(lycee);
          });

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat(lycee.coordinates)
            .addTo(map);

          lyceeMarkersRef.current.set(lycee.id, { marker, lycee });
        });
      }
    };

    map.on("load", attachLayersAndPois);
    map.on("styledata", attachLayersAndPois);

    // Interaction au clic sur un nœud de caméra SunderS
    map.on("click", "sunders-cameras-circle", (e) => {
      if (!e.features || e.features.length === 0) return;
      const props = e.features[0].properties;
      if (!props) return;
      setSelectedCamera({
        id: String(props.id),
        lat: Number(props.lat),
        lon: Number(props.lon),
        type: props.type || undefined,
        zone: props.zone !== "unknown" ? props.zone : undefined,
        mount: props.mount || undefined,
        dir: props.dir >= 0 ? Number(props.dir) : undefined,
        op: props.op || undefined,
      });
    });

    map.on("mouseenter", "sunders-cameras-circle", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "sunders-cameras-circle", () => {
      map.getCanvas().style.cursor = "";
    });

    // Clic sur la carte (mode pointage manuel)
    map.on("click", (e) => {
      if (onMapClickReport) {
        onMapClickReport({
          lat: e.lngLat.lat,
          lng: e.lngLat.lng,
        });
      }
    });

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
      lyceeMarkersRef.current.forEach(({ marker }) => marker.remove());
      lyceeMarkersRef.current.clear();
      tacticalMarkersRef.current.forEach((m) => m.remove());
      tacticalMarkersRef.current.clear();
      windMarkersRef.current.forEach((m) => m.remove());
      windMarkersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Écoute des événements de navigation
  useEffect(() => {
    const handleFocusSector = (e: Event) => {
      const custom = e as CustomEvent<TacticalSector>;
      const sector = custom.detail;
      if (!sector || !mapRef.current) return;
      mapRef.current.flyTo({
        center: sector.coordinates,
        zoom: 15.8,
        essential: true,
      });
      setSelectedTacticalSector(sector);
    };

    const handleFocusCoords = (e: Event) => {
      const custom = e as CustomEvent<{ coords: [number, number]; zoom?: number }>;
      if (!custom.detail?.coords || !mapRef.current) return;
      mapRef.current.flyTo({
        center: custom.detail.coords,
        zoom: custom.detail.zoom ?? 16,
        essential: true,
      });
    };

    const handleRecenterNantes = () => {
      if (!mapRef.current) return;
      mapRef.current.flyTo({
        center: nantesData.center as [number, number],
        zoom: nantesData.defaultZoom,
        essential: true,
      });
    };

    window.addEventListener("focus-tactical-sector", handleFocusSector);
    window.addEventListener("focus-map-coords", handleFocusCoords);
    window.addEventListener("recenter-nantes", handleRecenterNantes);
    return () => {
      window.removeEventListener("focus-tactical-sector", handleFocusSector);
      window.removeEventListener("focus-map-coords", handleFocusCoords);
      window.removeEventListener("recenter-nantes", handleRecenterNantes);
    };
  }, []);

  // Synchronisation du Calque « Caméras de Surveillance SunderS »
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;
    const pointsSource = map.getSource("sunders-points-source") as
      | maplibregl.GeoJSONSource
      | undefined;
    const conesSource = map.getSource("sunders-cones-source") as
      | maplibregl.GeoJSONSource
      | undefined;

    if (isCamerasEnabled) {
      const { pointsGeoJson, conesGeoJson } = getSundersGeoJson();
      if (pointsSource) pointsSource.setData(pointsGeoJson);
      if (conesSource) conesSource.setData(conesGeoJson);
    } else {
      const empty = { type: "FeatureCollection", features: [] } as any;
      if (pointsSource) pointsSource.setData(empty);
      if (conesSource) conesSource.setData(empty);
    }
  }, [isCamerasEnabled, mapLoaded]);

  // Synchronisation du Calque « Topographie Tactique & Mémoire des Lieux »
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;
    const source = map.getSource("tactical-sectors-source") as
      | maplibregl.GeoJSONSource
      | undefined;

    if (isTacticalLayerEnabled) {
      if (source) {
        source.setData(buildTacticalSectorsGeoJson() as any);
      }

      if (tacticalMarkersRef.current.size === 0) {
        CARNET_2_SECTORS.forEach((sec) => {
          const el = document.createElement("div");
          el.className = "tactical-sector-marker cursor-pointer z-20";
          el.innerHTML = `
            <div class="group transition-transform duration-150 hover:scale-110">
              <div class="px-2 py-0.5 rounded-full bg-black/90 backdrop-blur-md border shadow-lg flex items-center gap-1 text-[10px] font-bold text-white whitespace-nowrap" style="border-color: ${sec.color}; box-shadow: 0 0 10px ${sec.color}44;">
                <span>${sec.icon}</span>
                <span>${sec.shortName}</span>
                <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${sec.color};"></span>
              </div>
            </div>
          `;

          el.addEventListener("click", (e) => {
            e.stopPropagation();
            setSelectedTacticalSector(sec);
            map.flyTo({
              center: sec.coordinates,
              zoom: Math.max(map.getZoom(), 15.3),
              essential: true,
            });
          });

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat(sec.coordinates)
            .addTo(map);
          tacticalMarkersRef.current.set(sec.id, marker);
        });
      }
    } else {
      if (source) {
        source.setData({ type: "FeatureCollection", features: [] } as any);
      }
      tacticalMarkersRef.current.forEach((m) => m.remove());
      tacticalMarkersRef.current.clear();
    }
  }, [isTacticalLayerEnabled, mapLoaded]);

  // Filtrage dynamique des POIs et des Lycées sur la carte
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    poiItemsRef.current.forEach(({ marker, category }) => {
      const isVisible = poiCategoryFilter === "ALL" || poiCategoryFilter === category;
      const el = marker.getElement();
      if (el) {
        el.style.display = isVisible ? "block" : "none";
      }
    });

    lyceeMarkersRef.current.forEach(({ marker }) => {
      const isVisible = poiCategoryFilter === "ALL" || poiCategoryFilter === "LYCEE";
      const el = marker.getElement();
      if (el) {
        el.style.display = isVisible ? "block" : "none";
      }
    });
  }, [poiCategoryFilter, mapLoaded]);

  // Détection & mise à jour du pointeur GPS utilisateur
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

  // Synchronisation des aiguilles de vent SVG minimalistes et discrètes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    // Nettoyage des anciennes aiguilles
    windMarkersRef.current.forEach((m) => m.remove());
    windMarkersRef.current = [];

    if (isWindEnabled && windData) {
      const deg = windData.blowToDeg;
      WIND_GRID_POINTS.forEach((coords, idx) => {
        const el = document.createElement("div");
        el.className = "wind-minimal-marker pointer-events-none select-none";
        // SVG ultra-fin et discret : ligne dégradée + pointe chevron fine
        el.innerHTML = `
          <div style="transform: rotate(${deg}deg); opacity: 0.52;" class="transition-transform duration-700">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <defs>
                <linearGradient id="wgrad-${idx}" x1="13" y1="23" x2="13" y2="3" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#67e8f9" stop-opacity="0.05"/>
                  <stop offset="65%" stop-color="#67e8f9" stop-opacity="0.65"/>
                  <stop offset="100%" stop-color="#ecfeff" stop-opacity="0.95"/>
                </linearGradient>
              </defs>
              <line x1="13" y1="22" x2="13" y2="4" stroke="url(#wgrad-${idx})" stroke-width="1.25" stroke-linecap="round"/>
              <path d="M9.8 7.5L13 3.5L16.2 7.5" stroke="#a5f3fc" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="0.9"/>
            </svg>
          </div>
        `;

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(coords)
          .addTo(map);
        windMarkersRef.current.push(marker);
      });
    }
  }, [isWindEnabled, windData, mapLoaded]);

  // Mise à jour de l'état de Blocus des Lycées sur la carte (visible en BLOCUS dès 5 signalements users)
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const blocusClusters = consensusMarkers.filter(
      (m) => m.category === "BLOCUS_LYCEE"
    );
    const showNameLabels = poiCategoryFilter === "LYCEE";

    lyceeMarkersRef.current.forEach(({ marker, lycee }) => {
      const el = marker.getElement();
      if (!el) return;

      const match = blocusClusters.find(
        (m) =>
          calculateHaversineDistance(
            lycee.coordinates[1],
            lycee.coordinates[0],
            m.lat,
            m.lng
          ) <= 180
      );

      const count = match ? match.reportCount : 0;
      const isBlocusActive = count >= CONSENSUS_CONFIG.BLOCUS_REPORTS_THRESHOLD;

      if (isBlocusActive) {
        // Dès 5 signalements utilisateurs : le Blocus du lycée s'affiche clairement sur la carte
        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <div class="absolute -inset-1 rounded-full bg-orange-500/35 animate-ping"></div>
            <div class="lycee-pill relative z-10 px-2.5 py-1 rounded-full border-2 border-orange-400 bg-orange-950/95 flex items-center gap-1.5 shadow-xl text-[11px] font-black text-white select-none whitespace-nowrap" style="box-shadow: 0 0 14px rgba(249,115,22,0.55);">
              <span>🚧</span>
              <span>${lycee.shortName}</span>
              <span class="px-1.5 py-0.2 rounded-full bg-orange-500 text-black text-[9px] font-mono font-black">BLOCUS (${count})</span>
            </div>
          </div>
        `;
      } else if (showNameLabels) {
        // Vue filtrée « Lycées » : affiche le nom court de chaque établissement
        el.innerHTML = `
          <div class="lycee-pill px-2.5 py-1 rounded-full border border-orange-400/70 bg-zinc-950/95 flex items-center gap-1.5 shadow-lg text-[11px] font-bold text-orange-200 select-none hover:border-orange-300 transition-all whitespace-nowrap">
            <span>🎓</span>
            <span>${lycee.shortName}</span>
          </div>
        `;
      } else {
        // Vue « Tous » : pastille circulaire épurée pour garder la carte aérée sur mobile
        el.innerHTML = `
          <div class="w-7 h-7 rounded-full border border-orange-400/75 bg-orange-950/90 flex items-center justify-center shadow-md backdrop-blur-sm text-xs select-none hover:border-white transition-colors">
            🎓
          </div>
        `;
      }
    });
  }, [consensusMarkers, poiCategoryFilter, mapLoaded]);

  // Synchronisation des marqueurs de consensus de rue (hors BLOCUS_LYCEE qui est porté par chaque lycée)
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;
    const currentMarkers = consensusMarkersRef.current;

    const streetMarkers = consensusMarkers.filter(
      (m) => m.category !== "BLOCUS_LYCEE"
    );
    const activeIds = new Set(streetMarkers.map((m) => m.id));

    for (const [id, marker] of currentMarkers.entries()) {
      if (!activeIds.has(id)) {
        marker.remove();
        currentMarkers.delete(id);
      }
    }

    streetMarkers.forEach((markerData) => {
      const meta = REPORT_CATEGORIES[markerData.category];
      const remainingMs = Math.max(0, markerData.expiresAt - Date.now());
      const remainingText = markerData.isPending
        ? "1/2"
        : formatTimeRemaining(remainingMs);
      const isPending = Boolean(markerData.isPending);
      const isGas = markerData.category === "ZONE_GAZ";

      // Halo de dérive sous le vent minimaliste et doux pour le gaz
      const gasConeHtml =
        isGas && isWindEnabled && windData
          ? `<div class="gas-drift-cone absolute pointer-events-none" style="transform: rotate(${windData.blowToDeg}deg); transform-origin: 20px 20px; width: 56px; height: 56px; top: -8px; left: -8px; z-index: -1;">
              <svg viewBox="0 0 56 56" width="56" height="56" fill="none">
                <defs>
                  <linearGradient id="gasGrad-${markerData.id}" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.55"/>
                    <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M 28 28 L 17 3 A 26 26 0 0 1 39 3 Z" fill="url(#gasGrad-${markerData.id})" />
              </svg>
            </div>`
          : "";

      if (currentMarkers.has(markerData.id)) {
        const marker = currentMarkers.get(markerData.id)!;
        marker.setLngLat([markerData.lng, markerData.lat]);

        const el = marker.getElement();
        const badgeEl = el.querySelector(".marker-badge");
        const timeEl = el.querySelector(".marker-time");
        if (badgeEl) badgeEl.textContent = isPending ? "1/2" : `x${markerData.reportCount}`;
        if (timeEl) timeEl.textContent = remainingText;

        const existingCone = el.querySelector(".gas-drift-cone");
        if (existingCone && (!isWindEnabled || !windData)) {
          existingCone.remove();
        } else if (!existingCone && isGas && isWindEnabled && windData) {
          const container = el.querySelector(".relative");
          if (container) {
            container.insertAdjacentHTML("afterbegin", gasConeHtml);
          }
        }
      } else {
        const el = document.createElement("div");
        el.className = "consensus-marker cursor-pointer";
        const pingAnimation = isPending ? "animate-pulse opacity-25" : "animate-ping opacity-35";
        const borderClass = isPending ? "border-dashed opacity-85" : "border-solid";

        el.innerHTML = `
          <div class="relative flex flex-col items-center group">
            ${gasConeHtml}
            <div class="w-9 h-9 rounded-full flex items-center justify-center border-2 ${borderClass} shadow-xl relative" style="background-color: ${meta.badgeBg}; border-color: ${meta.borderColor};">
              <div class="w-11 h-11 rounded-full absolute -inset-1 ${pingAnimation}" style="background-color: ${meta.color};"></div>
              <span class="text-[11px] font-black text-white relative z-10 marker-badge">${isPending ? "1/2" : `x${markerData.reportCount}`}</span>
            </div>
            <div class="mt-0.5 px-1.5 py-0.2 rounded bg-black/85 border border-zinc-800 text-[9px] font-mono text-zinc-300 marker-time">
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
  }, [consensusMarkers, mapLoaded, isWindEnabled, windData]);

  // Synchronisation de la Tête, Fin et du Tracé Bleu du Cortège
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

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

    const routeSource = map.getSource("official-route-source") as maplibregl.GeoJSONSource | undefined;
    if (routeSource && cortegeState.routeCoordinates && cortegeState.routeCoordinates.length >= 2) {
      routeSource.setData({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { name: "Parcours Officiel Actualisé", type: "route" },
            geometry: { type: "LineString", coordinates: cortegeState.routeCoordinates },
          },
        ],
      });
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
      () => {
        setIsLocating(false);
        alert("Impossible d'obtenir votre position GPS.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 }
    );
  }, [onUserLocationFound]);

  const handleRecenterRoute = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: nantesData.center as [number, number],
      zoom: nantesData.defaultZoom,
      essential: true,
    });
  }, []);

  // Nombre de signalements actuels sur le lycée sélectionné
  const selectedLyceeReportCount = React.useMemo(() => {
    if (!selectedLycee) return 0;
    const match = consensusMarkers.find(
      (m) =>
        m.category === "BLOCUS_LYCEE" &&
        calculateHaversineDistance(
          selectedLycee.coordinates[1],
          selectedLycee.coordinates[0],
          m.lat,
          m.lng
        ) <= 180
    );
    return match ? match.reportCount : 0;
  }, [selectedLycee, consensusMarkers]);

  // Nombre total de lycées actuellement en Blocus validé (>= 5 signalements)
  const activeBlocusLyceesCount = React.useMemo(() => {
    return NANTES_LYCEES.filter((lyc) =>
      consensusMarkers.some(
        (m) =>
          m.category === "BLOCUS_LYCEE" &&
          m.reportCount >= CONSENSUS_CONFIG.BLOCUS_REPORTS_THRESHOLD &&
          calculateHaversineDistance(
            lyc.coordinates[1],
            lyc.coordinates[0],
            m.lat,
            m.lng
          ) <= 180
      )
    ).length;
  }, [consensusMarkers]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      {/* Conteneur de carte MapLibre */}
      <div
        ref={mapContainerRef}
        className={`w-full h-full ${isMapSelectActive ? "cursor-crosshair" : "cursor-grab"}`}
      />

      {/* Badge HUD Vent & Direction en temps réel */}
      {isWindEnabled && (
        <WindBadge
          windData={windData}
          isLoading={isWindLoading}
          onRefresh={refetchWind}
          onClose={handleToggleWind}
        />
      )}

      {/* Barre de filtres aérée et bien positionnée sous l'en-tête (zéro superposition) */}
      <div
        className="absolute left-0 right-0 z-20 flex items-center gap-2 overflow-x-auto no-scrollbar px-2.5 sm:px-4 py-1.5"
        style={{ top: "calc(max(8px, env(safe-area-inset-top, 8px)) + 60px)" }}
      >
        <button
          onClick={() => setPoiCategoryFilter("ALL")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md transition-all whitespace-nowrap shadow-md min-h-[34px] flex items-center ${
            poiCategoryFilter === "ALL"
              ? "bg-white text-black border-white"
              : "bg-black/90 text-zinc-200 border-zinc-700/80 hover:text-white"
          }`}
        >
          Tous
        </button>

        {/* Filtre Lycées & Blocus */}
        <button
          onClick={() =>
            setPoiCategoryFilter(poiCategoryFilter === "LYCEE" ? "ALL" : "LYCEE")
          }
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md transition-all flex items-center gap-1.5 whitespace-nowrap shadow-md min-h-[34px] ${
            poiCategoryFilter === "LYCEE"
              ? "bg-orange-950 text-orange-200 border-orange-400"
              : activeBlocusLyceesCount > 0
              ? "bg-orange-950/90 text-orange-200 border-orange-500 animate-pulse"
              : "bg-black/90 text-zinc-200 border-zinc-700/80 hover:text-orange-300"
          }`}
        >
          <span>🎓</span>
          <span>Lycées</span>
          <span className="text-[10px] font-mono opacity-85">
            {activeBlocusLyceesCount > 0
              ? `(${activeBlocusLyceesCount} blocus)`
              : `(${NANTES_LYCEES.length})`}
          </span>
        </button>

        {/* Vue Caméras de Surveillance SunderS / OSM */}
        <button
          onClick={handleToggleCameras}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md transition-all flex items-center gap-1.5 whitespace-nowrap shadow-md min-h-[34px] ${
            isCamerasEnabled
              ? "bg-rose-950 text-rose-200 border-rose-400 ring-1 ring-rose-500/40"
              : "bg-black/90 text-zinc-200 border-zinc-700/80 hover:text-rose-300"
          }`}
          title="Afficher/Masquer les caméras de surveillance (SunderS / OpenStreetMap)"
        >
          <span>📹</span>
          <span>Caméras</span>
        </button>

        {(["WATER", "PHARMACY", "HOSPITAL", "EMERGENCY", "TOILET"] as POICategory[]).map((cat) => {
          const meta = POI_META[cat];
          const isActive = poiCategoryFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setPoiCategoryFilter(isActive ? "ALL" : cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md transition-all flex items-center gap-1.5 whitespace-nowrap shadow-md min-h-[34px] ${
                isActive
                  ? `${meta.bg} ${meta.text} border-current`
                  : "bg-black/90 text-zinc-200 border-zinc-700/80 hover:text-white"
              }`}
            >
              <span>{meta.icon}</span>
              <span>{meta.label}</span>
            </button>
          );
        })}

        {/* Analyseur Prédictif de Parcours */}
        {onOpenObservatory && (
          <button
            onClick={() => onOpenObservatory("route")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md transition-all flex items-center gap-1.5 whitespace-nowrap shadow-md min-h-[34px] ${
              routeAnalysis.globalVigilanceLevel === "CRITIQUE"
                ? "bg-red-950/95 text-red-200 border-red-500/60"
                : routeAnalysis.globalVigilanceLevel === "ÉLEVÉE"
                ? "bg-amber-950/95 text-amber-200 border-amber-500/60"
                : "bg-indigo-950/95 text-indigo-200 border-indigo-500/60"
            }`}
          >
            <span>🛡️</span>
            <span>Parcours ({routeAnalysis.traversedSectors.length})</span>
          </button>
        )}
      </div>

      {/* Boutons d'action flottants latéraux (Caméras SunderS, Zones, Vent, GPS, Recentrement) */}
      <div className="absolute right-2.5 sm:right-4 bottom-[104px] sm:bottom-28 z-20 flex flex-col gap-2.5">
        {/* Bascule Caméras SunderS / OSM */}
        <button
          onClick={handleToggleCameras}
          className={`w-11 h-11 rounded-2xl border shadow-2xl transition-all active:scale-90 flex items-center justify-center ${
            isCamerasEnabled
              ? "bg-rose-500/25 border-rose-400 text-rose-200 ring-2 ring-rose-500/40"
              : "bg-black/90 hover:bg-zinc-900 border-zinc-700/90 text-zinc-300 hover:text-rose-300"
          }`}
          title={
            isCamerasEnabled
              ? "Masquer les caméras de surveillance (SunderS)"
              : "Afficher les caméras de surveillance (SunderS / OpenStreetMap)"
          }
          aria-label="Bascule caméras de surveillance SunderS"
        >
          <Cctv className="w-5 h-5" />
        </button>

        {/* Bascule 8 Zones Tactiques */}
        {onToggleTacticalLayer && (
          <button
            onClick={onToggleTacticalLayer}
            className={`w-11 h-11 rounded-2xl border shadow-2xl transition-all active:scale-90 flex items-center justify-center ${
              isTacticalLayerEnabled
                ? "bg-amber-500/25 border-amber-400 text-amber-200 ring-2 ring-amber-500/40"
                : "bg-black/90 hover:bg-zinc-900 border-zinc-700/90 text-amber-300/90 hover:text-amber-200"
            }`}
            title="Afficher/Masquer les 8 zones tactiques"
            aria-label="Bascule zones tactiques"
          >
            <Landmark className="w-5 h-5" />
          </button>
        )}

        {/* Bascule Vent */}
        <button
          onClick={handleToggleWind}
          className={`w-11 h-11 rounded-2xl border shadow-2xl transition-all active:scale-90 flex items-center justify-center ${
            isWindEnabled
              ? "bg-cyan-500/25 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/40"
              : "bg-black/90 hover:bg-zinc-900 border-zinc-700/90 text-zinc-300 hover:text-white"
          }`}
          title="Afficher/Masquer le vent"
          aria-label="Bascule vent"
        >
          <Wind className="w-5 h-5" />
        </button>

        {/* Position GPS */}
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          className="w-11 h-11 bg-black/90 hover:bg-zinc-900 border border-zinc-700/90 rounded-2xl text-blue-400 shadow-2xl transition-all active:scale-90 flex items-center justify-center"
          title="Centrer sur ma position GPS"
          aria-label="Recentrer sur ma position"
        >
          <Locate className={`w-5 h-5 ${isLocating ? "animate-spin text-blue-300" : ""}`} />
        </button>

        {/* Recentrer sur Nantes */}
        <button
          onClick={handleRecenterRoute}
          className="w-11 h-11 bg-black/90 hover:bg-zinc-900 border border-zinc-700/90 rounded-2xl text-cyan-400 shadow-2xl transition-all active:scale-90 flex items-center justify-center"
          title="Centrer sur le parcours officiel"
          aria-label="Recentrer sur le parcours"
        >
          <Compass className="w-5 h-5" />
        </button>
      </div>

      {/* Bandeau Légende & Crédits SunderS quand la vue Caméras est active */}
      {isCamerasEnabled && !selectedCamera && (
        <div className="absolute bottom-[104px] left-2.5 right-16 sm:right-auto sm:max-w-xs z-20 pointer-events-auto bg-black/90 backdrop-blur-md border border-zinc-800 rounded-2xl px-3 py-2 shadow-xl text-[11px] text-zinc-200 space-y-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="font-bold text-white flex items-center gap-1">
              📹 Caméras SunderS
            </span>
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Public
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Ext.
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Int.
              </span>
            </div>
          </div>
          <div className="text-[10px] text-zinc-400 leading-tight">
            <a
              href="https://sunders.hamburg.ccc.de/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-300 underline hover:text-white"
            >
              CCCHH SunderS mirror
            </a>{" "}
            • osmcamera • © OpenStreetMap ODbL
          </div>
        </div>
      )}

      {/* Fiche Lycée & Signalement de Blocus (Consensus 5 signalements users) */}
      {selectedLycee && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 sm:inset-auto sm:top-28 sm:left-4 z-40 flex items-end sm:items-start justify-center p-3 sm:p-0 bg-black/60 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none"
        >
          <div className="w-full max-w-sm bg-[#0b0b0f] border border-zinc-700 rounded-3xl p-4 shadow-2xl text-zinc-100 animate-in fade-in slide-in-from-bottom-2 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-orange-500/15 text-orange-300 border border-orange-500/30">
                    🎓 Lycée {selectedLycee.type} • {selectedLycee.district}
                  </span>
                </div>
                <h4 className="font-black text-sm text-white mt-1.5">
                  {selectedLycee.name}
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">{selectedLycee.address}</p>
              </div>
              <button
                onClick={() => setSelectedLycee(null)}
                aria-label="Fermer"
                className="p-1 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Jauge de consensus à 5 signalements */}
            <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-200">
                  {selectedLyceeReportCount >= CONSENSUS_CONFIG.BLOCUS_REPORTS_THRESHOLD
                    ? "🔥 Blocus en cours (Validé)"
                    : "État du blocus"}
                </span>
                <span className="font-mono font-black text-orange-400">
                  {selectedLyceeReportCount} / {CONSENSUS_CONFIG.BLOCUS_REPORTS_THRESHOLD} signalements
                </span>
              </div>

              {/* 5 segments visuels */}
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    className={`h-2 rounded-full transition-all ${
                      selectedLyceeReportCount >= step
                        ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"
                        : "bg-zinc-800"
                    }`}
                  />
                ))}
              </div>

              <p className="text-[10px] text-zinc-400">
                Le blocus s&apos;affiche publiquement sur la carte à partir de{" "}
                <strong className="text-zinc-200">5 signalements citoyens</strong>.
              </p>
            </div>

            {blocusSentToast && (
              <div className="px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                Signalement de blocus envoyé !
              </div>
            )}

            <div className="flex gap-2">
              {onTriggerReport && (
                <button
                  disabled={isReportingBlocus}
                  onClick={async () => {
                    setIsReportingBlocus(true);
                    try {
                      await onTriggerReport("BLOCUS_LYCEE", {
                        lat: selectedLycee.coordinates[1],
                        lng: selectedLycee.coordinates[0],
                      });
                      setBlocusSentToast(true);
                      setTimeout(() => setBlocusSentToast(false), 2500);
                    } finally {
                      setIsReportingBlocus(false);
                    }
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <GraduationCap className="w-4 h-4" />
                  {isReportingBlocus ? "Envoi..." : "🚧 Signaler un blocus ici"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fiche Caméra de Surveillance (SunderS / OpenStreetMap) */}
      {selectedCamera && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 sm:inset-auto sm:top-28 sm:left-4 z-40 flex items-end sm:items-start justify-center p-3 sm:p-0 bg-black/60 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none"
        >
          <div className="w-full max-w-sm bg-[#0b0b0f] border border-zinc-700 rounded-3xl p-4 shadow-2xl text-zinc-100 animate-in fade-in slide-in-from-bottom-2 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border"
                  style={{
                    backgroundColor: `${getSundersColor(selectedCamera.zone)}20`,
                    color: getSundersColor(selectedCamera.zone),
                    borderColor: `${getSundersColor(selectedCamera.zone)}50`,
                  }}
                >
                  📹 {getSundersZoneLabel(selectedCamera.zone)}
                </span>
                <h4 className="font-black text-sm text-white mt-1.5">
                  {getSundersTypeLabel(selectedCamera.type)}
                </h4>
                <p className="text-[10px] font-mono text-zinc-400">
                  Nœud OSM #{selectedCamera.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedCamera(null)}
                aria-label="Fermer"
                className="p-1 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800">
                <div className="text-[9px] font-mono text-zinc-500 uppercase">Support</div>
                <div className="font-bold text-zinc-200 mt-0.5">
                  {getSundersMountLabel(selectedCamera.mount)}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800">
                <div className="text-[9px] font-mono text-zinc-500 uppercase">Angle / Azimut</div>
                <div className="font-bold text-zinc-200 mt-0.5">
                  {selectedCamera.dir !== undefined
                    ? `${selectedCamera.dir}°`
                    : selectedCamera.type === "dome"
                    ? "360° (Dôme)"
                    : "Non spécifié"}
                </div>
              </div>
            </div>

            {selectedCamera.op && (
              <div className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-[11px] text-zinc-300">
                <span className="text-zinc-500 font-mono text-[10px]">Opérateur : </span>
                <span className="font-bold text-white">{selectedCamera.op}</span>
              </div>
            )}

            <div className="pt-1 flex items-center justify-between gap-2 text-[10px] text-zinc-500">
              <span>CCCHH SunderS • osmcamera • ODbL</span>
              <a
                href={`https://www.openstreetmap.org/node/${selectedCamera.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold flex items-center gap-1"
              >
                <span>Fiche OSM</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Fiche Minimaliste d'un Secteur Tactique */}
      {selectedTacticalSector && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 sm:inset-auto sm:top-28 sm:left-4 z-40 flex items-end sm:items-start justify-center p-3 sm:p-0 bg-black/60 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none"
        >
          <div className="w-full max-w-sm bg-[#0b0b0f] border border-zinc-700 rounded-3xl p-4 shadow-2xl text-zinc-100 animate-in fade-in slide-in-from-bottom-2 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border"
                  style={{
                    backgroundColor: `${selectedTacticalSector.color}20`,
                    color: selectedTacticalSector.color,
                    borderColor: `${selectedTacticalSector.color}50`,
                  }}
                >
                  {selectedTacticalSector.icon} {selectedTacticalSector.riskLevel} •{" "}
                  {selectedTacticalSector.tacticalType}
                </span>
                <h4 className="font-black text-sm text-white mt-1">
                  {selectedTacticalSector.name}
                </h4>
              </div>
              <button
                onClick={() => setSelectedTacticalSector(null)}
                aria-label="Fermer"
                className="p-1 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0">⚠️</span>
                <span className="text-zinc-200">{selectedTacticalSector.weaponsAndRisks[0]}</span>
              </div>
              <div className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-start gap-2">
                <span className="text-indigo-400 font-bold shrink-0">🛡️</span>
                <span className="text-zinc-300">{selectedTacticalSector.policeDeployment[0]}</span>
              </div>
              <div className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">🏥</span>
                <span className="text-zinc-300">{selectedTacticalSector.medicalAndLegalSupport[0]}</span>
              </div>

              {CARNET_1_MILESTONES.filter(
                (m) =>
                  m.sectorId === selectedTacticalSector.id ||
                  selectedTacticalSector.linkedEvents.includes(m.id)
              )
                .slice(0, 2)
                .map((evt) => (
                  <div
                    key={evt.id}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-950/25 border border-amber-500/30 flex items-center justify-between gap-2 text-[10px]"
                  >
                    <span className="font-mono font-bold text-amber-300 shrink-0">
                      📜 {evt.dateFormatted}
                    </span>
                    <span className="text-zinc-300 truncate">{evt.medicalToll}</span>
                  </div>
                ))}
            </div>

            <div className="pt-1 flex items-center justify-between gap-2">
              <span className="text-[10px] text-zinc-500 truncate">
                {selectedTacticalSector.roleAndLegal[0]}
              </span>
              {onOpenObservatory && (
                <button
                  onClick={() => {
                    setSelectedTacticalSector(null);
                    onOpenObservatory("topo");
                  }}
                  className="px-2.5 py-1 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-[11px] font-bold shrink-0"
                >
                  Détails →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono border ${
                    POI_META[selectedPoi.category]?.badge || "text-cyan-400 border-cyan-500/30"
                  }`}
                >
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
