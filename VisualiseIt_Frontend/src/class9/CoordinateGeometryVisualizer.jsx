import React, { useMemo, useRef, useState } from "react";
import "./style/coordinates.css";
/**
 * CoordinateGeometryVisualizer
 * Class 9 · Coordinate Geometry
 *
 * Click anywhere on the plane to plot a point. Selecting a point drops
 * dashed perpendiculars to both axes — a direct, visual definition of
 * abscissa (distance from the y-axis) and ordinate (distance from the x-axis).
 */

const RANGE = 7;

function quadrantOf(x, y) {
  if (x === 0 && y === 0) return { label: "the Origin", tag: "O", color: "var(--chalk)" };
  if (x === 0) return { label: "on the y-axis", tag: "—", color: "var(--chalk-dim)" };
  if (y === 0) return { label: "on the x-axis", tag: "—", color: "var(--chalk-dim)" };
  if (x > 0 && y > 0) return { label: "Quadrant I  (+, +)", tag: "I", color: "var(--gold)" };
  if (x < 0 && y > 0) return { label: "Quadrant II  (−, +)", tag: "II", color: "var(--sage)" };
  if (x < 0 && y < 0) return { label: "Quadrant III  (−, −)", tag: "III", color: "var(--coral)" };
  return { label: "Quadrant IV  (+, −)", tag: "IV", color: "var(--lilac)" };
}

let idCounter = 1;

/**
 * CoordinateGeometryVisualizer
 * @param {Object} data - Optional data prop from visualization API
 * @param {Array} data.initialPoints - Initial points to plot (each with x, y properties)
 *                                      (default: [{x: 4, y: 3}, {x: -3, y: 5}])
 * @param {number} data.range - Coordinate range to display (default: 7)
 */
export default function CoordinateGeometryVisualizer({ data = {} }) {
  const initialPoints = data.initialPoints || [
    { id: idCounter++, x: 4, y: 3 },
    { id: idCounter++, x: -3, y: 5 },
  ];
  
  const svgRef = useRef(null);
  const [points, setPoints] = useState(initialPoints);
  const [selectedId, setSelectedId] = useState(initialPoints[0]?.id || 1);
  const [hover, setHover] = useState(null);
  const [inputX, setInputX] = useState("");
  const [inputY, setInputY] = useState("");

  const selected = points.find((p) => p.id === selectedId) || null;

  const toScreen = (x, y) => ({ x, y: -y });
  const clamp = (v) => Math.max(-RANGE, Math.min(RANGE, v));

  const clientToMath = (clientX, clientY) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM().inverse();
    const p = pt.matrixTransform(ctm);
    return { x: clamp(Math.round(p.x * 2) / 2), y: clamp(Math.round(-p.y * 2) / 2) };
  };

  const handleClick = (e) => {
    const { x, y } = clientToMath(e.clientX, e.clientY);
    const id = idCounter++;
    setPoints((prev) => [...prev, { id, x, y }]);
    setSelectedId(id);
  };

  const handleMove = (e) => {
    setHover(clientToMath(e.clientX, e.clientY));
  };

  const addManualPoint = () => {
    const x = clamp(parseFloat(inputX));
    const y = clamp(parseFloat(inputY));
    if (Number.isNaN(x) || Number.isNaN(y)) return;
    const id = idCounter++;
    setPoints((prev) => [...prev, { id, x, y }]);
    setSelectedId(id);
    setInputX("");
    setInputY("");
  };

  const removePoint = (id) => {
    setPoints((prev) => prev.filter((p) => p.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const clearAll = () => {
    setPoints([]);
    setSelectedId(null);
  };

  const gridLines = useMemo(() => {
    const arr = [];
    for (let i = -RANGE; i <= RANGE; i++) arr.push(i);
    return arr;
  }, []);

  return (
    <div className="cg-root">

      <p className="cg-eyebrow">Class 9 · Coordinate Geometry</p>
      <h1 className="cg-h1">The Cartesian Plane</h1>
      <p className="cg-sub">
        Click anywhere on the grid to plot a point, or type coordinates directly. Select a point
        to see its abscissa and ordinate as literal perpendicular distances from the two axes.
      </p>

      <div className="cg-layout">
        {/* Graph */}
        <div className="cg-panel">
          <div className="cg-svg-wrap">
            <svg
              ref={svgRef}
              viewBox={`-${RANGE + 1} -${RANGE + 1} ${2 * (RANGE + 1)} ${2 * (RANGE + 1)}`}
              xmlns="http://www.w3.org/2000/svg"
              onClick={handleClick}
              onMouseMove={handleMove}
              onMouseLeave={() => setHover(null)}
            >
              {/* quadrant tints */}
              <rect x="0" y={-RANGE} width={RANGE} height={RANGE} fill="var(--gold)" opacity="0.06" />
              <rect x={-RANGE} y={-RANGE} width={RANGE} height={RANGE} fill="var(--sage)" opacity="0.06" />
              <rect x={-RANGE} y="0" width={RANGE} height={RANGE} fill="var(--coral)" opacity="0.06" />
              <rect x="0" y="0" width={RANGE} height={RANGE} fill="var(--lilac)" opacity="0.08" />

              {/* grid */}
              {gridLines.map((i) => (
                <g key={`g${i}`}>
                  <line x1={i} y1={-RANGE} x2={i} y2={RANGE} stroke="var(--gridfaint)" strokeWidth="0.012" />
                  <line x1={-RANGE} y1={i} x2={RANGE} y2={i} stroke="var(--gridfaint)" strokeWidth="0.012" />
                </g>
              ))}

              {/* axes */}
              <line x1={-RANGE - 0.6} y1="0" x2={RANGE + 0.6} y2="0" stroke="var(--chalk)" strokeWidth="0.035" />
              <line x1="0" y1={-RANGE - 0.6} x2="0" y2={RANGE + 0.6} stroke="var(--chalk)" strokeWidth="0.035" />
              <text x={RANGE + 0.5} y="-0.25" fontSize="0.4" fill="var(--chalk)" fontFamily="Fraunces, serif" textAnchor="middle">x</text>
              <text x="0.35" y={-RANGE - 0.4} fontSize="0.4" fill="var(--chalk)" fontFamily="Fraunces, serif">y</text>
              <text x="-0.3" y="0.5" fontSize="0.28" fill="var(--chalk-dim)" fontFamily="IBM Plex Mono, monospace" textAnchor="end">O</text>

              {/* tick labels every 2 units */}
              {gridLines.filter((i) => i !== 0 && i % 2 === 0).map((i) => (
                <g key={`t${i}`}>
                  <text x={i} y="0.32" fontSize="0.24" fill="var(--chalk-dim)" fontFamily="IBM Plex Mono, monospace" textAnchor="middle">{i}</text>
                  <text x="-0.15" y={-i + 0.08} fontSize="0.24" fill="var(--chalk-dim)" fontFamily="IBM Plex Mono, monospace" textAnchor="end">{i}</text>
                </g>
              ))}

              {/* selected point projections */}
              {selected && (
                <g>
                  <line x1={selected.x} y1="0" x2={selected.x} y2={-selected.y} stroke="var(--coral)" strokeWidth="0.025" strokeDasharray="0.08 0.06" />
                  <line x1="0" y1={-selected.y} x2={selected.x} y2={-selected.y} stroke="var(--coral)" strokeWidth="0.025" strokeDasharray="0.08 0.06" />
                  <text
                    x={selected.x / 2}
                    y={selected.y >= 0 ? -0.12 : 0.32}
                    fontSize="0.24" fill="var(--coral)" fontFamily="IBM Plex Mono, monospace" textAnchor="middle"
                  >abscissa {selected.x}</text>
                  <text
                    x={selected.x >= 0 ? 0.15 : -0.15}
                    y={-selected.y / 2}
                    fontSize="0.24" fill="var(--coral)" fontFamily="IBM Plex Mono, monospace"
                    textAnchor={selected.x >= 0 ? "start" : "end"}
                  >ordinate {selected.y}</text>
                </g>
              )}

              {/* points */}
              {points.map((p) => {
                const s = toScreen(p.x, p.y);
                const isSel = p.id === selectedId;
                return (
                  <g key={p.id} onClick={(e) => { e.stopPropagation(); setSelectedId(p.id); }}>
                    <circle cx={s.x} cy={s.y} r={isSel ? 0.14 : 0.1} fill={isSel ? "var(--coral)" : "var(--chalk)"} stroke={isSel ? "var(--chalk)" : "none"} strokeWidth="0.02" />
                    <text x={s.x + 0.22} y={s.y - 0.18} fontSize="0.26" fill={isSel ? "var(--coral)" : "var(--chalk-dim)"} fontFamily="IBM Plex Mono, monospace">
                      ({p.x}, {p.y})
                    </text>
                  </g>
                );
              })}

              {/* hover crosshair */}
              {hover && (
                <circle cx={hover.x} cy={-hover.y} r="0.06" fill="none" stroke="var(--gold)" strokeWidth="0.02" opacity="0.7" />
              )}
            </svg>
          </div>
          <div className="cg-hover-readout">
            {hover ? <>hovering at <b>({hover.x}, {hover.y})</b> — click to plot</> : "move over the grid to preview a point"}
          </div>
        </div>

        {/* Side panel */}
        <div className="cg-panel">
          <h2 className="cg-section-title">Plot a point</h2>
          <div className="cg-manual-row">
            <input placeholder="x" value={inputX} onChange={(e) => setInputX(e.target.value)} />
            <span>,</span>
            <input placeholder="y" value={inputY} onChange={(e) => setInputY(e.target.value)} />
            <button className="cg-btn" onClick={addManualPoint}>Plot</button>
          </div>

          <div className="cg-point-list">
            {points.length === 0 && <p style={{ color: "var(--chalk-dim)", fontSize: 13 }}>No points yet — click the grid or add one above.</p>}
            {points.map((p) => {
              const q = quadrantOf(p.x, p.y);
              return (
                <div key={p.id} className={`cg-point-row ${p.id === selectedId ? "active" : ""}`} onClick={() => setSelectedId(p.id)}>
                  <span className="coord">({p.x}, {p.y}) <span className="quad">· {q.label}</span></span>
                  <button onClick={(e) => { e.stopPropagation(); removePoint(p.id); }}>×</button>
                </div>
              );
            })}
          </div>
          {points.length > 0 && <button className="cg-btn ghost" onClick={clearAll} style={{ marginBottom: 14 }}>Clear all</button>}

          <h2 className="cg-section-title">Selected point</h2>
          {selected ? (
            <div className="cg-detail">
              Point <b>({selected.x}, {selected.y})</b> lies in <span className="quadtag">{quadrantOf(selected.x, selected.y).label}</span>.<br />
              Abscissa (x-coordinate): <b>{selected.x}</b> — distance from the y-axis.<br />
              Ordinate (y-coordinate): <b>{selected.y}</b> — distance from the x-axis.
            </div>
          ) : (
            <div className="cg-detail">Select a point to see its abscissa, ordinate, and quadrant.</div>
          )}
        </div>
      </div>

      {/* Reference cards */}
      <div className="cg-cards">
        <div className="cg-card">
          <h3>Key terms</h3>
          <ul>
            <li><code>Cartesian plane</code> — the plane formed by a horizontal x-axis and vertical y-axis</li>
            <li><code>Origin</code> — the point (0, 0) where the axes cross</li>
            <li><code>Abscissa</code> — the x-coordinate, distance from the y-axis</li>
            <li><code>Ordinate</code> — the y-coordinate, distance from the x-axis</li>
            <li>A point is written as the ordered pair <code>(abscissa, ordinate)</code></li>
          </ul>
        </div>
        <div className="cg-card">
          <h3>Quadrant sign convention</h3>
          <table className="cg-quad-table">
            <tbody>
              <tr><th>Quadrant</th><th>x</th><th>y</th></tr>
              <tr><td>I</td><td>+</td><td>+</td></tr>
              <tr><td>II</td><td>−</td><td>+</td></tr>
              <tr><td>III</td><td>−</td><td>−</td></tr>
              <tr><td>IV</td><td>+</td><td>−</td></tr>
            </tbody>
          </table>
          <p style={{ marginTop: 8 }}>Points on an axis (x = 0 or y = 0) don't belong to any quadrant.</p>
        </div>
      </div>
    </div>
  );
}