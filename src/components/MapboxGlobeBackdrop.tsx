"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { inferSoundscapeTags } from "@/lib/sound";
import type { GeneratedDilemma } from "@/types/world2046";

const secondsPerRevolution = 260;
const maxSpinZoom = 4.2;
const slowSpinZoom = 2.6;
const orbitMsPerRevolution = 240000;
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

// Interpolate N points along the great-circle path between two [lng, lat] coords
function interpolateGreatCircle(
  from: [number, number],
  to: [number, number],
  steps = 80
): [number, number][] {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const lat1 = toRad(from[1]);
  const lng1 = toRad(from[0]);
  const lat2 = toRad(to[1]);
  const lng2 = toRad(to[0]);

  const d = 2 * Math.asin(
    Math.sqrt(
      Math.pow(Math.sin((lat2 - lat1) / 2), 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lng2 - lng1) / 2), 2)
    )
  );

  if (d === 0) return [from];

  return Array.from({ length: steps + 1 }, (_, i) => {
    const f = i / steps;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2);
    const y = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);
    const lat = toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)));
    const lng = toDeg(Math.atan2(y, x));
    return [lng, lat] as [number, number];
  });
}

function getFogForDilemma(dilemma: GeneratedDilemma) {
  const tags = inferSoundscapeTags(dilemma);

  if (tags.includes("coastal")) {
    return {
      color: "rgb(90, 140, 180)",
      "high-color": "rgb(130, 178, 210)",
      "horizon-blend": 0.18,
      "space-color": "rgb(5, 9, 26)",
      "star-intensity": 0.32,
    };
  }
  if (tags.includes("desert")) {
    return {
      color: "rgb(170, 128, 68)",
      "high-color": "rgb(210, 172, 110)",
      "horizon-blend": 0.22,
      "space-color": "rgb(18, 10, 4)",
      "star-intensity": 0.5,
    };
  }
  if (tags.includes("industrial")) {
    return {
      color: "rgb(38, 54, 76)",
      "high-color": "rgb(72, 102, 136)",
      "horizon-blend": 0.11,
      "space-color": "rgb(4, 7, 18)",
      "star-intensity": 0.28,
    };
  }
  if (tags.includes("care") || tags.includes("hopeful")) {
    return {
      color: "rgb(110, 135, 160)",
      "high-color": "rgb(152, 185, 210)",
      "horizon-blend": 0.17,
      "space-color": "rgb(5, 9, 26)",
      "star-intensity": 0.42,
    };
  }
  // Default: urban / high-tech — crisp blue
  return {
    color: "rgb(20, 52, 92)",
    "high-color": "rgb(72, 132, 190)",
    "horizon-blend": 0.14,
    "space-color": "rgb(6, 10, 28)",
    "star-intensity": 0.45,
  };
}

const DEFAULT_FOG = {
  color: "rgb(20, 52, 92)",
  "high-color": "rgb(72, 132, 190)",
  "horizon-blend": 0.14,
  "space-color": "rgb(6, 10, 28)",
  "star-intensity": 0.45,
};

export function MapboxGlobeBackdrop({
  active,
  zoomed,
  introProgressRef,
  slowAfterIntro = false,
}: {
  active?: GeneratedDilemma;
  zoomed: boolean;
  introProgressRef?: React.MutableRefObject<number>;
  slowAfterIntro?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const activeRef = useRef<GeneratedDilemma | undefined>(active);
  const spinningRef = useRef(true);
  const orbitingRef = useRef(false);
  const orbitTimeoutRef = useRef<number | undefined>(undefined);
  const orbitFrameRef = useRef<number | undefined>(undefined);
  const slowAfterIntroRef = useRef(slowAfterIntro);
  const slowOrbitBaseRef = useRef<{ center: [number, number]; zoom: number; pitch: number; bearing: number } | null>(null);
  const slowOrbitStartedAtRef = useRef(0);
  const introBaseViewRef = useRef<{ center: [number, number]; zoom: number; pitch: number; bearing: number } | null>(null);
  // Track previous center for flight path arc
  const prevCenterRef = useRef<[number, number]>([8, 38]);
  const pathFrameRef = useRef<number | undefined>(undefined);
  const styleLoadedRef = useRef(false);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    slowAfterIntroRef.current = slowAfterIntro;
    if (!slowAfterIntro) {
      slowOrbitBaseRef.current = null;
    }
    if (slowAfterIntro && mapRef.current && (!introProgressRef || introProgressRef.current >= 0.999)) {
      const map = mapRef.current;
      const center = map.getCenter();
      slowOrbitBaseRef.current = {
        center: [center.lng, center.lat],
        zoom: map.getZoom(),
        pitch: map.getPitch(),
        bearing: map.getBearing(),
      };
      slowOrbitStartedAtRef.current = performance.now();
    }
  }, [slowAfterIntro, introProgressRef]);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token || !containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: labelFreeSatelliteStyle,
      center: [8, 38],
      zoom: 1.95,
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
      styleLoadedRef.current = true;
      map.setFog(DEFAULT_FOG);

      // Add flight path source + layer
      map.addSource("flight-path", {
        type: "geojson",
        data: { type: "Feature", geometry: { type: "LineString", coordinates: [] }, properties: {} },
      });

      map.addLayer({
        id: "flight-path-line",
        type: "line",
        source: "flight-path",
        paint: {
          "line-color": "rgba(143, 199, 232, 0.65)",
          "line-width": 1.4,
          "line-opacity": 1,
          "line-blur": 0.5,
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
      });

      spinGlobe();
    });

    map.on("moveend", spinGlobe);

    return () => {
      window.clearTimeout(orbitTimeoutRef.current);
      window.cancelAnimationFrame(orbitFrameRef.current ?? 0);
      window.cancelAnimationFrame(pathFrameRef.current ?? 0);
      orbitingRef.current = false;
      styleLoadedRef.current = false;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !introProgressRef) return;

    spinningRef.current = false;
    map.stop();

    const endZoom = 3.82;
    const endPitch = 34;
    const endBearing = 58;
    const startedAt = performance.now();

    let frameId: number;
    const tick = () => {
      const p = Math.min(Math.max(introProgressRef.current, 0), 1);
      const motionP = p * p * (3 - 2 * p);
      const transitionInProgress = p < 0.999;
      if (!transitionInProgress && slowAfterIntroRef.current && !slowOrbitBaseRef.current) {
        const center = map.getCenter();
        slowOrbitBaseRef.current = {
          center: [center.lng, center.lat],
          zoom: map.getZoom(),
          pitch: map.getPitch(),
          bearing: map.getBearing(),
        };
        slowOrbitStartedAtRef.current = performance.now();
      }
      if (!transitionInProgress && slowAfterIntroRef.current && slowOrbitBaseRef.current) {
        const base = slowOrbitBaseRef.current;
        const slowDrift = ((performance.now() - slowOrbitStartedAtRef.current) / 1000) * 0.9;
        map.jumpTo({
          center: [base.center[0] - slowDrift, base.center[1]],
          zoom: base.zoom,
          pitch: base.pitch,
          bearing: base.bearing + slowDrift,
        });
        frameId = requestAnimationFrame(tick);
        return;
      }
      if (!introBaseViewRef.current) {
        const center = map.getCenter();
        introBaseViewRef.current = {
          center: [center.lng, center.lat],
          zoom: map.getZoom(),
          pitch: map.getPitch(),
          bearing: map.getBearing(),
        };
      }
      const base = introBaseViewRef.current;
      // Keep a gentle orbit running underneath the transition and add the
      // faster travel movement as a smooth, eased offset.
      const rotationDrift = ((performance.now() - startedAt) / 1000) * 0.9 + motionP * 18;
      map.jumpTo({
        center: [base.center[0] - rotationDrift, base.center[1]],
        zoom: base.zoom + (endZoom - base.zoom) * motionP,
        pitch: base.pitch + (endPitch - base.pitch) * motionP,
        bearing: base.bearing + (endBearing - base.bearing) * motionP,
      });
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
      spinningRef.current = true;
      introBaseViewRef.current = null;
    };
  }, [introProgressRef]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (introProgressRef) return;

    window.clearTimeout(orbitTimeoutRef.current);
    window.cancelAnimationFrame(orbitFrameRef.current ?? 0);
    window.cancelAnimationFrame(pathFrameRef.current ?? 0);
    orbitingRef.current = false;

    if (!active) {
      spinningRef.current = true;
      // Reset fog and clear path
      if (styleLoadedRef.current) {
        map.setFog(DEFAULT_FOG);
        (map.getSource("flight-path") as mapboxgl.GeoJSONSource | undefined)?.setData({
          type: "Feature",
          geometry: { type: "LineString", coordinates: [] },
          properties: {},
        });
      }
      prevCenterRef.current = [8, 38];
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

    // Update fog for destination
    if (styleLoadedRef.current) {
      map.setFog(getFogForDilemma(active));
    }

    const targetZoom = active.exactPlace ? (zoomed ? 16.35 : 15.4) : zoomed ? 13.6 : 12.8;
    const targetPitch = zoomed ? 58 : 46;
    const targetBearing = active.marker.lng >= 8 ? -24 : 24;
    const flyDuration = zoomed ? 5400 : 4600;

    const destCoords: [number, number] = [active.marker.lng, active.marker.lat];
    const fromCoords: [number, number] = [...prevCenterRef.current];

    // Draw flight path arc progressively over the flyTo duration
    if (styleLoadedRef.current && fromCoords[0] !== destCoords[0]) {
      const allPoints = interpolateGreatCircle(fromCoords, destCoords, 80);
      let revealed = 1;

      // Clear old path first
      (map.getSource("flight-path") as mapboxgl.GeoJSONSource | undefined)?.setData({
        type: "Feature",
        geometry: { type: "LineString", coordinates: [allPoints[0]] },
        properties: {},
      });

      const drawFrame = () => {
        revealed = Math.min(revealed + 2, allPoints.length);
        (map.getSource("flight-path") as mapboxgl.GeoJSONSource | undefined)?.setData({
          type: "Feature",
          geometry: { type: "LineString", coordinates: allPoints.slice(0, revealed) },
          properties: {},
        });
        if (revealed < allPoints.length) {
          pathFrameRef.current = window.requestAnimationFrame(drawFrame);
        } else {
          // Fade out arc after orbit starts
          window.setTimeout(() => {
            (map.getSource("flight-path") as mapboxgl.GeoJSONSource | undefined)?.setData({
              type: "Feature",
              geometry: { type: "LineString", coordinates: [] },
              properties: {},
            });
          }, flyDuration + 2000);
        }
      };

      pathFrameRef.current = window.requestAnimationFrame(drawFrame);
    }

    prevCenterRef.current = destCoords;

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
