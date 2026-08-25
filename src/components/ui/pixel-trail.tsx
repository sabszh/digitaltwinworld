"use client";

import React, { useCallback, useEffect, useId, useMemo, useRef } from "react";

import { cn } from "@/lib/utils";
import { useDimensions } from "@/components/hooks/use-debounced-dimensions";

interface PixelTrailProps {
  pixelSize?: number; // px
  fadeDuration?: number; // ms
  delay?: number; // ms
  className?: string;
  pixelClassName?: string;
  /**
   * Autonomous mode: milliseconds for one ring to travel from the centre to the
   * far corner, repeating. The original component only lights pixels under the
   * cursor, which renders nothing on a loading screen where the user is waiting
   * and touching nothing — and nothing at all on a kiosk with no pointer.
   * Leave undefined for the original mouse-driven behaviour.
   */
  sweepMs?: number;
}

const PixelTrail: React.FC<PixelTrailProps> = ({
  pixelSize = 20,
  fadeDuration = 500,
  delay = 0,
  className,
  pixelClassName,
  sweepMs,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dimensions = useDimensions(containerRef);
  // useId instead of uuid: React already guarantees a unique, stable id, so the
  // extra dependency buys nothing here.
  const trailId = useId().replace(/:/g, "");

  const columns = useMemo(() => Math.ceil(dimensions.width / pixelSize), [dimensions.width, pixelSize]);
  const rows = useMemo(() => Math.ceil(dimensions.height / pixelSize), [dimensions.height, pixelSize]);

  /**
   * Pixels are driven by writing opacity straight to the node with a CSS
   * transition rather than by giving every cell its own animation controller.
   * A full-screen grid is 1000+ cells and this screen already runs a WebGL globe,
   * so per-cell animation state is a cost the loading view cannot afford.
   */
  const light = useCallback(
    (element: HTMLElement) => {
      element.style.transition = "none";
      element.style.opacity = "1";
      void element.offsetHeight; // flush, so the fade below actually animates
      element.style.transition = `opacity ${fadeDuration}ms linear ${delay}ms`;
      element.style.opacity = "0";
    },
    [fadeDuration, delay],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current || sweepMs) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) / pixelSize);
      const y = Math.floor((event.clientY - rect.top) / pixelSize);
      const element = document.getElementById(`${trailId}-pixel-${x}-${y}`);
      if (element) light(element);
    },
    [pixelSize, trailId, light, sweepMs],
  );

  // Expanding ring, so the effect reads as something travelling outward.
  useEffect(() => {
    if (!sweepMs || !columns || !rows) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const centreX = (columns - 1) / 2;
    const centreY = (rows - 1) / 2;
    const maxRadius = Math.hypot(centreX, centreY) + 1;

    let frame = 0;
    let previousRadius = 0;
    const started = performance.now();

    const tick = (now: number) => {
      const progress = ((now - started) % sweepMs) / sweepMs;
      const radius = progress * maxRadius;
      // Wrapped around: start the next ring from the centre again.
      if (radius < previousRadius) previousRadius = 0;

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const distance = Math.hypot(column - centreX, row - centreY);
          if (distance >= previousRadius && distance < radius) {
            const element = document.getElementById(`${trailId}-pixel-${column}-${row}`);
            if (element) light(element);
          }
        }
      }

      previousRadius = radius;
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [sweepMs, columns, rows, trailId, light]);

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 w-full h-full", sweepMs ? "pointer-events-none" : "pointer-events-auto", className)}
      onMouseMove={handleMouseMove}
    >
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={`${colIndex}-${rowIndex}`}
              id={`${trailId}-pixel-${colIndex}-${rowIndex}`}
              className={cn(pixelClassName)}
              style={{ width: `${pixelSize}px`, height: `${pixelSize}px`, opacity: 0 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export { PixelTrail };
