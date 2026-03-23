export default function EvacuationPage({ sensors = [], loading = false }) {
  const highRisk = sensors.filter(s => s.riskLevel === "HIGH");

  return (
    <div style={{ padding: "32px", background: "#181818", minHeight: "100%" }}>
      <h2 style={{ color: "#fff", marginBottom: 8, fontSize: "22px" }}>Evacuation Routes</h2>
      <p style={{ color: "#888", marginBottom: 28, fontSize: "13px" }}>
        Guidance based on current sensor risk levels. Always follow official emergency directives.
      </p>

      {/* Emergency banner if HIGH risk active */}
      {highRisk.length > 0 && (
        <div style={{
          background: "rgba(178,34,34,0.15)",
          border: "1px solid rgba(178,34,34,0.5)",
          borderRadius: "12px",
          padding: "20px 24px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "flex-start",
          gap: "16px",
        }}>
          <span
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "40px",
              height: "40px",
              background: "rgba(178,34,34,0.35)",
              color: "#fff",
              borderRadius: "8px",
              fontSize: "11px",
              fontWeight: "800",
              letterSpacing: "0.06em",
            }}
            aria-hidden
          >
            ALERT
          </span>
          <div>
            <div style={{ color: "#B22222", fontWeight: "700", fontSize: "16px", marginBottom: "6px" }}>
              HIGH RISK DETECTED — {highRisk.length} sensor{highRisk.length > 1 ? "s" : ""}
            </div>
            <div style={{ color: "#E0E0E0", fontSize: "14px", lineHeight: "1.6" }}>
              Immediate evacuation may be required near: <strong>{highRisk.map(s => s.deviceId).join(", ")}</strong>.
              Contact local emergency services and monitor official alerts.
            </div>
          </div>
        </div>
      )}

      {/* Per-sensor guidance */}
      {loading && sensors.length === 0 ? (
        <p style={{ color: "#888" }}>Loading sensor data...</p>
      ) : sensors.length === 0 ? (
        <p style={{ color: "#888" }}>No sensor data available.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "28px" }}>
          {[...sensors].sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0)).map((sensor) => {
            const isHigh = sensor.riskLevel === "HIGH";
            const isMed  = sensor.riskLevel === "MEDIUM";
            const borderColor = isHigh ? "#B22222" : isMed ? "#FF7A00" : "#00C853";
            const defaultAction = isHigh
              ? "Evacuate immediately. Move perpendicular to estimated fire spread direction."
              : isMed
              ? "Prepare to evacuate. Monitor conditions and keep evacuation kit ready."
              : "No evacuation needed. Continue monitoring.";
            const action = sensor.recommendedAction || defaultAction;

            return (
              <div key={sensor.deviceId} style={{
                background: "#1F1F1F",
                border: `1px solid ${borderColor}`,
                borderRadius: "12px",
                padding: "20px 24px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ color: "#fff", fontWeight: "600", fontSize: "15px" }}>{sensor.deviceId}</span>
                  <span style={{ color: borderColor, fontWeight: "700", fontSize: "13px" }}>{sensor.riskLevel}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                  <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "10px" }}>
                    <div style={{ color: "#888", fontSize: "11px" }}>Location</div>
                    <div style={{ color: "#ccc", fontSize: "13px", fontWeight: "500" }}>
                      {sensor.lat?.toFixed(3) ?? "N/A"}, {sensor.lng?.toFixed(3) ?? "N/A"}
                    </div>
                  </div>
                  <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "10px" }}>
                    <div style={{ color: "#888", fontSize: "11px" }}>Risk Score</div>
                    <div style={{ color: borderColor, fontSize: "13px", fontWeight: "700" }}>
                      {sensor.riskScore?.toFixed(1) ?? "N/A"}/100
                    </div>
                  </div>
                  <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "10px" }}>
                    <div style={{ color: "#888", fontSize: "11px" }}>Est. Spread Rate</div>
                    <div style={{ color: "#FFA500", fontSize: "13px", fontWeight: "700" }}>
                      {sensor.spreadRateKmh?.toFixed(1) ?? "N/A"} km/h
                    </div>
                  </div>
                </div>
                <div style={{
                  background: "rgba(0,0,0,0.2)",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  color: "#E0E0E0",
                  fontSize: "13px",
                  lineHeight: "1.5",
                }}>
                  <strong style={{ color: "#fff" }}>Recommended Action: </strong>{action}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* General guidance */}
      <div style={{
        background: "#1F1F1F",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "12px",
        padding: "24px",
      }}>
        <h3 style={{ color: "#fff", fontSize: "15px", marginBottom: "16px", fontWeight: "600" }}>General Evacuation Guidelines</h3>
        {[
          "Move perpendicular to fire spread direction, not directly away from it.",
          "Use major highways and avoid dead-end roads.",
          "Notify neighbors and assist those who may need help evacuating.",
          "Take essential documents, medications, and emergency kit.",
          "Follow instructions from Ontario Emergency Management and local fire services.",
          "Monitor Emergency Alert Ontario and local radio for real-time updates.",
        ].map((tip, i) => (
          <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "10px", alignItems: "flex-start" }}>
            <span style={{ color: "#FF7A00", fontWeight: "700", minWidth: "20px" }}>{i + 1}.</span>
            <span style={{ color: "#B0B0B0", fontSize: "14px", lineHeight: "1.5" }}>{tip}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
