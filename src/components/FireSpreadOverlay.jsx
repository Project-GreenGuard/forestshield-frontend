import React, { useState, useEffect } from 'react';
import { Circle, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

export default function FireSpreadOverlay({
  fireData,
  ignitionPoint,
  visible = true
}) {
  const [spreadCircles, setSpreadCircles] = useState([]);
  const [spreadPath, setSpreadPath] = useState([]);

  useEffect(() => {
    if (!fireData || !visible || !ignitionPoint) {
      setSpreadCircles([]);
      setSpreadPath([]);
      return;
    }

    try {
      const spreadRate = fireData.fire_spread?.spread_rate_kmh || 2.3;
      const direction = (fireData.fire_spread?.direction_degrees || 125) * (Math.PI / 180);
      const forecastHours = fireData.forecast_hours || 12;

      const circles = [];
      const pathPoints = [[ignitionPoint.lat, ignitionPoint.lng]];

      for (let h = 3; h <= forecastHours; h += 3) {
        const distance = (spreadRate * h) * 1.609344;
        const latChange = (distance / 111000) * Math.cos(direction);
        const lngChange = (distance / (111000 * Math.cos(ignitionPoint.lat * Math.PI / 180))) * Math.sin(direction);

        const newLat = ignitionPoint.lat + latChange;
        const newLng = ignitionPoint.lng + lngChange;

        circles.push({
          lat: newLat,
          lng: newLng,
          hour: h,
          radius: 500 + (h * 100)
        });

        pathPoints.push([newLat, newLng]);
      }

      setSpreadCircles(circles);
      setSpreadPath(pathPoints);
    } catch (error) {
      console.error('Error calculating fire spread:', error);
    }
  }, [fireData, visible, ignitionPoint]);

  if (!visible || !fireData || !ignitionPoint) {
    return null;
  }

  return (
    <>
      {/* Fire Origin Marker */}
      <Marker
        position={[ignitionPoint.lat, ignitionPoint.lng]}
        icon={L.icon({
          iconUrl: `data:image/svg+xml;base64,${btoa(`
            <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FF4500" d="M15 0C8 8 5 15 5 20c0 5.5 6.7 10 10 10s10-4.5 10-10c0-5-3-12-10-20z"/>
              <circle cx="15" cy="18" r="3" fill="#FFD700"/>
            </svg>
          `)}`,
          iconSize: [30, 40],
          iconAnchor: [15, 40],
          popupAnchor: [0, -40]
        })}
      >
        <Popup>
          <div style={{ color: '#000', fontSize: '12px' }}>
            <h3 style={{ margin: '0 0 8px 0' }}>🔥 Fire Origin</h3>
            <p style={{ margin: '3px 0' }}>
              <strong>Rate:</strong> {fireData.fire_spread?.spread_rate_kmh?.toFixed(1)} km/h
            </p>
            <p style={{ margin: '3px 0' }}>
              <strong>Direction:</strong> {fireData.fire_spread?.direction_degrees}°
            </p>
            <p style={{ margin: '3px 0' }}>
              <strong>Intensity:</strong> {fireData.fire_spread?.intensity_level}/10
            </p>
          </div>
        </Popup>
      </Marker>

      {/* Spread Path */}
      {spreadPath.length > 1 && (
        <Polyline
          positions={spreadPath}
          color="#FF7A00"
          weight={3}
          opacity={0.8}
          dashArray="5, 5"
        />
      )}

      {/* Progress Circles */}
      {spreadCircles.map((circle, idx) => (
        <Circle
          key={`fire-circle-${idx}`}
          center={[circle.lat, circle.lng]}
          radius={circle.radius}
          pathOptions={{
            fillColor: '#FF4500',
            fillOpacity: 0.2 - (idx * 0.03),
            color: '#FF7A00',
            weight: 2,
            dashArray: '3, 3'
          }}
        />
      ))}
    </>
  );
}