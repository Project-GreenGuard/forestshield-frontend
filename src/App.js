import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import MapArea from "./components/MapArea";
import { getSensors, getRiskMapData } from "./services/api";
import "./App.css";

// Mock sensor data - 10 Ontario cities
const MOCK_SENSORS = [
  { id: 'sensor_001', deviceId: 'SENSOR-001', name: 'Toronto Downtown', lat: 43.6629, lng: -79.3957, temperature: 28.5, humidity: 45.0, wind_speed: 15.0, fire_distance_km: 2.3, fuel_type: 'forest', elevation: 76, vegetation_type: 'mixed', soil_moisture: 0.4, riskScore: 72.5, timestamp: new Date().toISOString(), nearestFireDistance: 2.3, threat_level: 'HIGH', evacuation_recommended: true },
  { id: 'sensor_002', deviceId: 'SENSOR-002', name: 'Ottawa Parliament Hill', lat: 45.4215, lng: -75.6972, temperature: 25.2, humidity: 55.0, wind_speed: 12.0, fire_distance_km: 15.0, fuel_type: 'grassland', elevation: 85, vegetation_type: 'grassland', soil_moisture: 0.6, riskScore: 38.0, timestamp: new Date().toISOString(), nearestFireDistance: 15.0, threat_level: 'LOW', evacuation_recommended: false },
  { id: 'sensor_003', deviceId: 'SENSOR-003', name: 'Hamilton Downtown', lat: 43.2557, lng: -79.8711, temperature: 24.1, humidity: 55.0, wind_speed: 8.0, fire_distance_km: 25.0, fuel_type: 'forest', elevation: 90, vegetation_type: 'mixed', soil_moisture: 0.7, riskScore: 28.0, timestamp: new Date().toISOString(), nearestFireDistance: 25.0, threat_level: 'LOW', evacuation_recommended: false },
  { id: 'sensor_004', deviceId: 'SENSOR-004', name: 'London Downtown', lat: 42.9849, lng: -81.2453, temperature: 26.3, humidity: 48.0, wind_speed: 14.0, fire_distance_km: 12.0, fuel_type: 'grassland', elevation: 78, vegetation_type: 'grassland', soil_moisture: 0.5, riskScore: 52.0, timestamp: new Date().toISOString(), nearestFireDistance: 12.0, threat_level: 'MEDIUM', evacuation_recommended: true },
  { id: 'sensor_005', deviceId: 'SENSOR-005', name: 'Windsor Downtown', lat: 42.3126, lng: -83.0252, temperature: 27.8, humidity: 50.0, wind_speed: 18.0, fire_distance_km: 8.0, fuel_type: 'forest', elevation: 62, vegetation_type: 'mixed', soil_moisture: 0.3, riskScore: 65.0, timestamp: new Date().toISOString(), nearestFireDistance: 8.0, threat_level: 'HIGH', evacuation_recommended: true },
  { id: 'sensor_006', deviceId: 'SENSOR-006', name: 'Kitchener Downtown', lat: 43.4516, lng: -80.4925, temperature: 23.5, humidity: 52.0, wind_speed: 11.0, fire_distance_km: 18.0, fuel_type: 'forest', elevation: 91, vegetation_type: 'mixed', soil_moisture: 0.6, riskScore: 35.0, timestamp: new Date().toISOString(), nearestFireDistance: 18.0, threat_level: 'LOW', evacuation_recommended: false },
  { id: 'sensor_007', deviceId: 'SENSOR-007', name: 'Niagara Falls Downtown', lat: 43.0896, lng: -79.0849, temperature: 22.0, humidity: 60.0, wind_speed: 16.0, fire_distance_km: 20.0, fuel_type: 'grassland', elevation: 100, vegetation_type: 'grassland', soil_moisture: 0.8, riskScore: 25.0, timestamp: new Date().toISOString(), nearestFireDistance: 20.0, threat_level: 'LOW', evacuation_recommended: false },
  { id: 'sensor_008', deviceId: 'SENSOR-008', name: 'Sudbury Downtown', lat: 46.4917, lng: -80.9930, temperature: 20.5, humidity: 58.0, wind_speed: 13.0, fire_distance_km: 30.0, fuel_type: 'forest', elevation: 261, vegetation_type: 'forest', soil_moisture: 0.7, riskScore: 42.0, timestamp: new Date().toISOString(), nearestFireDistance: 30.0, threat_level: 'MEDIUM', evacuation_recommended: false },
  { id: 'sensor_009', deviceId: 'SENSOR-009', name: 'Timmins Downtown', lat: 48.4758, lng: -81.3304, temperature: 19.2, humidity: 62.0, wind_speed: 10.0, fire_distance_km: 35.0, fuel_type: 'forest', elevation: 296, vegetation_type: 'forest', soil_moisture: 0.8, riskScore: 32.0, timestamp: new Date().toISOString(), nearestFireDistance: 35.0, threat_level: 'LOW', evacuation_recommended: false },
  { id: 'sensor_010', deviceId: 'SENSOR-010', name: 'Thunder Bay Downtown', lat: 48.3809, lng: -89.2477, temperature: 18.0, humidity: 65.0, wind_speed: 14.0, fire_distance_km: 40.0, fuel_type: 'forest', elevation: 194, vegetation_type: 'forest', soil_moisture: 0.9, riskScore: 28.0, timestamp: new Date().toISOString(), nearestFireDistance: 40.0, threat_level: 'LOW', evacuation_recommended: false },
];

// Mock fire data
const MOCK_FIRE_DATA = {
  lat: 43.65,
  lng: -79.38,
  intensity: 72,
  wind_speed: 18,
  wind_direction: 45,
  temperature: 32,
  humidity: 20,
  slope: 15,
  fuel_type: "forest",
  estimated_speed: 8.5,
  direction: 45,
  affected_radius: 12.3,
  danger_level: "HIGH",
  model_confidence: 0.85,
  spread_path: [
    { hours_from_now: 0, distance_km: 0, intensity: 72, lat: 43.65, lng: -79.38 },
    { hours_from_now: 2, distance_km: 17, intensity: 70, lat: 43.653, lng: -79.373 },
    { hours_from_now: 4, distance_km: 34, intensity: 68, lat: 43.656, lng: -79.368 },
    { hours_from_now: 6, distance_km: 51, intensity: 65, lat: 43.659, lng: -79.363 },
    { hours_from_now: 8, distance_km: 68, intensity: 62, lat: 43.662, lng: -79.358 },
    { hours_from_now: 24, distance_km: 204, intensity: 45, lat: 43.677, lng: -79.323 },
  ],
};

function App() {
  const [sensors, setSensors] = useState([]);
  const [riskMapData, setRiskMapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [useMockData, setUseMockData] = useState(true);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [fireSpreadData, setFireSpreadData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (useMockData) {
          setSensors(MOCK_SENSORS);
          setRiskMapData(MOCK_SENSORS);
        } else {
          const data = await getSensors();
          setSensors(data || []);
          setRiskMapData(data || []);
        }
      } catch (err) {
        console.error(err);
        if (!useMockData) setSensors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [useMockData]);

  useEffect(() => {
    if (!useMockData) {
      const fetchRiskMap = async () => {
        try {
          const data = await getRiskMapData();
          setRiskMapData(data || []);
        } catch (err) {
          console.error("Failed to fetch risk map:", err);
        }
      };
      
      fetchRiskMap();
      const interval = setInterval(fetchRiskMap, 30000);
      return () => clearInterval(interval);
    }
  }, [useMockData]);

  const errorStyle = { gridArea: "map", margin: "20px", padding: "40px", background: "#1B2E1B", borderRadius: "12px", border: "1px solid #FF7A00", color: "#fff", textAlign: "center", fontSize: "18px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px" };

  return (
    <div className="dashboard">
      <Sidebar fireData={MOCK_FIRE_DATA} sensors={sensors} useMockData={useMockData} setUseMockData={setUseMockData} selectedSensor={selectedSensor} fireSpreadData={fireSpreadData} />
      <Topbar />
      
      {!useMockData && sensors.length === 0 && !loading && (
        <div style={errorStyle}>
          <p style={{ fontSize: "24px", marginBottom: "10px" }}>📡 Live Data Mode</p>
          <p style={{ marginBottom: "20px" }}>No sensors connected</p>
          <p style={{ fontSize: "14px", color: "#aaa" }}>Start your backend:</p>
          <p style={{ fontSize: "12px", color: "#FF7A00", fontFamily: "monospace", marginTop: "10px" }}>http://localhost:5001</p>
        </div>
      )}
      
      {!useMockData && loading && (
        <div style={{...errorStyle, fontSize: "16px"}}>⏳ Loading live data...</div>
      )}
      
      {sensors.length > 0 && (
        <MapArea sensors={sensors} riskMapData={riskMapData} loading={loading} isExpanded={isMapExpanded} onToggleExpand={() => setIsMapExpanded(!isMapExpanded)} onSensorSelect={setSelectedSensor} onFireSpreadUpdate={setFireSpreadData} />
      )}
    </div>
  );
}

export default App;