import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

// Fix for default marker icons in React Leaflet
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons based on risk score (expects 0-100 scale)
const getRiskIcon = (riskScore) => {
  let color = '#00C853'; // Green - Low risk (0-30)
  if (riskScore > 60) {
    color = '#B22222'; // Red - High risk (61-100)
  } else if (riskScore > 30) {
    color = '#FF7A00'; // Orange - Medium risk (31-60)
  }

  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path fill="${color}" stroke="#fff" stroke-width="2" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 8.5 12.5 28.5 12.5 28.5S25 21 25 12.5C25 5.6 19.4 0 12.5 0z"/>
        <circle cx="12.5" cy="12.5" r="6" fill="#fff"/>
      </svg>
    `)}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
  });
};

// Component to handle map resizing
function MapResizer({ isExpanded }) {
  const map = useMap();

  useEffect(() => {
    // Invalidate size after a short delay to allow transition to complete
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => clearTimeout(timer);
  }, [map, isExpanded]);

  return null;
}

export default function MapArea({ sensors = [], riskMapData = [], loading = false, isExpanded, onToggleExpand }) {
  const containerStyle = isExpanded ? {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    zIndex: 1000,
    background: "#1B2E1B",
    padding: 0
  } : {
    gridArea: "map",
    position: "relative",
    margin: "20px",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #243B24"
  };

  const [mapCenter, setMapCenter] = useState([43.467, -79.699]); // Default: Ontario, Canada
  const [mapZoom, setMapZoom] = useState(8);

  // Calculate map center from sensor locations
  useEffect(() => {
    if (sensors.length > 0) {
      const validSensors = sensors.filter(s => s.lat && s.lng);
      if (validSensors.length > 0) {
        const avgLat = validSensors.reduce((sum, s) => sum + s.lat, 0) / validSensors.length;
        const avgLng = validSensors.reduce((sum, s) => sum + s.lng, 0) / validSensors.length;
        setMapCenter([avgLat, avgLng]);
        setMapZoom(validSensors.length === 1 ? 10 : 8);
      }
    }
  }, [sensors]);

  if (loading && sensors.length === 0) {
    return (
      <div style={{
        gridArea: "map",
        background: "#242424",
        margin: 20,
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff"
      }}>
        Loading map...
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <button
        onClick={onToggleExpand}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 10000,
          background: "#FF7A00",
          color: "white",
          border: "none",
          padding: "8px 16px",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "bold",
          boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
        }}
      >
        {isExpanded ? "Collapse View" : "Expand Live View"}
      </button>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <MapResizer isExpanded={isExpanded} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Sensor markers */}
        {sensors.map((sensor) => {
          if (!sensor.lat || !sensor.lng) return null;

          // PRIORITIZE ML PREDICTION (riskScore) over stored data (fire_risk)
          // ML model returns 0-1 scale
          const mlRiskScore = sensor.riskScore || 0;
          const storedRisk = sensor.fire_risk || 0;
          
          // Use ML prediction if available (non-zero), otherwise fall back to stored
          const rawRiskScore = mlRiskScore > 0 ? mlRiskScore : storedRisk;
          
          // Convert to 0-100 scale for display
          const displayRiskScore = rawRiskScore * 100;
          
          // Use riskLevel from API if available, otherwise determine from score
          const riskLevel = sensor.riskLevel || 
            (displayRiskScore > 60 ? 'HIGH' : displayRiskScore > 30 ? 'MEDIUM' : 'LOW');

          // Debug log to console (you can check this in browser DevTools)
          console.log(`Sensor ${sensor.deviceId}:`, {
            mlRiskScore,
            storedRisk,
            used: rawRiskScore,
            display: displayRiskScore,
            level: riskLevel
          });

          return (
            <Marker
              key={sensor.deviceId}
              position={[sensor.lat, sensor.lng]}
              icon={getRiskIcon(displayRiskScore)}
            >
              <Popup>
                <div style={{ color: '#000', minWidth: '220px' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                    🔥 Sensor: {sensor.deviceId}
                  </h3>
                  
                  {/* ML Prediction Section (highlighted) */}
                  <div style={{
                    background: '#f5f5f5',
                    padding: '8px',
                    borderRadius: '4px',
                    marginBottom: '10px',
                    border: '1px solid #ddd'
                  }}>
                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#333' }}>
                      🤖 ML PREDICTION:
                    </p>
                    <p style={{ 
                      margin: '5px 0',
                      padding: '8px',
                      borderRadius: '4px',
                      background: riskLevel === 'HIGH' ? '#ffebee' : riskLevel === 'MEDIUM' ? '#fff3e0' : '#e8f5e8',
                      borderLeft: `4px solid ${riskLevel === 'HIGH' ? '#B22222' : riskLevel === 'MEDIUM' ? '#FF7A00' : '#00C853'}`
                    }}>
                      <strong>Risk Level:</strong> {riskLevel}<br/>
                      <strong>Risk Score:</strong> {displayRiskScore.toFixed(1)}/100
                    </p>
                  </div>

                  {/* Sensor Data Section */}
                  <p style={{ margin: '5px 0' }}>
                    <strong>📍 Location:</strong> {sensor.location || 'Unknown'}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>🌡️ Temperature:</strong> {sensor.temperature?.toFixed(1)}°C
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>💧 Humidity:</strong> {sensor.humidity?.toFixed(1)}%
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>💨 Wind Speed:</strong> {sensor.wind_speed?.toFixed(1)} km/h
                  </p>
                  
                  {/* Stored Risk Value (for debugging) */}
                  {storedRisk > 0 && (
                    <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#666' }}>
                      <strong>📊 Stored Risk:</strong> {(storedRisk * 100).toFixed(1)}/100
                    </p>
                  )}
                  
                  {sensor.nearestFireDistance && sensor.nearestFireDistance > 0 && (
                    <p style={{ margin: '5px 0' }}>
                      <strong>🔥 Nearest Fire:</strong> {sensor.nearestFireDistance.toFixed(1)} km
                    </p>
                  )}
                  
                  {sensor.timestamp && (
                    <p style={{ fontSize: '0.8em', color: '#666', marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '8px' }}>
                      ⏱️ Last updated: {new Date(sensor.timestamp).toLocaleString()}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Risk heatmap circles */}
        {riskMapData.slice(0, 50).map((point, index) => {
          if (!point.lat || !point.lng) return null;

          // Use ML prediction for circles too
          const mlRiskScore = point.riskScore || 0;
          const storedRisk = point.fire_risk || 0;
          const rawRiskScore = mlRiskScore > 0 ? mlRiskScore : storedRisk;
          const displayRiskScore = rawRiskScore * 100;
          
          const radius = Math.max(1000, displayRiskScore * 50);
          const opacity = Math.min(0.3, displayRiskScore / 100);

          return (
            <Circle
              key={`risk-${index}`}
              center={[point.lat, point.lng]}
              radius={radius}
              pathOptions={{
                fillColor: displayRiskScore > 60 ? '#B22222' : displayRiskScore > 30 ? '#FF7A00' : '#00C853',
                fillOpacity: opacity,
                color: 'transparent',
              }}
            />
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div style={{
        position: "absolute",
        bottom: 20,
        left: 20,
        background: "rgba(0, 0, 0, 0.85)",
        padding: "15px 20px",
        borderRadius: "8px",
        color: "#fff",
        fontSize: 13,
        zIndex: 1000,
        backdropFilter: "blur(4px)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 4px 6px rgba(0,0,0,0.3)"
      }}>
        <div style={{ marginBottom: 10, fontWeight: 'bold', fontSize: 14, display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: 8 }}>🔥</span> Risk Legend
          <span style={{ marginLeft: 10, fontSize: 11, background: '#333', padding: '2px 6px', borderRadius: 4 }}>
            ML-Powered
          </span>
        </div>
        <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
          <span style={{ color: "#B22222", fontSize: 18, marginRight: 8 }}>●</span> 
          <span>High Risk (61-100)</span>
        </div>
        <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
          <span style={{ color: "#FF7A00", fontSize: 18, marginRight: 8 }}>●</span> 
          <span>Medium Risk (31-60)</span>
        </div>
        <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
          <span style={{ color: "#00C853", fontSize: 18, marginRight: 8 }}>●</span> 
          <span>Low Risk (0-30)</span>
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: '#aaa', borderTop: '1px solid #444', paddingTop: 8 }}>
          Based on real-time ML predictions
        </div>
      </div>
    </div>
  );
}