/**
 * Enhanced Data Panel with detailed ML scoring breakdown (PBI-7)
 * Shows ML score vs rule-based score, confidence, and model drift status
 */

import { useState, useEffect } from 'react';
import { getDetailedRisk, getModelHealth } from '../services/scoring';

// Icon Components
const ChartIcon = ({ size = 20, color = "#4ECDC4" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4-1h2v19h-2zm4 4h2v15h-2z"
      fill={color}
    />
  </svg>
);

const BrainIcon = ({ size = 20, color = "#FFB266" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    <path
      d="M12 8v8M9 12h6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const AlertIcon = ({ size = 20, color = "#FF6B6B" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L2 20h20L12 2z"
      stroke={color}
      strokeWidth="2"
      fill={color}
      opacity="0.2"
    />
    <path d="M12 9v4M12 17h0.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const HealthIcon = ({ size = 20, color = "#00C853" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <path
      d="M8 12l2 2 6-6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function EnhancedDataPanel({ sensors = [], loading = false }) {
  const [detailedScores, setDetailedScores] = useState({});
  const [modelHealth, setModelHealth] = useState(null);

  // Fetch detailed scoring when sensors change
  useEffect(() => {
    if (sensors.length === 0) return;

    const fetchDetailedScores = async () => {
      const scores = {};

      for (const sensor of sensors) {
        const payload = {
          temperature: sensor.temperature || 25,
          humidity: sensor.humidity || 50,
          lat: sensor.lat || 43.6532,
          lng: sensor.lng || -79.3832,
          nearestFireDistance: sensor.nearestFireDistance || 50,
          timestamp: sensor.timestamp || new Date().toISOString(),
        };

        const detailed = await getDetailedRisk(payload);
        if (detailed) {
          scores[sensor.deviceId] = detailed;
        }
      }

      setDetailedScores(scores);
    };

    fetchDetailedScores();
  }, [sensors]);

  // Fetch model health
  useEffect(() => {
    const fetchHealth = async () => {
      const health = await getModelHealth();
      setModelHealth(health);
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (score) => {
    if (score > 60) return '#B22222';
    if (score > 30) return '#FF7A00';
    return '#00C853';
  };

  const getRiskLevel = (score) => {
    if (score > 60) return 'HIGH';
    if (score > 30) return 'MEDIUM';
    return 'LOW';
  };

  if (loading && sensors.length === 0) {
    return (
      <div style={{ gridArea: "panel", background: "#181818", padding: 20 }}>
        <h3>Enhanced Analysis</h3>
        <div style={{ color: "#888", marginTop: 20 }}>
          Loading detailed scoring...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        gridArea: "panel",
        background: "#181818",
        padding: "20px",
        overflowY: "auto",
      }}
    >
      <h3 style={{ marginBottom: 20, color: "#fff", fontSize: "18px" }}>
        Enhanced Analysis
      </h3>

      {/* Model Health Status */}
      {modelHealth && (
        <div
          style={{
            background: "#1F1F1F",
            padding: "16px",
            marginBottom: 20,
            borderRadius: "12px",
            border: `1px solid rgba(${
              modelHealth.status === 'CRITICAL'
                ? '255,107,107'
                : modelHealth.status === 'WARNING'
                ? '255,122,0'
                : '0,200,83'
            },0.3)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
            {modelHealth.status === 'CRITICAL' ? (
              <AlertIcon size={20} color="#FF6B6B" />
            ) : modelHealth.status === 'WARNING' ? (
              <AlertIcon size={20} color="#FF7A00" />
            ) : (
              <HealthIcon size={20} color="#00C853" />
            )}
            <span style={{ color: "#E0E0E0", fontWeight: "600" }}>
              Model Status: {modelHealth.status}
            </span>
          </div>
          {modelHealth.drift_detected && (
            <div style={{ fontSize: "12px", color: "#FF7A00", marginBottom: "8px" }}>
              ⚠️ Model drift detected
            </div>
          )}
          <div style={{ fontSize: "12px", color: "#888" }}>
            {modelHealth.predictions_count} predictions analyzed | RMSE: {modelHealth.rmse}
          </div>
        </div>
      )}

      {/* Detailed Scores per Sensor */}
      {sensors.map((sensor) => {
        const detailed = detailedScores[sensor.deviceId];
        if (!detailed) return null;

        const mlColor = getRiskColor(detailed.ml_score);
        const ruleColor = getRiskColor(detailed.rule_score);

        return (
          <div
            key={sensor.deviceId}
            style={{
              background: "#1F1F1F",
              padding: "16px",
              marginBottom: 16,
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Sensor Header */}
            <div
              style={{
                marginBottom: 14,
                paddingBottom: 14,
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <h4 style={{ margin: 0, color: "#fff", fontSize: "14px" }}>
                {sensor.deviceId}
              </h4>
            </div>

            {/* Score Comparison */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
              {/* ML Score */}
              <div
                style={{
                  flex: 1,
                  padding: "12px",
                  background: `rgba(255,178,102,0.08)`,
                  borderRadius: "8px",
                  border: "1px solid rgba(255,178,102,0.2)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <BrainIcon size={16} color="#FFB266" />
                  <span style={{ fontSize: "12px", color: "#888" }}>ML Score</span>
                </div>
                <div style={{ fontSize: "18px", color: mlColor, fontWeight: "600" }}>
                  {detailed.ml_score.toFixed(1)}
                </div>
                <div style={{ fontSize: "10px", color: "#888", marginTop: "4px" }}>
                  {detailed.ml_level} • {(detailed.ml_confidence * 100).toFixed(0)}% confidence
                </div>
              </div>

              {/* Rule Score */}
              <div
                style={{
                  flex: 1,
                  padding: "12px",
                  background: `rgba(78,205,196,0.08)`,
                  borderRadius: "8px",
                  border: "1px solid rgba(78,205,196,0.2)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <ChartIcon size={16} color="#4ECDC4" />
                  <span style={{ fontSize: "12px", color: "#888" }}>Rule Score</span>
                </div>
                <div style={{ fontSize: "18px", color: ruleColor, fontWeight: "600" }}>
                  {detailed.rule_score.toFixed(1)}
                </div>
                <div style={{ fontSize: "10px", color: "#888", marginTop: "4px" }}>
                  {detailed.rule_level}
                </div>
              </div>

              {/* Combined */}
              <div
                style={{
                  flex: 1,
                  padding: "12px",
                  background: `rgba(${
                    getRiskColor(detailed.combined_score) === '#B22222'
                      ? '178,34,34'
                      : getRiskColor(detailed.combined_score) === '#FF7A00'
                      ? '255,122,0'
                      : '0,200,83'
                  },0.08)`,
                  borderRadius: "8px",
                  border: `1px solid rgba(${
                    getRiskColor(detailed.combined_score) === '#B22222'
                      ? '178,34,34'
                      : getRiskColor(detailed.combined_score) === '#FF7A00'
                      ? '255,122,0'
                      : '0,200,83'
                  },0.2)`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "12px", color: "#888" }}>Combined</span>
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    color: getRiskColor(detailed.combined_score),
                    fontWeight: "600",
                  }}
                >
                  {detailed.combined_score.toFixed(1)}
                </div>
                <div style={{ fontSize: "10px", color: "#888", marginTop: "4px" }}>
                  {getRiskLevel(detailed.combined_score)}
                </div>
              </div>
            </div>

            {/* Model Info */}
            <div style={{ fontSize: "11px", color: "#666", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              Model: {detailed.model_version}
            </div>
          </div>
        );
      })}
    </div>
  );
}