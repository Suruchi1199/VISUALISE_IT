import { useState, useRef, useCallback, useEffect } from "react";
import { Play, RotateCcw } from "lucide-react";

/**
 * DistanceFormulaVisualizer
 *
 * Two-panel visual explainer for the 2-D distance formula:
 *   d = sqrt((x2 - x1)^2 + (y2 - y1)^2)
 * and distance from the origin (x2, y2 = 0, 0).
 *
 * Tab 1 "Explore": drag two points around a coordinate plane and watch
 * the distance between them, and each point's distance from the origin,
 * update live.
 *
 * Tab 2 "Animate": a scripted step-by-step animation that builds a right
 * triangle from two fixed points and derives the formula visually via
 * the Pythagorean theorem.
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

function GridLines() {
  const lines = [];
  for (let x = 40; x <= 640; x += SCALE) {
    lines.push(
      <line
        key={`gx-${x}`}
        x1={x}
        y1={30}
        x2={x}
        y2={430}
        stroke="#e5e3db"
        strokeWidth={0.5}
      />
    );
  }
  for (let y = 30; y <= 430; y += SCALE) {
    lines.push(
      <line
        key={`gy-${y}`}
        x1={40}
        y1={y}
        x2={640}
        y2={y}
        stroke="#e5e3db"
        strokeWidth={0.5}
      />
    );
  }
  return <g>{lines}</g>;
}

function ArrowMarkerDefs() {
  return (
    <defs>
      <marker
        id="df-arrow"
        viewBox="0 0 10 10"
        refX="8"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path
          d="M2 1L8 5L2 9"
          fill="none"
          stroke="context-stroke"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </marker>
    </defs>
  );
}

/* ---------------------------- Explore panel ---------------------------- */

function ExplorePanel() {
  const [A, setA] = useState({ x: -3, y: 2 });
  const [B, setB] = useState({ x: 4, y: -2 });
  const [dragging, setDragging] = useState(null); // "A" | "B" | null
  const [showA, setShowA] = useState(true);
  const [showB, setShowB] = useState(true);
  const svgRef = useRef(null);

  const clampToGrid = (x, y) => ({
    x: Math.max(-7, Math.min(7, x)),
    y: Math.max(-4, Math.min(4, y)),
  });
  const clampX = (x) => (Number.isFinite(x) ? Math.max(-7, Math.min(7, x)) : 0);
  const clampY = (y) => (Number.isFinite(y) ? Math.max(-4, Math.min(4, y)) : 0);

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
      else setB(world);
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

  const pa = toSvg(A);
  const pb = toSvg(B);
  const dx = B.x - A.x;
  const dy = B.y - A.y;
  const dAB = Math.sqrt(dx * dx + dy * dy);
  const dOA = Math.sqrt(A.x * A.x + A.y * A.y);
  const dOB = Math.sqrt(B.x * B.x + B.y * B.y);
  const midX = (pa.sx + pb.sx) / 2;
  const midY = (pa.sy + pb.sy) / 2;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-lg border border-stone-200 p-3">
          <div className="text-xs font-medium text-stone-500 mb-2">Point A coordinates</div>
          <div className="flex gap-2">
            <label className="flex-1 text-xs text-stone-500">
              x
              <input
                type="number"
                value={A.x}
                onChange={(e) => {
                  setA((p) => ({ ...p, x: clampX(Number(e.target.value)) }));
                }}
                className="mt-1 w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm text-stone-800"
              />
            </label>
            <label className="flex-1 text-xs text-stone-500">
              y
              <input
                type="number"
                value={A.y}
                onChange={(e) => {
                  setA((p) => ({ ...p, y: clampY(Number(e.target.value)) }));
                }}
                className="mt-1 w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm text-stone-800"
              />
            </label>
          </div>
        </div>
        <div className="rounded-lg border border-stone-200 p-3">
          <div className="text-xs font-medium text-stone-500 mb-2">Point B coordinates</div>
          <div className="flex gap-2">
            <label className="flex-1 text-xs text-stone-500">
              x
              <input
                type="number"
                value={B.x}
                onChange={(e) => {
                  setB((p) => ({ ...p, x: clampX(Number(e.target.value)) }));
                }}
                className="mt-1 w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm text-stone-800"
              />
            </label>
            <label className="flex-1 text-xs text-stone-500">
              y
              <input
                type="number"
                value={B.y}
                onChange={(e) => {
                  setB((p) => ({ ...p, y: clampY(Number(e.target.value)) }));
                }}
                className="mt-1 w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm text-stone-800"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setShowA((v) => !v)}
          className={`flex-1 text-left rounded-lg px-4 py-3 border transition-colors ${
            showA ? "bg-stone-50 border-transparent" : "bg-white border-stone-200 opacity-50"
          }`}
        >
          <div className="text-xs text-stone-500">Point A {showA ? "(shown)" : "(hidden)"}</div>
          <div className="text-base font-medium text-stone-800">
            ({A.x}, {A.y})
          </div>
        </button>
        <button
          onClick={() => setShowB((v) => !v)}
          className={`flex-1 text-left rounded-lg px-4 py-3 border transition-colors ${
            showB ? "bg-stone-50 border-transparent" : "bg-white border-stone-200 opacity-50"
          }`}
        >
          <div className="text-xs text-stone-500">Point B {showB ? "(shown)" : "(hidden)"}</div>
          <div className="text-base font-medium text-stone-800">
            ({B.x}, {B.y})
          </div>
        </button>
      </div>

      <svg
        ref={svgRef}
        width="100%"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="img"
        aria-label="Coordinate plane with two draggable points"
        style={{ touchAction: "none", userSelect: "none" }}
        className="rounded-lg bg-white"
      >
        <ArrowMarkerDefs />
        <GridLines />
        <line x1={40} y1={230} x2={640} y2={230} stroke="#a8a59a" strokeWidth={1} />
        <line x1={340} y1={30} x2={340} y2={430} stroke="#a8a59a" strokeWidth={1} />
        <text x={644} y={234} fontSize={12} fill="#8a887f">x</text>
        <text x={344} y={26} fontSize={12} fill="#8a887f">y</text>

        {showA && (
          <line
            x1={ORIGIN.x}
            y1={ORIGIN.y}
            x2={pa.sx}
            y2={pa.sy}
            stroke="#7F77DD"
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.6}
          />
        )}
        {showB && (
          <line
            x1={ORIGIN.x}
            y1={ORIGIN.y}
            x2={pb.sx}
            y2={pb.sy}
            stroke="#1D9E75"
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.6}
          />
        )}

        {showA && showB && (
          <>
            <path
              d={`M${pa.sx} ${pa.sy} L${pb.sx} ${pa.sy} L${pb.sx} ${pb.sy}`}
              fill="none"
              stroke="#c7c4b8"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <line x1={pa.sx} y1={pa.sy} x2={pb.sx} y2={pb.sy} stroke="#D85A30" strokeWidth={2} />
            <text
              x={midX}
              y={midY - 10}
              fontSize={12}
              fill="#993c1d"
              textAnchor="middle"
              fontWeight={500}
            >
              {round(dAB)}
            </text>
          </>
        )}

        {showA && (
          <g
            transform={`translate(${pa.sx},${pa.sy})`}
            onPointerDown={() => setDragging("A")}
            style={{ cursor: dragging === "A" ? "grabbing" : "grab" }}
          >
            <circle r={9} fill="#7F77DD" stroke="white" strokeWidth={2} />
            <text y={-16} fontSize={14} textAnchor="middle" fontWeight={500} fill="#26215c">A</text>
          </g>
        )}
        {showB && (
          <g
            transform={`translate(${pb.sx},${pb.sy})`}
            onPointerDown={() => setDragging("B")}
            style={{ cursor: dragging === "B" ? "grabbing" : "grab" }}
          >
            <circle r={9} fill="#1D9E75" stroke="white" strokeWidth={2} />
            <text y={-16} fontSize={14} textAnchor="middle" fontWeight={500} fill="#04342c">B</text>
          </g>
        )}
      </svg>

      {showA && showB ? (
        <div className="mt-4 rounded-lg bg-stone-50 p-4">
          <div className="text-xs text-stone-500 mb-1">Distance A to B</div>
          <div className="text-sm font-mono text-stone-600 mb-1">
            d = √[({B.x} − ({A.x}))² + ({B.y} − ({A.y}))²] = √[{dx}² + {dy}²]
          </div>
          <div className="text-2xl font-medium text-stone-900">d = {round(dAB)}</div>
        </div>
      ) : (
        <div className="mt-4 rounded-lg bg-stone-50 p-4 text-sm text-stone-500">
          Show both points to see the distance between them.
        </div>
      )}

      <div className="flex gap-3 mt-3">
        {showA && (
          <div className="flex-1 rounded-lg bg-stone-50 p-4">
            <div className="text-xs text-stone-500 mb-1">Origin to A</div>
            <div className="text-lg font-medium text-stone-900">
              d = √({A.x}² + {A.y}²) = {round(dOA)}
            </div>
          </div>
        )}
        {showB && (
          <div className="flex-1 rounded-lg bg-stone-50 p-4">
            <div className="text-xs text-stone-500 mb-1">Origin to B</div>
            <div className="text-lg font-medium text-stone-900">
              d = √({B.x}² + {B.y}²) = {round(dOB)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------- Animate panel ---------------------------- */

const STEP_TEXT = [
  "Click play to watch the legs and squares build the formula",
  "Step 1 — move across: dx = 6",
  "Step 2 — move up: dy = 4",
  "Step 3 — connect A to B directly",
  "Step 4 — square each leg: dx² and dy²",
  "Step 5 — Pythagorean theorem: d² = dx² + dy² = 36 + 16 = 52",
  "d = √52 ≈ 7.21 — the straight-line distance from A to B",
];

const A_FIXED = { sx: 220, sy: 230 };
const B_FIXED = { sx: 460, sy: 150 };
const CORNER = { sx: 460, sy: 230 };

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
    const delays = [300, 1300, 2300, 3200, 4300, 5300];
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

  const legDxDone = step >= 1;
  const legDyDone = step >= 2;
  const hypDone = step >= 3;
  const squaresDone = step >= 4;
  const resultDone = step >= 5;

  const legDxEnd = legDxDone ? CORNER : A_FIXED;
  const legDyEnd = legDyDone ? B_FIXED : CORNER;
  const hypEnd = hypDone ? B_FIXED : A_FIXED;

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
        aria-label="Right triangle built from two points, showing legs dx and dy and squares on each side"
        className="rounded-lg bg-white"
      >
        <ArrowMarkerDefs />
        <GridLines />
        <line x1={40} y1={230} x2={640} y2={230} stroke="#a8a59a" strokeWidth={1} />
        <line x1={220} y1={30} x2={220} y2={430} stroke="#e5e3db" strokeWidth={0.5} />

        <rect
          x={220}
          y={150}
          width={240}
          height={80}
          fill="#7F77DD"
          opacity={squaresDone ? 0.5 : 0}
          style={{ transition: "opacity 500ms ease" }}
        />
        <rect
          x={460}
          y={150}
          width={80}
          height={80}
          fill="#1D9E75"
          opacity={squaresDone ? 0.5 : 0}
          style={{ transition: "opacity 500ms ease" }}
        />

        <line
          x1={A_FIXED.sx}
          y1={A_FIXED.sy}
          x2={legDxEnd.sx}
          y2={legDxEnd.sy}
          stroke="#7F77DD"
          strokeWidth={3}
          strokeLinecap="round"
          style={{ transition: "x2 700ms ease, y2 700ms ease" }}
        />
        <line
          x1={CORNER.sx}
          y1={CORNER.sy}
          x2={legDyEnd.sx}
          y2={legDyEnd.sy}
          stroke="#1D9E75"
          strokeWidth={3}
          strokeLinecap="round"
          style={{ transition: "x2 700ms ease, y2 700ms ease" }}
        />
        <line
          x1={A_FIXED.sx}
          y1={A_FIXED.sy}
          x2={hypEnd.sx}
          y2={hypEnd.sy}
          stroke="#D85A30"
          strokeWidth={3}
          strokeLinecap="round"
          style={{ transition: "x2 700ms ease, y2 700ms ease" }}
        />

        <circle cx={A_FIXED.sx} cy={A_FIXED.sy} r={8} fill="#3d3d3a" />
        <text x={A_FIXED.sx} y={A_FIXED.sy + 22} fontSize={14} fontWeight={500} textAnchor="middle" fill="#3d3d3a">A</text>
        <circle cx={B_FIXED.sx} cy={B_FIXED.sy} r={8} fill="#3d3d3a" />
        <text x={B_FIXED.sx} y={B_FIXED.sy - 18} fontSize={14} fontWeight={500} textAnchor="middle" fill="#3d3d3a">B</text>

        <text
          x={340}
          y={250}
          fontSize={14}
          fontWeight={500}
          textAnchor="middle"
          opacity={legDxDone ? 1 : 0}
          style={{ transition: "opacity 500ms ease" }}
        >
          dx = 6
        </text>
        <text
          x={485}
          y={195}
          fontSize={14}
          fontWeight={500}
          textAnchor="middle"
          opacity={legDyDone ? 1 : 0}
          style={{ transition: "opacity 500ms ease" }}
        >
          dy = 4
        </text>
        <text
          x={340}
          y={195}
          fontSize={14}
          fontWeight={500}
          textAnchor="middle"
          opacity={squaresDone ? 1 : 0}
          style={{ transition: "opacity 600ms ease" }}
        >
          dx²
        </text>
        <text
          x={500}
          y={195}
          fontSize={14}
          fontWeight={500}
          textAnchor="middle"
          opacity={squaresDone ? 1 : 0}
          style={{ transition: "opacity 600ms ease" }}
        >
          dy²
        </text>
        <text
          x={330}
          y={175}
          fontSize={14}
          fontWeight={500}
          textAnchor="middle"
          fill="#993c1d"
          opacity={resultDone ? 1 : 0}
          style={{ transition: "opacity 500ms ease" }}
        >
          d = √52
        </text>
      </svg>

      <div className="mt-4 rounded-lg bg-stone-50 p-4 text-center">
        <div className="text-base font-medium text-stone-800 min-h-[24px]">
          {STEP_TEXT[step]}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- Main --------------------------------- */

export default function DistanceFormulaVisualizer() {
  const [tab, setTab] = useState("explore");

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white">
      <h1 className="text-xl font-medium text-stone-900 mb-1">Distance formula</h1>
      <p className="text-sm text-stone-500 mb-4">
        d = √[(x₂ − x₁)² + (y₂ − y₁)²] — the straight-line distance between two points,
        and from a point to the origin.
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