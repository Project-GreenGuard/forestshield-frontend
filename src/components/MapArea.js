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

// Custom marker icons based on risk score
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

          const riskScore = sensor.riskScore || 0;

          return (
            <Marker
              key={sensor.deviceId}
              position={[sensor.lat, sensor.lng]}
              icon={getRiskIcon(riskScore)}
            >
              <Popup>
                <div style={{ color: '#000', minWidth: '200px' }}>
                  <h3 style={{ margin: '0 0 10px 0' }}>Sensor: {sensor.deviceId}</h3>
                  <p><strong>Temperature:</strong> {sensor.temperature?.toFixed(1)}°C</p>
                  <p><strong>Humidity:</strong> {sensor.humidity?.toFixed(1)}%</p>
                  <p><strong>Risk Score:</strong> {riskScore.toFixed(1)}/100</p>
                  {sensor.nearestFireDistance && sensor.nearestFireDistance > 0 && (
                    <p><strong>Nearest Fire:</strong> {sensor.nearestFireDistance.toFixed(1)} km</p>
                  )}
                  {sensor.timestamp && (
                    <p style={{ fontSize: '0.8em', color: '#666', marginTop: '10px' }}>
                      Last updated: {new Date(sensor.timestamp).toLocaleString()}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Risk heatmap circles (optional - can be enhanced later) */}
        {riskMapData.slice(0, 50).map((point, index) => {
          if (!point.lat || !point.lng) return null;

          const radius = Math.max(1000, (point.riskScore || 0) * 50); // Scale radius by risk
          const opacity = Math.min(0.3, (point.riskScore || 0) / 100);

          return (
            <Circle
              key={`risk-${index}`}
              center={[point.lat, point.lng]}
              radius={radius}
              pathOptions={{
                fillColor: point.riskScore > 60 ? '#B22222' : point.riskScore > 30 ? '#FF7A00' : '#00C853',
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
        background: "rgba(0, 0, 0, 0.7)",
        padding: "10px 15px",
        borderRadius: 5,
        color: "#fff",
        fontSize: 12,
        zIndex: 1000
      }}>
        <div style={{ marginBottom: 5 }}><span style={{ color: "#B22222" }}>●</span> High Risk (61-100)</div>
        <div style={{ marginBottom: 5 }}><span style={{ color: "#FF7A00" }}>●</span> Medium Risk (31-60)</div>
        <div><span style={{ color: "#00C853" }}>●</span> Low Risk (0-30)</div>
      </div>
    </div>
  );
}
