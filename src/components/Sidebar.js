import { useState } from 'react';

export default function Sidebar({ activePage = 'dashboard', onPageChange }) {
  const [active, setActive] = useState(activePage);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'predictions', label: 'Predictions', icon: '🔮' },
    { id: 'alerts', label: 'Alerts', icon: '🚨' },
    { id: 'evacuation', label: 'Evacuation Routes', icon: '🚗' },
    { id: 'reports', label: 'Reports', icon: '📋' },
  ];

  const handleClick = (itemId) => {
    setActive(itemId);
    if (onPageChange) {
      onPageChange(itemId);
    }
  };

  return (
    <div style={{
      background: "#243B24",
      padding: "30px 20px",
      gridArea: "sidebar",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      boxShadow: "2px 0 10px rgba(0,0,0,0.3)"
    }}>
      {/* Logo and Title */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        marginBottom: 30,
        paddingBottom: 20,
        borderBottom: "1px solid #3B5A3B"
      }}>
        <img
          src="/logo.png"
          alt="GreenGuard Logo"
          style={{
            width: 45,
            height: 45,
            borderRadius: "50%",
            marginRight: 12,
            objectFit: "cover"
          }}
        />
        <div>
          <h3 style={{ color: "#FF7A00", margin: 0, fontSize: "18px" }}>GreenGuard</h3>
          <p style={{ color: "#8FBC8F", margin: "4px 0 0 0", fontSize: "11px" }}>ML-Powered</p>
        </div>
      </div>

      {/* Menu Items */}
      <div style={{ flex: 1 }}>
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleClick(item.id)}
            style={{
              padding: "12px 16px",
              margin: "6px 0",
              borderRadius: "10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              backgroundColor: active === item.id ? "#FF7A00" : "transparent",
              color: active === item.id ? "#fff" : "#B0B0B0",
              transition: "all 0.3s ease",
              fontWeight: active === item.id ? "600" : "400",
              boxShadow: active === item.id ? "0 4px 12px rgba(255,122,0,0.4)" : "none",
              transform: active === item.id ? "translateX(5px)" : "none"
            }}
            onMouseEnter={(e) => {
              if (active !== item.id) {
                e.currentTarget.style.backgroundColor = "#2F4F2F";
                e.currentTarget.style.color = "#fff";
              }
            }}
            onMouseLeave={(e) => {
              if (active !== item.id) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#B0B0B0";
              }
            }}
          >
            <span style={{ fontSize: "20px" }}>{item.icon}</span>
            <span style={{ fontSize: "14px", letterSpacing: "0.3px" }}>{item.label}</span>
            {active === item.id && (
              <span style={{ marginLeft: "auto", fontSize: "12px", color: "#fff" }}>●</span>
            )}
          </div>
        ))}
      </div>

      {/* ML Status Indicator */}
      <div style={{
        padding: "16px",
        background: "#1B2E1B",
        borderRadius: "10px",
        marginBottom: "16px",
        border: "1px solid #3B5A3B"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <span style={{ color: "#4CAF50", fontSize: "10px" }}>●</span>
          <span style={{ color: "#8FBC8F", fontSize: "12px" }}>ML Model Active</span>
        </div>
        <div style={{ color: "#B0B0B0", fontSize: "11px" }}>
          Real-time risk analysis
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: "16px 12px",
        borderTop: "1px solid #3B5A3B",
        color: "#6B8E6B",
        fontSize: "11px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <span style={{ fontSize: "14px" }}>🌲</span>
          <span>ForestShield v1.0</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>© 2026</span>
          <span>🔥 {Math.floor(Math.random() * 10) + 1} active</span>
        </div>
      </div>
    </div>
  );
}