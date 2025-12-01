/**
 * API service for communicating with ForestShield backend
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

