import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import MapArea from "./components/MapArea";
import DataPanel from "./components/DataPanel";
import EnhancedDataPanel from "./components/EnhancedDataPanel";
import { getSensors, getRiskMapData } from "./services/api";
import "./App.css";

// Mock sensor data for testing PBI-7
const MOCK_SENSORS = [
  {
    deviceId: "SENSOR-001",
    temperature: 32.5,
    humidity: 25.0,
    lat: 43.6532,
    lng: -79.3832,
    riskScore: 45.2,
    nearestFireDistance: 5.0,
    timestamp: new Date().toISOString(),
  },
  {
    deviceId: "SENSOR-002",
    temperature: 28.3,
    humidity: 35.0,
    lat: 43.7,
    lng: -79.4,
    riskScore: 62.8,
    nearestFireDistance: 2.5,
    timestamp: new Date().toISOString(),
  },
  {
    deviceId: "SENSOR-003",
    temperature: 24.1,
    humidity: 55.0,
    lat: 43.55,
    lng: -79.35,
    riskScore: 28.5,
    nearestFireDistance: 15.0,
    timestamp: new Date().toISOString(),
  },
];

function App() {
  const [sensors, setSensors] = useState([]);
  const [riskMapData, setRiskMapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [showEnhanced, setShowEnhanced] = useState(true); // Toggle between views
  const [useMockData, setUseMockData] = useState(true); // Toggle for mock data

  // Fetch sensor data every 10 seconds (or use mock data)
  useEffect(() => {
    const fetchSensors = async () => {
      try {
        if (useMockData) {
          // Use mock data for testing
          setSensors(MOCK_SENSORS);
          setRiskMapData(MOCK_SENSORS);
        } else {
          // Fetch from real API
          const data = await getSensors();
          setSensors(data);
          setRiskMapData(data);
        }
        setError(null);
      } catch (err) {
        setError("Failed to fetch sensor data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSensors();
    const sensorInterval = setInterval(fetchSensors, 10000);
    return () => clearInterval(sensorInterval);
  }, [useMockData]);

  // Fetch risk map data every 30 seconds
  useEffect(() => {
    const fetchRiskMap = async () => {
      try {
        if (!useMockData) {
          const data = await getRiskMapData();
          setRiskMapData(data);
        }
      } catch (err) {
        console.error("Failed to fetch risk map data:", err);
      }
    };

    fetchRiskMap();
    const riskMapInterval = setInterval(fetchRiskMap, 30000);
    return () => clearInterval(riskMapInterval);
  }, [useMockData]);

  return (
    <div className="dashboard">
      <Sidebar />
      <Topbar />
      <MapArea
        sensors={sensors}
        riskMapData={riskMapData}
        loading={loading}
        isExpanded={isMapExpanded}
        onToggleExpand={() => setIsMapExpanded(!isMapExpanded)}
      />
      {showEnhanced ? (
        <EnhancedDataPanel sensors={sensors} loading={loading} />
      ) : (
        <DataPanel sensors={sensors} loading={loading} error={error} />
      )}
      
      {/* Toggle View Button */}
      <button
        onClick={() => setShowEnhanced(!showEnhanced)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          background: "#FF7A00",
          color: "white",
          border: "none",
          padding: "10px 15px",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: "600",
          zIndex: 999,
        }}
      >
        {showEnhanced ? "Basic View" : "Enhanced View"}
      </button>

      {/* Toggle Mock Data Button */}
      <button
        onClick={() => setUseMockData(!useMockData)}
        style={{
          position: "fixed",
          bottom: 70,
          right: 20,
          background: useMockData ? "#00C853" : "#888",
          color: "white",
          border: "none",
          padding: "8px 12px",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "11px",
          fontWeight: "600",
          zIndex: 998,
        }}
      >
        {useMockData ? "✓ Mock Data" : "Live Data"}
      </button>
    </div>
  );
}

export default App;