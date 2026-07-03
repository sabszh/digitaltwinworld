"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import type { GeneratedDilemma } from "@/types/world2046";

const secondsPerRevolution = 130;
const maxSpinZoom = 4.2;
const slowSpinZoom = 2.6;
const orbitMsPerRevolution = 52000;
const easeOutCubic = (n: number) => 1 - Math.pow(1 - n, 3);

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
  introProgressRef,
}: {
  active?: GeneratedDilemma;
  zoomed: boolean;
  introProgressRef?: React.MutableRefObject<number>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const activeRef = useRef<GeneratedDilemma | undefined>(active);
  const spinningRef = useRef(true);
  const orbitingRef = useRef(false);
  const orbitTimeoutRef = useRef<number | undefined>(undefined);
  const orbitFrameRef = useRef<number | undefined>(undefined);

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
        color: "rgb(20, 52, 92)",
        "high-color": "rgb(72, 132, 190)",
        "horizon-blend": 0.14,
        "space-color": "rgb(6, 10, 28)",
        "star-intensity": 0.45,
      });
      spinGlobe();
    });

    map.on("moveend", spinGlobe);

    return () => {
      window.clearTimeout(orbitTimeoutRef.current);
      window.cancelAnimationFrame(orbitFrameRef.current ?? 0);
      orbitingRef.current = false;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !introProgressRef) return;

    spinningRef.current = false;
    map.stop();

    const startZoom = 1.78;
    const endZoom = 3.65;
    const startPitch = 0;
    const endPitch = 34;
    const startBearing = 0;
    const endBearing = 58;

    let frameId: number;
    const tick = () => {
      const p = Math.min(Math.max(introProgressRef.current, 0), 1);
      map.jumpTo({
        center: [8, 38],
        zoom: startZoom + (endZoom - startZoom) * p,
        pitch: startPitch + (endPitch - startPitch) * p,
        bearing: startBearing + (endBearing - startBearing) * p,
      });
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
      spinningRef.current = true;
    };
  }, [introProgressRef]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (introProgressRef) return;

    window.clearTimeout(orbitTimeoutRef.current);
    window.cancelAnimationFrame(orbitFrameRef.current ?? 0);
    orbitingRef.current = false;

    if (!active) {
      spinningRef.current = true;
      map.easeTo({
        center: [8, 38],
        zoom: 1.78,
        bearing: 0,
        pitch: 0,
        duration: 1200,
        easing: easeOutCubic,
      });
      return;
    }

    spinningRef.current = false;
    map.stop();

    const targetZoom = active.exactPlace ? (zoomed ? 16.35 : 15.4) : zoomed ? 13.6 : 12.8;
    const targetPitch = zoomed ? 58 : 46;
    const targetBearing = active.marker.lng >= 8 ? -24 : 24;
    const flyDuration = zoomed ? 5400 : 4600;

    const orbitArea = () => {
      const startBearing = map.getBearing();
      const startedAt = performance.now();

      const orbitFrame = (now: number) => {
        if (!orbitingRef.current || activeRef.current !== active) return;

        const elapsed = now - startedAt;
        const bearing = startBearing + (elapsed / orbitMsPerRevolution) * 360;
        map.jumpTo({
          center: [active.marker.lng, active.marker.lat],
          bearing,
          pitch: targetPitch,
          zoom: targetZoom,
        });

        orbitFrameRef.current = window.requestAnimationFrame(orbitFrame);
      };

      orbitFrameRef.current = window.requestAnimationFrame(orbitFrame);
    };

    map.flyTo({
      center: [active.marker.lng, active.marker.lat],
      zoom: targetZoom,
      bearing: targetBearing,
      pitch: targetPitch,
      duration: flyDuration,
      curve: 1.85,
      easing: easeOutCubic,
      essential: true,
    });

    orbitTimeoutRef.current = window.setTimeout(() => {
      orbitingRef.current = true;
      orbitArea();
    }, flyDuration + 250);
  }, [active, zoomed, introProgressRef]);

  if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) return null;

  return (
    <div className="absolute inset-0 z-0 h-screen w-screen overflow-hidden">
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_48%_42%,rgba(255,255,255,0.1)_0_22%,rgba(0,0,0,0.04)_48%,rgba(0,0,0,0.38)_100%)]" />
    </div>
  );
}
