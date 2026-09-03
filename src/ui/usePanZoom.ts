import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface View {
  k: number;
  x: number;
  y: number;
}

const IDENTITY: View = { k: 1, x: 0, y: 0 };

/**
 * Pan + zoom for an SVG whose content is wrapped in
 * `<g transform={pz.transform}>`. Coordinates are in viewBox units, so pass the
 * viewBox size via `setBounds` on every render. Drag = pan, wheel + pinch =
 * zoom, and `moved` tells a click handler whether the gesture was a drag.
 */
export function usePanZoom(minK = 1, maxK = 9) {
  const [view, setView] = useState<View>(IDENTITY);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const bounds = useRef({ w: 1, h: 1 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; mx: number; my: number } | null>(null);
  const moved = useRef(false);

  const setBounds = useCallback((w: number, h: number) => {
    bounds.current = { w, h };
  }, []);

  const clamp = useCallback(
    (v: View): View => {
      const k = Math.min(maxK, Math.max(minK, v.k));
      const { w, h } = bounds.current;
      return {
        k,
        x: Math.min(0, Math.max(w - w * k, v.x)),
        y: Math.min(0, Math.max(h - h * k, v.y)),
      };
    },
    [minK, maxK],
  );

  /** client px -> viewBox units */
  const toLocal = (cx: number, cy: number) => {
    const el = svgRef.current;
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    return {
      x: ((cx - r.left) / r.width) * bounds.current.w,
      y: ((cy - r.top) / r.height) * bounds.current.h,
    };
  };

  const zoomAt = useCallback(
    (factor: number, cx: number, cy: number) => {
      setView((v) => {
        const p = toLocal(cx, cy);
        const k = Math.min(maxK, Math.max(minK, v.k * factor));
        const f = k / v.k;
        return clamp({ k, x: p.x - (p.x - v.x) * f, y: p.y - (p.y - v.y) * f });
      });
    },
    [clamp, minK, maxK],
  );

  // non-passive wheel so we can preventDefault the page scroll while zooming
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX, e.clientY);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved.current = false;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = {
        dist: Math.hypot(a.x - b.x, a.y - b.y),
        mx: (a.x + b.x) / 2,
        my: (a.y + b.y) / 2,
      };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      zoomAt(dist / pinch.current.dist, pinch.current.mx, pinch.current.my);
      pinch.current.dist = dist;
      moved.current = true;
      return;
    }

    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) moved.current = true;
    const sx = bounds.current.w / (svgRef.current?.getBoundingClientRect().width ?? 1);
    const sy = bounds.current.h / (svgRef.current?.getBoundingClientRect().height ?? 1);
    setView((v) => clamp({ ...v, x: v.x + dx * sx, y: v.y + dy * sy }));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  };

  const reset = useCallback(() => setView(IDENTITY), []);

  const transform = useMemo(
    () => `translate(${view.x} ${view.y}) scale(${view.k})`,
    [view],
  );

  return {
    svgRef,
    setBounds,
    transform,
    view,
    reset,
    wasDrag: () => moved.current,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp },
  };
}
