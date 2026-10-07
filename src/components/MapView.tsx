"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import * as pmtiles from "pmtiles";
import "maplibre-gl/dist/maplibre-gl.css";

import { ConsensusMarker, CortegeState, POI, ReportCategory } from "@/types";
import nantesData from "@/config/cities/nantes.json";
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

// Initialisation globale du protocole PMTiles une seule fois
let isProtocolAdded = false;
if (typeof window !== "undefined" && !isProtocolAdded) {
  const protocol = new pmtiles.Protocol();
  maplibregl.addProtocol("pmtiles", protocol.tile);
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
  const poiMarkersRef = useRef<maplibregl.Marker[]>([]);

  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [selectedConsensus, setSelectedConsensus] = useState<ConsensusMarker | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  const cartoApiKey =
    process.env.NEXT_PUBLIC_CARTO_API_KEY ||
    "eyJhbGciOiJIUzI1NiJ9.eyJhIjoiYWNfeTkyeWE2bmIiLCJqdGkiOiJiNDJjZjEyMjY0OTY5YzYwODk4OTVlZmQxOTE3ZWNhOSJ9.U8XMi3bYAi_U2UqdrQOuouTMWVvx-6yl0vzEHHNYcyA";
  const cartoQuery = cartoApiKey ? `?api_key=${cartoApiKey}` : "";

  // Style de carte sombre haute lisibilité (OLED optimisé)
  const darkMapStyle: maplibregl.StyleSpecification = {
    version: 8,
    name: "LegalMaps Dark OLED",
    sources: {
      "osm-dark": {
        type: "raster",
        tiles: [
          `https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png${cartoQuery}`,
          `https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png${cartoQuery}`,
          `https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png${cartoQuery}`,
        ],
        tileSize: 256,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      },
      "nantes-pmtiles-source": {
        type: "vector",
        url: `pmtiles://${typeof window !== "undefined" && window.location.pathname.startsWith("/legalmap") ? "/legalmap" : ""}/tiles/nantes.pmtiles`,
      },
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: {
          "background-color": "#050507",
        },
      },
      {
        id: "osm-dark-tiles",
        type: "raster",
        source: "osm-dark",
        minzoom: 0,
        maxzoom: 19,
        paint: {
          "raster-opacity": 0.85,
          "raster-contrast": 0.1,
          "raster-saturation": -0.8,
        },
      },
    ],
  };

  // Initialisation de la carte MapLibre
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: darkMapStyle,
      center: nantesData.center as [number, number],
      zoom: nantesData.defaultZoom,
      minZoom: nantesData.minZoom,
      maxZoom: nantesData.maxZoom,
      attributionControl: false,
    });

    map.addControl(
      new maplibregl.AttributionControl({
        compact: true,
      }),
      "bottom-right"
    );

    map.on("load", () => {
      setMapLoaded(true);

      // 1. Ajout de la source du parcours officiel GeoJSON de Nantes
      map.addSource("official-route-source", {
        type: "geojson",
        data: nantesData.officialRoute as any,
      });

      // Lueur d'arrière-plan du tracé (Halo Cyan)
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
          "line-opacity": 0.3,
          "line-blur": 4,
        },
      });

      // Ligne principale du tracé officiel
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
          "line-dasharray": [1, 0],
        },
      });

      // 2. Création des POIs statiques (Hôpitaux, Pharmacies, Points d'Eau)
      nantesData.pois.forEach((poi) => {
        const el = document.createElement("div");
        el.className = "poi-marker cursor-pointer";
        el.setAttribute("title", poi.name);

        let iconEmoji = "💧";
        let bgClass = "bg-blue-600/80 border-blue-400";
        if (poi.category === "HOSPITAL") {
          iconEmoji = "🏥";
          bgClass = "bg-red-600/90 border-red-300";
        } else if (poi.category === "PHARMACY") {
          iconEmoji = "💊";
          bgClass = "bg-emerald-600/80 border-emerald-300";
        } else if (poi.category === "EMERGENCY") {
          iconEmoji = "⚖️";
          bgClass = "bg-purple-600/80 border-purple-300";
        }

        el.innerHTML = `
          <div class="flex items-center justify-center w-8 h-8 rounded-full border-2 ${bgClass} shadow-lg text-sm select-none transform hover:scale-125 transition-transform">
            ${iconEmoji}
          </div>
        `;

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          setSelectedPoi(poi as POI);
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(poi.coordinates as [number, number])
          .addTo(map);

        poiMarkersRef.current.push(marker);
      });
    });

    // Clic sur la carte (pour le mode sélection d'un point)
    map.on("click", (e) => {
      if (onMapClickReport) {
        onMapClickReport({
          lat: e.lngLat.lat,
          lng: e.lngLat.lng,
        });
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

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
      const remainingText = formatTimeRemaining(remainingMs);

      if (currentMarkers.has(markerData.id)) {
        // Mise à jour de la position et de l'affichage du temps restant
        const marker = currentMarkers.get(markerData.id)!;
        marker.setLngLat([markerData.lng, markerData.lat]);

        const el = marker.getElement();
        const badgeEl = el.querySelector(".marker-badge");
        const timeEl = el.querySelector(".marker-time");
        if (badgeEl) badgeEl.textContent = `x${markerData.reportCount}`;
        if (timeEl) timeEl.textContent = remainingText;
      } else {
        // Création d'un nouveau marqueur animé
        const el = document.createElement("div");
        el.className = "consensus-marker cursor-pointer";
        el.innerHTML = `
          <div class="relative flex flex-col items-center group">
            <div class="w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-2xl relative" style="background-color: ${meta.badgeBg}; border-color: ${meta.borderColor}; box-shadow: 0 0 16px ${meta.color}66;">
              <div class="w-12 h-12 rounded-full absolute -inset-1 animate-ping opacity-40" style="background-color: ${meta.color};"></div>
              <span class="text-xs font-black text-white relative z-10 marker-badge">x${markerData.reportCount}</span>
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

  // Synchronisation des positions de la Tête et Fin de Cortège
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    // Tête de cortège
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

    // Fin de cortège
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
          className="fixed inset-0 sm:inset-auto sm:top-20 sm:left-4 z-40 flex items-end sm:items-start justify-center p-4 bg-black/60 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none"
        >
          <div className="w-full max-w-sm bg-[#101014] border border-zinc-700 rounded-3xl p-4 shadow-2xl text-zinc-100 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                  Point d&apos;Urgence Vital
                </span>
                <h4 className="font-bold text-sm text-white mt-0.5">{selectedPoi.name}</h4>
                <p className="text-xs text-zinc-400 mt-1">{selectedPoi.address}</p>
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
              <div className="mt-3 p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300">
                {selectedPoi.emergencyInfo}
              </div>
            )}

            {selectedPoi.phone && (
              <div className="mt-3">
                <a
                  href={`tel:${selectedPoi.phone.replace(/\s+/g, "")}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Appeler {selectedPoi.phone}
                </a>
              </div>
            )}
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

