import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import MapArea from "./components/MapArea";
import DataPanel from "./components/DataPanel";
import AlertsPage from "./components/AlertsPage";
import ReportsPage from "./components/ReportsPage";
import EvacuationPage from "./components/EvacuationPage";
import { getSensors, getRiskMapData, getNasaFires } from "./services/api";
import "./App.css";

function App() {
  const [sensors, setSensors] = useState([]);
  const [riskMapData, setRiskMapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [activePage, setActivePage] = useState("predictions");

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

  // NASA FIRMS hotspots — refresh less often than sensors (FIRMS is near-real-time, not per-second)
  useEffect(() => {
    const loadFirms = async () => {
      const { fires } = await getNasaFires();
      setNasaFires(fires);
    };
    loadFirms();
    const firmsInterval = setInterval(loadFirms, 180000); // 3 minutes
    return () => clearInterval(firmsInterval);
  }, []);

  const renderPage = () => {
    if (activePage === "alerts") {
      return (
        <div style={{ gridColumn: "2 / 4", gridRow: "2", overflowY: "auto" }}>
          <AlertsPage sensors={sensors} loading={loading} />
        </div>
      );
    }
    if (activePage === "reports") {
      return (
        <div style={{ gridColumn: "2 / 4", gridRow: "2", overflowY: "auto" }}>
          <ReportsPage sensors={sensors} loading={loading} />
        </div>
      );
    }
    if (activePage === "evacuation") {
      return (
        <div style={{ gridColumn: "2 / 4", gridRow: "2", overflowY: "auto" }}>
          <EvacuationPage sensors={sensors} loading={loading} />
        </div>
      );
    }
    // Default: predictions (map + panel)
    return (
      <>
        <MapArea
          sensors={sensors}
          riskMapData={riskMapData}
          nasaFires={nasaFires}
          loading={loading}
          isExpanded={isMapExpanded}
          onToggleExpand={() => setIsMapExpanded(!isMapExpanded)}
        />
        <DataPanel sensors={sensors} loading={loading} error={error} />
      </>
    );
  };

  return (
    <div className="dashboard">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <Topbar />
      {renderPage()}
    </div>
  );
}

export default App;
