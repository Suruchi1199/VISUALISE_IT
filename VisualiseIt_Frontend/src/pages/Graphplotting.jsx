import { useMemo, useState } from "react";
import "../styles/graphplotting.css";

/* ---------- coordinate mapping helpers ---------- */
const VIEW = 600;      // svg viewport size (square)
const RANGE = 10;      // data range shown: -10..10 on both axes
const PAD = 28;         // inner padding so labels aren't clipped
const SCALE = (VIEW - PAD * 2) / (RANGE * 2);

const toSvgX = (x) => VIEW / 2 + x * SCALE;
const toSvgY = (y) => VIEW / 2 - y * SCALE;

function buildLinearPoints(m, b) {
  const p1 = { x: -RANGE, y: m * -RANGE + b };
  const p2 = { x: RANGE, y: m * RANGE + b };
  return [p1, p2];
}

function buildQuadraticPoints(a, b, c) {
  const pts = [];
  const step = 0.15;
  for (let x = -RANGE; x <= RANGE + 1e-9; x += step) {
    const y = a * x * x + b * x + c;
    pts.push({ x, y: Math.max(-RANGE, Math.min(RANGE, y)) });
  }
  return pts;
}

function pointsToPath(points) {
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toSvgX(p.x).toFixed(2)} ${toSvgY(p.y).toFixed(2)}`)
    .join(" ");
}

function fmt(n) {
  const r = Math.round(n * 100) / 100;
  return Object.is(r, -0) ? "0" : r.toString();
}

function signed(n, isFirst = false) {
  const v = fmt(Math.abs(n));
  if (n >= 0) return isFirst ? v : ` + ${v}`;
  return isFirst ? `-${v}` : ` - ${v}`;
}

/* ---------- component ---------- */

export default function GraphPlotting() {
  const [mode, setMode] = useState("linear"); // "linear" | "quadratic"

  const [m, setM] = useState(1);
  const [b, setB] = useState(2);

  const [a, setA] = useState(1);
  const [qb, setQb] = useState(0);
  const [qc, setQc] = useState(-3);

  const gridLines = useMemo(() => {
    const lines = [];
    for (let i = -RANGE; i <= RANGE; i++) {
      lines.push(i);
    }
    return lines;
  }, []);

  const curvePath = useMemo(() => {
    if (mode === "linear") return pointsToPath(buildLinearPoints(m, b));
    return pointsToPath(buildQuadraticPoints(a, qb, qc));
  }, [mode, m, b, a, qb, qc]);

  const equationLabel =
    mode === "linear"
      ? `y = ${signed(m, true)}x${signed(b)}`
      : `y = ${signed(a, true)}x²${signed(qb)}x${signed(qc)}`;

  // key values shown in the info panel
  const info = useMemo(() => {
    if (mode === "linear") {
      const yIntercept = b;
      const root = m !== 0 ? -b / m : null;
      return [
        { label: "Slope (m)", value: fmt(m) },
        { label: "Y-intercept", value: `(0, ${fmt(yIntercept)})` },
        { label: "Root (x-intercept)", value: root === null ? "none (horizontal line)" : `(${fmt(root)}, 0)` },
      ];
    }
    const discriminant = qb * qb - 4 * a * qc;
    const vertexX = a !== 0 ? -qb / (2 * a) : 0;
    const vertexY = a * vertexX * vertexX + qb * vertexX + qc;
    let roots = "no real roots";
    if (a !== 0 && discriminant >= 0) {
      const r1 = (-qb + Math.sqrt(discriminant)) / (2 * a);
      const r2 = (-qb - Math.sqrt(discriminant)) / (2 * a);
      roots = discriminant === 0 ? `x = ${fmt(r1)}` : `x = ${fmt(r1)}, ${fmt(r2)}`;
    }
    return [
      { label: "Vertex", value: `(${fmt(vertexX)}, ${fmt(vertexY)})` },
      { label: "Axis of symmetry", value: `x = ${fmt(vertexX)}` },
      { label: "Discriminant", value: fmt(discriminant) },
      { label: "Roots", value: roots },
      { label: "Y-intercept", value: `(0, ${fmt(qc)})` },
    ];
  }, [mode, m, b, a, qb, qc]);

  return (
    <div className="gp-root">
      <div className="gp-header">
        <p className="gp-eyebrow">Mathematics · Graph Plotting</p>
        <h1 className="gp-title">Linear &amp; Quadratic Graphs</h1>
        <p className="gp-sub">
          Move the sliders to change the equation and watch the curve update in real time.
        </p>
      </div>

      <div className="gp-mode-switch">
        <button
          className={mode === "linear" ? "active" : ""}
          onClick={() => setMode("linear")}
        >
          Linear · y = mx + b
        </button>
        <button
          className={mode === "quadratic" ? "active" : ""}
          onClick={() => setMode("quadratic")}
        >
          Quadratic · y = ax² + bx + c
        </button>
      </div>

      <div className="gp-grid">
        {/* ---------- plot ---------- */}
        <div className="gp-plot-card">
          <div className="gp-equation-badge">{equationLabel}</div>

          <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className="gp-svg">
            {/* grid */}
            {gridLines.map((i) => (
              <line
                key={`v${i}`}
                x1={toSvgX(i)} y1={PAD} x2={toSvgX(i)} y2={VIEW - PAD}
                className={i === 0 ? "gp-axis" : "gp-grid-line"}
              />
            ))}
            {gridLines.map((i) => (
              <line
                key={`h${i}`}
                x1={PAD} y1={toSvgY(i)} x2={VIEW - PAD} y2={toSvgY(i)}
                className={i === 0 ? "gp-axis" : "gp-grid-line"}
              />
            ))}

            {/* axis labels every 2 units */}
            {gridLines.filter((i) => i % 2 === 0 && i !== 0).map((i) => (
              <text key={`lx${i}`} x={toSvgX(i)} y={toSvgY(0) + 16} className="gp-tick-label">{i}</text>
            ))}
            {gridLines.filter((i) => i % 2 === 0 && i !== 0).map((i) => (
              <text key={`ly${i}`} x={toSvgX(0) - 10} y={toSvgY(i) + 4} className="gp-tick-label" textAnchor="end">{i}</text>
            ))}

            {/* curve */}
            <path d={curvePath} className="gp-curve" />

            {/* y-intercept marker */}
            <circle
              cx={toSvgX(0)}
              cy={toSvgY(mode === "linear" ? b : qc)}
              r="5"
              className="gp-point gp-point-amber"
            />

            {/* quadratic vertex marker */}
            {mode === "quadratic" && a !== 0 && (
              <circle
                cx={toSvgX(-qb / (2 * a))}
                cy={toSvgY(a * (-qb / (2 * a)) ** 2 + qb * (-qb / (2 * a)) + qc)}
                r="5"
                className="gp-point gp-point-teal"
              />
            )}
          </svg>

          <div className="gp-legend">
            <span><i className="gp-swatch amber" /> y-intercept</span>
            {mode === "quadratic" && <span><i className="gp-swatch teal" /> vertex</span>}
          </div>
        </div>

        {/* ---------- controls ---------- */}
        <div className="gp-panel">
          <p className="gp-panel-title">Adjust the equation</p>

          {mode === "linear" ? (
            <>
              <div className="gp-slider-row">
                <div className="gp-slider-label"><span>Slope (m)</span><span className="gp-unit">{fmt(m)}</span></div>
                <input type="range" min="-5" max="5" step="0.1" value={m} onChange={(e) => setM(+e.target.value)} />
              </div>
              <div className="gp-slider-row">
                <div className="gp-slider-label"><span>Y-intercept (b)</span><span className="gp-unit">{fmt(b)}</span></div>
                <input type="range" min="-10" max="10" step="0.5" value={b} onChange={(e) => setB(+e.target.value)} />
              </div>
            </>
          ) : (
            <>
              <div className="gp-slider-row">
                <div className="gp-slider-label"><span>a (curvature)</span><span className="gp-unit">{fmt(a)}</span></div>
                <input type="range" min="-3" max="3" step="0.1" value={a} onChange={(e) => setA(+e.target.value)} />
              </div>
              <div className="gp-slider-row">
                <div className="gp-slider-label"><span>b</span><span className="gp-unit">{fmt(qb)}</span></div>
                <input type="range" min="-10" max="10" step="0.5" value={qb} onChange={(e) => setQb(+e.target.value)} />
              </div>
              <div className="gp-slider-row">
                <div className="gp-slider-label"><span>c (y-intercept)</span><span className="gp-unit">{fmt(qc)}</span></div>
                <input type="range" min="-10" max="10" step="0.5" value={qc} onChange={(e) => setQc(+e.target.value)} />
              </div>
            </>
          )}

          <div className="gp-divider" />

          <p className="gp-panel-title">Key values</p>
          <div className="gp-info-list">
            {info.map((row) => (
              <div className="gp-info-row" key={row.label}>
                <span className="gp-info-label">{row.label}</span>
                <span className="gp-info-value">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="gp-note">
            {mode === "linear"
              ? <><b>y = mx + b</b> — a straight line. The slope m controls steepness and direction; b shifts the line up or down.</>
              : <><b>y = ax² + bx + c</b> — a parabola. The sign of a decides if it opens upward or downward; the vertex is its turning point.</>}
          </div>
        </div>
      </div>
    </div>
  );
}