export default function DataPanel({ sensors = [], loading = false, error = null }) {
  // Get the first sensor or create a default display
  const primarySensor = sensors.length > 0 ? sensors[0] : null;

  const getRiskLevel = (riskScore) => {
    if (!riskScore) return { level: 'Unknown', color: '#888' };
    if (riskScore > 60) return { level: 'High', color: '#B22222' };
    if (riskScore > 30) return { level: 'Medium', color: '#FF7A00' };
    return { level: 'Low', color: '#00C853' };
  };

  if (loading && sensors.length === 0) {
    return (
      <div style={{
        gridArea: "panel",
        background: "#181818",
        padding: 20
      }}>
        <h3>Live Data</h3>
        <div style={{ color: "#888", marginTop: 20 }}>Loading sensor data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        gridArea: "panel",
        background: "#181818",
        padding: 20
      }}>
        <h3>Live Data</h3>
        <div style={{ color: "#B22222", marginTop: 20 }}>Error: {error}</div>
      </div>
    );
  }

  if (sensors.length === 0) {
    return (
      <div style={{
        gridArea: "panel",
        background: "#181818",
        padding: 20
      }}>
        <h3>Live Data</h3>
        <div style={{ color: "#888", marginTop: 20 }}>No sensors available</div>
      </div>
    );
  }

  return (
    <div style={{
      gridArea: "panel",
      background: "#181818",
      padding: 20,
      overflowY: "auto"
    }}>
      <h3 style={{ marginBottom: 20 }}>Live Data</h3>
      
      {sensors.map((sensor) => {
        const riskInfo = getRiskLevel(sensor.riskScore);
        
        return (
          <div
            key={sensor.deviceId}
            style={{
              background: "#2A2A2A",
              padding: "15px",
              marginBottom: 15,
              borderRadius: 10,
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
            }}
          >
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginBottom: 10
            }}>
              <h4 style={{ margin: 0, color: "#fff" }}>{sensor.deviceId}</h4>
              <span style={{
                background: riskInfo.color,
                color: "#fff",
                padding: "4px 10px",
                borderRadius: 5,
                fontSize: 12,
                fontWeight: "bold"
              }}>
                {riskInfo.level}
              </span>
            </div>
            
            <div style={{ marginTop: 15 }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between",
                marginBottom: 8
              }}>
                <span style={{ color: "#B0B0B0" }}>Temperature 🌡️</span>
                <span style={{ color: "#fff", fontWeight: "bold" }}>
                  {sensor.temperature?.toFixed(1) || 'N/A'}°C
                </span>
              </div>
              
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between",
                marginBottom: 8
              }}>
                <span style={{ color: "#B0B0B0" }}>Humidity 💧</span>
                <span style={{ color: "#fff", fontWeight: "bold" }}>
                  {sensor.humidity?.toFixed(1) || 'N/A'}%
                </span>
              </div>
              
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between",
                marginBottom: 8
              }}>
                <span style={{ color: "#B0B0B0" }}>Risk Score</span>
                <span style={{ 
                  color: riskInfo.color, 
                  fontWeight: "bold" 
                }}>
                  {sensor.riskScore?.toFixed(1) || 'N/A'}/100
                </span>
              </div>
              
              {sensor.nearestFireDistance && sensor.nearestFireDistance > 0 && (
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between",
                  marginBottom: 8
                }}>
                  <span style={{ color: "#B0B0B0" }}>Nearest Fire</span>
                  <span style={{ color: "#fff", fontWeight: "bold" }}>
                    {sensor.nearestFireDistance.toFixed(1)} km
                  </span>
                </div>
              )}
              
              {sensor.timestamp && (
                <div style={{ 
                  fontSize: 11, 
                  color: "#666", 
                  marginTop: 10,
                  borderTop: "1px solid #333",
                  paddingTop: 10
                }}>
                  Updated: {new Date(sensor.timestamp).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
