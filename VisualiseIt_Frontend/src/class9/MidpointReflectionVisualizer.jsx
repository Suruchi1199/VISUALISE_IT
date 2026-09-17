import { useState, useRef, useCallback, useEffect } from "react";
import { Play, RotateCcw } from "lucide-react";

/**
 * MidpointReflectionVisualizer
 *
 * Two-panel visual explainer for midpoints and reflections:
 *   Midpoint of A(x1, y1) and B(x2, y2): M = ((x1+x2)/2, (y1+y2)/2)
 *   Reflection across x-axis:  (x, y) -> (x, -y)
 *   Reflection across y-axis:  (x, y) -> (-x, y)
 *   Reflection across origin:  (x, y) -> (-x, -y)
 *
 * Tab 1 "Explore": drag points on a coordinate plane. A sub-toggle
 * switches between Midpoint mode (drag A and B, watch M update) and
 * Reflection mode (drag P, pick an axis, watch the mirror point P').
 *
 * Tab 2 "Animate": a scripted step-by-step animation that builds a
 * midpoint, then reflects a point across the x-axis, y-axis, and origin.
 *
 * No required props — renders a complete, self-contained demo.
 */

const SCALE = 40;
const ORIGIN = { x: 340, y: 230 };
const VIEW_W = 680;
const VIEW_H = 460;

function toSvg(pt) {
  return { sx: ORIGIN.x + pt.x * SCALE, sy: ORIGIN.y - pt.y * SCALE };
}

function toWorld(sx, sy) {
  return {
    x: Math.round((sx - ORIGIN.x) / SCALE),
    y: Math.round((ORIGIN.y - sy) / SCALE),
  };
}

function round(n) {
  return Math.round(n * 100) / 100;
}

function clampToGrid(x, y) {
  return {
    x: Math.max(-7, Math.min(7, x)),
    y: Math.max(-4, Math.min(4, y)),
  };
}

function clampCoord(n, lo, hi) {
  return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : 0;
}

function GridLines() {
  const lines = [];
  for (let x = 40; x <= 640; x += SCALE) {
    lines.push(
      <line key={`gx-${x}`} x1={x} y1={30} x2={x} y2={430} stroke="#e5e3db" strokeWidth={0.5} />
    );
  }
  for (let y = 30; y <= 430; y += SCALE) {
    lines.push(
      <line key={`gy-${y}`} x1={40} y1={y} x2={640} y2={y} stroke="#e5e3db" strokeWidth={0.5} />
    );
  }
  return <g>{lines}</g>;
}

function AxesAndDefs() {
  return (
    <>
      <defs>
        <marker id="mr-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </marker>
      </defs>
      <GridLines />
      <line x1={40} y1={230} x2={640} y2={230} stroke="#a8a59a" strokeWidth={1} />
      <line x1={340} y1={30} x2={340} y2={430} stroke="#a8a59a" strokeWidth={1} />
      <text x={644} y={234} fontSize={12} fill="#8a887f">x</text>
      <text x={344} y={26} fontSize={12} fill="#8a887f">y</text>
    </>
  );
}

/* ---------------------------- Explore panel ---------------------------- */

function ExplorePanel() {
  const [subMode, setSubMode] = useState("mid"); // "mid" | "ref"
  const [axis, setAxis] = useState("x"); // "x" | "y" | "o"
  const [A, setA] = useState({ x: -4, y: -2 });
  const [B, setB] = useState({ x: 4, y: 3 });
  const [P, setP] = useState({ x: 5, y: 3 });
  const [dragging, setDragging] = useState(null); // "A" | "B" | "P" | null
  const svgRef = useRef(null);

  const handlePointerMove = useCallback(
    (e) => {
      if (!dragging || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = VIEW_W / rect.width;
      const scaleY = VIEW_H / rect.height;
      const sx = (e.clientX - rect.left) * scaleX;
      const sy = (e.clientY - rect.top) * scaleY;
      const world = clampToGrid(...Object.values(toWorld(sx, sy)));
      if (dragging === "A") setA(world);
      else if (dragging === "B") setB(world);
      else setP(world);
    },
    [dragging]
  );

  useEffect(() => {
    if (!dragging) return;
    window.addEventListener("pointermove", handlePointerMove);
    const stop = () => setDragging(null);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, [dragging, handlePointerMove]);

  const mx = round((A.x + B.x) / 2);
  const my = round((A.y + B.y) / 2);
  const M = { x: mx, y: my };

  let Pp;
  if (axis === "x") Pp = { x: P.x, y: -P.y };
  else if (axis === "y") Pp = { x: -P.x, y: P.y };
  else Pp = { x: -P.x, y: -P.y };

  const pa = toSvg(A);
  const pb = toSvg(B);
  const pm = toSvg(M);
  const pp = toSvg(P);
  const ppp = toSvg(Pp);

  const axisName = axis === "x" ? "x-axis" : axis === "y" ? "y-axis" : "origin";
  const refFormula =
    axis === "x"
      ? `(x, y) → (x, −y) = (${P.x}, ${-P.y})`
      : axis === "y"
      ? `(x, y) → (−x, y) = (${-P.x}, ${P.y})`
      : `(x, y) → (−x, −y) = (${-P.x}, ${-P.y})`;

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSubMode("mid")}
          className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
            subMode === "mid" ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-300 hover:bg-stone-50"
          }`}
        >
          Midpoint
        </button>
        <button
          onClick={() => setSubMode("ref")}
          className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
            subMode === "ref" ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-300 hover:bg-stone-50"
          }`}
        >
          Reflection
        </button>
      </div>

      {subMode === "mid" ? (
        <div className="flex gap-3 mb-4">
          <div className="flex-1 rounded-lg bg-stone-50 px-4 py-3">
            <div className="text-xs text-stone-500">Point A</div>
            <div className="text-base font-medium text-stone-800">({A.x}, {A.y})</div>
          </div>
          <div className="flex-1 rounded-lg bg-stone-50 px-4 py-3">
            <div className="text-xs text-stone-500">Point B</div>
            <div className="text-base font-medium text-stone-800">({B.x}, {B.y})</div>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            ["x", "Across x-axis"],
            ["y", "Across y-axis"],
            ["o", "Across origin"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setAxis(key)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                axis === key ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-300 hover:bg-stone-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <svg
        ref={svgRef}
        width="100%"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="img"
        aria-label="Coordinate plane for midpoint and reflection"
        style={{ touchAction: "none", userSelect: "none" }}
        className="rounded-lg bg-white"
      >
        <AxesAndDefs />

        {subMode === "mid" ? (
          <>
            <line x1={pa.sx} y1={pa.sy} x2={pb.sx} y2={pb.sy} stroke="#7F77DD" strokeWidth={2} />
            <g transform={`translate(${pm.sx},${pm.sy})`}>
              <circle r={7} fill="#D85A30" stroke="white" strokeWidth={2} />
              <text y={18} fontSize={14} textAnchor="middle" fontWeight={500} fill="#993c1d">M</text>
            </g>
            <g
              transform={`translate(${pa.sx},${pa.sy})`}
              onPointerDown={() => setDragging("A")}
              style={{ cursor: dragging === "A" ? "grabbing" : "grab" }}
            >
              <circle r={9} fill="#7F77DD" stroke="white" strokeWidth={2} />
              <text y={-16} fontSize={14} textAnchor="middle" fontWeight={500} fill="#26215c">A</text>
            </g>
            <g
              transform={`translate(${pb.sx},${pb.sy})`}
              onPointerDown={() => setDragging("B")}
              style={{ cursor: dragging === "B" ? "grabbing" : "grab" }}
            >
              <circle r={9} fill="#1D9E75" stroke="white" strokeWidth={2} />
              <text y={-16} fontSize={14} textAnchor="middle" fontWeight={500} fill="#04342c">B</text>
            </g>
          </>
        ) : (
          <>
            <line
              x1={pp.sx}
              y1={pp.sy}
              x2={ppp.sx}
              y2={ppp.sy}
              stroke="#a8a59a"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <g
              transform={`translate(${pp.sx},${pp.sy})`}
              onPointerDown={() => setDragging("P")}
              style={{ cursor: dragging === "P" ? "grabbing" : "grab" }}
            >
              <circle r={9} fill="#7F77DD" stroke="white" strokeWidth={2} />
              <text y={-16} fontSize={14} textAnchor="middle" fontWeight={500} fill="#26215c">P</text>
            </g>
            <g transform={`translate(${ppp.sx},${ppp.sy})`}>
              <circle r={9} fill="#D85A30" stroke="white" strokeWidth={2} />
              <text y={-16} fontSize={14} textAnchor="middle" fontWeight={500} fill="#993c1d">P'</text>
            </g>
          </>
        )}
      </svg>

      <div className="mt-4 rounded-lg bg-stone-50 p-4">
        {subMode === "mid" ? (
          <>
            <div className="text-xs text-stone-500 mb-1">Midpoint of AB</div>
            <div className="text-sm font-mono text-stone-600 mb-1">
              M = (({A.x} + {B.x})/2, ({A.y} + {B.y})/2)
            </div>
            <div className="text-2xl font-medium text-stone-900">M = ({mx}, {my})</div>
          </>
        ) : (
          <>
            <div className="text-xs text-stone-500 mb-1">Reflection of P across the {axisName}</div>
            <div className="text-sm font-mono text-stone-600 mb-1">{refFormula}</div>
            <div className="text-2xl font-medium text-stone-900">
              P' = ({round(Pp.x)}, {round(Pp.y)})
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------------------- Animate panel ---------------------------- */

const A_FIXED = { x: -4, y: -2.5 };
const B_FIXED = { x: 5, y: 2.5 };
const P_FIXED = { x: 4, y: 2 };

const STEP_TEXT = [
  "Click play to watch the midpoint form, then the reflections",
  "Segment AB: A = (-4, -2.5), B = (5, 2.5)",
  "Midpoint M = ((-4+5)/2, (-2.5+2.5)/2) = (0.5, 0)",
  "Now: point P = (4, 2). Reflect across the x-axis",
  "(x, y) → (x, -y): P' = (4, -2)",
  "Reflect across the y-axis instead: (x, y) → (-x, y): P' = (-4, 2)",
  "Reflect across the origin: (x, y) → (-x, -y): P' = (-4, -2)",
];

function AnimatePanel() {
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const timeouts = useRef([]);

  const clearTimers = () => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  };

  const play = () => {
    clearTimers();
    setRunning(true);
    setStep(0);
    const delays = [200, 1200, 2600, 3600, 4900, 6200];
    delays.forEach((delay, i) => {
      timeouts.current.push(
        setTimeout(() => {
          setStep(i + 1);
          if (i === delays.length - 1) setRunning(false);
        }, delay)
      );
    });
  };

  useEffect(() => {
    play();
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showMidpoint = step >= 2;
  const showReflectGroup = step >= 3;
  const reflectStage = step >= 6 ? "o" : step >= 5 ? "y" : step >= 4 ? "x" : null;

  const M = { x: (A_FIXED.x + B_FIXED.x) / 2, y: (A_FIXED.y + B_FIXED.y) / 2 };
  const pa = toSvg(A_FIXED);
  const pb = toSvg(B_FIXED);
  const pm = toSvg(M);
  const pp = toSvg(P_FIXED);

  let Pp = P_FIXED;
  if (reflectStage === "x") Pp = { x: P_FIXED.x, y: -P_FIXED.y };
  else if (reflectStage === "y") Pp = { x: -P_FIXED.x, y: P_FIXED.y };
  else if (reflectStage === "o") Pp = { x: -P_FIXED.x, y: -P_FIXED.y };
  const ppp = toSvg(Pp);

  return (
    <div>
      <div className="flex justify-end mb-2">
        <button
          onClick={play}
          disabled={running}
          className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50"
        >
          {running ? <RotateCcw size={16} /> : <Play size={16} />}
          Replay
        </button>
      </div>

      <svg
        width="100%"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="img"
        aria-label="Animated midpoint construction followed by reflections across the x-axis, y-axis, and origin"
        className="rounded-lg bg-white"
      >
        <AxesAndDefs />

        <line x1={pa.sx} y1={pa.sy} x2={pb.sx} y2={pb.sy} stroke="#7F77DD" strokeWidth={3} strokeLinecap="round" />
        <circle cx={pa.sx} cy={pa.sy} r={8} fill="#3d3d3a" />
        <text x={pa.sx} y={pa.sy + 22} fontSize={14} fontWeight={500} textAnchor="middle" fill="#3d3d3a">A</text>
        <circle cx={pb.sx} cy={pb.sy} r={8} fill="#3d3d3a" />
        <text x={pb.sx} y={pb.sy - 18} fontSize={14} fontWeight={500} textAnchor="middle" fill="#3d3d3a">B</text>

        <g opacity={showMidpoint ? 1 : 0} style={{ transition: "opacity 600ms ease" }}>
          <circle cx={pm.sx} cy={pm.sy} r={7} fill="#D85A30" stroke="white" strokeWidth={2} />
          <text x={pm.sx} y={pm.sy + 22} fontSize={14} fontWeight={500} textAnchor="middle" fill="#993c1d">M</text>
        </g>

        <g opacity={showReflectGroup ? 1 : 0} style={{ transition: "opacity 400ms ease" }}>
          <line
            x1={pp.sx}
            y1={pp.sy}
            x2={reflectStage ? ppp.sx : pp.sx}
            y2={reflectStage ? ppp.sy : pp.sy}
            stroke="#a8a59a"
            strokeWidth={1}
            strokeDasharray="4 4"
            style={{ transition: "x2 500ms ease, y2 500ms ease" }}
          />
          <circle cx={pp.sx} cy={pp.sy} r={8} fill="#1D9E75" />
          <text x={pp.sx} y={pp.sy - 18} fontSize={14} fontWeight={500} textAnchor="middle" fill="#04342c">P</text>
          <g
            opacity={reflectStage ? 1 : 0}
            style={{ transition: "opacity 500ms ease" }}
            transform={`translate(${ppp.sx},${ppp.sy})`}
          >
            <circle r={8} fill="#D85A30" stroke="white" strokeWidth={2} />
            <text y={-16} fontSize={14} textAnchor="middle" fontWeight={500} fill="#993c1d">P'</text>
          </g>
        </g>
      </svg>

      <div className="mt-4 rounded-lg bg-stone-50 p-4 text-center">
        <div className="text-base font-medium text-stone-800 min-h-[24px]">{STEP_TEXT[step]}</div>
      </div>
    </div>
  );
}

/* ------------------------------- Main --------------------------------- */

export default function MidpointReflectionVisualizer() {
  const [tab, setTab] = useState("explore");

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white">
      <h1 className="text-xl font-medium text-stone-900 mb-1">Midpoints and reflections</h1>
      <p className="text-sm text-stone-500 mb-4">
        M = ((x₁+x₂)/2, (y₁+y₂)/2) — the midpoint of a segment — and mirror-image
        coordinates when a point is reflected across the x-axis, y-axis, or origin.
      </p>

      <div className="inline-flex rounded-lg border border-stone-200 p-1 mb-5 bg-stone-50">
        <button
          onClick={() => setTab("explore")}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            tab === "explore" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"
          }`}
        >
          Explore
        </button>
        <button
          onClick={() => setTab("animate")}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            tab === "animate" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"
          }`}
        >
          Animate
        </button>
      </div>

      {tab === "explore" ? <ExplorePanel /> : <AnimatePanel />}
    </div>
  );
}