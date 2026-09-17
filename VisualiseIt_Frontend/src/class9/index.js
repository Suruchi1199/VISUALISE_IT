// src/class9/index.js
import { lazy } from "react";

const class9Topics = {
  "orienting-yourself-coordinates": lazy(() => import("./CoordinateGeometryVisualizer.jsx")),
  "polynomials": lazy(() => import("./PolynomialVisualizer.jsx")),
  "coordinate-geometry": lazy(() => import("./CoordinateGeometryVisualizer.jsx")),
};

export default class9Topics;
