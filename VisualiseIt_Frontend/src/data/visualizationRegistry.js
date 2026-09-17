/**
 * Visualization Registry
 * Maps visualization types (from API) to React components
 * Enables dynamic component selection based on database type field
 */
import DistanceFormulaVisualizer from "../class9/DistanceFormulaVisualizer";
import CoordinateGeometryVisualizer from "../class9/CoordinateGeometryVisualizer";
import PolynomialVisualizer from "../class9/PolynomialVisualizer";
import MidpointReflectionVisualizer from "../class9/MidpointReflectionVisualizer";
import GeometryApplicationsVisualizer from "../class9/GeometryApplicationsVisualizer";
import RealLifeApplicationsVisualizer from "../class9/RealLifeApplicationsVisualizer";
/**
 * Visualization type mapping
 * Key: visualization type from database (e.g., "coordinate-geometry")
 * Value: React component to render
 */
export const VISUALIZATION_REGISTRY = {
  "coordinate-geometry": CoordinateGeometryVisualizer,
  "coordinates": CoordinateGeometryVisualizer, // alias
  "distance-formula": DistanceFormulaVisualizer, // alias
  "midpoints and reflections": MidpointReflectionVisualizer, // alias
  "geometry-applications" : GeometryApplicationsVisualizer, // alias
  "real-life applications": RealLifeApplicationsVisualizer, // alias
  "polynomial": PolynomialVisualizer,
  "polynomials": PolynomialVisualizer, // alias
};

/**
 * Get component for a visualization type
 * @param {string} type - The visualization type from the API
 * @returns {React.Component|null} - The component to render or null if not found
 */
export function getVisualizationComponent(type) {
  if (!type) return null;
  
  const normalizedType = type.toLowerCase().trim();
  return VISUALIZATION_REGISTRY[normalizedType] || null;
}

/**
 * Check if a visualization type is supported
 * @param {string} type - The visualization type to check
 * @returns {boolean} - True if the type is registered
 */
export function isVisualizationTypeSupported(type) {
  return getVisualizationComponent(type) !== null;
}

/**
 * Get all supported visualization types
 * @returns {string[]} - Array of supported type keys
 */
export function getSupportedVisualizationTypes() {
  return Object.keys(VISUALIZATION_REGISTRY);
}

export default VISUALIZATION_REGISTRY;
