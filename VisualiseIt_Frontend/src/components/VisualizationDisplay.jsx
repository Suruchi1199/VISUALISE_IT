import React from "react";
import "../styles/visualization.css";
import { getVisualizationComponent } from "../data/visualizationRegistry";

export default function VisualizationDisplay({ visualizations }) {
  if (!visualizations || visualizations.length === 0) {
    return (
      <div className="visualizations-container">
        <p className="no-visualizations">No visualizations available for this chapter.</p>
      </div>
    );
  }

  return (
    <div className="visualizations-container">
      
      <div className="visualizations-grid">
        {visualizations.map((vis) => (
          <div key={vis.id} className="visualization-card">
            {/* <div className="visualization-header">
              <h3>{vis.title}</h3>
              <span className="visualization-type">{vis.type}</span>
            </div> */}
            {vis.description && (
              <p className="visualization-description">{vis.description}</p>
            )}
            <div className="visualization-content">
              <VisualizationRenderer visualization={vis} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VisualizationRenderer({ visualization }) {
  const { type, data } = visualization;
  const Visualizer = getVisualizationComponent(type);

  if (Visualizer) {
    return <Visualizer data={data ?? {}} />;
  }

  return (
    <div className="placeholder">
      No visualization component is registered for type: {type || "unknown"}
    </div>
  );
}
