"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import type { GeneratedDilemma } from "@/types/world2046";

export function MapboxFlyToBackdrop({ dilemma, active }: { dilemma?: GeneratedDilemma; active: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!active || !dilemma || !containerRef.current || !token) return;

    mapboxgl.accessToken = token;
    mapRef.current?.remove();

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/satellite-v9",
      center: [12, 35],
      zoom: 1.35,
      bearing: -8,
      pitch: 18,
      interactive: false,
      attributionControl: false,
      logoPosition: "bottom-left",
    });

    mapRef.current = map;

    map.on("load", () => {
      window.setTimeout(() => {
        map.flyTo({
          center: [dilemma.marker.lng, dilemma.marker.lat],
          zoom: dilemma.exactPlace ? 16.2 : 13.4,
          bearing: 0,
          pitch: 0,
          speed: 0.58,
          curve: 1.35,
          essential: true,
        });
      }, 250);

      window.setTimeout(() => {
        const markerElement = document.createElement("div");
        markerElement.className = "relative h-12 w-12 rounded-full border border-white/85 shadow-[0_0_32px_rgba(255,255,255,0.35)]";
        markerElement.innerHTML = '<span class="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/65"></span><span class="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/65"></span>';
        markerRef.current = new mapboxgl.Marker({ element: markerElement, anchor: "center" })
          .setLngLat([dilemma.marker.lng, dilemma.marker.lat])
          .addTo(map);
      }, 2600);
    });

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [active, dilemma]);

  if (!active || !dilemma || !process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
      <div ref={containerRef} className="absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0_20%,rgba(2,11,22,0.22)_48%,rgba(2,11,22,0.82)_100%)]" />
      <div className="absolute inset-0 bg-slate-950/10" />
      <div className="absolute bottom-5 left-5 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-xs text-white/62 backdrop-blur-md">
        Mapbox Satellite · animated fly-to
      </div>
    </div>
  );
}
