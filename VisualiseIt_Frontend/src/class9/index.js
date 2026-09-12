// src/class9/index.js
import { lazy } from "react";

const class9Topics = {
  "number-system": lazy(() => import("./NumberSystemVisualizer.jsx")),
  "polynomials": lazy(() => import("./PolynomialVisualizer.jsx")),
  "coordinate-geometry": lazy(() => import("./CoordinateGeometryVisualizer.jsx")),
};

export default class9Topics;