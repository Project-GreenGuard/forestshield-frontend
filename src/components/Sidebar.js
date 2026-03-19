import React, { useState } from 'react';
import FireThreatTimeline from './FireThreatTimeline';

export default function Sidebar({ fireData, sensors, useMockData, setUseMockData, selectedSensor, fireSpreadData }) {
  const [active, setActive] = useState('timeline');

  return (
    <div style={{
      background: "#243B24",
      padding: "20px",
      gridArea: "sidebar",
      height: "100vh",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
        <img src="/logo.png" alt="Logo" style={{ width: 40, height: 40, borderRadius: "50%", marginRight: 10, objectFit: "cover" }} />
        <h3 style={{ color: "#FF7A00", margin: 0 }}>Dashboard</h3>
      </div>

      {/* Navigation Tabs */}
      <nav style={{ marginBottom: 20, borderBottom: "1px solid #444", paddingBottom: 20 }}>
         <button 
          onClick={() => setActive('overview')} 
          style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", color: active === 'overview' ? "#FF7A00" : "#B0B0B0", cursor: "pointer", padding: "12px 0 12px 10px", borderLeft: active === 'overview' ? "3px solid #FF7A00" : "none", fontSize: "14px", transition: "all 0.3s" }}
        >
          📊 Overview
        </button>
        <button 
          onClick={() => setActive('timeline')} 
          style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", color: active === 'timeline' ? "#FF7A00" : "#B0B0B0", cursor: "pointer", padding: "12px 0 12px 10px", borderLeft: active === 'timeline' ? "3px solid #FF7A00" : "none", fontSize: "14px", transition: "all 0.3s" }}
        >
          ⏱️ Threat Timeline
        </button>
      </nav>

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: "auto", paddingRight: "8px", marginBottom: "16px" }}>
                {/* OVERVIEW TAB */}
        {active === 'overview' && (
          <div>
            <h4 style={{ color: "#FF7A00", margin: "0 0 16px 0" }}>📊 System Overview</h4>
            
            {/* Sensor Stats */}
            <div style={{ background: "#1a1a1a", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
              <h5 style={{ color: "#FF7A00", margin: "0 0 12px 0", fontSize: "12px" }}>🎯 Sensor Statistics</h5>
              <div style={{ marginBottom: "12px" }}>
                <div style={{ color: "#B0B0B0", fontSize: "11px" }}>Total Sensors</div>
                <div style={{ color: "#FF7A00", fontSize: "28px", fontWeight: "bold" }}>{sensors?.length || 0}</div>
              </div>
              <div style={{ marginBottom: "12px" }}>
                <div style={{ color: "#B0B0B0", fontSize: "11px" }}>High Risk</div>
                <div style={{ color: "#FF0000", fontSize: "24px", fontWeight: "bold" }}>{sensors?.filter(s => s.riskScore > 60).length || 0}</div>
              </div>
              <div style={{ marginBottom: "12px" }}>
                <div style={{ color: "#B0B0B0", fontSize: "11px" }}>Medium Risk</div>
                <div style={{ color: "#FF7A00", fontSize: "24px", fontWeight: "bold" }}>{sensors?.filter(s => s.riskScore > 30 && s.riskScore <= 60).length || 0}</div>
              </div>
              <div>
                <div style={{ color: "#B0B0B0", fontSize: "11px" }}>Low Risk</div>
                <div style={{ color: "#00C853", fontSize: "24px", fontWeight: "bold" }}>{sensors?.filter(s => s.riskScore <= 30).length || 0}</div>
              </div>
            </div>

               {/* Model Health */}
            <div style={{ background: "#1a1a1a", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
              <h5 style={{ color: "#FF7A00", margin: "0 0 12px 0", fontSize: "12px" }}>🤖 Model Health</h5>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "#00C853", marginRight: "10px" }}></div>
                <div>
                  <div style={{ color: "#B0B0B0", fontSize: "11px" }}>Status</div>
                  <div style={{ color: "#00C853", fontSize: "14px", fontWeight: "bold" }}>HEALTHY</div>
                </div>
              </div>
              <div>
                <div style={{ color: "#B0B0B0", fontSize: "11px", marginBottom: "4px" }}>Confidence</div>
                <div style={{ background: "#0d0d0d", height: "20px", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ background: "#FF7A00", height: "100%", width: "85%" }}></div>
                </div>
                <div style={{ color: "#FF7A00", fontSize: "12px", fontWeight: "bold", marginTop: "4px" }}>85%</div>
              </div>
            </div>

            {/* Active Sensors */}
            <div style={{ background: "#1a1a1a", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
              <h5 style={{ color: "#FF7A00", margin: "0 0 12px 0", fontSize: "12px" }}>📍 Top Sensors</h5>
              {sensors?.slice(0, 5).map((sensor) => (
                <div key={sensor.deviceId} style={{ padding: "10px", background: "#0d0d0d", borderRadius: "4px", marginBottom: "8px", borderLeft: `3px solid ${sensor.riskScore > 60 ? '#FF0000' : sensor.riskScore > 30 ? '#FF7A00' : '#00C853'}` }}>
                  <div style={{ color: "#B0B0B0", fontSize: "11px", fontWeight: "bold", marginBottom: "4px" }}>{sensor.name || sensor.deviceId}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                    <span style={{ color: "#888" }}>{sensor.temperature?.toFixed(1)}°C</span>
                    <span style={{ color: "#FF7A00", fontWeight: "bold" }}>Risk: {sensor.riskScore?.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* System Info */}
            <div style={{ background: "#1a1a1a", padding: "16px", borderRadius: "8px", border: "1px solid #333" }}>
              <h5 style={{ color: "#FF7A00", margin: "0 0 12px 0", fontSize: "12px" }}>ℹ️ System Info</h5>
              <div style={{ fontSize: "11px", color: "#888", lineHeight: "1.6" }}>
                <p style={{ margin: "0 0 8px 0" }}><strong>Forecast:</strong> 12-48 hours</p>
                <p style={{ margin: "0 0 8px 0" }}><strong>Update Rate:</strong> 10 seconds</p>
                <p style={{ margin: "0 0 8px 0" }}><strong>ML Model:</strong> Active</p>
                <p style={{ margin: 0 }}><strong>Regions:</strong> Ontario, Canada</p>
              </div>
            </div>
          </div>
        )}
      </div>
        
        {/* THREAT TIMELINE TAB */}
        {active === 'timeline' && (
          <div>
            {fireSpreadData && selectedSensor ? (
              <>
                <h4 style={{ color: "#FF7A00", margin: "0 0 16px 0" }}>🔥 Threat Timeline</h4>
                <FireThreatTimeline 
                  fireData={fireSpreadData} 
                  sensors={sensors} 
                  ignitionPoint={{ lat: selectedSensor.lat, lng: selectedSensor.lng }} 
                  visible={true}
                  inSidebar={true}
                />
              </>
            ) : (
              <div style={{ background: "#1a1a1a", padding: "20px", borderRadius: "8px", textAlign: "center", color: "#B0B0B0", fontSize: "13px", border: "1px solid #333", marginTop: "20px" }}>
                <p style={{ margin: "0 0 8px 0", fontSize: "16px" }}>🔥 Threat Timeline</p>
                <p style={{ margin: "0 0 8px 0" }}>Select a Sensor</p>
                <p style={{ margin: "0 0 8px 0" }}>Click a sensor on the</p>
                <p style={{ margin: 0 }}>map to view threats</p>
              </div>
            )}
          </div>
        )}

      {/* Mock Data Toggle */}
      <button 
        onClick={() => setUseMockData(!useMockData)} 
        style={{ width: "100%", padding: "10px", background: useMockData ? "#00C853" : "#666", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "12px", transition: "background 0.3s" }}
      >
        {useMockData ? '✓ Mock Data' : 'Live Data'}
      </button>
    </div>
  );
}