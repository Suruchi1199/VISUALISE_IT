import React, { useMemo, useState } from "react";
import "./style/numbersystem.css";
/**
 * NumberSystemVisualizer
 * Class 9 · Number Systems
 *
 * Hero: the Spiral of Theodorus — a real compass-and-straightedge construction.
 * Each right triangle has legs (√n, 1) and hypotenuse √(n+1). Swinging that
 * hypotenuse down onto the horizontal axis (with the same compass point at
 * the origin) is exactly how you locate √2, √3, √5... on a number line —
 * this component draws that swing as a literal circular arc.
 *
 * Below it: a small classifier that explains *why* a number is rational
 * or irrational, plus quick-reference cards.
 */

const MAX_STEP = 16; // spiral starts to self-overlap right around n=17

function computeSpiral(maxN) {
  const pts = [{ n: 1, angle: 0, r: 1, x: 1, y: 0 }];
  let angle = 0;
  for (let k = 2; k <= maxN; k++) {
    angle += Math.atan(1 / Math.sqrt(k - 1));
    const r = Math.sqrt(k);
    pts.push({ n: k, angle, r, x: r * Math.cos(angle), y: r * Math.sin(angle) });
  }
  return pts;
}

function isPerfectSquare(n) {
  const r = Math.sqrt(n);
  return Number.isInteger(r);
}

function classify(raw) {
  const s = raw.trim();
  if (!s) return null;

  if (/^-?\d+\s*\/\s*\d+$/.test(s)) {
    return { type: "rational", reason: "Written as a fraction p/q with q ≠ 0 — rational by definition." };
  }
  if (/^-?\d+$/.test(s)) {
    return { type: "rational", reason: `Any whole number can be written as ${s}/1 — rational.` };
  }
  if (/\.\d*\.\.\.$/.test(s) || /overline|repeat/i.test(s)) {
    return { type: "rational", reason: "A repeating decimal always equals some fraction p/q — rational." };
  }
  if (/^-?\d+\.\d+$/.test(s)) {
    return { type: "rational", reason: "A terminating decimal can always be written as a fraction — rational." };
  }
  const rootMatch = s.match(/^(?:√|sqrt\(?)\s*(\d+)\)?$/i);
  if (rootMatch) {
    const val = parseInt(rootMatch[1], 10);
    const root = Math.sqrt(val);
    if (Number.isInteger(root)) {
      return { type: "rational", reason: `√${val} = ${root}, a whole number — rational.` };
    }
    return {
      type: "irrational",
      reason: `${val} is not a perfect square, so √${val} ≈ ${root.toFixed(6)}… never terminates or repeats.`,
    };
  }
  if (/^(π|pi)$/i.test(s)) {
    return { type: "irrational", reason: "π ≈ 3.14159265… — proven to never terminate or repeat." };
  }
  if (/^e$/i.test(s)) {
    return { type: "irrational", reason: "Euler's number e ≈ 2.71828182… — never terminates or repeats." };
  }
  return {
    type: "unknown",
    reason: "Try a fraction (3/4), a whole number, a decimal, √n, π, or e.",
  };
}

const CHIPS = ["3/4", "0.75", "7", "√9", "√7", "√2", "π", "0.333..."];

/**
 * NumberSystemVisualizer
 * @param {Object} data - Optional data prop from visualization API
 * @param {number} data.initialStep - Initial spiral step (default: MAX_STEP)
 * @param {string} data.initialQuery - Initial query/input (default: "")
 * @param {string[]} data.chips - Custom chip options (default: predefined CHIPS)
 */
export default function NumberSystemVisualizer({ data = {} }) {
  const initialStep = data.initialStep || MAX_STEP;
  const initialQuery = data.initialQuery || "";
  const customChips = data.chips || CHIPS;

  const [step, setStep] = useState(initialStep);
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState(null);

  const allPoints = useMemo(() => computeSpiral(MAX_STEP), []);
  const visible = allPoints.slice(0, step);
  const current = visible[visible.length - 1];

  const runClassify = (value) => {
    setQuery(value);
    setResult(classify(value));
  };

  // ---- SVG geometry ----
  const AXIS_MAX = 5;
  const toScreen = (x, y) => ({ x, y: -y }); // flip math-y for screen-y

  const spiralPath = visible
    .map((p, i) => {
      const prev = i === 0 ? { x: 0, y: 0 } : visible[i - 1];
      const a = toScreen(prev.x, prev.y);
      const b = toScreen(p.x, p.y);
      return `${i === 0 ? "M" : "L"} ${a.x.toFixed(4)} ${a.y.toFixed(4)} L ${b.x.toFixed(4)} ${b.y.toFixed(4)}`;
    })
    .join(" ");

  return (
    <div className="nsv-root">


      
      <h1 className="nsv-h1">The Square Root Spiral</h1>
      {/* <p className="nsv-sub">
        Build the Spiral of Theodorus one right triangle at a time. Each new triangle has legs
        of length 1 and the previous hypotenuse — so its own hypotenuse is always
        √(step). Swing that hypotenuse down to the axis with a compass planted at the
        origin, and you've located an irrational number exactly, with no decimals guessed.
      </p> */}

      {/* Spiral panel */}
      <div className="nsv-panel">
        <div className="nsv-controls">
          <button className="nsv-btn" onClick={() => setStep((s) => Math.min(s + 1, MAX_STEP))} disabled={step >= MAX_STEP}>
            Add next triangle →
          </button>
          <button className="nsv-btn ghost" onClick={() => setStep(1)}>Reset</button>
          <span className="nsv-step-readout">step <b>{step}</b> / {MAX_STEP}</span>
        </div>

        <p className="nsv-current">
          √{step} = <span className={isPerfectSquare(step) ? "rat" : "val"}>
            {Math.sqrt(step).toFixed(6)}…
          </span>{" "}
          {isPerfectSquare(step) ? (
            <span style={{ color: "var(--sage)", fontFamily: "IBM Plex Mono, monospace", fontSize: 14 }}>
              &nbsp;— a perfect square, so this one's rational
            </span>
          ) : (
            <span style={{ color: "var(--gold)", fontFamily: "IBM Plex Mono, monospace", fontSize: 14 }}>
              &nbsp;— {step} isn't a perfect square, so this is irrational
            </span>
          )}
        </p>

        <div className="nsv-svg-wrap">
          <svg viewBox="-2.5 -5 13 6" xmlns="http://www.w3.org/2000/svg">
            {/* faint grid */}
            {Array.from({ length: 15 }).map((_, i) => (
              <line key={`gx${i}`} x1={-3.5 + i} y1={-5} x2={-3.5 + i} y2={1} stroke="var(--gridfaint)" strokeWidth="0.012" />
            ))}
            {Array.from({ length: 7 }).map((_, i) => (
              <line key={`gy${i}`} x1={-3.5} y1={-5 + i} x2={10.5} y2={-5 + i} stroke="var(--gridfaint)" strokeWidth="0.012" />
            ))}

            {/* axis */}
            <line
            x1={-1}
            y1={0}
            x2={AXIS_MAX}
            y2={0}
            stroke="var(--chalk-dim)"
            strokeWidth="0.02"
            />

          {Array.from({ length: AXIS_MAX + 1 }).map((_, i) => (
            <g key={`tick${i}`}>
              <line
                x1={i}
                y1={-1.08}
                x2={i}
                y2={-0.92}
                stroke="var(--chalk-dim)"
                strokeWidth="0.02"
              />
              <text
                x={i}
                y={-0.6}
                fontSize="0.28"
                fill="var(--chalk-dim)"
                textAnchor="middle"
                fontFamily="IBM Plex Mono, monospace"
              >
                {i}
              </text>
            </g>
          ))}

            {/* swing arcs: origin O to landing point on axis */}
            {visible.map((p, i) => {
  const isCurrent = i === visible.length - 1;

  const angleDeg = (p.angle * 180) / Math.PI;
  const largeArc = ((angleDeg % 360) + 360) % 360 > 180 ? 1 : 0;

  const start = toScreen(p.x, p.y);
  const end = toScreen(p.r, 0);

  const d = `
    M ${start.x.toFixed(4)} ${start.y.toFixed(4)}
    A ${p.r.toFixed(4)} ${p.r.toFixed(4)}
      0 ${largeArc} 1
      ${end.x.toFixed(4)} ${end.y.toFixed(4)}
  `;

  return (
    <path
      key={`arc${p.n}`}
      d={d}
      fill="none"
      stroke={isCurrent ? "var(--coral)" : "var(--grid)"}
      strokeWidth={isCurrent ? 0.028 : 0.014}
      strokeDasharray={isCurrent ? "0.09 0.07" : "0.05 0.07"}
      opacity={isCurrent ? 0.95 : 0.45}
    />
  );
})}

            {/* spiral polyline */}
            <path d={spiralPath} fill="none" stroke="var(--chalk)" strokeWidth="0.035" strokeLinejoin="round" />
            {/* first leg from origin */}
            <line x1="0" y1="0" x2={toScreen(visible[0].x, visible[0].y).x} y2={toScreen(visible[0].x, visible[0].y).y} stroke="var(--chalk)" strokeWidth="0.035" />

            {/* current hypotenuse (O to current vertex), highlighted */}
            <line
              x1="0" y1="0"
              x2={toScreen(current.x, current.y).x} y2={toScreen(current.x, current.y).y}
              stroke="var(--coral)" strokeWidth="0.03"
            />

            {/* origin */}
            <circle cx="0" cy="0" r="0.06" fill="var(--chalk)" />

            {/* spiral vertices */}
            {visible.map((p, i) => {
              const s = toScreen(p.x, p.y);
              const isCurrent = i === visible.length - 1;
              return (
                <circle key={`v${p.n}`} cx={s.x} cy={s.y} r={isCurrent ? 0.07 : 0.045}
                  fill={isCurrent ? "var(--coral)" : "var(--chalk)"} />
              );
            })}

            {/* landing points on the axis */}
            {visible.map((p, i) => {
              const isCurrent = i === visible.length - 1;
              const rational = isPerfectSquare(p.n);
              const color = isCurrent ? "var(--coral)" : rational ? "var(--sage)" : "var(--gold)";
              const labelUp = p.n % 2 === 0;
              return (
                <g key={`land${p.n}`}>
                  <circle cx={p.r} cy="0" r={isCurrent ? 0.075 : 0.05} fill={color} />
                  <text
                    x={p.r}
                    y={labelUp ? -0.22 : 0.62}
                    fontSize="0.22"
                    fill={color}
                    textAnchor="middle"
                    fontFamily="IBM Plex Mono, monospace"
                  >
                    √{p.n}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="nsv-legend">
          <span><span className="nsv-dot" style={{ background: "var(--coral)" }} /> current step</span>
          <span><span className="nsv-dot" style={{ background: "var(--gold)" }} /> irrational (not a perfect square)</span>
          <span><span className="nsv-dot" style={{ background: "var(--sage)" }} /> rational (perfect square)</span>
        </div>
      </div>

      {/* Classifier */}
      <div className="nsv-panel">
        <h2 className="nsv-section-title">Classify a number</h2>
        <div className="nsv-classify-row">
          <input
            className="nsv-input"
            placeholder="try 3/4, 0.75, √7, π…"
            value={query}
            onChange={(e) => runClassify(e.target.value)}
          />
        </div>
        <div className="nsv-chips">
          {customChips.map((c) => (
            <button key={c} className="nsv-chip" onClick={() => runClassify(c)}>{c}</button>
          ))}
        </div>
        {result && (
          <div className={`nsv-result ${result.type}`}>
            <span className="nsv-result-label">
              {result.type === "unknown" ? "not sure yet" : result.type}
            </span>
            {result.reason}
          </div>
        )}
      </div>

      {/* Reference cards */}
      <div className="nsv-cards">
        <div className="nsv-card rat">
          <h3>Rational numbers</h3>
          <p>Any number that can be written as <code>p/q</code>, where p and q are integers and q ≠ 0.</p>
          <ul>
            <li>Decimal expansion terminates: <code>0.75</code></li>
            <li>...or repeats forever: <code>0.333...</code></li>
            <li>Includes all integers: <code>-4, 0, 7</code></li>
            <li>√n is rational only if n is a perfect square</li>
          </ul>
        </div>
        <div className="nsv-card irrat">
          <h3>Irrational numbers</h3>
          <p>Cannot be written as any fraction <code>p/q</code>. Their decimals never terminate and never settle into a repeating pattern.</p>
          <ul>
            <li>√2, √3, √5, √7 — any non-perfect-square root</li>
            <li>π ≈ 3.14159265...</li>
            <li>e ≈ 2.71828182...</li>
            <li>Between any two rationals, infinitely many irrationals exist</li>
          </ul>
        </div>
      </div>
    </div>
  );
}