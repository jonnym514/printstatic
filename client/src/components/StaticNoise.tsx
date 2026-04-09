/**
 * StaticNoise — animated TV static canvas component
 *
 * Uses an offscreen canvas pre-rendered with random B&W pixels.
 * Each frame the offscreen canvas is drawn at a random offset,
 * giving the illusion of moving static with minimal CPU cost.
 *
 * A teal colour overlay is applied via CSS mix-blend-mode so the
 * static feels on-brand rather than plain grey.
 */

import { useEffect, useRef } from "react";

interface StaticNoiseProps {
  /** Width of the visible canvas in px */
  width?: number;
  /** Height of the visible canvas in px */
  height?: number;
  /** 0–1 opacity of the noise layer */
  opacity?: number;
  /** Additional Tailwind / CSS classes */
  className?: string;
}

export default function StaticNoise({
  width = 80,
  height = 32,
  opacity = 0.85,
  className = "",
}: StaticNoiseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // Build a 2× offscreen canvas filled once with random noise
    const ow = width * 2;
    const oh = height * 2;
    const offscreen = document.createElement("canvas");
    offscreen.width = ow;
    offscreen.height = oh;
    const octx = offscreen.getContext("2d", { alpha: false })!;
    const idata = octx.createImageData(ow, oh);
    const buf32 = new Uint32Array(idata.data.buffer);

    // Fill with random black/white pixels — teal tint applied via CSS
    for (let i = 0; i < buf32.length; i++) {
      // ~60% white, 40% black for a slightly brighter static feel
      buf32[i] = Math.random() < 0.6 ? 0xffffffff : 0xff000000;
    }
    octx.putImageData(idata, 0, 0);

    let lastTime = 0;
    const FPS = 24; // 24 fps feels like authentic TV static
    const interval = 1000 / FPS;

    function loop(ts: number) {
      if (ts - lastTime >= interval) {
        lastTime = ts;
        // Draw offscreen canvas at random integer offset for motion
        const ox = ((Math.random() * width) | 0);
        const oy = ((Math.random() * height) | 0);
        ctx!.drawImage(offscreen, -ox, -oy);
      }
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafRef.current);
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ opacity }}
      className={`block rounded-sm ${className}`}
    />
  );
}
