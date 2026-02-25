import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import MapArea from "./components/MapArea";
import DataPanel from "./components/DataPanel";
import WarningBanner from "./components/WarningBanner";
import { getSensors, getRiskMapData } from "./services/api";
import "./App.css";

function App() {
  const [sensors, setSensors] = useState([]);
  const [riskMapData, setRiskMapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

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

  // Handle page changes from sidebar
  const handlePageChange = (page) => {
    setCurrentPage(page);
    console.log(`Navigating to: ${page}`);
  };

  // Render different content based on current page
  const renderContent = () => {
    switch(currentPage) {
      case 'predictions':
        return (
          <div className="page-content" style={{ padding: "20px", overflowY: "auto" }}>
            <h2 style={{ color: "#fff", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span>🔮</span> ML Predictions
            </h2>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
              gap: "20px" 
            }}>
              {sensors.map(sensor => {
                const riskScore = sensor.riskScore ? sensor.riskScore * 100 : 0;
                return (
                  <div key={sensor.deviceId} style={{ 
                    background: "#1F1F1F", 
                    padding: "20px", 
                    borderRadius: "12px",
                    border: `1px solid ${
                      riskScore > 60 ? '#B22222' : 
                      riskScore > 30 ? '#FF7A00' : 
                      '#00C853'
                    }`
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                      <h3 style={{ color: "#fff", margin: 0 }}>{sensor.location || sensor.deviceId}</h3>
                      <span style={{
                        background: riskScore > 60 ? '#B22222' : riskScore > 30 ? '#FF7A00' : '#00C853',
                        color: "#fff",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold"
                      }}>
                        {riskScore > 60 ? 'HIGH' : riskScore > 30 ? 'MEDIUM' : 'LOW'}
                      </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div>
                        <div style={{ color: "#B0B0B0", fontSize: "12px" }}>Temperature</div>
                        <div style={{ color: "#FF6B6B", fontSize: "18px", fontWeight: "bold" }}>{sensor.temperature?.toFixed(1)}°C</div>
                      </div>
                      <div>
                        <div style={{ color: "#B0B0B0", fontSize: "12px" }}>Humidity</div>
                        <div style={{ color: "#4ECDC4", fontSize: "18px", fontWeight: "bold" }}>{sensor.humidity?.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div style={{ color: "#B0B0B0", fontSize: "12px" }}>Wind Speed</div>
                        <div style={{ color: "#FF7A00", fontSize: "18px", fontWeight: "bold" }}>{sensor.wind_speed?.toFixed(1)} km/h</div>
                      </div>
                      <div>
                        <div style={{ color: "#B0B0B0", fontSize: "12px" }}>Risk Score</div>
                        <div style={{ 
                          color: riskScore > 60 ? '#B22222' : riskScore > 30 ? '#FF7A00' : '#00C853',
                          fontSize: "18px", 
                          fontWeight: "bold" 
                        }}>
                          {riskScore.toFixed(1)}/100
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'alerts':
        const highRiskSensors = sensors.filter(s => (s.riskScore * 100) > 60);
        return (
          <div className="page-content" style={{ padding: "20px", overflowY: "auto" }}>
            <h2 style={{ color: "#fff", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span>🚨</span> Active Alerts ({highRiskSensors.length})
            </h2>
            {highRiskSensors.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {highRiskSensors.map(sensor => (
                  <div key={sensor.deviceId} style={{ 
                    background: "#2A1F1F", 
                    padding: "20px", 
                    borderRadius: "12px",
                    borderLeft: "4px solid #B22222"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <h3 style={{ color: "#fff", margin: 0 }}>{sensor.location || sensor.deviceId}</h3>
                      <span style={{ color: "#B22222", fontWeight: "bold" }}>CRITICAL</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px" }}>
                      <div>
                        <div style={{ color: "#B0B0B0", fontSize: "12px" }}>Temperature</div>
                        <div style={{ color: "#FF6B6B", fontSize: "16px" }}>{sensor.temperature?.toFixed(1)}°C</div>
                      </div>
                      <div>
                        <div style={{ color: "#B0B0B0", fontSize: "12px" }}>Humidity</div>
                        <div style={{ color: "#4ECDC4", fontSize: "16px" }}>{sensor.humidity?.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div style={{ color: "#B0B0B0", fontSize: "12px" }}>Risk Score</div>
                        <div style={{ color: "#B22222", fontSize: "16px", fontWeight: "bold" }}>
                          {(sensor.riskScore * 100).toFixed(1)}/100
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                background: "#1F1F1F", 
                padding: "40px", 
                borderRadius: "12px", 
                textAlign: "center",
                color: "#B0B0B0"
              }}>
                <span style={{ fontSize: "48px" }}>✅</span>
                <p style={{ marginTop: "10px" }}>No active alerts - all sensors are at safe levels</p>
              </div>
            )}
          </div>
        );

      case 'evacuation':
  // Helper function to get shelter links
  const getShelterLink = (shelterName) => {
    // Remove special characters and encode for Google Maps search
    const searchQuery = encodeURIComponent(shelterName + " Ontario");
    return `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
  };

  // Define routes for ALL cities
  const evacuationRoutes = {
    // GTA Cities
    'Toronto': { 
      primary: 'Gardiner Expressway East', 
      alternate: 'Don Valley Parkway North', 
      shelter: 'Exhibition Place',
      phone: '416-263-3600'
    },
    'Brampton': { 
      primary: 'Hwy 410 South', 
      alternate: 'Hwy 407 East', 
      shelter: 'Brampton Fairgrounds',
      phone: '905-794-9898'
    },
    'Mississauga': { 
      primary: 'Hwy 401 East', 
      alternate: 'QEW Toronto', 
      shelter: 'Paramount Fine Foods Centre',
      phone: '905-615-4100'
    },
    'Vaughan': { 
      primary: 'Hwy 400 South', 
      alternate: 'Hwy 407 East', 
      shelter: 'Vaughan Mills',
      phone: '905-879-2110'
    },
    'Markham': { 
      primary: 'Hwy 404 South', 
      alternate: 'Hwy 407 West', 
      shelter: 'Markham Pan Am Centre',
      phone: '905-471-6464'
    },
    'Oakville': { 
      primary: 'QEW Toronto', 
      alternate: 'Hwy 403 North', 
      shelter: 'Oakville Conference Centre',
      phone: '905-338-4160'
    },
    'Burlington': { 
      primary: 'QEW Niagara', 
      alternate: 'Hwy 403 South', 
      shelter: 'Burlington Convention Centre',
      phone: '905-637-1770'
    },
    'Newmarket': { 
      primary: 'Hwy 404 South', 
      alternate: 'Hwy 400 South', 
      shelter: 'Ray Twinney Complex',
      phone: '905-895-5000'
    },
    
    // Hamilton/Niagara Region
    'Hamilton': { 
      primary: 'QEW Niagara', 
      alternate: 'Hwy 403 East', 
      shelter: 'Hamilton Convention Centre',
      phone: '905-546-3000'
    },
    'St. Catharines': { 
      primary: 'QEW Toronto', 
      alternate: 'Hwy 406 North', 
      shelter: 'Meridian Centre',
      phone: '905-687-6551'
    },
    
    // Western Ontario
    'London': { 
      primary: 'Hwy 401 East', 
      alternate: 'Hwy 402 West', 
      shelter: 'Western Fair District',
      phone: '519-438-7203'
    },
    'Woodstock': { 
      primary: 'Hwy 401 East', 
      alternate: 'Hwy 403 North', 
      shelter: 'Woodstock Community Complex',
      phone: '519-539-2382'
    },
    'Stratford': { 
      primary: 'Hwy 7/8 East', 
      alternate: 'Hwy 401 West', 
      shelter: 'Stratford Rotary Complex',
      phone: '519-271-0250'
    },
    'Brantford': { 
      primary: 'Hwy 403 North', 
      alternate: 'Hwy 24 South', 
      shelter: 'Brantford Civic Centre',
      phone: '519-759-4150'
    },
    'St. Thomas': { 
      primary: 'Hwy 401 East', 
      alternate: 'Hwy 4 North', 
      shelter: 'St. Thomas Community Centre',
      phone: '519-631-9990'
    },
    
    // Kitchener-Waterloo Region
    'Kitchener': { 
      primary: 'Hwy 401 West', 
      alternate: 'Hwy 7/8 East', 
      shelter: 'Kitchener Aud',
      phone: '519-741-2200'
    },
    'Cambridge': { 
      primary: 'Hwy 401 West', 
      alternate: 'Hwy 8 East', 
      shelter: 'Cambridge Sports Park',
      phone: '519-623-1340'
    },
    'Guelph': { 
      primary: 'Hwy 401 East', 
      alternate: 'Hwy 6 South', 
      shelter: 'Sleeman Centre',
      phone: '519-837-5600'
    },
    
    // Northern
    'Barrie': { 
      primary: 'Hwy 400 South', 
      alternate: 'Hwy 11 South', 
      shelter: 'Barrie Molson Centre',
      phone: '705-722-5123'
    },
    
    // Default for any missing cities
    'default': { 
      primary: 'Main Evacuation Route', 
      alternate: 'Secondary Route', 
      shelter: 'Community Centre',
      phone: 'Call 311'
    }
  };

  // Group sensors by risk level
  const highRiskCities = sensors.filter(s => (s.riskScore * 100) > 60);
  const mediumRiskCities = sensors.filter(s => {
    const score = s.riskScore * 100;
    return score > 30 && score <= 60;
  });

  return (
    <div className="page-content" style={{ padding: "20px", overflowY: "auto" }}>
      <h2 style={{ color: "#fff", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
        <span>🚗</span> Evacuation Routes
      </h2>

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "15px", marginBottom: "25px" }}>
        <div style={{ background: "#2A1F1F", padding: "15px", borderRadius: "8px", border: "1px solid #B22222" }}>
          <div style={{ color: "#B0B0B0", fontSize: "12px" }}>High Risk Cities</div>
          <div style={{ color: "#B22222", fontSize: "24px", fontWeight: "bold" }}>{highRiskCities.length}</div>
        </div>
        <div style={{ background: "#1F1F1F", padding: "15px", borderRadius: "8px", border: "1px solid #FF7A00" }}>
          <div style={{ color: "#B0B0B0", fontSize: "12px" }}>Medium Risk Cities</div>
          <div style={{ color: "#FF7A00", fontSize: "24px", fontWeight: "bold" }}>{mediumRiskCities.length}</div>
        </div>
      </div>

      {/* Active Evacuation Warning */}
      {highRiskCities.length > 0 && (
        <div style={{
          background: "#2A1F1F",
          border: "2px solid #B22222",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "25px",
          display: "flex",
          alignItems: "center",
          gap: "15px"
        }}>
          <span style={{ fontSize: "32px" }}>🚨</span>
          <div>
            <h3 style={{ color: "#B22222", margin: "0 0 5px 0" }}>ACTIVE EVACUATION ALERT</h3>
            <p style={{ color: "#fff", margin: 0 }}>
              {highRiskCities.length} high-risk area{highRiskCities.length > 1 ? 's' : ''} require immediate evacuation
            </p>
          </div>
        </div>
      )}

      {/* High Risk Cities - Immediate Evacuation */}
      {highRiskCities.length > 0 && (
        <div style={{ marginBottom: "30px" }}>
          <h3 style={{ color: "#B22222", marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span>🔴</span> Immediate Evacuation Required
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
            {highRiskCities.map(city => {
              const routes = evacuationRoutes[city.location] || evacuationRoutes.default;
              return (
                <div key={city.deviceId} style={{
                  background: "#2A1F1F",
                  borderRadius: "12px",
                  padding: "20px",
                  border: "2px solid #B22222",
                  position: "relative"
                }}>
                  <div style={{
                    position: "absolute",
                    top: "-10px",
                    right: "20px",
                    background: "#B22222",
                    color: "#fff",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}>
                    EVACUATE NOW
                  </div>
                  
                  <h3 style={{ color: "#fff", margin: "0 0 15px 0", fontSize: "18px" }}>
                    {city.location || city.deviceId}
                  </h3>
                  
                  <div style={{ marginBottom: "15px" }}>
                    <div style={{ color: "#FF6B6B", fontSize: "14px", marginBottom: "5px" }}>
                      🔥 Risk Level: HIGH ({(city.riskScore * 100).toFixed(1)}/100)
                    </div>
                    <div style={{ color: "#B0B0B0", fontSize: "13px" }}>
                      {city.temperature?.toFixed(1)}°C | {city.humidity?.toFixed(1)}% humidity
                    </div>
                  </div>

                  {/* COMBINED ROUTES & SHELTER IN ONE BOX */}
                  <div style={{
                    background: "#1F1F1F",
                    padding: "15px",
                    borderRadius: "8px"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                      <span style={{ fontSize: "20px" }}>🚗</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "#B0B0B0", fontSize: "11px" }}>Primary Route</div>
                        <div style={{ color: "#fff", fontSize: "14px", fontWeight: "bold" }}>{routes.primary}</div>
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                      <span style={{ fontSize: "20px" }}>🔄</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "#B0B0B0", fontSize: "11px" }}>Alternate Route</div>
                        <div style={{ color: "#fff", fontSize: "14px", fontWeight: "bold" }}>{routes.alternate}</div>
                      </div>
                    </div>
                    
                    {/* Shelter with clickable link and phone */}
                    <div style={{ 
                      background: "#1F4F1F", 
                      padding: "12px", 
                      borderRadius: "8px",
                      marginTop: "8px"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "20px" }}>🏛️</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: "#B0B0B0", fontSize: "11px" }}>Emergency Shelter</div>
                          <a 
                            href={getShelterLink(routes.shelter)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                              color: "#fff", 
                              fontSize: "14px", 
                              fontWeight: "bold",
                              textDecoration: "underline",
                              textDecorationColor: "#FF7A00",
                              cursor: "pointer",
                              display: "block"
                            }}
                            onMouseEnter={(e) => e.target.style.color = "#FF7A00"}
                            onMouseLeave={(e) => e.target.style.color = "#fff"}
                          >
                            {routes.shelter} ↗
                          </a>
                          {routes.phone && (
                            <div style={{ 
                              color: "#B0B0B0", 
                              fontSize: "12px", 
                              marginTop: "4px",
                              display: "flex",
                              alignItems: "center",
                              gap: "5px"
                            }}>
                              <span>📞</span>
                              <a href={`tel:${routes.phone.replace(/[^0-9]/g, '')}`} 
                                 style={{ color: "#B0B0B0", textDecoration: "none" }}>
                                {routes.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Medium Risk Cities - Prepare */}
      {mediumRiskCities.length > 0 && (
        <div style={{ marginBottom: "30px" }}>
          <h3 style={{ color: "#FF7A00", marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span>🟡</span> Prepare for Possible Evacuation
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "15px" }}>
            {mediumRiskCities.map(city => {
              const routes = evacuationRoutes[city.location] || evacuationRoutes.default;
              return (
                <div key={city.deviceId} style={{
                  background: "#1F1F1F",
                  borderRadius: "10px",
                  padding: "15px",
                  border: "1px solid #FF7A00"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <h4 style={{ color: "#fff", margin: 0 }}>{city.location || city.deviceId}</h4>
                    <span style={{
                      background: "#FF7A00",
                      color: "#fff",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "11px"
                    }}>
                      {(city.riskScore * 100).toFixed(0)}/100
                    </span>
                  </div>
                  <div style={{ color: "#B0B0B0", fontSize: "13px", marginBottom: "10px" }}>
                    {city.temperature?.toFixed(1)}°C | {city.humidity?.toFixed(1)}% humidity
                  </div>
                  
                  {/* COMBINED ROUTE INFO FOR MEDIUM RISK */}
                  <div style={{
                    padding: "12px",
                    background: "#0F1F0F",
                    borderRadius: "6px"
                  }}>
                    <div style={{ color: "#FF7A00", marginBottom: "8px", fontWeight: "bold" }}>📋 Evacuation Information:</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "#FF7A00" }}>🚗</span>
                        <span style={{ color: "#B0B0B0" }}>{routes.primary}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "#FF7A00" }}>🔄</span>
                        <span style={{ color: "#B0B0B0" }}>{routes.alternate}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "#FF7A00" }}>🏛️</span>
                        <a 
                          href={getShelterLink(routes.shelter)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ 
                            color: "#B0B0B0",
                            textDecoration: "underline",
                            textDecorationColor: "#FF7A00",
                            cursor: "pointer"
                          }}
                          onMouseEnter={(e) => e.target.style.color = "#FF7A00"}
                          onMouseLeave={(e) => e.target.style.color = "#B0B0B0"}
                        >
                          {routes.shelter} ↗
                        </a>
                      </div>
                      {routes.phone && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                          <span style={{ color: "#FF7A00" }}>📞</span>
                          <a href={`tel:${routes.phone.replace(/[^0-9]/g, '')}`} 
                             style={{ color: "#B0B0B0", textDecoration: "none" }}>
                            {routes.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Emergency Contacts Bar */}
      <div style={{
        marginTop: "25px",
        padding: "15px",
        background: "#0F1F0F",
        borderRadius: "8px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "10px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <span style={{ color: "#FF7A00", fontWeight: "bold" }}>🚨 Emergency: 911</span>
          <span style={{ color: "#B0B0B0" }}>Fire: 311</span>
        </div>
        <div style={{ display: "flex", gap: "20px" }}>
          <span style={{ color: "#B0B0B0" }}>Red Cross: 1-800-123-4567</span>
          <span style={{ color: "#B0B0B0" }}>Ontario Fire: 1-877-123-4567</span>
        </div>
      </div>
    </div>
  );

      case 'reports':
        // Calculate statistics from sensor data
        const totalSensors = sensors.length;
        const highRiskCount = sensors.filter(s => (s.riskScore * 100) > 60).length;
        const mediumRiskCount = sensors.filter(s => {
          const score = s.riskScore * 100;
          return score > 30 && score <= 60;
        }).length;
        const lowRiskCount = sensors.filter(s => (s.riskScore * 100) <= 30).length;
        
        const avgTemp = sensors.reduce((sum, s) => sum + (s.temperature || 0), 0) / totalSensors;
        const avgHumidity = sensors.reduce((sum, s) => sum + (s.humidity || 0), 0) / totalSensors;
        const avgRisk = sensors.reduce((sum, s) => sum + (s.riskScore || 0), 0) / totalSensors * 100;

        return (
          <div className="page-content" style={{ padding: "20px", overflowY: "auto" }}>
            <h2 style={{ color: "#fff", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span>📋</span> ML Risk Reports
            </h2>
            
            {/* Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", marginBottom: "25px" }}>
              <div style={{ background: "#1F1F1F", padding: "20px", borderRadius: "10px", border: "1px solid #3B5A3B" }}>
                <div style={{ color: "#B0B0B0", fontSize: "12px", marginBottom: "5px" }}>Total Sensors</div>
                <div style={{ color: "#fff", fontSize: "28px", fontWeight: "bold" }}>{totalSensors}</div>
              </div>
              <div style={{ background: "#2A1F1F", padding: "20px", borderRadius: "10px", border: "1px solid #B22222" }}>
                <div style={{ color: "#B0B0B0", fontSize: "12px", marginBottom: "5px" }}>High Risk</div>
                <div style={{ color: "#B22222", fontSize: "28px", fontWeight: "bold" }}>{highRiskCount}</div>
              </div>
              <div style={{ background: "#1F1F1F", padding: "20px", borderRadius: "10px", border: "1px solid #FF7A00" }}>
                <div style={{ color: "#B0B0B0", fontSize: "12px", marginBottom: "5px" }}>Medium Risk</div>
                <div style={{ color: "#FF7A00", fontSize: "28px", fontWeight: "bold" }}>{mediumRiskCount}</div>
              </div>
              <div style={{ background: "#1F1F1F", padding: "20px", borderRadius: "10px", border: "1px solid #00C853" }}>
                <div style={{ color: "#B0B0B0", fontSize: "12px", marginBottom: "5px" }}>Low Risk</div>
                <div style={{ color: "#00C853", fontSize: "28px", fontWeight: "bold" }}>{lowRiskCount}</div>
              </div>
            </div>

            {/* Averages Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginBottom: "25px" }}>
              <div style={{ background: "#1F1F1F", padding: "15px", borderRadius: "8px" }}>
                <div style={{ color: "#B0B0B0", fontSize: "12px" }}>Avg Temperature</div>
                <div style={{ color: "#FF6B6B", fontSize: "24px", fontWeight: "bold" }}>{avgTemp.toFixed(1)}°C</div>
              </div>
              <div style={{ background: "#1F1F1F", padding: "15px", borderRadius: "8px" }}>
                <div style={{ color: "#B0B0B0", fontSize: "12px" }}>Avg Humidity</div>
                <div style={{ color: "#4ECDC4", fontSize: "24px", fontWeight: "bold" }}>{avgHumidity.toFixed(1)}%</div>
              </div>
              <div style={{ background: "#1F1F1F", padding: "15px", borderRadius: "8px" }}>
                <div style={{ color: "#B0B0B0", fontSize: "12px" }}>Avg Risk Score</div>
                <div style={{ color: "#FF7A00", fontSize: "24px", fontWeight: "bold" }}>{avgRisk.toFixed(1)}/100</div>
              </div>
            </div>

            {/* Risk Distribution Chart */}
            <div style={{ background: "#1F1F1F", padding: "20px", borderRadius: "10px", marginBottom: "25px" }}>
              <h3 style={{ color: "#fff", margin: "0 0 15px 0", fontSize: "16px" }}>Risk Distribution</h3>
              <div style={{ display: "flex", height: "30px", borderRadius: "15px", overflow: "hidden" }}>
                <div style={{ 
                  width: `${(lowRiskCount/totalSensors)*100}%`, 
                  background: "#00C853",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "12px"
                }}>
                  {lowRiskCount > 0 && `${Math.round((lowRiskCount/totalSensors)*100)}%`}
                </div>
                <div style={{ 
                  width: `${(mediumRiskCount/totalSensors)*100}%`, 
                  background: "#FF7A00",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "12px"
                }}>
                  {mediumRiskCount > 0 && `${Math.round((mediumRiskCount/totalSensors)*100)}%`}
                </div>
                <div style={{ 
                  width: `${(highRiskCount/totalSensors)*100}%`, 
                  background: "#B22222",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "12px"
                }}>
                  {highRiskCount > 0 && `${Math.round((highRiskCount/totalSensors)*100)}%`}
                </div>
              </div>
            </div>

            {/* Sensor Risk Table */}
            <div style={{ background: "#1F1F1F", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "15px", borderBottom: "1px solid #3B5A3B" }}>
                <h3 style={{ color: "#fff", margin: "0", fontSize: "16px" }}>Sensor Risk Report</h3>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#0F1F0F" }}>
                      <th style={{ padding: "12px", textAlign: "left", color: "#B0B0B0" }}>Sensor</th>
                      <th style={{ padding: "12px", textAlign: "left", color: "#B0B0B0" }}>Location</th>
                      <th style={{ padding: "12px", textAlign: "left", color: "#B0B0B0" }}>Temp</th>
                      <th style={{ padding: "12px", textAlign: "left", color: "#B0B0B0" }}>Humidity</th>
                      <th style={{ padding: "12px", textAlign: "left", color: "#B0B0B0" }}>Risk Score</th>
                      <th style={{ padding: "12px", textAlign: "left", color: "#B0B0B0" }}>Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sensors.map(sensor => (
                      <tr key={sensor.deviceId} style={{ borderBottom: "1px solid #2F4F2F" }}>
                        <td style={{ padding: "12px", color: "#fff" }}>{sensor.deviceId}</td>
                        <td style={{ padding: "12px", color: "#fff" }}>{sensor.location || 'Unknown'}</td>
                        <td style={{ padding: "12px", color: "#FF6B6B" }}>{sensor.temperature?.toFixed(1)}°C</td>
                        <td style={{ padding: "12px", color: "#4ECDC4" }}>{sensor.humidity?.toFixed(1)}%</td>
                        <td style={{ padding: "12px", color: "#FF7A00", fontWeight: "bold" }}>{(sensor.riskScore * 100).toFixed(1)}/100</td>
                        <td style={{ padding: "12px" }}>
                          <span style={{
                            background: sensor.riskLevel === 'HIGH' ? '#B22222' : sensor.riskLevel === 'MEDIUM' ? '#FF7A00' : '#00C853',
                            color: "#fff",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px"
                          }}>
                            {sensor.riskLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Export Buttons */}
            <div style={{ display: "flex", gap: "15px", marginTop: "25px", justifyContent: "flex-end" }}>
              <button style={{
                background: "transparent",
                border: "1px solid #FF7A00",
                color: "#FF7A00",
                padding: "10px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <span>📄</span> Export as PDF
              </button>
              <button style={{
                background: "#FF7A00",
                border: "none",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <span>📊</span> Download CSV
              </button>
            </div>
          </div>
        );

      default: // dashboard
        return (
          <>
            <MapArea
              sensors={sensors}
              riskMapData={riskMapData}
              loading={loading}
              isExpanded={isMapExpanded}
              onToggleExpand={() => setIsMapExpanded(!isMapExpanded)}
            />
            <DataPanel sensors={sensors} loading={loading} error={error} />
          </>
        );
    }
  };

  return (
    <div className="dashboard">
      <WarningBanner sensors={sensors} />
      <Sidebar activePage={currentPage} onPageChange={handlePageChange} />
      <Topbar />
      {renderContent()}
    </div>
  );
}

export default App;