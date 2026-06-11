"use client";

import { useEffect, useRef, useState } from "react";
import { registerSceneHandle } from "@/lib/sceneOrchestration";
import { useIsMobile, usePrefersReducedMotion } from "@/hooks/useMediaQuery";

/**
 * Calque 1 — Aurora (z-0). Dégradé liquide nocturne :
 * 3 blobs gaussiens (deepblue → violet → midnight), cycle ~30s,
 * dithering anti-banding. Le mix violet est piloté par l'orchestration
 * (tension sur la section Problème).
 *
 * NEXT_PUBLIC_AURORA_MODE=css|shader force l'implémentation.
 * Fallback CSS automatique : mobile, reduced-motion, WebGL indisponible.
 */

const MODE: "css" | "shader" =
  process.env.NEXT_PUBLIC_AURORA_MODE === "css" ? "css" : "shader";

const VERTEX_SRC = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAGMENT_SRC = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_violet;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 asp = vec2(u_res.x / u_res.y, 1.0);
  float t = u_time * 0.2094; /* cycle complet ~30s */

  vec3 midnight = vec3(0.039, 0.039, 0.039);
  vec3 deepblue = vec3(0.039, 0.055, 0.153);
  vec3 violet   = vec3(0.102, 0.067, 0.251);

  vec2 c1 = vec2(0.30 + 0.22 * cos(t),        0.62 + 0.18 * sin(t * 0.7));
  vec2 c2 = vec2(0.72 + 0.20 * cos(t * 0.8 + 2.1), 0.45 + 0.22 * sin(t * 0.55 + 1.3));
  vec2 c3 = vec2(0.50 + 0.28 * cos(t * 0.6 + 4.2), 0.78 + 0.15 * sin(t * 0.9 + 3.7));

  vec2 d1 = (uv - c1) * asp;
  vec2 d2 = (uv - c2) * asp;
  vec2 d3 = (uv - c3) * asp;
  float g1 = exp(-dot(d1, d1) / 0.10);
  float g2 = exp(-dot(d2, d2) / 0.14);
  float g3 = exp(-dot(d3, d3) / 0.07);

  vec3 col = midnight;
  col += mix(deepblue, violet, u_violet * 0.8) * g1 * 0.95;
  col += violet * g2 * (0.55 + 0.65 * u_violet);
  col += mix(deepblue * 0.85, violet, 0.35 + 0.65 * u_violet) * g3 * 0.75;

  /* dithering : bruit 1.5/255 pour casser le banding */
  col += (hash(gl_FragCoord.xy + fract(u_time)) - 0.5) * (1.5 / 255.0);

  gl_FragColor = vec4(col, 1.0);
}
`;

function AuroraWebGL({ onUnsupported }: { onUnsupported: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      antialias: false,
      depth: false,
      stencil: false,
      alpha: false,
    });
    if (!gl) {
      const raf = requestAnimationFrame(onUnsupported);
      return () => cancelAnimationFrame(raf);
    }

    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn("Aurora shader:", gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    };
    const vs = compile(gl.VERTEX_SHADER, VERTEX_SRC);
    const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SRC);
    if (!vs || !fs) {
      const raf = requestAnimationFrame(onUnsupported);
      return () => cancelAnimationFrame(raf);
    }
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("Aurora shader link:", gl.getProgramInfoLog(program));
      const raf = requestAnimationFrame(onUnsupported);
      return () => cancelAnimationFrame(raf);
    }
    gl.useProgram(program);

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_res");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uViolet = gl.getUniformLocation(program, "u_violet");

    // rendu en demi-résolution : les dégradés sont doux, invisible à l'œil
    const resize = () => {
      const scale = 0.5 * Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(window.innerWidth * scale));
      canvas.height = Math.max(1, Math.round(window.innerHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const violet = { v: 0 };
    const unregister = registerSceneHandle("aurora", {
      setVioletMix: (v) => {
        violet.v = v;
      },
    });

    let raf = 0;
    const start = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform1f(uViolet, violet.v);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      unregister();
      // Pas de loseContext() ici : en StrictMode le remontage récupèrerait
      // un contexte définitivement mort sur le même <canvas>.
    };
  }, [onUnsupported]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}

function AuroraCSS() {
  const violetRef = useRef<HTMLDivElement>(null);

  useEffect(
    () =>
      registerSceneHandle("aurora", {
        setVioletMix: (v) => {
          if (violetRef.current) {
            violetRef.current.style.opacity = String(0.45 + v * 0.55);
          }
        },
      }),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden bg-midnight" aria-hidden="true">
      <div
        className="absolute -left-[5%] top-[5%] h-[60vmax] w-[60vmax] rounded-full opacity-80"
        style={{
          background:
            "radial-gradient(circle, var(--color-deepblue) 0%, transparent 65%)",
          filter: "blur(80px)",
          animation: "aurora-drift-1 30s ease-in-out infinite",
        }}
      />
      <div
        ref={violetRef}
        className="absolute right-[-10%] top-[25%] h-[55vmax] w-[55vmax] rounded-full opacity-45"
        style={{
          background:
            "radial-gradient(circle, var(--color-violet) 0%, transparent 65%)",
          filter: "blur(80px)",
          animation: "aurora-drift-2 34s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-[-15%] left-[20%] h-[50vmax] w-[50vmax] rounded-full opacity-60"
        style={{
          background:
            "radial-gradient(circle, var(--color-deepblue) 0%, transparent 60%)",
          filter: "blur(80px)",
          animation: "aurora-drift-3 28s ease-in-out infinite",
        }}
      />
    </div>
  );
}

export default function AuroraShader() {
  const isMobile = useIsMobile();
  const reduced = usePrefersReducedMotion();
  const [webglFailed, setWebglFailed] = useState(false);

  const useCss = MODE === "css" || isMobile || reduced || webglFailed;

  if (useCss) return <AuroraCSS />;
  return <AuroraWebGL onUnsupported={() => setWebglFailed(true)} />;
}
