export default function MapArea() {
  const markers = [
  // Active Fires
  { x: 100, y: 120, color: "#B22222" },
  { x: 250, y: 180, color: "#B22222" },
  { x: 380, y: 220, color: "#B22222" },
  // Predicted Zones
  { x: 150, y: 300, color: "#FF7A00" },
  { x: 320, y: 350, color: "#FF7A00" },
  // Safe Routes
  { x: 180, y: 420, color: "#00C853" },
  { x: 420, y: 280, color: "#00C853" },
];


  return (
    <div style={{
      gridArea: "map",
      background: "#242424",
      position: "relative",
      margin: 20,
      borderRadius: 10
    }}>
      {markers.map((m, i) => (
        <div key={i}
          style={{
            position: "absolute",
            top: m.y,
            left: m.x,
            width: 15,
            height: 15,
            borderRadius: "50%",
            background: m.color
          }} />
      ))}
      <p style={{
        position: "absolute",
        bottom: 10,
        left: 10,
        fontSize: 14
      }}>
        🔴 Active Fire 🟠 Predicted Zone 🟩 Safe Route
      </p>
    </div>
  );
}
