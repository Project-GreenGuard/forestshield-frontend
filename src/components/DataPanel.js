// SVG Icon Components
const ThermometerIcon = ({ size = 20, color = "#FF6B6B" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 9V4C15 2.89543 14.1046 2 13 2H11C9.89543 2 9 2.89543 9 4V9C7.34315 9 6 10.3431 6 12C6 13.6569 7.34315 15 9 15V20C9 21.1046 9.89543 22 11 22H13C14.1046 22 15 21.1046 15 20V15C16.6569 15 18 13.6569 18 12C18 10.3431 16.6569 9 15 9Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M12 9V12" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const DropletIcon = ({ size = 20, color = "#4ECDC4" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2.69L17.66 8.35C19.78 10.47 19.78 13.53 17.66 15.66C15.54 17.78 12.47 17.78 10.35 15.66L12 14V2.69Z"
      fill={color}
      opacity="0.3"
    />
    <path
      d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ShieldIcon = ({ size = 20, color = "#FF7A00" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L4 5V11C4 16.55 7.16 21.74 12 23C16.84 21.74 20 16.55 20 11V5L12 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FireIcon = ({ size = 20, color = "#FF6B6B" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8.5 14.5C8.5 16.9853 10.5147 19 13 19C15.4853 19 17.5 16.9853 17.5 14.5C17.5 11.5 13 7 13 7C13 7 8.5 11.5 8.5 14.5Z"
      fill={color}
      opacity="0.3"
    />
    <path
      d="M13 2C10 6 8 9 8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 9 14 6 11 2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ClockIcon = ({ size = 16, color = "#888" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <path
      d="M12 6V12L16 14"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default function DataPanel({
  sensors = [],
  loading = false,
  error = null,
}) {
  const getRiskLevel = (riskScore) => {
    if (!riskScore) return { level: "Unknown", color: "#888" };
    if (riskScore > 60) return { level: "High", color: "#B22222" };
    if (riskScore > 30) return { level: "Medium", color: "#FF7A00" };
    return { level: "Low", color: "#00C853" };
  };

  if (loading && sensors.length === 0) {
    return (
      <div
        style={{
          gridArea: "panel",
          background: "#181818",
          padding: 20,
        }}
      >
        <h3>Live Data</h3>
        <div style={{ color: "#888", marginTop: 20 }}>
          Loading sensor data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          gridArea: "panel",
          background: "#181818",
          padding: 20,
        }}
      >
        <h3>Live Data</h3>
        <div style={{ color: "#B22222", marginTop: 20 }}>Error: {error}</div>
      </div>
    );
  }

  if (sensors.length === 0) {
    return (
      <div
        style={{
          gridArea: "panel",
          background: "#181818",
          padding: 20,
        }}
      >
        <h3>Live Data</h3>
        <div style={{ color: "#888", marginTop: 20 }}>No sensors available</div>
      </div>
    );
  }

  return (
    <div
      style={{
        gridArea: "panel",
        background: "#181818",
        padding: "20px",
        overflowY: "auto",
      }}
    >
      <h3
        style={{
          marginBottom: 20,
          color: "#fff",
          fontSize: "18px",
          fontWeight: "600",
          letterSpacing: "0.3px",
        }}
      >
        Live Data
      </h3>

      {sensors.map((sensor) => {
        const riskInfo = getRiskLevel(sensor.riskScore);

        return (
          <div
            key={sensor.deviceId}
            style={{
              background: "#1F1F1F",
              padding: "18px",
              marginBottom: 16,
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
                paddingBottom: 14,
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <h4
                style={{
                  margin: 0,
                  color: "#fff",
                  fontSize: "15px",
                  fontWeight: "600",
                  letterSpacing: "0.2px",
                }}
              >
                {sensor.deviceId}
              </h4>
              <span
                style={{
                  background: riskInfo.color,
                  color: "#fff",
                  padding: "5px 10px",
                  borderRadius: "6px",
                  fontSize: "10px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {riskInfo.level}
              </span>
            </div>

            {/* Data Grid */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {/* Temperature */}
              <div
                style={{
                  padding: "14px 16px",
                  background: "rgba(255,107,107,0.08)",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,107,107,0.15)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "36px",
                      height: "36px",
                      background: "rgba(255,107,107,0.15)",
                      borderRadius: "8px",
                    }}
                  >
                    <ThermometerIcon size={20} color="#FF6B6B" />
                  </div>
                  <span
                    style={{
                      color: "#E0E0E0",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Temperature
                  </span>
                </div>
                <span
                  style={{
                    color: "#fff",
                    fontWeight: "600",
                    fontSize: "18px",
                    marginLeft: "50px",
                    display: "block",
                  }}
                >
                  {sensor.temperature?.toFixed(1) || "N/A"}°C
                </span>
              </div>

              {/* Humidity */}
              <div
                style={{
                  padding: "14px 16px",
                  background: "rgba(78,205,196,0.08)",
                  borderRadius: "10px",
                  border: "1px solid rgba(78,205,196,0.15)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "36px",
                      height: "36px",
                      background: "rgba(78,205,196,0.15)",
                      borderRadius: "8px",
                    }}
                  >
                    <DropletIcon size={20} color="#4ECDC4" />
                  </div>
                  <span
                    style={{
                      color: "#E0E0E0",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Humidity
                  </span>
                </div>
                <span
                  style={{
                    color: "#fff",
                    fontWeight: "600",
                    fontSize: "18px",
                    marginLeft: "50px",
                    display: "block",
                  }}
                >
                  {sensor.humidity?.toFixed(1) || "N/A"}%
                </span>
              </div>

              {/* Risk Score */}
              <div
                style={{
                  padding: "14px 16px",
                  background: `rgba(${
                    riskInfo.color === "#FF7A00"
                      ? "255,122,0"
                      : riskInfo.color === "#B22222"
                      ? "178,34,34"
                      : "0,200,83"
                  },0.08)`,
                  borderRadius: "10px",
                  border: `1px solid rgba(${
                    riskInfo.color === "#FF7A00"
                      ? "255,122,0"
                      : riskInfo.color === "#B22222"
                      ? "178,34,34"
                      : "0,200,83"
                  },0.15)`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "36px",
                      height: "36px",
                      background: `rgba(${
                        riskInfo.color === "#FF7A00"
                          ? "255,122,0"
                          : riskInfo.color === "#B22222"
                          ? "178,34,34"
                          : "0,200,83"
                      },0.15)`,
                      borderRadius: "8px",
                    }}
                  >
                    <ShieldIcon size={20} color={riskInfo.color} />
                  </div>
                  <span
                    style={{
                      color: "#E0E0E0",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Risk Score
                  </span>
                </div>
                <span
                  style={{
                    color: riskInfo.color,
                    fontWeight: "600",
                    fontSize: "18px",
                    marginLeft: "50px",
                    display: "block",
                  }}
                >
                  {sensor.riskScore?.toFixed(1) || "N/A"}/100
                </span>
              </div>

              {/* Nearest Fire */}
              {sensor.nearestFireDistance && sensor.nearestFireDistance > 0 && (
                <div
                  style={{
                    padding: "14px 16px",
                    background: "rgba(255,107,107,0.08)",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,107,107,0.15)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "36px",
                        height: "36px",
                        background: "rgba(255,107,107,0.15)",
                        borderRadius: "8px",
                      }}
                    >
                      <FireIcon size={20} color="#FF6B6B" />
                    </div>
                    <span
                      style={{
                        color: "#E0E0E0",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      Nearest Fire
                    </span>
                  </div>
                  <span
                    style={{
                      color: "#fff",
                      fontWeight: "600",
                      fontSize: "18px",
                      marginLeft: "50px",
                      display: "block",
                    }}
                  >
                    {sensor.nearestFireDistance.toFixed(1)} km
                  </span>
                </div>
              )}

              {/* Timestamp */}
              {sensor.timestamp && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "11px",
                    color: "#888",
                    marginTop: 4,
                    paddingTop: 12,
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <ClockIcon size={12} color="#888" />
                  <span>
                    Updated: {new Date(sensor.timestamp).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
