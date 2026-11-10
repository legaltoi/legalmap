"use client";

import React, { useState, useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import * as pmtiles from "pmtiles";
import "maplibre-gl/dist/maplibre-gl.css";
import { useRealtime } from "@/hooks/useRealtime";
import {
  CortegeMovementStatus,
  RouteWaypoint,
  ProhibitedZone,
  DispersionZone,
  AdminZonesState,
  OfficialAttendanceFigures,
} from "@/types";
import { fetchWalkingRoute } from "@/lib/routing";
import {
  signCortegeState,
  signAdminZones,
  derivePublicKey,
  DEFAULT_ADMIN_VERIFY_KEY,
  CortegeMessageData,
  AdminZonesMessageData,
} from "@/lib/crypto";
import { createCirclePolygon } from "@/lib/geo";
import { MAP_UI_CONFIG } from "@/config/mapUi";
import nantesData from "@/config/cities/nantes.json";
import nantesBaseGeoJson from "@/config/cities/nantes-base.json";

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
import {
  ShieldCheck,
  PlayCircle,
  PauseCircle,
  Flag,
  Check,
  AlertTriangle,
  Lock,
  ArrowLeft,
  RefreshCw,
  MapPin,
  Trash2,
  Key,
  Route,
  Plus,
  RotateCcw,
  Navigation,
  Copy,
  GitCommit,
  ExternalLink,
  Eye,
  EyeOff,
  CheckCircle2,
  BarChart3,
  Ban,
  Radio,
  Sliders,
  ShieldAlert,
  OctagonAlert,
  Clock,
  Compass,
} from "lucide-react";
import Link from "next/link";
import { syncRouteToNantesJson, testGitHubToken, SyncRouteResult } from "@/lib/githubSync";

const EXPECTED_PUBLIC_VERIFY_KEY =
  process.env.NEXT_PUBLIC_ADMIN_VERIFY_KEY || DEFAULT_ADMIN_VERIFY_KEY;

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [privateKey, setPrivateKey] = useState<string>("");
  const [inputKey, setInputKey] = useState<string>("");
  const [authError, setAuthError] = useState(false);

  // État local du cortège
  const [cortegeStatus, setCortegeStatus] = useState<CortegeMovementStatus>("MOBILE");
  const [headCoords, setHeadCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [tailCoords, setTailCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Points d'étape et tracé dynamique le long des rues
  const [waypoints, setWaypoints] = useState<RouteWaypoint[]>([]);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [hasCopiedGeoJson, setHasCopiedGeoJson] = useState(false);

  // Chiffres officiels du Jour J (Observatoire « Bataille des Chiffres »)
  const [policeCountInput, setPoliceCountInput] = useState<string>("");
  const [unionCountInput, setUnionCountInput] = useState<string>("");
  const [thirdPartyCountInput, setThirdPartyCountInput] = useState<string>("");
  const [mobilisationLabel, setMobilisationLabel] = useState<string>("");

  // Mode de placement sur carte ('head' | 'tail' | 'waypoint' | 'prohibited_polygon' | 'dispersion_center' | null)
  const [placementMode, setPlacementMode] = useState<
    "head" | "tail" | "waypoint" | "prohibited_polygon" | "dispersion_center" | null
  >(null);
  const [adminActiveTab, setAdminActiveTab] = useState<"cortege" | "zones" | "chiffres">("cortege");
  const [mobileAdminView, setMobileAdminView] = useState<"controls" | "map">("controls");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [lastBroadcastTime, setLastBroadcastTime] = useState<number | null>(null);
  const [lastBroadcastSig, setLastBroadcastSig] = useState<string | null>(null);

  // État des Zones Éditables (Interdiction de manifester & Dispersion en cours)
  const [prohibitedPoints, setProhibitedPoints] = useState<[number, number][]>([]);
  const [prohibitedName, setProhibitedName] = useState<string>("");
  const [prohibitedDecreeRef, setProhibitedDecreeRef] = useState<string>("");
  const [prohibitedStartTime, setProhibitedStartTime] = useState<string>("");
  const [prohibitedEndTime, setProhibitedEndTime] = useState<string>("");
  const [activeProhibitedZone, setActiveProhibitedZone] = useState<ProhibitedZone | null>(null);

  const [dispersionCenter, setDispersionCenter] = useState<[number, number] | null>(null);
  const [dispersionRadiusMeters, setDispersionRadiusMeters] = useState<number>(
    MAP_UI_CONFIG.DISPERSION_ZONE.defaultRadiusMeters
  );
  const [dispersionTtlMinutes, setDispersionTtlMinutes] = useState<number>(
    MAP_UI_CONFIG.DISPERSION_ZONE.defaultTtlMinutes
  );
  const [activeDispersionZone, setActiveDispersionZone] = useState<DispersionZone | null>(null);
  const [isBroadcastingZones, setIsBroadcastingZones] = useState(false);
  const [lastZonesBroadcastTime, setLastZonesBroadcastTime] = useState<number | null>(null);
  const [lastZonesBroadcastSig, setLastZonesBroadcastSig] = useState<string | null>(null);

  // État de la synchronisation automatique avec GitHub (nantes.json)
  const [githubToken, setGithubToken] = useState<string>("");
  const [autoCommitGithub, setAutoCommitGithub] = useState<boolean>(true);
  const [isSyncingGithub, setIsSyncingGithub] = useState(false);
  const [githubSyncResult, setGithubSyncResult] = useState<SyncRouteResult | null>(null);
  const [isTestingToken, setIsTestingToken] = useState(false);
  const [tokenTestResult, setTokenTestResult] = useState<{ valid: boolean; error?: string } | null>(null);
  const [showToken, setShowToken] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const headMarkerRef = useRef<maplibregl.Marker | null>(null);
  const tailMarkerRef = useRef<maplibregl.Marker | null>(null);
  const waypointMarkersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const prohibitedVertexMarkersRef = useRef<maplibregl.Marker[]>([]);
  const dispersionCenterMarkerRef = useRef<maplibregl.Marker | null>(null);

  // Référence synchronisée du tracé pour accès synchrone dans les callbacks de carte
  const routeCoordinatesRef = useRef<[number, number][]>([]);
  routeCoordinatesRef.current = routeCoordinates;
  const prohibitedPointsRef = useRef<[number, number][]>([]);
  prohibitedPointsRef.current = prohibitedPoints;
  const isHydratedRef = useRef(false);
  const ADMIN_STORAGE_KEY = "legalmaps_admin_cortege_draft";
  const GH_TOKEN_KEY = "legalmaps_admin_gh_token";
  const GH_AUTOCOMMIT_KEY = "legalmaps_admin_gh_autocommit";

  // 1. Récupération du brouillon organisateur, zones et token GitHub depuis localStorage au montage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved) {
          if (saved.cortegeStatus === "MOBILE" || saved.cortegeStatus === "IMMOBILE") {
            setCortegeStatus(saved.cortegeStatus);
          }
          if (saved.headCoords && typeof saved.headCoords.lat === "number") {
            setHeadCoords(saved.headCoords);
          }
          if (saved.tailCoords && typeof saved.tailCoords.lat === "number") {
            setTailCoords(saved.tailCoords);
          }
          if (Array.isArray(saved.waypoints)) {
            setWaypoints(saved.waypoints);
          }
          if (Array.isArray(saved.routeCoordinates) && saved.routeCoordinates.length >= 2) {
            setRouteCoordinates(saved.routeCoordinates);
            routeCoordinatesRef.current = saved.routeCoordinates;
          }
          if (typeof saved.policeCountInput === "string") setPoliceCountInput(saved.policeCountInput);
          if (typeof saved.unionCountInput === "string") setUnionCountInput(saved.unionCountInput);
          if (typeof saved.thirdPartyCountInput === "string") setThirdPartyCountInput(saved.thirdPartyCountInput);
          if (typeof saved.mobilisationLabel === "string") setMobilisationLabel(saved.mobilisationLabel);
          if (saved.lastBroadcastTime) {
            setLastBroadcastTime(saved.lastBroadcastTime);
          }
          if (saved.lastBroadcastSig) {
            setLastBroadcastSig(saved.lastBroadcastSig);
          }
        }
      }

      // Restauration du brouillon des zones
      const rawZones = localStorage.getItem(MAP_UI_CONFIG.STORAGE_KEYS.ADMIN_ZONES_DRAFT);
      if (rawZones) {
        const savedZones = JSON.parse(rawZones);
        if (savedZones) {
          if (savedZones.activeProhibitedZone) setActiveProhibitedZone(savedZones.activeProhibitedZone);
          if (Array.isArray(savedZones.prohibitedPoints)) {
            setProhibitedPoints(savedZones.prohibitedPoints);
            prohibitedPointsRef.current = savedZones.prohibitedPoints;
          }
          if (typeof savedZones.prohibitedName === "string") setProhibitedName(savedZones.prohibitedName);
          if (typeof savedZones.prohibitedDecreeRef === "string") setProhibitedDecreeRef(savedZones.prohibitedDecreeRef);
          if (typeof savedZones.prohibitedStartTime === "string") setProhibitedStartTime(savedZones.prohibitedStartTime);
          if (typeof savedZones.prohibitedEndTime === "string") setProhibitedEndTime(savedZones.prohibitedEndTime);

          if (savedZones.activeDispersionZone) setActiveDispersionZone(savedZones.activeDispersionZone);
          if (Array.isArray(savedZones.dispersionCenter)) setDispersionCenter(savedZones.dispersionCenter);
          if (typeof savedZones.dispersionRadiusMeters === "number") setDispersionRadiusMeters(savedZones.dispersionRadiusMeters);
          if (typeof savedZones.dispersionTtlMinutes === "number") setDispersionTtlMinutes(savedZones.dispersionTtlMinutes);
          if (savedZones.lastZonesBroadcastTime) setLastZonesBroadcastTime(savedZones.lastZonesBroadcastTime);
          if (savedZones.lastZonesBroadcastSig) setLastZonesBroadcastSig(savedZones.lastZonesBroadcastSig);
        }
      }

      const savedGh = localStorage.getItem(GH_TOKEN_KEY) || process.env.NEXT_PUBLIC_GITHUB_TOKEN || "";
      if (savedGh) setGithubToken(savedGh);

      const savedAuto = localStorage.getItem(GH_AUTOCOMMIT_KEY);
      if (savedAuto !== null) setAutoCommitGithub(savedAuto === "true");
    } catch (e) {
      console.warn("[LegalMaps Admin] Erreur lors de la lecture du brouillon local:", e);
    } finally {
      isHydratedRef.current = true;
    }
  }, []);

  // 2. Persistance automatique dans localStorage à chaque modification
  useEffect(() => {
    if (!isHydratedRef.current || typeof window === "undefined") return;
    try {
      const draft = {
        cortegeStatus,
        headCoords,
        tailCoords,
        waypoints,
        routeCoordinates,
        policeCountInput,
        unionCountInput,
        thirdPartyCountInput,
        mobilisationLabel,
        lastBroadcastTime,
        lastBroadcastSig,
      };
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(draft));
    } catch (e) {
      console.warn("[LegalMaps Admin] Erreur lors de la sauvegarde du brouillon cortège local:", e);
    }
  }, [
    cortegeStatus,
    headCoords,
    tailCoords,
    waypoints,
    routeCoordinates,
    policeCountInput,
    unionCountInput,
    thirdPartyCountInput,
    mobilisationLabel,
    lastBroadcastTime,
    lastBroadcastSig,
  ]);

  // Persistance automatique du brouillon des zones
  useEffect(() => {
    if (!isHydratedRef.current || typeof window === "undefined") return;
    try {
      const zonesDraft = {
        activeProhibitedZone,
        prohibitedPoints,
        prohibitedName,
        prohibitedDecreeRef,
        prohibitedStartTime,
        prohibitedEndTime,
        activeDispersionZone,
        dispersionCenter,
        dispersionRadiusMeters,
        dispersionTtlMinutes,
        lastZonesBroadcastTime,
        lastZonesBroadcastSig,
      };
      localStorage.setItem(
        MAP_UI_CONFIG.STORAGE_KEYS.ADMIN_ZONES_DRAFT,
        JSON.stringify(zonesDraft)
      );
    } catch (e) {
      console.warn("[LegalMaps Admin] Erreur sauvegarde brouillon zones:", e);
    }
  }, [
    activeProhibitedZone,
    prohibitedPoints,
    prohibitedName,
    prohibitedDecreeRef,
    prohibitedStartTime,
    prohibitedEndTime,
    activeDispersionZone,
    dispersionCenter,
    dispersionRadiusMeters,
    dispersionTtlMinutes,
    lastZonesBroadcastTime,
    lastZonesBroadcastSig,
  ]);

  const { status: realtimeStatus, sendSignedCortegeState, sendSignedAdminZones } = useRealtime({
    onCortegeStateReceived: (state) => {
      setCortegeStatus(state.status);
      if (state.head) setHeadCoords({ lat: state.head.lat, lng: state.head.lng });
      if (state.tail) setTailCoords({ lat: state.tail.lat, lng: state.tail.lng });
      if (state.attendanceFigures) {
        if (state.attendanceFigures.policeCount != null) {
          setPoliceCountInput(String(state.attendanceFigures.policeCount));
        }
        if (state.attendanceFigures.unionCount != null) {
          setUnionCountInput(String(state.attendanceFigures.unionCount));
        }
        if (state.attendanceFigures.thirdPartyCount != null) {
          setThirdPartyCountInput(String(state.attendanceFigures.thirdPartyCount));
        }
        if (state.attendanceFigures.label) {
          setMobilisationLabel(state.attendanceFigures.label);
        }
      }
      if (state.routeCoordinates && state.routeCoordinates.length >= 2) {
        setRouteCoordinates(state.routeCoordinates);
        routeCoordinatesRef.current = state.routeCoordinates;
        if (mapRef.current) {
          const source = mapRef.current.getSource("official-route") as maplibregl.GeoJSONSource | undefined;
          if (source) {
            source.setData({
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  properties: { name: "Parcours Actualisé", type: "route" },
                  geometry: {
                    type: "LineString",
                    coordinates: state.routeCoordinates,
                  },
                },
              ],
            });
          }
        }
      }
    },
    onAdminZonesReceived: (zones) => {
      if (zones.prohibitedZone) {
        setActiveProhibitedZone(zones.prohibitedZone);
        if (zones.prohibitedZone.polygon && zones.prohibitedZone.polygon.length >= 3) {
          const pts = zones.prohibitedZone.polygon.slice(0, -1);
          setProhibitedPoints(pts);
          prohibitedPointsRef.current = pts;
        }
        if (zones.prohibitedZone.name) setProhibitedName(zones.prohibitedZone.name);
        if (zones.prohibitedZone.decreeRef) setProhibitedDecreeRef(zones.prohibitedZone.decreeRef);
        if (zones.prohibitedZone.startTime) setProhibitedStartTime(zones.prohibitedZone.startTime);
        if (zones.prohibitedZone.endTime) setProhibitedEndTime(zones.prohibitedZone.endTime);
      } else {
        setActiveProhibitedZone(null);
      }

      if (zones.dispersionZone) {
        setActiveDispersionZone(zones.dispersionZone);
        if (zones.dispersionZone.center) {
          setDispersionCenter(zones.dispersionZone.center);
        }
        if (zones.dispersionZone.radiusMeters) {
          setDispersionRadiusMeters(zones.dispersionZone.radiusMeters);
        }
        if (zones.dispersionZone.ttlDurationMs) {
          setDispersionTtlMinutes(Math.round(zones.dispersionZone.ttlDurationMs / 60000));
        }
      } else {
        setActiveDispersionZone(null);
      }
    },
  });

  // Vérification de la clé privée Ed25519 via l'ancre d'URL (#priv=...) et extraction token GitHub (&gh=...)
  useEffect(() => {
    const checkHashKey = () => {
      if (typeof window === "undefined") return;
      const hash = window.location.hash;

      // Détection optionnelle du token GitHub passé dans l'URL (#priv=...&gh=github_pat_...)
      const ghMatch = hash.match(/[&?]gh=([^&]+)/);
      if (ghMatch && ghMatch[1]) {
        const extractedToken = decodeURIComponent(ghMatch[1]);
        setGithubToken(extractedToken);
        try {
          localStorage.setItem(GH_TOKEN_KEY, extractedToken);
        } catch {}
      }

      const match = hash.match(/#priv=([0-9a-fA-F]{64,128})/);
      if (match && match[1]) {
        const priv = match[1].toLowerCase();
        try {
          const derivedPub = derivePublicKey(priv);
          if (derivedPub.toLowerCase() === EXPECTED_PUBLIC_VERIFY_KEY.toLowerCase()) {
            setPrivateKey(priv);
            setIsAuthenticated(true);
            setAuthError(false);
            return;
          }
        } catch {
          // Erreur de dérivation
        }
      }
      setIsAuthenticated(false);
    };

    checkHashKey();
    window.addEventListener("hashchange", checkHashKey);
    return () => window.removeEventListener("hashchange", checkHashKey);
  }, []);

  const handleUpdateGhToken = (val: string) => {
    setGithubToken(val);
    setTokenTestResult(null);
    try {
      localStorage.setItem(GH_TOKEN_KEY, val.trim());
    } catch {}
  };

  const handleToggleAutoCommit = (checked: boolean) => {
    setAutoCommitGithub(checked);
    try {
      localStorage.setItem(GH_AUTOCOMMIT_KEY, checked ? "true" : "false");
    } catch {}
  };

  const handleTestToken = async () => {
    setIsTestingToken(true);
    setTokenTestResult(null);
    const res = await testGitHubToken(githubToken);
    setTokenTestResult(res);
    setIsTestingToken(false);
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputKey.trim().toLowerCase();
    try {
      const derivedPub = derivePublicKey(clean);
      if (derivedPub.toLowerCase() === EXPECTED_PUBLIC_VERIFY_KEY.toLowerCase()) {
        setPrivateKey(clean);
        if (typeof window !== "undefined") {
          window.location.hash = `#priv=${clean}`;
        }
        setIsAuthenticated(true);
        setAuthError(false);
      } else {
        setAuthError(true);
      }
    } catch {
      setAuthError(true);
    }
  };

  const placementModeRef = useRef<
    "head" | "tail" | "waypoint" | "prohibited_polygon" | "dispersion_center" | null
  >(null);
  placementModeRef.current = placementMode;

  // Initialisation de la carte d'administration
  useEffect(() => {
    if (!isAuthenticated || !mapContainerRef.current || mapRef.current) return;

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
          paint: {
            "background-color": "#060608",
          },
        },
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

    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    const initialStyle = isOnline ? onlineStyleUrl : offlineDarkStyle;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: nantesData.center as [number, number],
      zoom: 14.5,
    });

    map.addControl(
      new maplibregl.NavigationControl({
        showCompass: true,
        showZoom: true,
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

    let hasFallenBack = false;
    map.on("error", (e) => {
      console.warn("[Admin MapLibre Event]:", e);
      if (
        !hasFallenBack &&
        (e.error?.message?.includes("Failed to fetch") ||
          e.error?.message?.includes("NetworkError") ||
          (e as any).status === 404)
      ) {
        hasFallenBack = true;
        console.info("[LegalMaps Admin] Bascule automatique sur le style hors-ligne local.");
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
      } catch {
        // Ignorer
      }
    });

    const triggerResize = () => {
      if (map) {
        map.resize();
      }
    };

    const attachAdminRoute = () => {
      triggerResize();

      // 1. Couches des Zones (Placées avant le tracé pour rester en-dessous)
      if (!map.getSource("admin-prohibited-source")) {
        map.addSource("admin-prohibited-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
      }
      if (!map.getLayer("admin-prohibited-fill")) {
        map.addLayer({
          id: "admin-prohibited-fill",
          type: "fill",
          source: "admin-prohibited-source",
          paint: {
            "fill-color": MAP_UI_CONFIG.PROHIBITED_ZONE.fillColor,
            "fill-opacity": 0.22,
          },
        });
      }
      if (!map.getLayer("admin-prohibited-outline")) {
        map.addLayer({
          id: "admin-prohibited-outline",
          type: "line",
          source: "admin-prohibited-source",
          paint: {
            "line-color": MAP_UI_CONFIG.PROHIBITED_ZONE.strokeColor,
            "line-width": 2.5,
            "line-dasharray": [3, 2.5],
          },
        });
      }

      if (!map.getSource("admin-dispersion-source")) {
        map.addSource("admin-dispersion-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
      }
      if (!map.getLayer("admin-dispersion-fill")) {
        map.addLayer({
          id: "admin-dispersion-fill",
          type: "fill",
          source: "admin-dispersion-source",
          paint: {
            "fill-color": MAP_UI_CONFIG.DISPERSION_ZONE.fillColor,
            "fill-opacity": 0.25,
          },
        });
      }
      if (!map.getLayer("admin-dispersion-outline")) {
        map.addLayer({
          id: "admin-dispersion-outline",
          type: "line",
          source: "admin-dispersion-source",
          paint: {
            "line-color": MAP_UI_CONFIG.DISPERSION_ZONE.strokeColor,
            "line-width": 2.5,
            "line-dasharray": [3, 2],
          },
        });
      }

      // 2. Couche du parcours officiel (Au-dessus des zones)
      let activeCoords = routeCoordinatesRef.current;
      if (!activeCoords || activeCoords.length < 2) {
        try {
          const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
          if (raw) {
            const saved = JSON.parse(raw);
            if (Array.isArray(saved?.routeCoordinates) && saved.routeCoordinates.length >= 2) {
              activeCoords = saved.routeCoordinates;
            }
          }
        } catch {}
      }

      const activeGeoJson =
        activeCoords && activeCoords.length >= 2
          ? {
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  properties: { name: "Parcours Actualisé", type: "route" },
                  geometry: {
                    type: "LineString",
                    coordinates: activeCoords,
                  },
                },
              ],
            }
          : (nantesData.officialRoute as any);

      if (!map.getSource("official-route")) {
        map.addSource("official-route", {
          type: "geojson",
          data: activeGeoJson,
        });
      } else {
        const source = map.getSource("official-route") as maplibregl.GeoJSONSource | undefined;
        if (source) {
          source.setData(activeGeoJson);
        }
      }

      if (!map.getLayer("route-line")) {
        map.addLayer({
          id: "route-line",
          type: "line",
          source: "official-route",
          filter: ["==", "$type", "LineString"],
          paint: {
            "line-color": "#22d3ee",
            "line-width": 4,
            "line-opacity": 0.8,
          },
        });
      }
    };

    map.on("load", attachAdminRoute);
    map.on("styledata", attachAdminRoute);

    map.on("click", (e) => {
      const lat = Math.round(e.lngLat.lat * 1000) / 1000;
      const lng = Math.round(e.lngLat.lng * 1000) / 1000;

      const currentMode = placementModeRef.current;
      if (currentMode === "head") {
        setHeadCoords({ lat, lng });
        setPlacementMode(null);
      } else if (currentMode === "tail") {
        setTailCoords({ lat, lng });
        setPlacementMode(null);
      } else if (currentMode === "waypoint") {
        const newWp: RouteWaypoint = {
          id: `wp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          lat,
          lng,
        };
        setWaypoints((prev) => [...prev, newWp]);
        setPlacementMode(null);
      } else if (currentMode === "prohibited_polygon") {
        setProhibitedPoints((prev) => [...prev, [lng, lat]]);
      } else if (currentMode === "dispersion_center") {
        setDispersionCenter([lng, lat]);
        setPlacementMode(null);
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
      map.remove();
      mapRef.current = null;
    };
  }, [isAuthenticated]);

  // Synchronisation des marqueurs sur la carte d'administration (Tête et Fin)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Tête de cortège
    if (headCoords) {
      if (!headMarkerRef.current) {
        const el = document.createElement("div");
        el.className = "p-1.5 bg-cyan-500 rounded-full border-2 border-white text-xs font-bold shadow-lg";
        el.innerHTML = "🚩 Tête";
        headMarkerRef.current = new maplibregl.Marker({ element: el, draggable: true })
          .setLngLat([headCoords.lng, headCoords.lat])
          .addTo(map);

        headMarkerRef.current.on("dragend", () => {
          const lngLat = headMarkerRef.current!.getLngLat();
          setHeadCoords({
            lat: Math.round(lngLat.lat * 1000) / 1000,
            lng: Math.round(lngLat.lng * 1000) / 1000,
          });
        });
      } else {
        headMarkerRef.current.setLngLat([headCoords.lng, headCoords.lat]);
      }
    } else if (headMarkerRef.current) {
      headMarkerRef.current.remove();
      headMarkerRef.current = null;
    }

    // Fin de cortège
    if (tailCoords) {
      if (!tailMarkerRef.current) {
        const el = document.createElement("div");
        el.className = "p-1.5 bg-orange-500 rounded-full border-2 border-white text-xs font-bold shadow-lg";
        el.innerHTML = "🏁 Fin";
        tailMarkerRef.current = new maplibregl.Marker({ element: el, draggable: true })
          .setLngLat([tailCoords.lng, tailCoords.lat])
          .addTo(map);

        tailMarkerRef.current.on("dragend", () => {
          const lngLat = tailMarkerRef.current!.getLngLat();
          setTailCoords({
            lat: Math.round(lngLat.lat * 1000) / 1000,
            lng: Math.round(lngLat.lng * 1000) / 1000,
          });
        });
      } else {
        tailMarkerRef.current.setLngLat([tailCoords.lng, tailCoords.lat]);
      }
    } else if (tailMarkerRef.current) {
      tailMarkerRef.current.remove();
      tailMarkerRef.current = null;
    }
  }, [headCoords, tailCoords]);

  // Synchronisation des marqueurs d'étapes (waypoints)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const currentMarkers = waypointMarkersRef.current;
    const activeIds = new Set(waypoints.map((w) => w.id));

    // Supprimer les marqueurs retirés
    for (const [id, marker] of currentMarkers.entries()) {
      if (!activeIds.has(id)) {
        marker.remove();
        currentMarkers.delete(id);
      }
    }

    // Ajouter ou mettre à jour les marqueurs
    waypoints.forEach((wp, index) => {
      if (currentMarkers.has(wp.id)) {
        currentMarkers.get(wp.id)!.setLngLat([wp.lng, wp.lat]);
      } else {
        const el = document.createElement("div");
        el.className = "p-1 bg-purple-600 rounded-full border-2 border-white text-[11px] font-bold text-white shadow-lg cursor-pointer flex items-center gap-0.5 px-2";
        el.innerHTML = `<span>📍</span><span>${index + 1}</span>`;

        const marker = new maplibregl.Marker({ element: el, draggable: true })
          .setLngLat([wp.lng, wp.lat])
          .addTo(map);

        marker.on("dragend", () => {
          const lngLat = marker.getLngLat();
          setWaypoints((prev) =>
            prev.map((item) =>
              item.id === wp.id
                ? {
                    ...item,
                    lat: Math.round(lngLat.lat * 1000) / 1000,
                    lng: Math.round(lngLat.lng * 1000) / 1000,
                  }
                : item
            )
          );
        });

        currentMarkers.set(wp.id, marker);
      }
    });
  }, [waypoints]);

  // Calcul automatique de l'itinéraire le long des rues de Nantes (OSRM foot)
  const handleRecalculateRoute = async () => {
    setIsCalculatingRoute(true);

    const orderedPoints: [number, number][] = [];
    if (headCoords) orderedPoints.push([headCoords.lng, headCoords.lat]);
    waypoints.forEach((wp) => orderedPoints.push([wp.lng, wp.lat]));
    if (tailCoords) orderedPoints.push([tailCoords.lng, tailCoords.lat]);

    if (orderedPoints.length >= 2) {
      try {
        const calculatedCoords = await fetchWalkingRoute(orderedPoints);
        setRouteCoordinates(calculatedCoords);
        routeCoordinatesRef.current = calculatedCoords;

        // Mise à jour visuelle sur la carte d'administration
        if (mapRef.current) {
          const source = mapRef.current.getSource("official-route") as maplibregl.GeoJSONSource | undefined;
          if (source) {
            source.setData({
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  properties: { name: "Parcours Actualisé", type: "route" },
                  geometry: {
                    type: "LineString",
                    coordinates: calculatedCoords,
                  },
                },
              ],
            });
          }
        }
      } catch (err) {
        console.error("Erreur calcul d'itinéraire voirie:", err);
      }
    } else {
      alert("Placez au moins 2 points (Tête, Fin ou Étapes) pour calculer le tracé calqué sur les rues.");
    }
    setIsCalculatingRoute(false);
  };

  // Synchronisation dynamique de la couche tracé si routeCoordinates change (ex: réhydratation)
  useEffect(() => {
    routeCoordinatesRef.current = routeCoordinates;
    if (!mapRef.current) return;
    const source = mapRef.current.getSource("official-route") as maplibregl.GeoJSONSource | undefined;
    if (source) {
      if (routeCoordinates && routeCoordinates.length >= 2) {
        source.setData({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: { name: "Parcours Actualisé", type: "route" },
              geometry: {
                type: "LineString",
                coordinates: routeCoordinates,
              },
            },
          ],
        });
      } else {
        source.setData(nantesData.officialRoute as any);
      }
    }
  }, [routeCoordinates]);

  // Réinitialisation au tracé initial
  const handleResetRoute = () => {
    setRouteCoordinates([]);
    setWaypoints([]);
    routeCoordinatesRef.current = [];
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch {}
    if (mapRef.current) {
      const source = mapRef.current.getSource("official-route") as maplibregl.GeoJSONSource | undefined;
      if (source) {
        source.setData(nantesData.officialRoute as any);
      }
    }
  };

  // Exporter/Copier les coordonnées pour nantes.json
  const handleCopyGeoJsonCoordinates = () => {
    const coordsToExport =
      routeCoordinates.length >= 2
        ? routeCoordinates
        : (nantesData.officialRoute.features[0].geometry.coordinates as [number, number][]);

    const formatted = JSON.stringify(coordsToExport, null, 2);
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(formatted).then(() => {
        setHasCopiedGeoJson(true);
        setTimeout(() => setHasCopiedGeoJson(false), 3000);
      });
    } else {
      prompt("Copiez les coordonnées JSON ci-dessous :", formatted);
    }
  };

  // Synchronisation dynamique de la couche du périmètre d'interdiction et des marqueurs de sommets
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // 1. Couche GeoJSON
    const source = map.getSource("admin-prohibited-source") as maplibregl.GeoJSONSource | undefined;
    if (source) {
      if (prohibitedPoints.length >= 3) {
        source.setData({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: { name: prohibitedName || "Zone d'interdiction" },
              geometry: {
                type: "Polygon",
                coordinates: [[...prohibitedPoints, prohibitedPoints[0]]],
              },
            },
          ],
        });
      } else {
        source.setData({ type: "FeatureCollection", features: [] });
      }
    }

    // 2. Marqueurs interactifs de sommets déplaçables
    prohibitedVertexMarkersRef.current.forEach((m) => m.remove());
    prohibitedVertexMarkersRef.current = [];

    prohibitedPoints.forEach((pt, idx) => {
      const el = document.createElement("div");
      el.className =
        "px-1.5 py-0.5 rounded-full bg-red-600 border border-white text-[10px] font-bold text-white shadow-lg cursor-grab active:cursor-grabbing flex items-center gap-1 select-none hover:scale-110 transition-transform";
      el.innerHTML = `<span>⛔</span><span>#${idx + 1}</span>`;

      const marker = new maplibregl.Marker({ element: el, draggable: true })
        .setLngLat(pt)
        .addTo(map);

      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        const updatedLng = Math.round(lngLat.lng * 1000) / 1000;
        const updatedLat = Math.round(lngLat.lat * 1000) / 1000;
        setProhibitedPoints((prev) => {
          const next = [...prev];
          next[idx] = [updatedLng, updatedLat];
          return next;
        });
      });

      prohibitedVertexMarkersRef.current.push(marker);
    });
  }, [prohibitedPoints, prohibitedName]);

  // Synchronisation dynamique du cercle de dispersion et de son marqueur central
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const source = map.getSource("admin-dispersion-source") as maplibregl.GeoJSONSource | undefined;
    if (source) {
      if (dispersionCenter) {
        const circleCoords = createCirclePolygon(dispersionCenter, dispersionRadiusMeters);
        source.setData({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: { name: "Zone de Dispersion" },
              geometry: {
                type: "Polygon",
                coordinates: [circleCoords],
              },
            },
          ],
        });
      } else {
        source.setData({ type: "FeatureCollection", features: [] });
      }
    }

    if (dispersionCenter) {
      if (!dispersionCenterMarkerRef.current) {
        const el = document.createElement("div");
        el.className =
          "px-2 py-1 rounded-xl bg-orange-600 border border-white text-xs font-bold text-white shadow-xl cursor-grab active:cursor-grabbing flex items-center gap-1.5 select-none hover:scale-105 transition-transform";
        el.innerHTML = `<span>🚨</span><span>Centre (${dispersionRadiusMeters}m)</span>`;

        const marker = new maplibregl.Marker({ element: el, draggable: true })
          .setLngLat(dispersionCenter)
          .addTo(map);

        marker.on("dragend", () => {
          const lngLat = marker.getLngLat();
          setDispersionCenter([
            Math.round(lngLat.lng * 1000) / 1000,
            Math.round(lngLat.lat * 1000) / 1000,
          ]);
        });

        dispersionCenterMarkerRef.current = marker;
      } else {
        dispersionCenterMarkerRef.current.setLngLat(dispersionCenter);
        const el = dispersionCenterMarkerRef.current.getElement();
        if (el) {
          el.innerHTML = `<span>🚨</span><span>Centre (${dispersionRadiusMeters}m)</span>`;
        }
      }
    } else if (dispersionCenterMarkerRef.current) {
      dispersionCenterMarkerRef.current.remove();
      dispersionCenterMarkerRef.current = null;
    }
  }, [dispersionCenter, dispersionRadiusMeters]);

  // Diffusion manuelle signée des zones administratives (Interdiction + Dispersion)
  const handleBroadcastAdminZones = async (
    overrideDispersion?: DispersionZone | null,
    overrideProhibited?: ProhibitedZone | null
  ) => {
    if (!privateKey) {
      alert("Clé privée non disponible pour la signature des zones.");
      return false;
    }

    setIsBroadcastingZones(true);
    const now = Date.now();
    const probZone =
      overrideProhibited !== undefined ? overrideProhibited : activeProhibitedZone;
    const dispZone =
      overrideDispersion !== undefined ? overrideDispersion : activeDispersionZone;

    const messageData: AdminZonesMessageData = {
      prohibitedZone: probZone,
      dispersionZone: dispZone,
      timestamp: now,
      nonce: `zones_${now}_${Math.random().toString(36).substring(2, 10)}`,
    };

    const signedPayload = signAdminZones(messageData, privateKey);
    const success = await sendSignedAdminZones(signedPayload);
    setIsBroadcastingZones(false);

    if (success) {
      setLastZonesBroadcastTime(now);
      setLastZonesBroadcastSig(signedPayload.signature.substring(0, 16) + "...");
    }
    return success;
  };

  // 1-Geste : Activer la dispersion en cours
  const handleActivateDispersion = async () => {
    if (!privateKey) {
      alert("Clé privée requise pour signer l'ordre de dispersion.");
      return;
    }
    const center =
      dispersionCenter ||
      (headCoords ? [headCoords.lng, headCoords.lat] : [nantesData.center[0], nantesData.center[1]]);

    if (!dispersionCenter) {
      setDispersionCenter(center as [number, number]);
    }

    const now = Date.now();
    const ttlMs = dispersionTtlMinutes * 60 * 1000;
    const newZone: DispersionZone = {
      id: `disp_${now}`,
      center: center as [number, number],
      radiusMeters: dispersionRadiusMeters,
      activatedAt: now,
      ttlDurationMs: ttlMs,
      expiresAt: now + ttlMs,
      isActive: true,
    };

    setActiveDispersionZone(newZone);
    await handleBroadcastAdminZones(newZone, undefined);
  };

  // Désactiver manuellement la dispersion
  const handleStopDispersion = async () => {
    setActiveDispersionZone(null);
    await handleBroadcastAdminZones(null, undefined);
  };

  // Valider et enregistrer le polygone d'interdiction
  const handleSaveProhibitedZone = async () => {
    if (prohibitedPoints.length < 3) {
      alert("Veuillez poser au moins 3 points sur la carte pour délimiter le polygone.");
      return;
    }
    const now = Date.now();
    const closedPolygon: [number, number][] = [...prohibitedPoints, prohibitedPoints[0]];
    const newProhibited: ProhibitedZone = {
      id: `prob_${now}`,
      name: prohibitedName.trim() || "Zone d'interdiction de manifester",
      decreeRef: prohibitedDecreeRef.trim() || undefined,
      startTime: prohibitedStartTime.trim() || undefined,
      endTime: prohibitedEndTime.trim() || undefined,
      polygon: closedPolygon,
      createdAt: now,
    };

    setActiveProhibitedZone(newProhibited);
    await handleBroadcastAdminZones(undefined, newProhibited);
  };

  // Supprimer le périmètre d'interdiction
  const handleClearProhibitedZone = async () => {
    setActiveProhibitedZone(null);
    setProhibitedPoints([]);
    prohibitedPointsRef.current = [];
    await handleBroadcastAdminZones(undefined, null);
  };
  const buildAttendanceFigures = (now: number): OfficialAttendanceFigures | null => {
    const cleanPol = policeCountInput.trim() ? parseInt(policeCountInput.trim(), 10) : null;
    const cleanUni = unionCountInput.trim() ? parseInt(unionCountInput.trim(), 10) : null;
    const cleanThi = thirdPartyCountInput.trim()
      ? parseInt(thirdPartyCountInput.trim(), 10)
      : null;

    const validPol = cleanPol != null && !isNaN(cleanPol) && cleanPol >= 0 ? cleanPol : null;
    const validUni = cleanUni != null && !isNaN(cleanUni) && cleanUni >= 0 ? cleanUni : null;
    const validThi = cleanThi != null && !isNaN(cleanThi) && cleanThi >= 0 ? cleanThi : null;

    if (validPol === null && validUni === null && validThi === null) {
      return null;
    }

    return {
      policeCount: validPol,
      unionCount: validUni,
      thirdPartyCount: validThi,
      label: mobilisationLabel.trim() || undefined,
      updatedAt: now,
    };
  };

  // Signature asymétrique Ed25519 et diffusion officielle (Statut + Tête + Fin + Tracé + Chiffres du Jour)
  const handleBroadcastSignedState = async () => {
    if (!privateKey) {
      alert("Clé privée non disponible pour la signature.");
      return;
    }

    setIsBroadcasting(true);
    const now = Date.now();
    const attendanceFigures = buildAttendanceFigures(now);

    const messageData: CortegeMessageData = {
      status: cortegeStatus,
      head: headCoords ? { lat: headCoords.lat, lng: headCoords.lng } : null,
      tail: tailCoords ? { lat: tailCoords.lat, lng: tailCoords.lng } : null,
      routeCoordinates: routeCoordinates.length >= 2 ? routeCoordinates : undefined,
      attendanceFigures: attendanceFigures || undefined,
      timestamp: now,
      nonce: `nonce_${now}_${Math.random().toString(36).substring(2, 10)}`,
    };

    // Signature cryptographique Ed25519
    const signedPayload = signCortegeState(messageData, privateKey);

    await sendSignedCortegeState(signedPayload);
    setIsBroadcasting(false);
    setLastBroadcastTime(now);
    setLastBroadcastSig(signedPayload.signature.substring(0, 16) + "...");

    // Synchroniser également les zones éditables
    try {
      await handleBroadcastAdminZones();
    } catch (zErr) {
      console.warn("[LegalMaps Admin] Erreur diffusion synchrone des zones:", zErr);
    }

    // Auto-commit automatique dans nantes.json sur GitHub si configuré
    if (
      autoCommitGithub &&
      githubToken.trim() &&
      (routeCoordinates.length >= 2 || attendanceFigures !== null)
    ) {
      setIsSyncingGithub(true);
      setGithubSyncResult(null);
      try {
        const syncRes = await syncRouteToNantesJson({
          token: githubToken.trim(),
          routeCoordinates: routeCoordinates.length >= 2 ? routeCoordinates : undefined,
          headCoords,
          tailCoords,
          attendanceFigures,
        });
        setGithubSyncResult(syncRes);
      } catch (err: any) {
        setGithubSyncResult({
          success: false,
          error: err.message || "Erreur de synchronisation GitHub",
        });
      } finally {
        setIsSyncingGithub(false);
      }
    }
  };

  // Pousser manuellement le tracé actuel et/ou les chiffres du jour dans nantes.json sur GitHub
  const handleManualSyncGitHub = async () => {
    if (!githubToken.trim()) {
      alert("Veuillez renseigner un Token GitHub (PAT) dans la section Auto-Commit ci-dessous.");
      return;
    }
    const attendanceFigures = buildAttendanceFigures(Date.now());
    if (routeCoordinates.length < 2 && !attendanceFigures) {
      alert(
        "Calculez un tracé (au moins 2 points) ou renseignez les chiffres du jour avant de pousser sur GitHub."
      );
      return;
    }

    setIsSyncingGithub(true);
    setGithubSyncResult(null);
    try {
      const syncRes = await syncRouteToNantesJson({
        token: githubToken.trim(),
        routeCoordinates: routeCoordinates.length >= 2 ? routeCoordinates : undefined,
        headCoords,
        tailCoords,
        attendanceFigures,
      });
      setGithubSyncResult(syncRes);
    } catch (err: any) {
      setGithubSyncResult({
        success: false,
        error: err.message || "Erreur de synchronisation GitHub",
      });
    } finally {
      setIsSyncingGithub(false);
    }
  };

  // Formulaire d'authentification par clé privée si non authentifié
  if (isAuthenticated === false) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Espace Organisateur Sécurisé</h1>
              <p className="text-xs text-zinc-400 font-mono">Authentification asymétrique Ed25519</p>
            </div>
          </div>

          <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
            Pour réguler le cortège, fournissez la clé privée d&apos;émission. La clé publique correspondante
            vérifie chaque ordre sur les téléphones des manifestants.
          </p>

          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-priv-input" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Clé privée Ed25519 (64 hex caractères)
              </label>
              <input
                id="admin-priv-input"
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="Ex: 4a2b8f... (ou via lien #priv=...)"
                className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
              {authError && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Clé privée invalide ou non reconnue
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
            >
              Déverrouiller avec Ed25519
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between text-xs text-zinc-500">
            <Link href="/" className="hover:text-zinc-300 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Retour à la carte publique
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Dashboard d'administration sécurisé (100% Responsive Mobile / Tablette / Desktop)
  return (
    <div className="h-[100dvh] bg-black text-white flex flex-col overflow-hidden">
      {/* Header Admin Aéré & Responsive */}
      <header
        className="px-3 sm:px-5 py-2.5 sm:py-3 border-b border-zinc-800/90 bg-zinc-950/95 backdrop-blur-xl flex items-center justify-between gap-2 shrink-0"
        style={{ paddingTop: "max(10px, env(safe-area-inset-top, 10px))" }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href="/"
            aria-label="Retour à la carte publique"
            className="w-9 h-9 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl transition-colors flex items-center justify-center shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-black tracking-wider text-cyan-400 truncate">
                CONSOLE ORGANISATEUR
              </span>
              <span className="hidden xs:inline-flex px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[9px] text-emerald-400 font-mono items-center gap-1 shrink-0">
                <ShieldCheck className="w-3 h-3" />
                Ed25519
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 truncate mt-0.5">
              Diffusion certifiée • Relais {realtimeStatus}
            </p>
          </div>
        </div>

        <button
          onClick={handleBroadcastSignedState}
          disabled={isBroadcasting || isSyncingGithub}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] sm:text-xs rounded-xl shadow-lg transition-colors active:scale-95 disabled:opacity-60 shrink-0 min-h-[38px]"
        >
          <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isBroadcasting || isSyncingGithub ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">
            {isSyncingGithub
              ? "Auto-Commit GitHub..."
              : isBroadcasting
              ? "Diffusion..."
              : "Signer & Diffuser en Direct"}
          </span>
          <span className="sm:hidden">
            {isSyncingGithub ? "GitHub..." : isBroadcasting ? "Envoi..." : "Signer & Diffuser"}
          </span>
        </button>
      </header>

      {/* Sélecteur Mobile / Tablette : Réglages vs Carte Interactive */}
      <div className="lg:hidden px-3 py-2 bg-zinc-950 border-b border-zinc-800/80 grid grid-cols-2 gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => setMobileAdminView("controls")}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            mobileAdminView === "controls"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
              : "bg-zinc-900 text-zinc-400 border border-zinc-800"
          }`}
        >
          <span>⚙️ Réglages &amp; Chiffres</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMobileAdminView("map");
            setTimeout(() => mapRef.current?.resize(), 60);
          }}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            mobileAdminView === "map"
              ? "bg-blue-500/25 text-blue-200 border border-blue-400/50"
              : placementMode
              ? "bg-blue-600 text-white border border-blue-400 animate-pulse"
              : "bg-zinc-900 text-zinc-400 border border-zinc-800"
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Carte &amp; Tracé ({waypoints.length})</span>
        </button>
      </div>

      {/* Main Responsive Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-0">
        {/* Panel gauche : Commandes (Scrollable indépendamment) */}
        <div
          className={`lg:col-span-5 xl:col-span-4 p-3.5 sm:p-5 bg-zinc-950/90 border-r border-zinc-800/90 space-y-4 overflow-y-auto overscroll-contain min-h-0 ${
            mobileAdminView === "map" ? "hidden lg:block" : "block"
          }`}
          style={{ paddingBottom: "max(24px, env(safe-area-inset-bottom, 24px))" }}
        >
          {/* Sélecteur d'Onglets Admin */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-900/90 border border-zinc-800 rounded-2xl shrink-0">
            <button
              type="button"
              onClick={() => setAdminActiveTab("cortege")}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                adminActiveTab === "cortege"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 border border-transparent"
              }`}
            >
              <Route className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Cortège</span>
            </button>

            <button
              type="button"
              onClick={() => setAdminActiveTab("zones")}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 relative ${
                adminActiveTab === "zones"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 border border-transparent"
              }`}
            >
              <Ban className="w-3.5 h-3.5 shrink-0 text-rose-400" />
              <span className="truncate">Zones</span>
              {(activeProhibitedZone ||
                (activeDispersionZone &&
                  activeDispersionZone.isActive &&
                  activeDispersionZone.expiresAt > Date.now())) && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setAdminActiveTab("chiffres")}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                adminActiveTab === "chiffres"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 border border-transparent"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
              <span className="truncate">Chiffres</span>
            </button>
          </div>

          {/* ===================== ONGLET 1 : CORTÈGE ===================== */}
          {adminActiveTab === "cortege" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* 1. Statut Mobile / Immobile */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-2.5">
                  1. Statut de Mobilité du Cortège
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => setCortegeStatus("MOBILE")}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                      cortegeStatus === "MOBILE"
                        ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md"
                        : "bg-zinc-800/60 border-zinc-700 text-zinc-400"
                    }`}
                  >
                    <PlayCircle className="w-5 h-5 mb-1 text-cyan-400" />
                    Cortège Mobile
                    <span className="text-[10px] font-normal opacity-75">TTL 5 min</span>
                  </button>

                  <button
                    onClick={() => setCortegeStatus("IMMOBILE")}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                      cortegeStatus === "IMMOBILE"
                        ? "bg-orange-500/20 border-orange-400 text-orange-300 shadow-md"
                        : "bg-zinc-800/60 border-zinc-700 text-zinc-400"
                    }`}
                  >
                    <PauseCircle className="w-5 h-5 mb-1 text-orange-400" />
                    Cortège Immobile
                    <span className="text-[10px] font-normal opacity-75">TTL 10 min</span>
                  </button>
                </div>
              </div>

              {/* 2. Position Tête & 3. Position Fin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                {/* 2. Position Tête */}
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Flag className="w-3.5 h-3.5" /> 2. Tête de Cortège
                    </span>
                    {headCoords && (
                      <button
                        onClick={() => setHeadCoords(null)}
                        className="text-zinc-500 hover:text-red-400 p-1"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {headCoords ? (
                    <div className="text-xs font-mono text-zinc-300 bg-black/60 p-2 rounded-lg border border-zinc-800">
                      Lat: {headCoords.lat.toFixed(3)}, Lng: {headCoords.lng.toFixed(3)}
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-500 mb-2">Non positionnée</div>
                  )}

                  <button
                    onClick={() => {
                      setPlacementMode("head");
                      setMobileAdminView("map");
                      setTimeout(() => mapRef.current?.resize(), 60);
                    }}
                    className={`w-full mt-2 py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                      placementMode === "head"
                        ? "bg-cyan-500 text-black border-cyan-400 animate-pulse"
                        : "bg-zinc-800 hover:bg-zinc-700 text-cyan-300 border-zinc-700"
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    {placementMode === "head" ? "Touchez la carte..." : "Placer / Déplacer la Tête"}
                  </button>
                </div>

                {/* 3. Position Fin */}
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Flag className="w-3.5 h-3.5" /> 3. Fin de Cortège
                    </span>
                    {tailCoords && (
                      <button
                        onClick={() => setTailCoords(null)}
                        className="text-zinc-500 hover:text-red-400 p-1"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {tailCoords ? (
                    <div className="text-xs font-mono text-zinc-300 bg-black/60 p-2 rounded-lg border border-zinc-800">
                      Lat: {tailCoords.lat.toFixed(3)}, Lng: {tailCoords.lng.toFixed(3)}
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-500 mb-2">Non positionnée</div>
                  )}

                  <button
                    onClick={() => {
                      setPlacementMode("tail");
                      setMobileAdminView("map");
                      setTimeout(() => mapRef.current?.resize(), 60);
                    }}
                    className={`w-full mt-2 py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                      placementMode === "tail"
                        ? "bg-orange-500 text-black border-orange-400 animate-pulse"
                        : "bg-zinc-800 hover:bg-zinc-700 text-orange-300 border-zinc-700"
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    {placementMode === "tail" ? "Touchez la carte..." : "Placer / Déplacer la Fin"}
                  </button>
                </div>
              </div>

              {/* 4. Tracé & Étapes du Cortège (Voirie Dynamique) */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Route className="w-3.5 h-3.5" /> 4. Tracé &amp; Étapes ({waypoints.length})
                  </span>
                  {waypoints.length > 0 && (
                    <button
                      onClick={() => setWaypoints([])}
                      className="text-zinc-500 hover:text-red-400 p-1 text-[11px]"
                      title="Effacer toutes les étapes"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-zinc-400 leading-snug">
                  Placez des étapes sur les carrefours pour contraindre le tracé piéton à suivre fidèlement les rues.
                </p>

                <button
                  onClick={() => {
                    setPlacementMode("waypoint");
                    setMobileAdminView("map");
                    setTimeout(() => mapRef.current?.resize(), 60);
                  }}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                    placementMode === "waypoint"
                      ? "bg-purple-600 text-white border-purple-400 animate-pulse"
                      : "bg-zinc-800 hover:bg-zinc-700 text-purple-300 border-zinc-700"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {placementMode === "waypoint"
                    ? "Touchez la carte pour ajouter une étape"
                    : "+ Ajouter un point d'étape"}
                </button>

                {/* Liste des points d'étape */}
                {waypoints.length > 0 && (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {waypoints.map((wp, index) => (
                      <div
                        key={wp.id}
                        className="flex items-center justify-between p-2 bg-black/50 border border-zinc-800 rounded-lg text-xs"
                      >
                        <span className="font-mono text-purple-300 flex items-center gap-1">
                          <span>📍</span> #{index + 1} ({wp.lat.toFixed(3)}, {wp.lng.toFixed(3)})
                        </span>
                        <button
                          onClick={() => setWaypoints((prev) => prev.filter((item) => item.id !== wp.id))}
                          className="text-zinc-500 hover:text-red-400 p-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bouton de calcul automatique OSRM */}
                <div className="pt-1 flex flex-col gap-2">
                  <button
                    onClick={handleRecalculateRoute}
                    disabled={isCalculatingRoute}
                    className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
                  >
                    <Navigation className={`w-3.5 h-3.5 shrink-0 ${isCalculatingRoute ? "animate-spin" : ""}`} />
                    <span>
                      {isCalculatingRoute ? "Calcul piéton en cours..." : "Recalculer le tracé piéton"}
                    </span>
                  </button>

                  <button
                    onClick={handleManualSyncGitHub}
                    disabled={isSyncingGithub || routeCoordinates.length < 2}
                    className="w-full py-2 px-3 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
                    title="Pousser immédiatement dans src/config/cities/nantes.json sur GitHub"
                  >
                    <GitCommit className={`w-3.5 h-3.5 shrink-0 ${isSyncingGithub ? "animate-spin" : ""}`} />
                    <span>
                      {isSyncingGithub ? "Mise à jour GitHub..." : "Pousser dans nantes.json (GitHub)"}
                    </span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleCopyGeoJsonCoordinates}
                      className="py-2 px-2.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] font-semibold rounded-xl border border-zinc-700 transition-colors flex items-center justify-center gap-1"
                      title="Copier les coordonnées JSON"
                    >
                      <Copy className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="truncate">{hasCopiedGeoJson ? "Copié !" : "Copier JSON"}</span>
                    </button>

                    <button
                      onClick={handleResetRoute}
                      className="py-2 px-2.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white text-[11px] font-semibold rounded-xl border border-zinc-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3 shrink-0" />
                      <span className="truncate">Tracé initial</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 6. Synchronisation Automatique GitHub */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <GitCommit className="w-3.5 h-3.5 text-purple-400 shrink-0" /> Auto-Commit GitHub
                  </span>
                  {githubToken ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[9px] text-emerald-400 font-mono flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3" /> Configuré
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-[9px] text-zinc-400 font-mono shrink-0">
                      Non configuré
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-zinc-400 leading-snug">
                  Met à jour automatiquement <code className="text-cyan-400 font-mono">nantes.json</code> sur GitHub dès la diffusion.
                </p>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="gh-token-input" className="text-[11px] font-medium text-zinc-400">
                      Token GitHub (PAT contents:write)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="text-zinc-500 hover:text-zinc-300 p-0.5"
                      title={showToken ? "Masquer" : "Afficher"}
                    >
                      {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <input
                    id="gh-token-input"
                    type={showToken ? "text" : "password"}
                    value={githubToken}
                    onChange={(e) => handleUpdateGhToken(e.target.value)}
                    placeholder="github_pat_... ou ghp_..."
                    className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-400 font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleTestToken}
                    disabled={isTestingToken || !githubToken.trim()}
                    className="py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 text-[11px] font-semibold rounded-lg border border-zinc-700 transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isTestingToken ? "animate-spin" : ""}`} />
                    Tester la connexion
                  </button>

                  {tokenTestResult && (
                    <span className={`text-[10px] font-mono flex items-center gap-1 ${tokenTestResult.valid ? "text-emerald-400" : "text-red-400"}`}>
                      {tokenTestResult.valid ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Token valide
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3" /> {tokenTestResult.error || "Invalide"}
                        </>
                      )}
                    </span>
                  )}
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-2 border-t border-zinc-800 text-[11px] text-zinc-300 select-none">
                  <input
                    type="checkbox"
                    checked={autoCommitGithub}
                    onChange={(e) => handleToggleAutoCommit(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-black border-zinc-700 text-purple-600 focus:ring-0 focus:ring-offset-0 cursor-pointer shrink-0"
                  />
                  <span>Auto-commit GitHub à chaque clic sur &laquo; Signer &amp; Diffuser &raquo;</span>
                </label>
              </div>
            </div>
          )}

          {/* ===================== ONGLET 2 : ZONES ÉDITABLES ===================== */}
          {adminActiveTab === "zones" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* 1. Zone d'interdiction de manifester */}
              <div className="bg-zinc-900/90 border border-rose-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Ban className="w-3.5 h-3.5" /> 1. Zone d&apos;interdiction de manifester
                  </span>
                  {activeProhibitedZone && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-[9px] font-mono text-rose-300 font-bold">
                      Active
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-zinc-400 leading-snug">
                  Délimitez un polygone rouge d&apos;interdiction préfectorale sur la carte (contour pointillé, alerte d&apos;approche à 250 m).
                </p>

                {/* Mode dessin polygone */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPlacementMode(
                        placementMode === "prohibited_polygon" ? null : "prohibited_polygon"
                      );
                      setMobileAdminView("map");
                      setTimeout(() => mapRef.current?.resize(), 60);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                      placementMode === "prohibited_polygon"
                        ? "bg-rose-600 text-white border-rose-400 animate-pulse"
                        : "bg-zinc-800 hover:bg-zinc-700 text-rose-300 border-zinc-700"
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    {placementMode === "prohibited_polygon"
                      ? `Touchez la carte pour ajouter des points (${prohibitedPoints.length} sommets)`
                      : prohibitedPoints.length > 0
                      ? `Modifier le tracé (${prohibitedPoints.length} sommets)`
                      : "Dessiner le périmètre sur la carte"}
                  </button>

                  {prohibitedPoints.length > 0 && (
                    <div className="p-2.5 bg-black/60 border border-zinc-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-300 font-mono">
                          {prohibitedPoints.length} sommet{prohibitedPoints.length > 1 ? "s" : ""} défini{prohibitedPoints.length > 1 ? "s" : ""}
                          {prohibitedPoints.length < 3 && " (min 3 requis)"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setProhibitedPoints([])}
                          className="text-zinc-500 hover:text-rose-400 text-[10px] font-mono flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Effacer
                        </button>
                      </div>
                      <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                        {prohibitedPoints.map((pt, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between px-2 py-1 bg-zinc-900 rounded-lg text-[10px] font-mono text-zinc-400"
                          >
                            <span>
                              #{idx + 1} : {pt[1].toFixed(3)}, {pt[0].toFixed(3)}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setProhibitedPoints((prev) => prev.filter((_, i) => i !== idx))
                              }
                              className="text-zinc-500 hover:text-red-400"
                              title="Supprimer ce sommet"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Champs optionnels */}
                <div className="space-y-2 pt-1 border-t border-zinc-800/80">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                      Nom / Libellé du périmètre (optionnel)
                    </label>
                    <input
                      type="text"
                      value={prohibitedName}
                      onChange={(e) => setProhibitedName(e.target.value)}
                      placeholder="Ex: Périmètre Centre-Ville / Préfecture"
                      maxLength={100}
                      className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                      Référence de l&apos;arrêté préfectoral (optionnel)
                    </label>
                    <input
                      type="text"
                      value={prohibitedDecreeRef}
                      onChange={(e) => setProhibitedDecreeRef(e.target.value)}
                      placeholder="Ex: Arrêté préfectoral n° 2026-CAB-44"
                      maxLength={100}
                      className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-rose-400 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                        Heure début (optionnel)
                      </label>
                      <input
                        type="time"
                        value={prohibitedStartTime}
                        onChange={(e) => setProhibitedStartTime(e.target.value)}
                        className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-rose-400 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                        Heure fin (optionnel)
                      </label>
                      <input
                        type="time"
                        value={prohibitedEndTime}
                        onChange={(e) => setProhibitedEndTime(e.target.value)}
                        className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-rose-400 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleSaveProhibitedZone}
                    disabled={prohibitedPoints.length < 3 || isBroadcastingZones}
                    className="w-full py-2.5 px-3 bg-rose-700 hover:bg-rose-600 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Valider et publier le périmètre</span>
                  </button>

                  {activeProhibitedZone && (
                    <button
                      type="button"
                      onClick={handleClearProhibitedZone}
                      disabled={isBroadcastingZones}
                      className="w-full py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-red-300 text-[11px] font-bold rounded-xl border border-zinc-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Supprimer le périmètre</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Zone de dispersion */}
              <div className="bg-zinc-900/90 border border-orange-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5" /> 2. Zone de dispersion (1 geste)
                  </span>
                  {activeDispersionZone && activeDispersionZone.isActive && activeDispersionZone.expiresAt > Date.now() ? (
                    <span className="px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-[9px] font-mono text-orange-300 font-bold animate-pulse">
                      En cours
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-[9px] font-mono text-zinc-400">
                      Inactive
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-zinc-400 leading-snug">
                  Déclenche immédiatement une alerte orange pulsante et calcule automatiquement les 2-3 meilleures issues de secours vers l&apos;extérieur.
                </p>

                {/* Position du centre */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase">
                      Centre du cercle de dispersion
                    </label>
                    {dispersionCenter && (
                      <span className="text-[10px] font-mono text-orange-300">
                        {dispersionCenter[1].toFixed(3)}, {dispersionCenter[0].toFixed(3)}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPlacementMode("dispersion_center");
                        setMobileAdminView("map");
                        setTimeout(() => mapRef.current?.resize(), 60);
                      }}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                        placementMode === "dispersion_center"
                          ? "bg-orange-600 text-white border-orange-400 animate-pulse"
                          : "bg-zinc-800 hover:bg-zinc-700 text-orange-300 border-zinc-700"
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate">
                        {placementMode === "dispersion_center" ? "Touchez carte..." : "Pointer centre"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const target = headCoords
                          ? [headCoords.lng, headCoords.lat]
                          : [nantesData.center[0], nantesData.center[1]];
                        setDispersionCenter(target as [number, number]);
                      }}
                      className="py-2 px-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl border border-zinc-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Compass className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="truncate">Sur la tête / centre</span>
                    </button>
                  </div>
                </div>

                {/* Réglage du Rayon */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase">
                      Rayon de dispersion : <strong className="text-orange-400 font-bold">{dispersionRadiusMeters} m</strong>
                    </label>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[150, 250, 400, 600].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setDispersionRadiusMeters(r)}
                        className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-colors border ${
                          dispersionRadiusMeters === r
                            ? "bg-orange-500/20 text-orange-300 border-orange-500/50"
                            : "bg-zinc-800/80 text-zinc-400 border-zinc-700"
                        }`}
                      >
                        {r} m
                      </button>
                    ))}
                  </div>
                </div>

                {/* Réglage du TTL (Expiration automatique) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase">
                      Durée avant expiration : <strong className="text-orange-400 font-bold">{dispersionTtlMinutes} min</strong>
                    </label>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[5, 10, 15, 30].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setDispersionTtlMinutes(t)}
                        className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-colors border ${
                          dispersionTtlMinutes === t
                            ? "bg-orange-500/20 text-orange-300 border-orange-500/50"
                            : "bg-zinc-800/80 text-zinc-400 border-zinc-700"
                        }`}
                      >
                        {t} min
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bouton d'action 1 geste */}
                <div className="pt-2">
                  {activeDispersionZone && activeDispersionZone.isActive && activeDispersionZone.expiresAt > Date.now() ? (
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-orange-950/40 border border-orange-500/40 text-xs text-orange-300 flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1.5">
                          <Radio className="w-3.5 h-3.5 animate-pulse" />
                          Dispersion en cours
                        </span>
                        <span className="font-mono font-bold">
                          Fin dans {Math.max(1, Math.round((activeDispersionZone.expiresAt - Date.now()) / 60000))} min
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleStopDispersion}
                        disabled={isBroadcastingZones}
                        className="w-full py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-red-300 hover:text-white text-xs font-extrabold rounded-xl border border-red-500/30 transition-all shadow flex items-center justify-center gap-1.5"
                      >
                        <OctagonAlert className="w-4 h-4 text-red-400" />
                        <span>🛑 Arrêter / Désactiver la dispersion</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleActivateDispersion}
                      disabled={isBroadcastingZones}
                      className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Radio className="w-4 h-4 animate-pulse" />
                      <span>🚨 Activer la dispersion en cours</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Section de Diffusion Explicite des Zones */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Signature &amp; Diffusion des Zones
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleBroadcastAdminZones()}
                  disabled={isBroadcastingZones}
                  className="w-full py-2.5 px-3 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isBroadcastingZones ? "animate-spin" : ""}`} />
                  <span>
                    {isBroadcastingZones
                      ? "Signature Ed25519 & Envoi..."
                      : "Signer & Diffuser les Zones (Ed25519)"}
                  </span>
                </button>

                {lastZonesBroadcastTime && (
                  <div className="text-[10px] font-mono text-emerald-400 bg-emerald-950/20 p-2 rounded-lg border border-emerald-500/20">
                    Diffusé à {new Date(lastZonesBroadcastTime).toLocaleTimeString()} • Sig: {lastZonesBroadcastSig}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================== ONGLET 3 : CHIFFRES DU JOUR ===================== */}
          {adminActiveTab === "chiffres" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* 5. Chiffres Officiels du Jour */}
              <div className="bg-zinc-900/90 border border-indigo-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5" /> Chiffres du Jour (Observatoire)
                  </span>
                  {(policeCountInput || unionCountInput || thirdPartyCountInput) && (
                    <button
                      type="button"
                      onClick={() => {
                        setPoliceCountInput("");
                        setUnionCountInput("");
                        setThirdPartyCountInput("");
                        setMobilisationLabel("");
                      }}
                      className="text-zinc-500 hover:text-red-400 p-1 text-[11px]"
                      title="Réinitialiser les chiffres du jour"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-zinc-400 leading-snug">
                  Diffusez en direct (signé Ed25519 + sauvegardé dans <code className="text-cyan-400 font-mono">nantes.json</code>) les estimations du jour.
                </p>

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                      Intitulé / Mouvement du jour (optionnel)
                    </label>
                    <input
                      type="text"
                      value={mobilisationLabel}
                      onChange={(e) => setMobilisationLabel(e.target.value)}
                      placeholder="Ex: Mobilisation intersyndicale Nantes"
                      maxLength={140}
                      className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-mono text-sky-400 uppercase mb-1">
                        Préfecture / Police
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={2000000}
                        value={policeCountInput}
                        onChange={(e) => setPoliceCountInput(e.target.value)}
                        placeholder="Ex: 15000"
                        className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-sky-400 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-rose-400 uppercase mb-1">
                        Syndicats / Org.
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={2000000}
                        value={unionCountInput}
                        onChange={(e) => setUnionCountInput(e.target.value)}
                        placeholder="Ex: 42000"
                        className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-rose-400 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-amber-400 uppercase mb-1">
                      Estimation Tiers / Médias (optionnel)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={2000000}
                      value={thirdPartyCountInput}
                      onChange={(e) => setThirdPartyCountInput(e.target.value)}
                      placeholder="Ex: 28000"
                      className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  {policeCountInput &&
                    unionCountInput &&
                    parseInt(policeCountInput, 10) > 0 && (
                      <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-[11px] font-mono text-indigo-300 flex items-center justify-between">
                        <span>Ratio calculé :</span>
                        <span className="font-bold text-amber-300">
                          {(
                            parseInt(unionCountInput, 10) /
                            parseInt(policeCountInput, 10)
                          ).toFixed(2)}
                          x (Écart : +
                          {Math.abs(
                            parseInt(unionCountInput, 10) -
                              parseInt(policeCountInput, 10)
                          ).toLocaleString("fr-FR")}
                          )
                        </span>
                      </div>
                    )}
                </div>
              </div>

              {/* Synchronisation Automatique GitHub pour les Chiffres */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <GitCommit className="w-3.5 h-3.5 text-purple-400 shrink-0" /> Commit Chiffres dans nantes.json
                  </span>
                </div>

                <p className="text-[11px] text-zinc-400 leading-snug">
                  Pousse les chiffres saisis dans la source de vérité <code className="text-cyan-400 font-mono">nantes.json</code> sur GitHub.
                </p>

                <button
                  onClick={handleManualSyncGitHub}
                  disabled={isSyncingGithub || !githubToken.trim()}
                  className="w-full py-2.5 px-3 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
                >
                  <GitCommit className={`w-3.5 h-3.5 shrink-0 ${isSyncingGithub ? "animate-spin" : ""}`} />
                  <span>
                    {isSyncingGithub ? "Mise à jour GitHub..." : "Pousser les chiffres sur GitHub"}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Info signature */}
          {lastBroadcastTime && (
            <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 space-y-1 font-mono">
              <div className="flex items-center gap-1.5 font-sans font-bold">
                <Check className="w-4 h-4 text-emerald-400" />
                Cortège Signé &amp; Diffusé à {new Date(lastBroadcastTime).toLocaleTimeString()}
              </div>
              <div className="text-[10px] text-zinc-400 break-all">
                Sig: {lastBroadcastSig}
              </div>
            </div>
          )}
        </div>

        {/* Panel droit : Carte interactive pleine hauteur */}
        <div
          className={`lg:col-span-7 xl:col-span-8 relative h-full min-h-[360px] ${
            mobileAdminView === "controls" ? "hidden lg:block" : "block"
          }`}
        >
          <div ref={mapContainerRef} className="w-full h-full" />

          {placementMode && (
            <div
              className={`absolute top-3 left-3 right-3 z-20 backdrop-blur-md border text-white px-3.5 py-2.5 rounded-2xl text-center text-xs font-bold shadow-2xl flex items-center justify-between gap-2 ${
                placementMode === "prohibited_polygon"
                  ? "bg-rose-900/95 border-rose-500"
                  : placementMode === "dispersion_center"
                  ? "bg-orange-800/95 border-orange-500"
                  : "bg-blue-600/95 border-blue-400"
              }`}
            >
              <span className="truncate">
                {placementMode === "head" && "🚩 Touchez la carte pour placer la Tête"}
                {placementMode === "tail" && "🏁 Touchez la carte pour placer la Fin"}
                {placementMode === "waypoint" && "📍 Touchez la carte pour ajouter une Étape"}
                {placementMode === "prohibited_polygon" &&
                  `⛔ Touchez la carte pour ajouter des sommets (${prohibitedPoints.length} placés)`}
                {placementMode === "dispersion_center" &&
                  "🚨 Touchez la carte pour positionner le centre de dispersion"}
              </span>
              <button
                type="button"
                onClick={() => setPlacementMode(null)}
                className="px-2.5 py-1 rounded-lg bg-black/40 hover:bg-black/60 text-[10px] font-mono shrink-0"
              >
                Terminer
              </button>
            </div>
          )}

          {/* Boutons flottants rapides sur mobile quand on est sur la carte */}
          <div
            className="lg:hidden absolute bottom-5 left-3 right-3 z-20 flex items-center justify-between gap-2 pointer-events-none"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}
          >
            <button
              type="button"
              onClick={() => setMobileAdminView("controls")}
              className="pointer-events-auto px-3.5 py-2.5 rounded-2xl bg-zinc-950/90 border border-zinc-700 text-white text-xs font-bold shadow-2xl flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>Retour aux réglages</span>
            </button>

            {adminActiveTab === "zones" ? (
              <button
                type="button"
                onClick={() => {
                  setPlacementMode(
                    placementMode === "prohibited_polygon" ? null : "prohibited_polygon"
                  );
                }}
                className={`pointer-events-auto px-3.5 py-2.5 rounded-2xl text-white text-xs font-bold shadow-2xl flex items-center gap-1 ${
                  placementMode === "prohibited_polygon"
                    ? "bg-rose-700 border border-rose-400"
                    : "bg-rose-600 hover:bg-rose-500"
                }`}
              >
                <Ban className="w-3.5 h-3.5" />
                <span>
                  {placementMode === "prohibited_polygon"
                    ? `Sommets (${prohibitedPoints.length})`
                    : "+ Sommet"}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setPlacementMode("waypoint");
                }}
                className="pointer-events-auto px-3.5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-2xl flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Étape</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
