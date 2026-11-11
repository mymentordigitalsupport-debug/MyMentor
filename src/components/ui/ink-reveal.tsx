"use client";

import { useCallback, useEffect, useRef } from "react";
import type { PointerEvent } from "react";

type InkRevealProps = {
  imageSrc: string;
  maskColor?: string;
  brushSize?: number;
  lifetime?: number;
  className?: string;
};

type Stamp = { x: number; y: number; created: number; radius: number; phase: number };

export default function InkReveal({
  imageSrc,
  maskColor = "#FAF0E3",
  brushSize = 120,
  lifetime = 1200,
  className = "",
}: InkRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stampsRef = useRef<Stamp[]>([]);
  const frameRef = useRef<number | null>(null);
  const enabledRef = useRef(false);
  const lastStampRef = useRef({ x: -1000, y: -1000, at: 0 });

  const paint = useCallback((now: number) => {
    frameRef.current = null;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const root = rootRef.current;
    if (!canvas || !context || !root) return;

    const width = root.clientWidth;
    const height = root.clientHeight;
    context.globalCompositeOperation = "source-over";
    context.clearRect(0, 0, width, height);
    context.fillStyle = maskColor;
    context.fillRect(0, 0, width, height);

    stampsRef.current = stampsRef.current.filter((stamp) => now - stamp.created < lifetime);
    if (enabledRef.current && stampsRef.current.length) {
      context.globalCompositeOperation = "destination-out";
      for (const stamp of stampsRef.current) {
        const age = (now - stamp.created) / lifetime;
        const strength = Math.min(1, (1 - age) * 2.4) * Math.min(1, (now - stamp.created) / 140);
        const radius = stamp.radius * (0.88 + 0.12 * Math.sin(stamp.phase + age * 2));
        const gradient = context.createRadialGradient(stamp.x, stamp.y, radius * 0.12, stamp.x, stamp.y, radius);
        gradient.addColorStop(0, `rgba(0,0,0,${0.7 * strength})`);
        gradient.addColorStop(0.6, `rgba(0,0,0,${0.42 * strength})`);
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        context.fillStyle = gradient;
        context.beginPath();
        context.ellipse(stamp.x, stamp.y, radius, radius * 0.88, stamp.phase * 0.08, 0, Math.PI * 2);
        context.fill();
      }
      context.globalCompositeOperation = "source-over";
      frameRef.current = requestAnimationFrame(paint);
    }
  }, [lifetime, maskColor]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const updatePreference = () => {
      enabledRef.current = !reducedMotion.matches && !coarsePointer.matches;
      if (!enabledRef.current) stampsRef.current = [];
      if (frameRef.current === null) frameRef.current = requestAnimationFrame(paint);
    };
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = root.clientWidth;
      const height = root.clientHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.getContext("2d")?.setTransform(ratio, 0, 0, ratio, 0, 0);
      if (frameRef.current === null) frameRef.current = requestAnimationFrame(paint);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    resize();
    updatePreference();
    reducedMotion.addEventListener("change", updatePreference);
    coarsePointer.addEventListener("change", updatePreference);
    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", updatePreference);
      coarsePointer.removeEventListener("change", updatePreference);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [paint]);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!enabledRef.current || event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const now = performance.now();
    const last = lastStampRef.current;
    if (Math.hypot(x - last.x, y - last.y) < brushSize * 0.28 && now - last.at < 35) return;
    const phase = x * 0.017 + y * 0.023;
    stampsRef.current.push({ x, y, created: now, radius: brushSize * (0.43 + 0.07 * Math.sin(phase)), phase });
    lastStampRef.current = { x, y, at: now };
    if (frameRef.current === null) frameRef.current = requestAnimationFrame(paint);
  };

  return (
    <div ref={rootRef} onPointerMove={onPointerMove} className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div className="absolute inset-0 opacity-75" style={{ backgroundImage: `url("${imageSrc}")`, backgroundSize: "265% auto", backgroundPosition: "92% 93%", filter: "saturate(0.55) brightness(0.66)" }} />
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ backgroundColor: maskColor }} />
    </div>
  );
}
