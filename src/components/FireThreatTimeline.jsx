import React, { useEffect, useState } from 'react';

export default function FireThreatTimeline({
  fireData,
  sensors,
  ignitionPoint,
  visible = true,
  inSidebar = false
}) {
  const [threats, setThreats] = useState([]);

  useEffect(() => {
    if (!fireData || !sensors || !visible || !ignitionPoint) {
      setThreats([]);
      return;
    }

    try {
      const spreadRate = fireData.fire_spread?.spread_rate_kmh || 2.3;
      const forecastHours = fireData.forecast_hours || 12;

      console.log(`🔥 Threat Timeline - Spread Rate: ${spreadRate} km/h, Forecast: ${forecastHours}h`);

      const threatList = sensors
        .filter(sensor => sensor.lat && sensor.lng)
        .map(sensor => {
          // Calculate distance using Haversine formula
          const R = 6371;
          const dLat = (sensor.lat - ignitionPoint.lat) * (Math.PI / 180);
          const dLng = (sensor.lng - ignitionPoint.lng) * (Math.PI / 180);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(ignitionPoint.lat * (Math.PI / 180)) *
              Math.cos(sensor.lat * (Math.PI / 180)) *
              Math.sin(dLng / 2) *
              Math.sin(dLng / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;

          // Calculate hours to reach
          const hoursToReach = distance > 0 ? distance / spreadRate : 0;
          
          // ✅ FIXED: Dynamic thresholds based on forecast period
          let threatLevel = 'SAFE';
          let isThreatened = false;

          if (hoursToReach <= forecastHours) {
            isThreatened = true;

            // Scale thresholds to forecast period
            const oneThird = forecastHours / 3;      // First 1/3 = HIGH
            const twoThirds = (forecastHours * 2) / 3;  // Second 1/3 = MEDIUM

            if (hoursToReach <= oneThird) {
              threatLevel = 'HIGH';      // 🟠 Closest/Most urgent
            } else if (hoursToReach <= twoThirds) {
              threatLevel = 'MEDIUM';    // 🟡 Moderate distance
            } else {
              threatLevel = 'LOW';       // 🟢 Farthest/Least urgent
            }
          } else {
            // Beyond forecast period
            threatLevel = 'SAFE';
            isThreatened = false;
          }

          const threat = {
            sensorId: sensor.deviceId || sensor.id,
            sensorName: sensor.name || sensor.deviceId,
            distance: distance,
            hoursToReach: hoursToReach,
            isThreatened: isThreatened,
            threatLevel: threatLevel
          };

          console.log(`  ${threat.sensorName}: ${threat.distance.toFixed(1)}km → ${threat.hoursToReach.toFixed(1)}h → ${threat.threatLevel}`);

          return threat;
        })
        .sort((a, b) => a.hoursToReach - b.hoursToReach);

      setThreats(threatList);
      console.log('✅ Threats calculated:', threatList);
      
    } catch (error) {
      console.error('❌ Error calculating threats:', error);
    }
  }, [fireData, sensors, visible, ignitionPoint]);

  if (!visible || threats.length === 0) {
    return null;
  }

  const getThreatColor = (level) => {
    switch (level) {
      case 'HIGH': return '#FF5722';       // 🟠 Orange - URGENT
      case 'MEDIUM': return '#FFC107';     // 🟡 Yellow - MODERATE
      case 'LOW': return '#8BC34A';        // 🟢 Light Green - CAUTION
      case 'SAFE': return '#4CAF50';       // ✅ Dark Green - SAFE
      default: return '#999';
    }
  };

  const getThreatIcon = (level) => {
    switch (level) {
      case 'HIGH': return '🟠';
      case 'MEDIUM': return '🟡';
      case 'LOW': return '🟢';
      case 'SAFE': return '✅';
      default: return '❓';
    }
  };

  // SIDEBAR VERSION
  if (inSidebar) {
    return (
      <div>
        <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid #FF7A00' }}>
          Forecast: {fireData.forecast_hours}h | Rate: {fireData.fire_spread?.spread_rate_kmh?.toFixed(1)} km/h
        </div>

        {threats.map((threat, idx) => (
          <div 
            key={idx} 
            style={{ 
              padding: '10px', 
              marginBottom: '8px', 
              background: `rgba(255, 122, 0, ${threat.isThreatened ? 0.2 : 0.05})`, 
              borderLeft: `4px solid ${getThreatColor(threat.threatLevel)}`, 
              borderRadius: '4px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '12px' }}>
                  {getThreatIcon(threat.threatLevel)} {threat.sensorName}
                </p>
                <p style={{ margin: '2px 0', fontSize: '11px', color: '#aaa' }}>
                  {threat.distance.toFixed(1)} km away
                </p>
              </div>
              <div style={{ textAlign: 'right', fontSize: '12px', fontWeight: 'bold', color: getThreatColor(threat.threatLevel) }}>
                <div>{threat.hoursToReach.toFixed(1)}h</div>
                <div style={{ 
                  fontSize: '10px', 
                  marginTop: '3px', 
                  padding: '3px 8px', 
                  background: getThreatColor(threat.threatLevel), 
                  color: '#000', 
                  borderRadius: '3px',
                  fontWeight: 'bold'
                }}>
                  {threat.threatLevel}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // MAP VERSION - Floating popup
  return (
    <div style={{
      position: 'absolute',
      bottom: 20,
      right: 20,
      background: 'rgba(0, 0, 0, 0.95)',
      color: '#fff',
      padding: '15px',
      borderRadius: '8px',
      zIndex: 999,
      width: '320px',
      maxHeight: '400px',
      overflowY: 'auto',
      border: '2px solid #FF7A00',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
    }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#FF7A00' }}>🔥 Fire Threat Timeline</h3>

      <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid #FF7A00' }}>
        Forecast: {fireData.forecast_hours}h | Rate: {fireData.fire_spread?.spread_rate_kmh?.toFixed(1)} km/h
      </div>

      {threats.map((threat, idx) => (
        <div 
          key={idx} 
          style={{ 
            padding: '10px', 
            marginBottom: '8px', 
            background: `rgba(255, 122, 0, ${threat.isThreatened ? 0.2 : 0.05})`, 
            borderLeft: `4px solid ${getThreatColor(threat.threatLevel)}`, 
            borderRadius: '4px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '12px' }}>
                {getThreatIcon(threat.threatLevel)} {threat.sensorName}
              </p>
              <p style={{ margin: '2px 0', fontSize: '11px', color: '#aaa' }}>
                {threat.distance.toFixed(1)} km away
              </p>
            </div>
            <div style={{ textAlign: 'right', fontSize: '12px', fontWeight: 'bold', color: getThreatColor(threat.threatLevel) }}>
              <div>{threat.hoursToReach.toFixed(1)}h</div>
              <div style={{ 
                fontSize: '10px', 
                marginTop: '3px', 
                padding: '3px 8px', 
                background: getThreatColor(threat.threatLevel), 
                color: '#000', 
                borderRadius: '3px',
                fontWeight: 'bold'
              }}>
                {threat.threatLevel}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}