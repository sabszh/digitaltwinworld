"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import type { GeneratedDilemma } from "@/types/world2046";

const orbitMsPerRevolution = 52000;
const easeOutCubic = (n: number) => 1 - Math.pow(1 - n, 3);

export function MapboxFlyToBackdrop({ dilemma, active }: { dilemma?: GeneratedDilemma; active: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const orbitingRef = useRef(false);
  const orbitTimeoutRef = useRef<number | undefined>(undefined);
  const orbitFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!active || !dilemma || !containerRef.current || !token) return;

    window.clearTimeout(orbitTimeoutRef.current);
    window.cancelAnimationFrame(orbitFrameRef.current ?? 0);
    orbitingRef.current = false;
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
      const targetZoom = dilemma.exactPlace ? 16.2 : 13.4;
      const targetPitch = 58;
      const targetBearing = dilemma.marker.lng >= 8 ? -22 : 22;
      const flyDuration = 3600;

      const orbitArea = () => {
        const startBearing = map.getBearing();
        const startedAt = performance.now();

        const orbitFrame = (now: number) => {
          if (!orbitingRef.current) return;

          const elapsed = now - startedAt;
          const bearing = startBearing + (elapsed / orbitMsPerRevolution) * 360;
          map.jumpTo({
            center: [dilemma.marker.lng, dilemma.marker.lat],
            zoom: targetZoom,
            bearing,
            pitch: targetPitch,
          });

          orbitFrameRef.current = window.requestAnimationFrame(orbitFrame);
        };

        orbitFrameRef.current = window.requestAnimationFrame(orbitFrame);
      };

      window.setTimeout(() => {
        map.flyTo({
          center: [dilemma.marker.lng, dilemma.marker.lat],
          zoom: targetZoom,
          bearing: targetBearing,
          pitch: targetPitch,
          duration: flyDuration,
          curve: 1.85,
          easing: easeOutCubic,
          essential: true,
        });
      }, 250);

      orbitTimeoutRef.current = window.setTimeout(() => {
        orbitingRef.current = true;
        orbitArea();
      }, flyDuration + 500);

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
      window.clearTimeout(orbitTimeoutRef.current);
      window.cancelAnimationFrame(orbitFrameRef.current ?? 0);
      orbitingRef.current = false;
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0_22%,rgba(245,255,250,0.08)_48%,rgba(25,55,58,0.34)_100%)]" />
      <div className="absolute inset-0 bg-white/[0.04]" />
      <div className="surface-panel absolute bottom-5 left-5 rounded-xl px-3 py-2 text-xs text-[var(--muted)]">
        Mapbox Satellite · animated fly-to
      </div>
    </div>
  );
}
