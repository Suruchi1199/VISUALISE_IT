import { useState, useRef, useCallback, useEffect } from "react";
import { Play, RotateCcw } from "lucide-react";

/**
 * GeometricApplicationsVisualizer
 *
 * Two-panel visual explainer for verifying shapes and testing collinearity
 * with coordinate geometry:
 *   - Triangle: side lengths via the distance formula, classify by side
 *     equality (equilateral / isosceles / scalene), check a² + b² = c²
 *     for a right angle.
 *   - Rectangle / square: opposite sides equal and diagonals equal =>
 *     rectangle; all sides equal too => square.
 *   - Collinearity: compare slopes between consecutive point pairs.
 *
 * Tab 1 "Explore": drag points on a coordinate plane, switch between
 * Triangle / Rectangle-square / Collinearity sub-modes, results update live.
 *
 * Tab 2 "Animate": a scripted step-by-step walkthrough verifying a right
 * triangle, then testing three points for collinearity.
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

function dist(p, q) {
  return Math.sqrt((q.x - p.x) ** 2 + (q.y - p.y) ** 2);
}

function close(a, b) {
  return Math.abs(a - b) < 0.15;
}

function GridLines() {
  const lines = [];
  for (let x = 40; x <= 640; x += SCALE) {
    lines.push(<line key={`gx-${x}`} x1={x} y1={30} x2={x} y2={430} stroke="#e5e3db" strokeWidth={0.5} />);
  }
  for (let y = 30; y <= 430; y += SCALE) {
    lines.push(<line key={`gy-${y}`} x1={40} y1={y} x2={640} y2={y} stroke="#e5e3db" strokeWidth={0.5} />);
  }
  return <g>{lines}</g>;
}

function AxesAndDefs() {
  return (
    <>
      <defs>
        <marker id="ga-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
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

function DraggablePoint({ point, svgPos, color, textColor, label, onDown, dragging }) {
  return (
    <g
      transform={`translate(${svgPos.sx},${svgPos.sy})`}
      onPointerDown={onDown}
      style={{ cursor: dragging ? "grabbing" : "grab" }}
    >
      <circle r={9} fill={color} stroke="white" strokeWidth={2} />
      <text y={-16} fontSize={14} textAnchor="middle" fontWeight={500} fill={textColor}>{label}</text>
    </g>
  );
}

/* ---------------------------- Explore panel ---------------------------- */

function ExplorePanel() {
  const [mode, setMode] = useState("tri"); // "tri" | "quad" | "col"
  const [A, setA] = useState({ x: -4, y: -2 });
  const [B, setB] = useState({ x: 3, y: -2 });
  const [C, setC] = useState({ x: -4, y: 2 });
  const [D, setD] = useState({ x: 3, y: 2 });
  const [colA, setColA] = useState({ x: -5, y: -3 });
  const [colB, setColB] = useState({ x: 0, y: -0.5 });
  const [colC, setColC] = useState({ x: 5, y: 2 });
  const [dragging, setDragging] = useState(null);
  const svgRef = useRef(null);

  const setters = {
    A: mode === "col" ? setColA : setA,
    B: mode === "col" ? setColB : setB,
    C: mode === "col" ? setColC : setC,
    D: setD,
  };

  const handlePointerMove = useCallback(
    (e) => {
      if (!dragging || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const sx = (e.clientX - rect.left) * (VIEW_W / rect.width);
      const sy = (e.clientY - rect.top) * (VIEW_H / rect.height);
      const world = clampToGrid(...Object.values(toWorld(sx, sy)));
      setters[dragging](world);
    },
    [dragging, mode]
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

  const pA = mode === "col" ? colA : A;
  const pB = mode === "col" ? colB : B;
  const pC = mode === "col" ? colC : C;
  const sA = toSvg(pA);
  const sB = toSvg(pB);
  const sC = toSvg(pC);
  const sD = toSvg(D);

  let label, lines, verdict, polyPoints, showLine = false, lineColor;

  if (mode === "tri") {
    const ab = dist(pA, pB), bc = dist(pB, pC), ca = dist(pC, pA);
    label = "Triangle ABC — side lengths";
    lines = `AB = ${round(ab)}\nBC = ${round(bc)}\nCA = ${round(ca)}`;
    let type;
    if (close(ab, bc) && close(bc, ca)) type = "Equilateral";
    else if (close(ab, bc) || close(bc, ca) || close(ab, ca)) type = "Isosceles";
    else type = "Scalene";
    const sides = [ab, bc, ca].sort((a, b) => a - b);
    const isRight = close(sides[0] ** 2 + sides[1] ** 2, sides[2] ** 2);
    verdict = `${type}${isRight ? ", right-angled" : ""} triangle`;
    polyPoints = `${sA.sx},${sA.sy} ${sB.sx},${sB.sy} ${sC.sx},${sC.sy}`;
  } else if (mode === "quad") {
    const ab = dist(A, B), cd = dist(C, D), ac = dist(A, C), bd = dist(B, D);
    const diag1 = dist(A, D), diag2 = dist(B, C);
    label = "Quadrilateral ABDC — sides and diagonals";
    lines = `AB = ${round(ab)}, CD = ${round(cd)}\nAC = ${round(ac)}, BD = ${round(bd)}\nDiagonals: ${round(diag1)}, ${round(diag2)}`;
    const oppEqual = close(ab, cd) && close(ac, bd);
    const diagEqual = close(diag1, diag2);
    const allSidesEqual = close(ab, cd) && close(ab, ac) && close(ab, bd);
    if (oppEqual && diagEqual && allSidesEqual) verdict = "Square (all sides equal, diagonals equal)";
    else if (oppEqual && diagEqual) verdict = "Rectangle (opposite sides equal, diagonals equal)";
    else verdict = "Not a rectangle";
    polyPoints = `${sA.sx},${sA.sy} ${sB.sx},${sB.sy} ${sD.sx},${sD.sy} ${sC.sx},${sC.sy}`;
  } else {
    const slopeAB = pB.x - pA.x === 0 ? Infinity : (pB.y - pA.y) / (pB.x - pA.x);
    const slopeBC = pC.x - pB.x === 0 ? Infinity : (pC.y - pB.y) / (pC.x - pB.x);
    const collinear = close(slopeAB, slopeBC);
    label = "Slope test for collinearity";
    lines = `Slope AB = ${slopeAB === Infinity ? "undefined" : round(slopeAB)}\nSlope BC = ${slopeBC === Infinity ? "undefined" : round(slopeBC)}`;
    verdict = collinear ? "Collinear — same slope, points lie on one line" : "Not collinear — slopes differ";
    showLine = true;
    lineColor = collinear ? "#1D9E75" : "#D85A30";
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          ["tri", "Triangle"],
          ["quad", "Rectangle / square"],
          ["col", "Collinearity"],
        ].map(([key, l]) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
              mode === key ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-300 hover:bg-stone-50"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <svg
        ref={svgRef}
        width="100%"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="img"
        aria-label="Coordinate plane for verifying shapes and testing collinearity"
        style={{ touchAction: "none", userSelect: "none" }}
        className="rounded-lg bg-white"
      >
        <AxesAndDefs />

        {(mode === "tri" || mode === "quad") && (
          <polygon points={polyPoints} fill="#7F77DD" fillOpacity={0.15} stroke="#7F77DD" strokeWidth={2} />
        )}
        {showLine && (
          <line x1={sA.sx} y1={sA.sy} x2={sC.sx} y2={sC.sy} stroke={lineColor} strokeWidth={2} strokeDasharray="0" />
        )}

        <DraggablePoint point={pA} svgPos={sA} color="#7F77DD" textColor="#26215c" label="A" dragging={dragging === "A"} onDown={() => setDragging("A")} />
        <DraggablePoint point={pB} svgPos={sB} color="#1D9E75" textColor="#04342c" label="B" dragging={dragging === "B"} onDown={() => setDragging("B")} />
        <DraggablePoint point={pC} svgPos={sC} color="#D85A30" textColor="#993c1d" label="C" dragging={dragging === "C"} onDown={() => setDragging("C")} />
        {mode === "quad" && (
          <DraggablePoint point={D} svgPos={sD} color="#EF9F27" textColor="#854f0b" label="D" dragging={dragging === "D"} onDown={() => setDragging("D")} />
        )}
      </svg>

      <div className="mt-4 rounded-lg bg-stone-50 p-4">
        <div className="text-xs text-stone-500 mb-1">{label}</div>
        <div className="text-sm font-mono text-stone-600 mb-1" style={{ whiteSpace: "pre-line" }}>{lines}</div>
        <div className="text-xl font-medium text-stone-900 mt-1">{verdict}</div>
      </div>
    </div>
  );
}

/* ---------------------------- Animate panel ---------------------------- */

const TRI = {
  A: { x: -4, y: -2.5 },
  B: { x: 3, y: -2.5 },
  C: { x: -4, y: 2 },
};
const COL = {
  P: { x: 1, y: -3.75 },
  Q: { x: 3.5, y: 2.75 },
  R: { x: 6, y: 5.75 },
};

const STEP_TEXT = [
  "Click play to verify a right triangle, then test collinearity",
  "Triangle ABC: A = (-4, -2.5), B = (3, -2.5), C = (-4, 2)",
  "Measure AB = 7",
  "Measure CA = 4.5",
  "Measure BC ≈ 8.32 (the longest side)",
  "Check: AB² + CA² = 49 + 20.25 = 69.25 ≈ BC² (8.32² ≈ 69.25) — right triangle at A",
  "Now test P, Q, R for collinearity using slopes",
  "Slope PQ = (2.75-(-3.75))/(3.5-1) = 2.4, slope QR = (5.75-2.75)/(6-3.5) = 1.2",
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
    const delays = [300, 1400, 2300, 3200, 4200, 5600, 6600];
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

  const showTri = step >= 1;
  const showAB = step >= 2;
  const showCA = step >= 3;
  const showBC = step >= 4;
  const showCol = step >= 6;

  const sA = toSvg(TRI.A);
  const sB = toSvg(TRI.B);
  const sC = toSvg(TRI.C);
  const sP = toSvg(COL.P);
  const sQ = toSvg(COL.Q);
  const sR = toSvg(COL.R);

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
        aria-label="Animated verification of a right triangle, then a collinearity test on three points"
        className="rounded-lg bg-white"
      >
        <AxesAndDefs />

        <polygon
          points={`${sA.sx},${sA.sy} ${sB.sx},${sB.sy} ${sC.sx},${sC.sy}`}
          fill="#7F77DD"
          fillOpacity={showTri ? 0.15 : 0}
          stroke="#7F77DD"
          strokeWidth={2}
          style={{ transition: "fill-opacity 500ms ease" }}
        />
        <circle cx={sA.sx} cy={sA.sy} r={8} fill="#3d3d3a" />
        <text x={sA.sx} y={sA.sy + 22} fontSize={14} fontWeight={500} textAnchor="middle" fill="#3d3d3a">A</text>
        <circle cx={sB.sx} cy={sB.sy} r={8} fill="#3d3d3a" />
        <text x={sB.sx} y={sB.sy + 22} fontSize={14} fontWeight={500} textAnchor="middle" fill="#3d3d3a">B</text>
        <circle cx={sC.sx} cy={sC.sy} r={8} fill="#3d3d3a" />
        <text x={sC.sx} y={sC.sy - 18} fontSize={14} fontWeight={500} textAnchor="middle" fill="#3d3d3a">C</text>

        <text x={(sA.sx + sB.sx) / 2} y={sA.sy + 20} fontSize={14} fontWeight={500} textAnchor="middle" opacity={showAB ? 1 : 0} style={{ transition: "opacity 500ms ease" }}>AB = 7</text>
        <text x={sA.sx - 40} y={(sA.sy + sC.sy) / 2} fontSize={14} fontWeight={500} textAnchor="middle" opacity={showCA ? 1 : 0} style={{ transition: "opacity 500ms ease" }}>CA = 4.5</text>
        <text x={(sB.sx + sC.sx) / 2 + 40} y={(sB.sy + sC.sy) / 2} fontSize={14} fontWeight={500} textAnchor="middle" opacity={showBC ? 1 : 0} style={{ transition: "opacity 500ms ease" }}>BC ≈ 8.32</text>

        <g opacity={showCol ? 1 : 0} style={{ transition: "opacity 400ms ease" }}>
          <line x1={sP.sx} y1={sP.sy} x2={step >= 7 ? sR.sx : sP.sx} y2={step >= 7 ? sR.sy : sP.sy} stroke={step >= 7 ? "#1D9E75" : "#D85A30"} strokeWidth={2} style={{ transition: "x2 700ms ease, y2 700ms ease" }} />
          <circle cx={sP.sx} cy={sP.sy} r={8} fill="#7F77DD" />
          <text x={sP.sx} y={sP.sy + 22} fontSize={14} fontWeight={500} textAnchor="middle" fill="#26215c">P</text>
          <circle cx={sQ.sx} cy={sQ.sy} r={8} fill="#1D9E75" />
          <text x={sQ.sx} y={sQ.sy - 18} fontSize={14} fontWeight={500} textAnchor="middle" fill="#04342c">Q</text>
          <circle cx={sR.sx} cy={sR.sy} r={8} fill="#D85A30" />
          <text x={sR.sx} y={sR.sy - 18} fontSize={14} fontWeight={500} textAnchor="middle" fill="#993c1d">R</text>
        </g>
      </svg>

      <div className="mt-4 rounded-lg bg-stone-50 p-4 text-center">
        <div className="text-base font-medium text-stone-800 min-h-[24px]">{STEP_TEXT[step]}</div>
      </div>
    </div>
  );
}

/* ------------------------------- Main --------------------------------- */

export default function GeometricApplicationsVisualizer() {
  const [tab, setTab] = useState("explore");

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white">
      <h1 className="text-xl font-medium text-stone-900 mb-1">Geometric applications</h1>
      <p className="text-sm text-stone-500 mb-4">
        Verify triangles, rectangles, and squares, and test three points for
        collinearity, using distance and slope in coordinate geometry.
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