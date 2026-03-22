function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function sensorsToCsv(rows) {
  const headers = [
    "deviceId",
    "riskLevel",
    "riskScore",
    "spreadRateKmh",
    "temperature",
    "humidity",
    "lat",
    "lng",
    "timestamp",
  ];
  const lines = [headers.join(",")];
  for (const s of rows) {
    lines.push(
      headers.map((h) => csvEscape(s[h])).join(",")
    );
  }
  return lines.join("\r\n");
}

export default function ReportsPage({ sensors = [], loading = false }) {
  if (loading && sensors.length === 0) {
    return (
      <div style={{ padding: "32px", background: "#181818", minHeight: "100%" }}>
        <h2 style={{ color: "#fff" }}>Reports</h2>
        <p style={{ color: "#888" }}>Loading...</p>
      </div>
    );
  }

  const total = sensors.length;
  const high   = sensors.filter(s => s.riskLevel === "HIGH").length;
  const medium = sensors.filter(s => s.riskLevel === "MEDIUM").length;
  const low    = sensors.filter(s => s.riskLevel === "LOW").length;

  const avgRisk = total
    ? (sensors.reduce((sum, s) => sum + (s.riskScore || 0), 0) / total).toFixed(1)
    : "N/A";

  const avgSpread = total
    ? (sensors.reduce((sum, s) => sum + (s.spreadRateKmh || 0), 0) / total).toFixed(1)
    : "N/A";

  const highest = sensors.reduce((max, s) =>
    (s.riskScore || 0) > (max?.riskScore || 0) ? s : max, null);

  const statCard = (label, value, color = "#fff", sub = null) => (
    <div style={{
      background: "#1F1F1F",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "12px",
      padding: "20px 24px",
    }}>
      <div style={{ color: "#888", fontSize: "12px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
      <div style={{ color, fontWeight: "700", fontSize: "28px" }}>{value}</div>
      {sub && <div style={{ color: "#666", fontSize: "12px", marginTop: "6px" }}>{sub}</div>}
    </div>
  );

  const downloadCsv = () => {
    const csv = sensorsToCsv(sensors);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `forestshield-sensors-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: "32px", background: "#181818", minHeight: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", marginBottom: 28 }}>
        <div>
          <h2 style={{ color: "#fff", marginBottom: 8, fontSize: "22px" }}>Reports</h2>
          <p style={{ color: "#888", marginBottom: 0, fontSize: "13px" }}>
            Aggregated summary across all active sensors.
          </p>
        </div>
        <button
          type="button"
          onClick={downloadCsv}
          disabled={!sensors.length}
          style={{
            background: sensors.length ? "#2E7D32" : "#333",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "10px 18px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: sensors.length ? "pointer" : "not-allowed",
            opacity: sensors.length ? 1 : 0.5,
          }}
        >
          Export CSV
        </button>
      </div>
      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
        {statCard("Total Sensors",       total,         "#fff")}
        {statCard("Avg Risk Score",      avgRisk,       "#FF7A00", "out of 100")}
        {statCard("Avg Spread Rate",     `${avgSpread} km/h`, "#FFA500")}
        {statCard("Active Alerts",       high + medium, high > 0 ? "#B22222" : "#FF7A00", `${high} HIGH · ${medium} MEDIUM`)}
      </div>

      {/* Risk breakdown */}
      <div style={{
        background: "#1F1F1F",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "20px",
      }}>
        <h3 style={{ color: "#fff", fontSize: "15px", marginBottom: "16px", fontWeight: "600" }}>Risk Level Breakdown</h3>
        {[
          { label: "HIGH",   count: high,   color: "#B22222", pct: total ? Math.round(high / total * 100) : 0 },
          { label: "MEDIUM", count: medium, color: "#FF7A00", pct: total ? Math.round(medium / total * 100) : 0 },
          { label: "LOW",    count: low,    color: "#00C853", pct: total ? Math.round(low / total * 100) : 0 },
        ].map(({ label, count, color, pct }) => (
          <div key={label} style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ color, fontSize: "13px", fontWeight: "600" }}>{label}</span>
              <span style={{ color: "#888", fontSize: "13px" }}>{count} sensor{count !== 1 ? "s" : ""} ({pct}%)</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "4px", height: "6px" }}>
              <div style={{ background: color, width: `${pct}%`, height: "100%", borderRadius: "4px", transition: "width 0.3s" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Highest risk sensor */}
      {highest && (
        <div style={{
          background: "#1F1F1F",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "12px",
          padding: "24px",
        }}>
          <h3 style={{ color: "#fff", fontSize: "15px", marginBottom: "16px", fontWeight: "600" }}>Highest Risk Sensor</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }}>
            {[
              { label: "Device",      value: highest.deviceId,                                  color: "#fff" },
              { label: "Risk Score",  value: `${highest.riskScore?.toFixed(1) ?? "N/A"}/100`,   color: "#B22222" },
              { label: "Spread Rate", value: `${highest.spreadRateKmh?.toFixed(1) ?? "N/A"} km/h`, color: "#FFA500" },
              { label: "Temperature", value: `${highest.temperature?.toFixed(1) ?? "N/A"}°C`,   color: "#FF6B6B" },
              { label: "Humidity",    value: `${highest.humidity?.toFixed(1) ?? "N/A"}%`,       color: "#4ECDC4" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "12px" }}>
                <div style={{ color: "#888", fontSize: "11px", marginBottom: "4px" }}>{label}</div>
                <div style={{ color, fontWeight: "600", fontSize: "14px", wordBreak: "break-all" }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
