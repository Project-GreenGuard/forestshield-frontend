export default function DataPanel() {
  const cards = [
    { title: "Temperature 🌡️" },
    { title: "Humidity 💧" },
    { title: "Wind Speed 🌬️" },
    { title: "Air Quality 🌫️" }
  ];

  return (
    <div style={{
      gridArea: "panel",
      background: "#181818",
      padding: 20
    }}>
      <h3>Live Data</h3>
      {cards.map((c, i) => (
        <div key={i}
          style={{
            background: "#2A2A2A",
            padding: "20px 10px",
            marginTop: 10,
            borderRadius: 10,
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
          }}>
          {c.title}
        </div>
      ))}
    </div>
  );
}
