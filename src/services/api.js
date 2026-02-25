/**
 * API service for communicating with ForestShield backend
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

/**
 * Fetch all sensors with their latest data
 * @returns {Promise<Array>} Array of sensor objects
 */
export const getSensors = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/sensors`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching sensors:', error);
    return [];
  }
};

/**
 * Fetch latest data for a specific sensor
 * @param {string} deviceId - Device identifier
 * @returns {Promise<Object|null>} Sensor data object or null
 */
export const getSensorById = async (deviceId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sensor/${deviceId}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching sensor ${deviceId}:`, error);
    return null;
  }
};

/**
 * Fetch risk map data for visualization
 * @returns {Promise<Array>} Array of risk map data points
 */
export const getRiskMapData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/risk-map`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching risk map data:', error);
    return [];
  }
};

/**
 * Fetch NASA FIRMS fire data
 * @returns {Promise<Object>} NASA fire data
 */
export const getNasaFires = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/nasa-fires`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching NASA fires:', error);
    return { fires: [], count: 0 };
  }
};

// ==================== ML Endpoints ====================

/**
 * Make a fire risk prediction from sensor data
 * @param {Object} sensorData - Temperature, humidity, wind_speed, etc.
 * @returns {Promise<Object>} Prediction result with risk_score and risk_level
 */
export const predictFireRisk = async (sensorData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ml/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sensorData)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error making prediction:', error);
    return { 
      success: false, 
      error: error.message,
      prediction: {
        risk_score: 0.5,
        risk_level: 'MEDIUM',
        model_used: 'error-fallback'
      }
    };
  }
};

/**
 * Train a new ML model with historical data
 * @param {string} dataPath - Path to training data CSV (default: 'data/training_data.csv')
 * @returns {Promise<Object>} Training result with metrics
 */
export const trainModel = async (dataPath = 'data/training_data.csv') => {
  try {
    const response = await fetch(`${API_BASE_URL}/ml/train`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data_path: dataPath })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error training model:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Get information about the current ML model
 * @returns {Promise<Object>} Model info
 */
export const getModelInfo = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/ml/model/info`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting model info:', error);
    return { 
      loaded: false,
      error: error.message 
    };
  }
};

/**
 * Get ML prediction for a specific sensor by ID
 * @param {string} deviceId - Device identifier
 * @returns {Promise<Object>} Prediction for the sensor
 */
export const predictSensorRisk = async (deviceId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ml/predict/sensor/${deviceId}`);
    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: 'Sensor not found' };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error predicting risk for sensor ${deviceId}:`, error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Check ML service health
 * @returns {Promise<Object>} Health status
 */
export const getMLHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/ml/health`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking ML health:', error);
    return { 
      model_loaded: false,
      processor_ready: false,
      error: error.message 
    };
  }
};

// ==================== Helper Functions ====================

/**
 * Get color code based on risk level
 * @param {string} riskLevel - HIGH, MEDIUM, or LOW
 * @returns {string} Color hex code
 */
export const getRiskColor = (riskLevel) => {
  switch (riskLevel?.toUpperCase()) {
    case 'HIGH':
      return '#ff4444'; // Red
    case 'MEDIUM':
      return '#ffaa44'; // Orange
    case 'LOW':
      return '#44aa44'; // Green
    default:
      return '#888888'; // Gray
  }
};

/**
 * Format risk score as percentage
 * @param {number} riskScore - Risk score between 0-1
 * @returns {string} Formatted percentage
 */
export const formatRiskPercentage = (riskScore) => {
  if (riskScore === undefined || riskScore === null) return 'N/A';
  return `${Math.round(riskScore * 100)}%`;
};