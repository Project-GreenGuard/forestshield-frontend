export default function Topbar() {
  return (
    <div style={{
      background: "#121212",
      gridArea: "topbar",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 30px"
    }}>
      <h2 style={{ margin: 0 }}>Real-Time Wildfire Dashboard</h2>
      <div style={{
        width: 30,
        height: 30,
        background: "linear-gradient(45deg,#FF7A00,#FFB266)",
        borderRadius: "50%"
      }} />
    </div>
  );
}
