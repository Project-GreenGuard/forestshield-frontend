export default function AlertsPage({ sensors = [], loading = false }) {
  const riskColor = (level) => {
    if (level === "HIGH")   return { bg: "rgba(178,34,34,0.1)",  border: "rgba(178,34,34,0.3)",  text: "#B22222" };
    if (level === "MEDIUM") return { bg: "rgba(255,122,0,0.1)",  border: "rgba(255,122,0,0.3)",  text: "#FF7A00" };
    return                         { bg: "rgba(0,200,83,0.08)",  border: "rgba(0,200,83,0.2)",   text: "#00C853" };
  };

  const sorted = [...sensors].sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));
  const activeAlerts = sorted.filter(s => s.riskLevel === "HIGH" || s.riskLevel === "MEDIUM");

  return (
    <div style={{ padding: "32px", background: "#181818", minHeight: "100%" }}>
      <h2 style={{ color: "#fff", marginBottom: 8, fontSize: "22px" }}>Alerts</h2>
      <p style={{ color: "#888", marginBottom: 28, fontSize: "13px" }}>
        Sensors reporting elevated wildfire risk. Updated every 10 seconds.
      </p>

      {loading && sensors.length === 0 && (
        <p style={{ color: "#888" }}>Loading sensor data...</p>
      )}

      {!loading && activeAlerts.length === 0 && (
        <div style={{
          background: "rgba(0,200,83,0.08)",
          border: "1px solid rgba(0,200,83,0.2)",
          borderRadius: "12px",
          padding: "24px",
          color: "#00C853",
          fontSize: "15px",
        }}>
          No active alerts — all sensors reporting LOW risk.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {activeAlerts.map((sensor) => {
          const c = riskColor(sensor.riskLevel);
          return (
            <div key={sensor.deviceId} style={{
              background: c.bg,
              border: `1px solid ${c.border}`,
              borderRadius: "12px",
              padding: "20px 24px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ color: "#fff", fontWeight: "600", fontSize: "15px" }}>{sensor.deviceId}</span>
                <span style={{
                  background: c.text,
                  color: "#fff",
                  padding: "4px 12px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: "700",
                  letterSpacing: "0.5px",
                }}>
                  {sensor.riskLevel}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                {[
                  { label: "Risk Score",   value: `${sensor.riskScore?.toFixed(1) ?? "N/A"}/100`,  color: c.text },
                  { label: "Temperature",  value: `${sensor.temperature?.toFixed(1) ?? "N/A"}°C`,  color: "#FF6B6B" },
                  { label: "Humidity",     value: `${sensor.humidity?.toFixed(1) ?? "N/A"}%`,      color: "#4ECDC4" },
                  { label: "Spread Rate",  value: `${sensor.spreadRateKmh?.toFixed(1) ?? "N/A"} km/h`, color: "#FFA500" },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "12px" }}>
                    <div style={{ color: "#888", fontSize: "11px", marginBottom: "4px" }}>{label}</div>
                    <div style={{ color, fontWeight: "700", fontSize: "16px" }}>{value}</div>
                  </div>
                ))}
              </div>
              {sensor.timestamp && (
                <div style={{ color: "#666", fontSize: "11px", marginTop: "12px" }}>
                  Last updated: {new Date(sensor.timestamp).toLocaleString()}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sorted.filter(s => s.riskLevel === "LOW").length > 0 && (
        <>
          <h3 style={{ color: "#888", fontSize: "14px", marginTop: "28px", marginBottom: "12px", fontWeight: "500" }}>
            LOW RISK SENSORS
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {sorted.filter(s => s.riskLevel === "LOW").map((sensor) => {
              const c = riskColor(sensor.riskLevel);
              return (
                <div key={sensor.deviceId} style={{
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                  borderRadius: "10px",
                  padding: "14px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <span style={{ color: "#ccc", fontSize: "14px" }}>{sensor.deviceId}</span>
                  <span style={{ color: c.text, fontWeight: "600" }}>
                    {sensor.riskScore?.toFixed(1) ?? "N/A"}/100
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
