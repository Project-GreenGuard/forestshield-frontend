import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import MapArea from "./components/MapArea";
import DataPanel from "./components/DataPanel";
import { getSensors, getRiskMapData } from "./services/api";
import "./App.css";

function App() {
  const [sensors, setSensors] = useState([]);
  const [riskMapData, setRiskMapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Fetch sensor data every 10 seconds
  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const data = await getSensors();
        setSensors(data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch sensor data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchSensors();

    // Set up polling interval (10 seconds)
    const sensorInterval = setInterval(fetchSensors, 10000);

    return () => clearInterval(sensorInterval);
  }, []);

  // Fetch risk map data every 30 seconds
  useEffect(() => {
    const fetchRiskMap = async () => {
      try {
        const data = await getRiskMapData();
        setRiskMapData(data);
      } catch (err) {
        console.error("Failed to fetch risk map data:", err);
      }
    };

    // Initial fetch
    fetchRiskMap();

    // Set up polling interval (30 seconds)
    const riskMapInterval = setInterval(fetchRiskMap, 30000);

    return () => clearInterval(riskMapInterval);
  }, []);

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
      <DataPanel sensors={sensors} loading={loading} error={error} />
    </div>
  );
}

export default App;
