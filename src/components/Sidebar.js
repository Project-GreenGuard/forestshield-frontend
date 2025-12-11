export default function Sidebar() {
  return (
    <div style={{
      background: "#243B24",
      padding: "30px 20px",
      gridArea: "sidebar"
    }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
        <img
          src="/logo.png"
          alt="GreenGuard Logo"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            marginRight: 10,
            objectFit: "cover"
          }}
        />
        <h3 style={{ color: "#FF7A00", margin: 0 }}>Dashboard</h3>
      </div>
      <p style={{ color: "#B0B0B0" }}>Predictions</p>
      <p style={{ color: "#B0B0B0" }}>Alerts</p>
      <p style={{ color: "#B0B0B0" }}>Evacuation Routes</p>
      <p style={{ color: "#B0B0B0" }}>Reports</p>
    </div>
  );
}
