import React, { useState, useEffect } from 'react';

export default function FireSpreadPanel({
  sensorId,
  sensor,
  ignitionPoint,
  sensors = [],
  onFireSpreadUpdate,
  onClose
}) {
  const [hours, setHours] = useState(12);
  const [loading, setLoading] = useState(false);
  const [fireData, setFireData] = useState(null);
  const [error, setError] = useState(null);

  const handleFetchFireSpread = async () => {
    if (!sensorId) {
      setError('No sensor selected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`🔥 Fetching fire spread for ${sensorId}, ${hours} hours...`);
      
      const response = await fetch(
        `http://localhost:5001/api/sensor/${sensorId}/fire-spread?hours=${hours}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Fire spread data:', data);
      
      setFireData(data);
      onFireSpreadUpdate(data);  // ← CRITICAL: Send data to parent (App.js)
      
    } catch (err) {
      console.error('❌ Error fetching fire spread:', err);
      setError(err.message || 'Failed to fetch fire spread prediction');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch when sensor changes
  useEffect(() => {
    if (sensorId) {
      handleFetchFireSpread();
    }
  }, [sensorId]);

  // Function to get color based on spread risk level
  const getSpreadRiskColor = (level) => {
    switch (level) {
      case 'CRITICAL':
        return '#FF0000';  // Red
      case 'HIGH':
        return '#FF5722';  // Red-Orange
      case 'MEDIUM':
        return '#FFC107';  // Yellow-Orange
      case 'LOW':
        return '#4CAF50';  // Green
      default:
        return '#FF7A00';  // Default Orange
    }
  };

  // Function to get background color based on spread risk level
  const getSpreadRiskBackground = (level) => {
    switch (level) {
      case 'CRITICAL':
        return 'rgba(255, 0, 0, 0.15)';
      case 'HIGH':
        return 'rgba(255, 87, 34, 0.15)';
      case 'MEDIUM':
        return 'rgba(255, 193, 7, 0.15)';
      case 'LOW':
        return 'rgba(76, 175, 80, 0.15)';
      default:
        return 'rgba(255, 122, 0, 0.15)';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      height: '100vh',
      width: '400px',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      color: '#fff',
      padding: '20px',
      zIndex: 999,
      overflowY: 'auto',
      boxShadow: '-4px 0 15px rgba(0, 0, 0, 0.5)',
      borderLeft: '3px solid #FF7A00'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '2px solid #FF7A00'
      }}>
        <h2 style={{ margin: 0, fontSize: '20px', color: '#FF7A00' }}>🔥 Fire Spread</h2>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#FF7A00', fontSize: '24px', cursor: 'pointer', padding: '0' }}>✕</button>
      </div>

      {/* Sensor Info */}
      <div style={{ background: 'rgba(255, 122, 0, 0.15)', padding: '15px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #FF7A00', fontSize: '13px' }}>
        <p style={{ margin: '8px 0', fontWeight: 'bold', color: '#FF7A00' }}>📍 {sensor?.name || sensorId}</p>
        <p style={{ margin: '5px 0', color: '#aaa' }}><strong>Location:</strong> {ignitionPoint?.lat?.toFixed(4)}, {ignitionPoint?.lng?.toFixed(4)}</p>
        {sensor && (
          <>
            <p style={{ margin: '5px 0', color: '#aaa' }}><strong>🌡️ Temp:</strong> {sensor.temperature?.toFixed(1)}°C</p>
            <p style={{ margin: '5px 0', color: '#aaa' }}><strong>💧 Humidity:</strong> {sensor.humidity?.toFixed(1)}%</p>
            <p style={{ margin: '5px 0', color: '#aaa' }}><strong>🌪️ Wind:</strong> {sensor.wind_speed?.toFixed(1)} km/h</p>
            <p style={{ margin: '5px 0', color: '#aaa' }}><strong>🔥 Risk:</strong> <span style={{ color: '#FF7A00' }}>{sensor.riskScore?.toFixed(1)}</span></p>
          </>
        )}
      </div>

      {/* Forecast Control */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', fontWeight: 'bold' }}>⏱️ Forecast Period</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input type="range" min="1" max="48" value={hours} onChange={(e) => setHours(parseInt(e.target.value))} style={{ flex: 1, cursor: 'pointer', height: '6px' }} />
          <span style={{ background: '#FF7A00', padding: '4px 12px', borderRadius: '4px', fontWeight: 'bold', minWidth: '50px', textAlign: 'center' }}>{hours}h</span>
        </div>
      </div>

      {/* Calculate Button */}
      <button onClick={handleFetchFireSpread} disabled={loading} style={{ width: '100%', padding: '12px', background: loading ? '#666' : '#FF7A00', color: '#000', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '14px', marginBottom: '20px', opacity: loading ? 0.7 : 1 }}>
        {loading ? '⏳ Calculating...' : '🔥 Calculate Spread'}
      </button>

      {/* Error */}
      {error && (
        <div style={{ background: '#8B0000', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '12px', color: '#FFB6C1', border: '1px solid #FF4444' }}>
          ❌ {error}
        </div>
      )}

      {/* Fire Metrics */}
      {fireData && (
        <div style={{ background: 'rgba(139, 0, 0, 0.15)', padding: '15px', borderRadius: '6px', fontSize: '13px', border: '1px solid rgba(255, 122, 0, 0.3)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#FF7A00', fontSize: '14px' }}>📊 Fire Metrics</h3>
          
          <div style={{ background: 'rgba(255, 122, 0, 0.1)', padding: '10px', borderRadius: '4px', marginBottom: '10px', borderLeft: '3px solid #FF7A00' }}>
            <p style={{ margin: '0 0 5px 0', color: '#aaa', fontSize: '11px' }}>SPREAD RATE</p>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#FF7A00' }}>{fireData.fire_spread?.spread_rate_kmh?.toFixed(1)} km/h</p>
          </div>

          <div style={{ background: 'rgba(255, 122, 0, 0.1)', padding: '10px', borderRadius: '4px', marginBottom: '10px', borderLeft: '3px solid #FF7A00' }}>
            <p style={{ margin: '0 0 5px 0', color: '#aaa', fontSize: '11px' }}>DIRECTION</p>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#FF7A00' }}>{fireData.fire_spread?.direction_degrees}°</p>
          </div>

          <div style={{ background: 'rgba(255, 122, 0, 0.1)', padding: '10px', borderRadius: '4px', marginBottom: '10px', borderLeft: '3px solid #FF7A00' }}>
            <p style={{ margin: '0 0 5px 0', color: '#aaa', fontSize: '11px' }}>AREA</p>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#FF7A00' }}>{fireData.fire_spread?.area_hectares?.toFixed(1)} ha</p>
          </div>

          <div style={{ background: 'rgba(255, 122, 0, 0.1)', padding: '10px', borderRadius: '4px', marginBottom: '10px', borderLeft: '3px solid #FF7A00' }}>
            <p style={{ margin: '0 0 5px 0', color: '#aaa', fontSize: '11px' }}>INTENSITY</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#FF7A00' }}>{fireData.fire_spread?.intensity_level}/10</p>
              <div style={{ flex: 1, height: '6px', background: '#333', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(fireData.fire_spread?.intensity_level / 10) * 100}%`, background: fireData.fire_spread?.intensity_level >= 7 ? '#FF4444' : '#FF7A00' }} />
              </div>
            </div>
          </div>

          {/* NEW: SPREAD RISK LEVEL SECTION */}
          <div style={{ 
            background: getSpreadRiskBackground(fireData.spread_risk_level), 
            padding: '12px', 
            borderRadius: '4px', 
            marginTop: '15px', 
            borderLeft: `3px solid ${getSpreadRiskColor(fireData.spread_risk_level)}`,
            border: `1px solid ${getSpreadRiskColor(fireData.spread_risk_level)}`
          }}>
            <p style={{ margin: '0 0 8px 0', color: '#aaa', fontSize: '11px', fontWeight: 'bold' }}>⚠️ SPREAD RISK LEVEL</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ 
                margin: 0, 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: getSpreadRiskColor(fireData.spread_risk_level),
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {fireData.spread_risk_level || 'UNKNOWN'}
              </p>
              <div style={{
                background: getSpreadRiskColor(fireData.spread_risk_level),
                color: '#000',
                padding: '6px 12px',
                borderRadius: '4px',
                fontWeight: 'bold',
                fontSize: '12px'
              }}>
                {fireData.danger_score?.toFixed(2) || '0.00'}
              </div>
            </div>
            <p style={{ margin: '8px 0 0 0', color: '#aaa', fontSize: '11px' }}>
              {fireData.spread_risk_level === 'CRITICAL' && '🔴 Extreme fire spread conditions'}
              {fireData.spread_risk_level === 'HIGH' && '🟠 High fire spread conditions'}
              {fireData.spread_risk_level === 'MEDIUM' && '🟡 Moderate fire spread conditions'}
              {fireData.spread_risk_level === 'LOW' && '🟢 Low fire spread conditions'}
              {!fireData.spread_risk_level && '⚪ Unable to assess'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}