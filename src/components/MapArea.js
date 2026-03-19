import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { getSensorMLRisk } from '../services/api';
import FireSpreadPanel from './FireSpreadPanel';
import FireSpreadOverlay from './FireSpreadOverlay';

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const getRiskIcon = (riskScore) => {
  const color = riskScore > 60 ? '#B22222' : riskScore > 30 ? '#FF7A00' : '#00C853';
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`<svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg"><path fill="${color}" stroke="#fff" stroke-width="2" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 8.5 12.5 28.5 12.5 28.5S25 21 25 12.5C25 5.6 19.4 0 12.5 0z"/><circle cx="12.5" cy="12.5" r="6" fill="#fff"/></svg>`)}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
  });
};

function MapResizer({ isExpanded }) {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [map, isExpanded]);
  return null;
}

export default function MapArea({ 
  sensors = [], 
  onSensorSelect = () => {}, 
  loading = false, 
  isExpanded = false, 
  onToggleExpand = () => {},
  onFireSpreadUpdate = () => {}
}) {
  const [mlRiskData, setMlRiskData] = useState({});
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [fireSpreadPanel, setFireSpreadPanel] = useState(false);
  const [fireData, setFireData] = useState(null);
  const [showFireOverlay, setShowFireOverlay] = useState(false);
  const [mapCenter, setMapCenter] = useState([43.467, -79.699]);
  const [mapZoom, setMapZoom] = useState(8);

  useEffect(() => {
    if (sensors.length > 0) {
      const validSensors = sensors.filter(s => s.lat && s.lng);
      if (validSensors.length > 0) {
        setMapCenter([
          validSensors.reduce((sum, s) => sum + s.lat, 0) / validSensors.length,
          validSensors.reduce((sum, s) => sum + s.lng, 0) / validSensors.length
        ]);
        setMapZoom(validSensors.length === 1 ? 10 : 8);
      }
    }
  }, [sensors]);

  const handleSensorClick = async (sensor) => {
    setSelectedSensor(sensor);
    onSensorSelect(sensor);
    try {
      const mlRisk = await getSensorMLRisk(sensor.id || sensor.deviceId);
      if (mlRisk) setMlRiskData(prev => ({ ...prev, [sensor.id || sensor.deviceId]: mlRisk }));
    } catch (error) {
      console.error('Error fetching ML risk:', error);
    }
  };

  const handleFireSpreadClick = (sensor) => {
    setSelectedSensor(sensor);
    setFireSpreadPanel(true);
    setShowFireOverlay(false);
    setFireData(null);
  };

  if (loading && sensors.length === 0) {
    return <div style={{ gridArea: "map", background: "#242424", margin: 20, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>Loading map...</div>;
  }

  const containerStyle = isExpanded ? { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 1000, padding: 0 } : { gridArea: "map", position: "relative", margin: "20px", borderRadius: "12px", overflow: "hidden", border: "1px solid #243B24" };

  return (
    <div style={containerStyle}>
      <button onClick={onToggleExpand} style={{ position: "absolute", top: 20, right: fireSpreadPanel ? 420 : 20, zIndex: 10000, background: "#FF7A00", color: "white", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", transition: "right 0.3s" }}>
        {isExpanded ? "Collapse View" : "Expand Live View"}
      </button>

      {fireSpreadPanel && selectedSensor && (
        <FireSpreadPanel
          sensorId={selectedSensor.deviceId || selectedSensor.id}
          sensor={selectedSensor}
          sensors={sensors}
          ignitionPoint={{ lat: selectedSensor.lat || 43.65, lng: selectedSensor.lng || -79.38 }}
          onFireSpreadUpdate={(data) => { 
            setFireData(data);
            onFireSpreadUpdate(data);
            setShowFireOverlay(true);
          }}
          onClose={() => setFireSpreadPanel(false)}
        />
      )}

      <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
        <MapResizer isExpanded={isExpanded} />
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {showFireOverlay && fireData && selectedSensor && (
          <FireSpreadOverlay
            fireData={fireData}
            ignitionPoint={{ lat: selectedSensor.lat, lng: selectedSensor.lng }}
            visible={true}
          />
        )}

        {sensors.map((sensor) => {
          if (!sensor.lat || !sensor.lng) return null;
          const sensorId = sensor.id || sensor.deviceId;
          const mlRisk = mlRiskData[sensorId];
          const displayRisk = mlRisk ? mlRisk.risk_score : (sensor.riskScore || 0);
          const isSelected = selectedSensor?.id === sensor.id || selectedSensor?.deviceId === sensor.deviceId;

          return (
            <Marker key={sensorId} position={[sensor.lat, sensor.lng]} icon={getRiskIcon(displayRisk)} opacity={isSelected ? 1 : 0.7} eventHandlers={{ click: () => handleSensorClick(sensor) }}>
              <Popup>
                <div style={{ color: '#000', minWidth: '280px' }}>
                  <h3 style={{ margin: '0 0 10px 0' }}>📍 {sensor.name || sensor.deviceId}</h3>
                  <p><strong>🌡️ Temp:</strong> {sensor.temperature?.toFixed(1)}°C</p>
                  <p><strong>💧 Humidity:</strong> {sensor.humidity?.toFixed(1)}%</p>
                  <p><strong>🌪️ Wind:</strong> {sensor.wind_speed?.toFixed(1)} km/h</p>
                  {mlRisk ? (
                    <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '6px', margin: '10px 0', borderLeft: '4px solid #FF7A00' }}>
                      <p style={{ margin: '5px 0', fontWeight: 'bold' }}>📊 ML Risk: <span style={{ fontSize: '18px', marginLeft: '5px', color: mlRisk.risk_score >= 61 ? '#B22222' : mlRisk.risk_score >= 31 ? '#FF7A00' : '#00C853' }}>{mlRisk.risk_score.toFixed(1)}</span>/100</p>
                      <p style={{ margin: '5px 0', fontSize: '12px' }}><strong>Level:</strong> {mlRisk.risk_level}</p>
                      <p style={{ margin: '5px 0', fontSize: '12px' }}><strong>Confidence:</strong> {(mlRisk.confidence * 100).toFixed(0)}%</p>
                    </div>
                  ) : <div style={{ background: '#f0f0f0', padding: '8px', borderRadius: '4px', margin: '10px 0', fontSize: '12px', color: '#666' }}>⏳ Loading ML prediction...</div>}
                  {sensor.nearestFireDistance && sensor.nearestFireDistance > 0 && <p><strong>🔥 Fire:</strong> {sensor.nearestFireDistance.toFixed(1)} km</p>}
                  <button onClick={() => handleFireSpreadClick(sensor)} style={{ width: '100%', marginTop: '10px', padding: '8px', background: '#FF7A00', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }} onMouseOver={(e) => e.target.style.background = '#E66A00'} onMouseOut={(e) => e.target.style.background = '#FF7A00'}>🔥 Show Fire Spread</button>
                  {sensor.timestamp && <p style={{ fontSize: '0.8em', color: '#666', marginTop: '10px', borderTop: '1px solid #ddd', paddingTop: '8px' }}>Updated: {new Date(sensor.timestamp).toLocaleString()}</p>}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {sensors.map((sensor, i) => {
          if (!sensor.lat || !sensor.lng) return null;
          const riskScore = mlRiskData[sensor.id || sensor.deviceId]?.risk_score || (sensor.riskScore || 0);
          return <Circle key={`risk-${i}`} center={[sensor.lat, sensor.lng]} radius={Math.max(1000, riskScore * 50)} pathOptions={{ fillColor: riskScore > 60 ? '#B22222' : riskScore > 30 ? '#FF7A00' : '#00C853', fillOpacity: Math.min(0.3, riskScore / 100), color: 'transparent' }} />;
        })}
      </MapContainer>

      <div style={{ position: "absolute", bottom: 20, left: 20, background: "rgba(0, 0, 0, 0.7)", padding: "10px 15px", borderRadius: 5, color: "#fff", fontSize: 12, zIndex: 1000 }}>
        <div style={{ marginBottom: 8, fontWeight: 'bold' }}>📊 Risk Levels</div>
        <div>🔴 High (61-100) | 🟠 Medium (31-60) | 🟢 Low (0-30)</div>
      </div>

      {selectedSensor && mlRiskData[selectedSensor.id || selectedSensor.deviceId] && !fireSpreadPanel && (
        <div style={{ position: "absolute", top: 80, right: 20, background: "rgba(255, 122, 0, 0.95)", padding: "12px 15px", borderRadius: 6, color: "#fff", fontSize: 13, zIndex: 1000, fontWeight: 'bold' }}>
          ✓ {selectedSensor.name || selectedSensor.deviceId}<br/>Risk: {mlRiskData[selectedSensor.id || selectedSensor.deviceId].risk_score.toFixed(1)}/100
        </div>
      )}
    </div>
  );
}