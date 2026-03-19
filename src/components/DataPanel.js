import React from 'react';

const DataPanel = ({ selectedSensor, mlRisk, fireSpread }) => {
  if (!selectedSensor) {
    return (
      <div className="data-panel">
        <p>Select a sensor to view details</p>
      </div>
    );
  }

  return (
    <div className="data-panel">
      <h2>{selectedSensor.name}</h2>

      {/* ============ RISK SCORE CARD ============ */}
      {mlRisk && (
        <div className="card risk-card">
          <h3>📊 ML Risk Score</h3>
          
          <div className="score-display">
            <div className="score-number" style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: mlRisk.risk_score >= 61 ? '#FF0000' :
                     mlRisk.risk_score >= 31 ? '#FFA500' : '#00AA00'
            }}>
              {mlRisk.risk_score.toFixed(1)}
            </div>
            <div className="score-label">
              {mlRisk.risk_level}
            </div>
          </div>

          <div className="score-breakdown">
            <div className="metric">
              <span>Confidence:</span>
              <strong>{(mlRisk.confidence * 100).toFixed(0)}%</strong>
            </div>
            <div className="metric">
              <span>ML Score:</span>
              <strong>{mlRisk.ml_score.toFixed(1)}</strong>
            </div>
            <div className="metric">
              <span>Rule Score:</span>
              <strong>{mlRisk.rule_based_score.toFixed(1)}</strong>
            </div>
          </div>

          <div className="features">
            <h4>Current Conditions</h4>
            <div className="feature-item">
              <span>🌡️ Temperature</span>
              <strong>{mlRisk.features.temperature}°C</strong>
            </div>
            <div className="feature-item">
              <span>💧 Humidity</span>
              <strong>{mlRisk.features.humidity}%</strong>
            </div>
            <div className="feature-item">
              <span>🔥 Fire Distance</span>
              <strong>{mlRisk.features.fire_distance_km} km</strong>
            </div>
          </div>
        </div>
      )}

      {/* ============ FIRE SPREAD CARD ============ */}
      {fireSpread && (
        <div className="card fire-spread-card">
          <h3>🔥 Fire Spread Forecast (12h)</h3>
          
          <div className="spread-metrics">
            <div className="metric-box">
              <div className="metric-label">Spread Rate</div>
              <div className="metric-value">
                {fireSpread.fire_spread.spread_rate_kmh}
                <span className="unit">km/h</span>
              </div>
            </div>

            <div className="metric-box">
              <div className="metric-label">Direction</div>
              <div className="metric-value">
                {fireSpread.fire_spread.direction_degrees}°
              </div>
            </div>

            <div className="metric-box">
              <div className="metric-label">Area (12h)</div>
              <div className="metric-value">
                {fireSpread.fire_spread.area_hectares}
                <span className="unit">ha</span>
              </div>
            </div>

            <div className="metric-box">
              <div className="metric-label">Intensity</div>
              <div className="metric-value">
                {fireSpread.fire_spread.intensity_level}/10
              </div>
            </div>
          </div>

          <div className="timeline">
            <h4>Spread Timeline</h4>
            {fireSpread.forecast_timeline?.map((step, idx) => (
              <div key={idx} className="timeline-item">
                <div className="time">+{step.hours}h</div>
                <div className="area">{step.area.toFixed(1)} ha</div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(step.area /
                        fireSpread.fire_spread.area_hectares) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataPanel;