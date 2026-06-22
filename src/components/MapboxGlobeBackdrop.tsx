"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import type { GeneratedDilemma } from "@/types/world2046";

const secondsPerRevolution = 130;
const maxSpinZoom = 4.2;
const slowSpinZoom = 2.6;

const labelFreeSatelliteStyle: mapboxgl.StyleSpecification = {
  version: 8,
  sources: {
    satellite: {
      type: "raster",
      url: "mapbox://mapbox.satellite",
      tileSize: 256,
    },
  },
  layers: [
    {
      id: "satellite",
      type: "raster",
      source: "satellite",
    },
  ],
};

export function MapboxGlobeBackdrop({
  active,
  zoomed,
}: {
  active?: GeneratedDilemma;
  zoomed: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const activeRef = useRef<GeneratedDilemma | undefined>(active);
  const spinningRef = useRef(true);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token || !containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: labelFreeSatelliteStyle,
      center: [8, 38],
      zoom: 1.78,
      bearing: 0,
      pitch: 0,
      interactive: false,
      attributionControl: false,
      logoPosition: "bottom-left",
      projection: "globe",
    });

    mapRef.current = map;
    window.setTimeout(() => map.resize(), 0);
    window.setTimeout(() => map.resize(), 250);

    const spinGlobe = () => {
      if (!spinningRef.current || activeRef.current) return;
      const zoom = map.getZoom();
      if (zoom >= maxSpinZoom) return;

      let distancePerSecond = 360 / secondsPerRevolution;
      if (zoom > slowSpinZoom) {
        const zoomDifference = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
        distancePerSecond *= zoomDifference;
      }

      const center = map.getCenter();
      center.lng -= distancePerSecond;
      map.easeTo({ center, duration: 1000, easing: (n) => n });
    };

    map.on("style.load", () => {
      map.setFog({
        color: "rgb(14, 48, 78)",
        "high-color": "rgb(54, 112, 152)",
        "horizon-blend": 0.1,
        "space-color": "rgb(3, 18, 34)",
        "star-intensity": 0.14,
      });
      spinGlobe();
    });

    map.on("moveend", spinGlobe);

    return () => {
      markerRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markerRef.current?.remove();
    markerRef.current = null;

    if (!active) {
      spinningRef.current = true;
      map.easeTo({
        center: [8, 38],
        zoom: 1.78,
        bearing: 0,
        pitch: 0,
        duration: 1200,
        easing: (n) => n,
      });
      return;
    }

    spinningRef.current = false;
    map.stop();
    map.flyTo({
      center: [active.marker.lng, active.marker.lat],
      zoom: active.exactPlace ? (zoomed ? 16.35 : 15.4) : zoomed ? 13.6 : 12.8,
      bearing: 0,
      pitch: zoomed ? 0 : 22,
      speed: 0.48,
      curve: 1.5,
      essential: true,
    });

    const markerElement = document.createElement("div");
    markerElement.className = "relative h-12 w-12 rounded-full border border-white/85 shadow-[0_0_32px_rgba(255,255,255,0.35)]";
    markerElement.innerHTML =
      '<span class="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/65"></span><span class="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/65"></span>';

    window.setTimeout(() => {
      if (activeRef.current?.id !== active.id || !mapRef.current) return;
      markerRef.current = new mapboxgl.Marker({ element: markerElement, anchor: "center" })
        .setLngLat([active.marker.lng, active.marker.lat])
        .addTo(map);
    }, 2100);
  }, [active, zoomed]);

  if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) return null;

  return (
    <div className="absolute inset-0 z-0 h-screen w-screen overflow-hidden">
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_48%_42%,rgba(255,255,255,0.18)_0_24%,rgba(143,199,232,0.12)_50%,rgba(10,35,56,0.28)_100%)]" />
    </div>
  );
}
