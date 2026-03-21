export default function Sidebar({ activePage, onNavigate }) {
  const navItems = [
    { id: "predictions", label: "Predictions" },
    { id: "alerts", label: "Alerts" },
    { id: "evacuation", label: "Evacuation Routes" },
    { id: "reports", label: "Reports" },
  ];

  return (
    <div
      style={{
        background: "#243B24",
        padding: "30px 20px",
        gridArea: "sidebar",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
        <img
          src="/GreenGuard.jpg"
          alt="GreenGuard Logo"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            marginRight: 10,
            objectFit: "cover",
          }}
        />
        <h3 style={{ color: "#FF7A00", margin: 0 }}>Dashboard</h3>
      </div>

      {navItems.map(({ id, label }) => {
        const isActive = activePage === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
            style={{
              background: isActive ? "rgba(255,122,0,0.15)" : "transparent",
              border: isActive
                ? "1px solid rgba(255,122,0,0.4)"
                : "1px solid transparent",
              borderRadius: "8px",
              color: isActive ? "#FF7A00" : "#B0B0B0",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: isActive ? "600" : "400",
              padding: "10px 14px",
              marginBottom: "6px",
              textAlign: "left",
              width: "100%",
              transition: "all 0.15s ease",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
