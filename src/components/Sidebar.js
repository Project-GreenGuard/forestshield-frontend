export default function Sidebar() {
  return (
    <div style={{
      background: "#151515",
      padding: "30px 20px",
      gridArea: "sidebar"
    }}>
      <h3 style={{ color: "#FF7A00" }}>Dashboard</h3>
      <p style={{ color: "#B0B0B0" }}>Predictions</p>
      <p style={{ color: "#B0B0B0" }}>Alerts</p>
      <p style={{ color: "#B0B0B0" }}>Evacuation Routes</p>
      <p style={{ color: "#B0B0B0" }}>Reports</p>
    </div>
  );
}
