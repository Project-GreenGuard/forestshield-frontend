import React, { useState, useEffect } from 'react';

const WarningIcon = ({ size = 24, color = "#FF4444" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 19H22L12 2Z" fill={color} opacity="0.2" />
    <path d="M12 2L2 19H22L12 2Z" stroke={color} strokeWidth="2" />
    <circle cx="12" cy="15" r="1.5" fill={color} />
    <rect x="11" y="8" width="2" height="5" rx="1" fill={color} />
  </svg>
);

export default function WarningBanner({ sensors = [] }) {
  const [criticalSensors, setCriticalSensors] = useState([]);
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState({});

  useEffect(() => {
    // Find sensors with HIGH risk (above 60)
    const highRisk = sensors.filter(s => {
      const riskScore = s.riskScore ? s.riskScore * 100 : 0;
      return riskScore > 60;
    });

    // Filter out dismissed warnings
    const newCritical = highRisk.filter(s => !dismissed[s.deviceId]);
    
    setCriticalSensors(newCritical);
    setShowBanner(newCritical.length > 0);
  }, [sensors, dismissed]);

  const dismissWarning = (deviceId) => {
    setDismissed(prev => ({ ...prev, [deviceId]: true }));
  };

  const dismissAll = () => {
    const allIds = criticalSensors.reduce((acc, s) => ({ ...acc, [s.deviceId]: true }), {});
    setDismissed(prev => ({ ...prev, ...allIds }));
  };

  if (!showBanner) return null;

  return (
    <div style={{
      position: "fixed",
      top: 20,
      right: 20,
      zIndex: 10000,
      maxWidth: "350px",
      background: "#fff",
      borderRadius: "12px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      border: "1px solid #B22222",
      overflow: "hidden",
      animation: "slideIn 0.3s ease"
    }}>
      {/* Header */}
      <div style={{
        background: "#B22222",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        color: "white"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <WarningIcon size={20} color="white" />
          <span style={{ fontWeight: "bold", fontSize: "14px" }}>
            CRITICAL WARNING
          </span>
        </div>
        <button
          onClick={dismissAll}
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            cursor: "pointer",
            fontSize: "12px",
            textDecoration: "underline",
            opacity: 0.8
          }}
        >
          Dismiss All
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "16px", background: "#fff" }}>
        <p style={{ margin: "0 0 12px 0", color: "#333", fontSize: "13px" }}>
          🔥 {criticalSensors.length} high-risk area{criticalSensors.length > 1 ? 's' : ''} detected:
        </p>
        
        {criticalSensors.map(sensor => (
          <div
            key={sensor.deviceId}
            style={{
              padding: "10px",
              marginBottom: "8px",
              background: "#fff5f5",
              borderRadius: "8px",
              border: "1px solid #ffcdd2",
              position: "relative"
            }}
          >
            <button
              onClick={() => dismissWarning(sensor.deviceId)}
              style={{
                position: "absolute",
                top: "4px",
                right: "4px",
                background: "transparent",
                border: "none",
                color: "#B22222",
                cursor: "pointer",
                fontSize: "16px",
                padding: "0 4px"
              }}
            >
              ×
            </button>
            
            <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
              {sensor.location || sensor.deviceId}
            </div>
            
            <div style={{ fontSize: "12px", color: "#666" }}>
              <div>🌡️ {sensor.temperature?.toFixed(1)}°C</div>
              <div>💧 {sensor.humidity?.toFixed(1)}%</div>
              <div>💨 {sensor.wind_speed?.toFixed(1)} km/h</div>
              <div style={{ 
                color: "#B22222", 
                fontWeight: "bold",
                marginTop: "4px",
                fontSize: "13px"
              }}>
                Risk: {(sensor.riskScore * 100).toFixed(1)}/100
              </div>
            </div>
          </div>
        ))}

        <div style={{
          marginTop: "12px",
          padding: "8px",
          background: "#f5f5f5",
          borderRadius: "6px",
          fontSize: "11px",
          color: "#666",
          textAlign: "center"
        }}>
          ⚠️ Immediate action recommended for high-risk areas
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}