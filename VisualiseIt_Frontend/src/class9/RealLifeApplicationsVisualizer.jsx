import { useState, useRef, useCallback, useEffect } from "react";
import { Play, RotateCcw } from "lucide-react";

/**
 * RealLifeApplicationsVisualizer
 *
 * Two-panel visual explainer for practical coordinate-geometry case studies:
 *   - Room layout: does a piece of furniture fit inside a room, and with
 *     how much wall clearance?
 *   - City mapping: on a city block grid, compare straight-line distance
 *     (distance formula) with distance travelled along streets (sum of
 *     horizontal + vertical blocks, i.e. "taxicab" distance).
 *
 * Tab 1 "Explore": drag a sofa inside a room outline, or drag Home/School
 * markers on a block grid; results update live.
 *
 * Tab 2 "Animate": a scripted step-by-step walkthrough of both scenarios.
 *
 * No required props — renders a complete, self-contained demo.
 */

const VIEW_W = 680;
const VIEW_H = 460;
const SCALE = 40;
const ORIGIN = { x: 40, y: 340 }; // room/city grid origin (bottom-left, feet/blocks)

function toSvg(pt) {
  return { sx: ORIGIN.x + pt.x * SCALE, sy: ORIGIN.y - pt.y * SCALE };
}

function toGrid(sx, sy) {
  return { x: (sx - ORIGIN.x) / SCALE, y: (ORIGIN.y - sy) / SCALE };
}

function round(n) {
  return Math.round(n * 100) / 100;
}

function GridLines() {
  const lines = [];
  for (let i = 0; i <= 16; i++) {
    const gx = 40 + i * SCALE;
    if (gx <= 640) lines.push(<line key={`gx-${i}`} x1={gx} y1={20} x2={gx} y2={440} stroke="#e5e3db" strokeWidth={0.5} />);
  }
  for (let j = 0; j <= 10; j++) {
    const gy = 20 + j * SCALE;
    if (gy <= 440) lines.push(<line key={`gy-${j}`} x1={40} y1={gy} x2={640} y2={gy} stroke="#e5e3db" strokeWidth={0.5} />);
  }
  return <g>{lines}</g>;
}

/* ---------------------------- Explore panel ---------------------------- */

const ROOM_FT = { w: 11, h: 7 };

function ExplorePanel() {
  const [mode, setMode] = useState("room"); // "room" | "city"
  const [sofa, setSofa] = useState({ x: 1, y: 1, w: 6, h: 2 });
  const [home, setHome] = useState({ x: 1, y: 0.5 });
  const [school, setSchool] = useState({ x: 8, y: 5.5 });
  const [dragging, setDragging] = useState(null); // "sofa" | "home" | "school" | null
  const svgRef = useRef(null);

  const handlePointerMove = useCallback(
    (e) => {
      if (!dragging || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const sx = (e.clientX - rect.left) * (VIEW_W / rect.width);
      const sy = (e.clientY - rect.top) * (VIEW_H / rect.height);
      const g = toGrid(sx, sy);

      if (dragging === "sofa") {
        setSofa((s) => ({
          ...s,
          x: Math.max(-2, Math.min(ROOM_FT.w + 2, round(g.x - s.w / 2))),
          y: Math.max(-2, Math.min(ROOM_FT.h + 2, round(g.y - s.h / 2))),
        }));
      } else if (dragging === "home") {
        setHome({ x: Math.max(0, Math.min(16, round(g.x))), y: Math.max(0, Math.min(10, round(g.y))) });
      } else {
        setSchool({ x: Math.max(0, Math.min(16, round(g.x))), y: Math.max(0, Math.min(10, round(g.y))) });
      }
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

  const roomTL = toSvg({ x: 0, y: ROOM_FT.h });
  const sofaBL = toSvg({ x: sofa.x, y: sofa.y + sofa.h });
  const sHome = toSvg(home);
  const sSchool = toSvg(school);

  const fitsX = sofa.x >= 0 && sofa.x + sofa.w <= ROOM_FT.w;
  const fitsY = sofa.y >= 0 && sofa.y + sofa.h <= ROOM_FT.h;
  const fits = fitsX && fitsY;
  const clearanceLeft = round(sofa.x);
  const clearanceRight = round(ROOM_FT.w - (sofa.x + sofa.w));
  const clearanceBottom = round(sofa.y);
  const clearanceTop = round(ROOM_FT.h - (sofa.y + sofa.h));

  const dx = Math.abs(school.x - home.x);
  const dy = Math.abs(school.y - home.y);
  const straight = round(Math.sqrt(dx * dx + dy * dy));
  const blocks = round(dx + dy);

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode("room")}
          className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
            mode === "room" ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-300 hover:bg-stone-50"
          }`}
        >
          Room layout
        </button>
        <button
          onClick={() => setMode("city")}
          className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
            mode === "city" ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-300 hover:bg-stone-50"
          }`}
        >
          City mapping
        </button>
      </div>

      <svg
        ref={svgRef}
        width="100%"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="img"
        aria-label="Grid for room layout and city mapping applications"
        style={{ touchAction: "none", userSelect: "none" }}
        className="rounded-lg bg-white"
      >
        <GridLines />

        {mode === "room" ? (
          <>
            <rect x={roomTL.sx} y={roomTL.sy} width={ROOM_FT.w * SCALE} height={ROOM_FT.h * SCALE} fill="none" stroke="#7F77DD" strokeWidth={2} />
            <text x={roomTL.sx} y={roomTL.sy - 8} fontSize={14} fontWeight={500}>Room (11 ft × 7 ft)</text>
            <g
              transform={`translate(${sofaBL.sx},${sofaBL.sy})`}
              onPointerDown={() => setDragging("sofa")}
              style={{ cursor: dragging === "sofa" ? "grabbing" : "grab" }}
            >
              <rect
                width={sofa.w * SCALE}
                height={sofa.h * SCALE}
                rx={6}
                fill={fits ? "#1D9E75" : "#D85A30"}
                fillOpacity={0.25}
                stroke={fits ? "#1D9E75" : "#D85A30"}
                strokeWidth={2}
              />
              <text x={(sofa.w * SCALE) / 2} y={(sofa.h * SCALE) / 2 + 5} fontSize={14} fontWeight={500} textAnchor="middle" fill={fits ? "#0f6e56" : "#993c1d"}>
                Sofa
              </text>
            </g>
          </>
        ) : (
          <>
            <path
              d={`M${sHome.sx} ${sHome.sy} L${sSchool.sx} ${sHome.sy} L${sSchool.sx} ${sSchool.sy}`}
              fill="none"
              stroke="#a8a59a"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
            <line x1={sHome.sx} y1={sHome.sy} x2={sSchool.sx} y2={sSchool.sy} stroke="#D85A30" strokeWidth={2} />
            <g
              transform={`translate(${sHome.sx},${sHome.sy})`}
              onPointerDown={() => setDragging("home")}
              style={{ cursor: dragging === "home" ? "grabbing" : "grab" }}
            >
              <circle r={9} fill="#7F77DD" stroke="white" strokeWidth={2} />
              <text y={-16} fontSize={14} textAnchor="middle" fontWeight={500} fill="#26215c">Home</text>
            </g>
            <g
              transform={`translate(${sSchool.sx},${sSchool.sy})`}
              onPointerDown={() => setDragging("school")}
              style={{ cursor: dragging === "school" ? "grabbing" : "grab" }}
            >
              <circle r={9} fill="#1D9E75" stroke="white" strokeWidth={2} />
              <text y={-16} fontSize={14} textAnchor="middle" fontWeight={500} fill="#04342c">School</text>
            </g>
          </>
        )}
      </svg>

      <div className="mt-4 rounded-lg bg-stone-50 p-4">
        {mode === "room" ? (
          <>
            <div className="text-xs text-stone-500 mb-1">Sofa placement (6 ft × 2 ft) in an 11 ft × 7 ft room</div>
            <div className="text-sm font-mono text-stone-600 mb-1" style={{ whiteSpace: "pre-line" }}>
              {`Clearance — left: ${clearanceLeft} ft, right: ${clearanceRight} ft\nClearance — bottom: ${clearanceBottom} ft, top: ${clearanceTop} ft`}
            </div>
            <div className="text-xl font-medium text-stone-900 mt-1">
              {fits ? "Fits inside the room" : "Does not fit — extends past a wall"}
            </div>
          </>
        ) : (
          <>
            <div className="text-xs text-stone-500 mb-1">Home to school on a city block grid (1 unit = 1 block)</div>
            <div className="text-sm font-mono text-stone-600 mb-1" style={{ whiteSpace: "pre-line" }}>
              {`Straight-line: √(${round(dx)}² + ${round(dy)}²) = ${straight} blocks\nAlong streets: ${round(dx)} + ${round(dy)} = ${blocks} blocks`}
            </div>
            <div className="text-xl font-medium text-stone-900 mt-1">
              Straight-line {straight} blocks vs {blocks} blocks by street
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------------------- Animate panel ---------------------------- */

const STEP_TEXT = [
  "Click play to check furniture fit, then compare city distances",
  "A 6 ft sofa needs to fit along an 11 ft wall",
  "11 ft wall − 6 ft sofa = 4 ft of clearance remaining — it fits",
  "Now: Home and School sit on a city block grid",
  "Walking along streets: 9 blocks east, then 6 blocks north",
  "Street distance = 9 + 6 = 15 blocks",
  "Straight-line distance = √(9² + 6²) = √117 ≈ 10.8 blocks",
  "The direct route is shorter — but streets force the longer path",
];

const HOME = { x: 2, y: 1 };
const SCHOOL = { x: 11, y: 7 };

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
    const delays = [300, 1500, 2800, 3800, 4700, 5700, 6900];
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

  const sofaGrown = step >= 1;
  const showClearance = step >= 2;
  const showCity = step >= 3;
  const showStreetPath = step >= 4;
  const showDirectLine = step >= 6;

  const sHome = toSvg(HOME);
  const sSchool = toSvg(SCHOOL);
  const roomTL = toSvg({ x: 0, y: 7 });

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
        aria-label="Animated furniture placement check followed by a city grid distance comparison"
        className="rounded-lg bg-white"
      >
        <GridLines />

        <rect x={roomTL.sx} y={roomTL.sy} width={11 * SCALE} height={7 * SCALE - 60} fill="none" stroke="#7F77DD" strokeWidth={2} />
        <text x={roomTL.sx} y={roomTL.sy - 8} fontSize={14} fontWeight={500}>Room: 11 ft × 7 ft</text>
        <rect
          x={120}
          y={220}
          width={sofaGrown ? 240 : 0}
          height={60}
          rx={6}
          fill="#1D9E75"
          fillOpacity={0.25}
          stroke="#1D9E75"
          strokeWidth={2}
          style={{ transition: "width 700ms ease" }}
        />
        <text x={120} y={255} fontSize={14} fontWeight={500} textAnchor="middle" fill="#0f6e56" opacity={sofaGrown ? 1 : 0} style={{ transition: "opacity 500ms ease" }}>
          Sofa: 6 ft
        </text>
        <text x={480} y={255} fontSize={12} textAnchor="middle" opacity={showClearance ? 1 : 0} style={{ transition: "opacity 500ms ease" }}>
          Clearance: 4 ft
        </text>

        <g opacity={showCity ? 1 : 0} style={{ transition: "opacity 400ms ease" }}>
          <circle cx={sHome.sx} cy={sHome.sy} r={8} fill="#7F77DD" />
          <text x={sHome.sx} y={sHome.sy + 22} fontSize={14} fontWeight={500} textAnchor="middle" fill="#26215c">Home</text>
          <circle cx={sSchool.sx} cy={sSchool.sy} r={8} fill="#1D9E75" />
          <text x={sSchool.sx} y={sSchool.sy - 18} fontSize={14} fontWeight={500} textAnchor="middle" fill="#04342c">School</text>
          <path
            d={showStreetPath ? `M${sHome.sx} ${sHome.sy} L${sSchool.sx} ${sHome.sy} L${sSchool.sx} ${sSchool.sy}` : `M${sHome.sx} ${sHome.sy} L${sHome.sx} ${sHome.sy} L${sHome.sx} ${sHome.sy}`}
            fill="none"
            stroke="#a8a59a"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
          <line
            x1={sHome.sx}
            y1={sHome.sy}
            x2={showDirectLine ? sSchool.sx : sHome.sx}
            y2={showDirectLine ? sSchool.sy : sHome.sy}
            stroke="#D85A30"
            strokeWidth={2}
            style={{ transition: "x2 700ms ease, y2 700ms ease" }}
          />
        </g>
      </svg>

      <div className="mt-4 rounded-lg bg-stone-50 p-4 text-center">
        <div className="text-base font-medium text-stone-800 min-h-[24px]">{STEP_TEXT[step]}</div>
      </div>
    </div>
  );
}

/* ------------------------------- Main --------------------------------- */

export default function RealLifeApplicationsVisualizer() {
  const [tab, setTab] = useState("explore");

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white">
      <h1 className="text-xl font-medium text-stone-900 mb-1">Real-life applications</h1>
      <p className="text-sm text-stone-500 mb-4">
        Practical case studies in coordinate geometry: does the furniture fit
        the room, and how far is it really from home to school on a city grid?
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