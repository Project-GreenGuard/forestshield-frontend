import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker, useMap } from 'react-leaflet';
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

// Invalidate size on expand/collapse and when basemap changes
function MapResizer({ isExpanded, mapType }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => clearTimeout(timer);
  }, [map, isExpanded, mapType]);

  return null;
}

const MAP_TYPES = {
  road: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  terrain: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  },
};

const NASA_MAX_MARKERS = 400;

export default function MapArea({ sensors = [], riskMapData = [], nasaFires = [], loading = false, isExpanded, onToggleExpand }) {
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
  const [mapType, setMapType] = useState("road");
  const [showNasaFirms, setShowNasaFirms] = useState(true);

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
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 10000,
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <label htmlFor="map-basemap" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          Map style
        </label>
        <select
          id="map-basemap"
          value={mapType}
          onChange={(e) => setMapType(e.target.value)}
          aria-label="Map basemap"
          style={{
            background: "#fff",
            color: "#333",
            border: "none",
            padding: "8px 12px",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          <option value="road">Road</option>
          <option value="terrain">Terrain</option>
        </select>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.95)",
            color: "#333",
            padding: "8px 12px",
            borderRadius: 4,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <input
            type="checkbox"
            checked={showNasaFirms}
            onChange={(e) => setShowNasaFirms(e.target.checked)}
            aria-label="Show NASA FIRMS hotspots"
          />
          NASA FIRMS
        </label>
        <button
          type="button"
          onClick={onToggleExpand}
          style={{
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
      </div>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <MapResizer isExpanded={isExpanded} mapType={mapType} />
        <TileLayer
          key={mapType}
          attribution={MAP_TYPES[mapType].attribution}
          url={MAP_TYPES[mapType].url}
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
                  {sensor.spreadRateKmh != null && (
                    <p><strong>Est. Spread Rate:</strong> {sensor.spreadRateKmh.toFixed(1)} km/h</p>
                  )}
                  {sensor.recommendedAction && (
                    <div style={{ marginTop: "8px", color: "#b22222", fontWeight: "600" }}>
                      Action: {sensor.recommendedAction}
                    </div>
                  )}
                  {sensor.explanation && (
                    <div style={{ fontSize: "12px", color: "#444", marginTop: "4px" }}>
                      {sensor.explanation}
                    </div>
                  )}
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

        {/* NASA VIIRS hotspots (near real-time thermal anomalies — not ground-truthed fire perimeters) */}
        {showNasaFirms &&
          nasaFires.slice(0, NASA_MAX_MARKERS).map((fire, index) => {
            const lat = Number(fire.latitude);
            const lng = Number(fire.longitude);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
            const frp = fire.frp != null ? Number(fire.frp) : 0;
            const r = Math.min(14, Math.max(4, 4 + Math.log1p(frp)));
            return (
              <CircleMarker
                key={`nasa-${index}-${lat}-${lng}`}
                center={[lat, lng]}
                radius={r}
                pathOptions={{
                  color: "#8B0000",
                  weight: 1,
                  fillColor: "#FF4500",
                  fillOpacity: 0.75,
                }}
              >
                <Popup>
                  <div style={{ color: "#111", minWidth: 160 }}>
                    <strong>NASA FIRMS</strong>
                    <p style={{ margin: "6px 0 0", fontSize: 12 }}>
                      {fire.acq_date} {fire.acq_time ? `· ${fire.acq_time}` : ""}
                    </p>
                    {fire.confidence && (
                      <p style={{ margin: "4px 0 0", fontSize: 12 }}>Confidence: {fire.confidence}</p>
                    )}
                    {Number.isFinite(frp) && frp > 0 && (
                      <p style={{ margin: "4px 0 0", fontSize: 12 }}>FRP: {frp.toFixed(1)} MW</p>
                    )}
                    <p style={{ margin: "8px 0 0", fontSize: 10, color: "#555" }}>
                      Thermal anomaly — not a legal fire boundary.
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
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
        <div style={{ marginBottom: 5 }}><span style={{ color: "#00C853" }}>●</span> Low Risk (0-30)</div>
        <div><span style={{ color: "#FF4500" }}>●</span> NASA FIRMS hotspot</div>
      </div>
    </div>
  );
}
