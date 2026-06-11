"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  registerSceneHandle,
  type SkylineMode,
} from "@/lib/sceneOrchestration";
import { useMousePosition } from "@/hooks/useMousePosition";
import { useIsMobile, usePrefersReducedMotion } from "@/hooks/useMediaQuery";

/**
 * Calque 2 — Skyline (z-1). L'asset signature : la ville endormie.
 *
 * SVG généré en pur code, 3 plans de profondeur (parallax scroll + curseur).
 * Les fenêtres s'allument aléatoirement (mode ambient), s'éteignent toutes
 * sauf la tour Rial Estate (dormant), ou s'allument massivement (awake) —
 * pilotage via l'orchestration centralisée.
 *
 * Deux variantes : ?skyline=haussmann (organique) | ?skyline=modern (ordonnée).
 */

type Variant = "haussmann" | "modern";
type PlaneName = "back" | "mid" | "front";

type Building = {
  x: number;
  w: number;
  h: number;
  roof: "flat" | "pitched" | "mansard";
  chimneys: number[];
  antenna: boolean;
  windows: { x: number; y: number }[];
  tower: boolean;
};

const VB_W = 1920;
const VB_H = 600;
const WIN_W = 5;
const WIN_H = 7;

function makeRng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generatePlane(
  variant: Variant,
  plane: PlaneName,
  seed: number
): Building[] {
  const rng = makeRng(seed);
  const cfg = {
    back: { hMin: 180, hMax: 380, wMin: 90, wMax: 200, windows: false, skip: 1 },
    mid: { hMin: 150, hMax: 300, wMin: 110, wMax: 190, windows: true, skip: 0.72 },
    front: { hMin: 130, hMax: 270, wMin: 130, wMax: 230, windows: true, skip: 0.38 },
  }[plane];

  const buildings: Building[] = [];
  let x = variant === "modern" ? 4 : -20;
  let towerPlaced = plane !== "front";

  while (x < VB_W) {
    const isTowerSlot = !towerPlaced && x > 1320;

    let w: number;
    let h: number;
    let roof: Building["roof"];

    if (isTowerSlot) {
      w = 130;
      h = 440;
      roof = "flat";
      towerPlaced = true;
    } else if (variant === "modern") {
      // ordonnée : largeurs et hauteurs quantizées, alignements nets
      w = cfg.wMin + Math.floor(rng() * 4) * 25;
      h = cfg.hMin + Math.floor(rng() * 5) * ((cfg.hMax - cfg.hMin) / 4);
      roof = rng() < 0.85 ? "flat" : "pitched";
    } else {
      // haussmannien : organique, hauteurs continues, toits variés
      w = cfg.wMin + rng() * (cfg.wMax - cfg.wMin);
      h = cfg.hMin + rng() * (cfg.hMax - cfg.hMin);
      const r = rng();
      roof = r < 0.45 ? "mansard" : r < 0.8 ? "pitched" : "flat";
    }

    const isTower = isTowerSlot;
    const top = VB_H - h;

    const chimneys: number[] = [];
    if (variant === "haussmann" && plane !== "back" && roof !== "flat" && !isTower) {
      const n = 1 + Math.floor(rng() * 2);
      for (let i = 0; i < n; i++) chimneys.push(x + 15 + rng() * (w - 30));
    }

    const antenna =
      !isTower &&
      plane !== "back" &&
      (variant === "modern" ? rng() < 0.35 : rng() < 0.12);

    const windows: { x: number; y: number }[] = [];
    if (cfg.windows || isTower) {
      const sx = variant === "modern" ? 16 : 15;
      const sy = variant === "modern" ? 20 : 23;
      const skip = isTower ? 0 : cfg.skip;
      for (let wy = top + 14; wy < VB_H - 24; wy += sy) {
        for (let wx = x + 11; wx < x + w - 11 - WIN_W; wx += sx) {
          if (rng() >= skip) windows.push({ x: wx, y: wy });
        }
      }
    }

    buildings.push({ x, w, h, roof, chimneys, antenna, windows, tower: isTower });

    x +=
      w +
      (variant === "modern"
        ? 10
        : -8 + rng() * 22); /* haussmann : chevauchements possibles */
  }

  return buildings;
}

const PLANES: Record<Variant, Record<PlaneName, Building[]>> = {
  haussmann: {
    back: generatePlane("haussmann", "back", 101),
    mid: generatePlane("haussmann", "mid", 202),
    front: generatePlane("haussmann", "front", 303),
  },
  modern: {
    back: generatePlane("modern", "back", 111),
    mid: generatePlane("modern", "mid", 222),
    front: generatePlane("modern", "front", 333),
  },
};

const VARIANT: Variant =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("skyline") === "modern"
    ? "modern"
    : typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("skyline") === "haussmann"
      ? "haussmann"
      : "haussmann"; /* défaut — variante au choix, voir ?skyline=modern */

function BuildingShape({ b }: { b: Building }) {
  const top = VB_H - b.h;
  const roofH = b.roof === "mansard" ? 26 : 34;

  return (
    <g>
      <rect x={b.x} y={top} width={b.w} height={b.h} />
      {b.roof === "pitched" && (
        <polygon
          points={`${b.x},${top} ${b.x + b.w / 2},${top - roofH} ${b.x + b.w},${top}`}
        />
      )}
      {b.roof === "mansard" && (
        <polygon
          points={`${b.x},${top} ${b.x + b.w * 0.18},${top - roofH} ${b.x + b.w * 0.82},${top - roofH} ${b.x + b.w},${top}`}
        />
      )}
      {b.roof === "flat" && !b.tower && (
        <rect x={b.x + 6} y={top - 6} width={b.w - 12} height={6} />
      )}
      {b.chimneys.map((cx, i) => (
        <rect key={i} x={cx} y={top - roofH - 4} width={9} height={22} />
      ))}
      {b.antenna && (
        <rect x={b.x + b.w * 0.5 - 1} y={top - 38} width={2} height={38} />
      )}
      {b.tower && (
        <>
          {/* antenne de la tour Rial Estate + balise amber */}
          <rect x={b.x + b.w / 2 - 1.5} y={top - 52} width={3} height={52} />
          <circle
            className="skyline-window lit"
            cx={b.x + b.w / 2}
            cy={top - 56}
            r={4}
          />
        </>
      )}
      {b.windows.map((win, i) => (
        <rect
          key={i}
          className={b.tower ? "skyline-window lit" : "skyline-window"}
          data-window={b.tower ? undefined : ""}
          x={win.x}
          y={win.y}
          width={WIN_W}
          height={WIN_H}
        />
      ))}
    </g>
  );
}

function Plane({
  name,
  buildings,
  style,
  planeRef,
}: {
  name: PlaneName;
  buildings: Building[];
  style: React.CSSProperties;
  planeRef: (el: SVGSVGElement | null) => void;
}) {
  return (
    <svg
      ref={planeRef}
      data-plane={name}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-x-0 bottom-0 h-full w-full fill-deepblue"
      style={style}
      aria-hidden="true"
    >
      {buildings.map((b, i) => (
        <BuildingShape key={i} b={b} />
      ))}
    </svg>
  );
}

export default function SkylineBackground() {
  const rootRef = useRef<HTMLDivElement>(null);
  const planeRefs = useRef<Partial<Record<PlaneName, SVGSVGElement>>>({});
  const mouse = useMousePosition();
  const isMobile = useIsMobile();
  const reduced = usePrefersReducedMotion();

  const planes = PLANES[VARIANT];

  // ── Fenêtres : allumage aléatoire selon le mode d'orchestration
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const windows = Array.from(
      root.querySelectorAll<SVGRectElement>("rect[data-window]")
    );
    let mode: SkylineMode = "ambient";
    const offCalls = new Map<SVGRectElement, gsap.core.Tween>();

    const extinguishAll = () => {
      offCalls.forEach((call) => call.kill());
      offCalls.clear();
      windows.forEach((w) => w.classList.remove("lit"));
    };

    const unregister = registerSceneHandle("skyline", {
      setMode: (m) => {
        mode = m;
        if (m === "dormant") extinguishAll();
      },
    });

    if (reduced) {
      // statique : un échantillon de fenêtres allumées, pas de timers
      windows.forEach((w, i) => {
        if (i % 11 === 0) w.classList.add("lit");
      });
      return unregister;
    }

    let loopCall: gsap.core.Tween | null = null;
    const loop = () => {
      if (mode !== "dormant" && !document.hidden) {
        const count =
          mode === "awake"
            ? 3 + Math.floor(Math.random() * 4)
            : 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
          const w = windows[Math.floor(Math.random() * windows.length)];
          if (!w || w.classList.contains("lit")) continue;
          w.classList.add("lit");
          const off = gsap.delayedCall(2 + Math.random() * 3, () => {
            w.classList.remove("lit");
            offCalls.delete(w);
          });
          offCalls.set(w, off);
        }
      }
      loopCall = gsap.delayedCall(mode === "awake" ? 0.2 : 0.8, loop);
    };
    loop();

    return () => {
      loopCall?.kill();
      extinguishAll();
      unregister();
    };
  }, [reduced]);

  // ── Parallax scroll (3 plans) + curseur (ensemble, lerpé, max 20px)
  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    const factors: Record<PlaneName, number> = { back: 0.1, mid: 0.3, front: 0.5 };
    // décalage borné : la skyline s'enfonce au scroll mais ne sort jamais
    // complètement (elle doit rester visible pour les sections 2-3)
    const maxShift: Record<PlaneName, number> = { back: 36, mid: 110, front: 190 };
    let curX = 0;

    const tick = () => {
      const y = window.scrollY;
      (Object.keys(factors) as PlaneName[]).forEach((p) => {
        const el = planeRefs.current[p];
        if (!el) return;
        const shift = maxShift[p] * (1 - Math.exp((-y * factors[p]) / 450));
        el.style.transform = `translateY(${shift}px)`;
      });

      if (!isMobile) {
        const targetX =
          ((mouse.current.x - window.innerWidth / 2) / (window.innerWidth / 2)) * 20;
        curX += (targetX - curX) * 0.06;
        root.style.transform = `translateX(${curX.toFixed(2)}px)`;
      }
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [isMobile, reduced, mouse]);

  return (
    <div ref={rootRef} className="absolute inset-x-0 bottom-0 h-[52vh]">
      {/* mobile : 2 plans seulement */}
      {!isMobile && (
        <Plane
          name="back"
          buildings={planes.back}
          style={{ filter: "blur(8px)", opacity: 0.3 }}
          planeRef={(el) => {
            if (el) planeRefs.current.back = el;
          }}
        />
      )}
      <Plane
        name="mid"
        buildings={planes.mid}
        style={{ filter: "blur(2px)", opacity: 0.6 }}
        planeRef={(el) => {
          if (el) planeRefs.current.mid = el;
        }}
      />
      <Plane
        name="front"
        buildings={planes.front}
        style={{ opacity: 1 }}
        planeRef={(el) => {
          if (el) planeRefs.current.front = el;
        }}
      />
    </div>
  );
}
