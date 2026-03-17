/**
 * API service for detailed risk scoring (PBI-7)
 * Supports both real API and mock data for testing
 */
const USE_MOCK_API = process.env.REACT_APP_USE_MOCK_API !== 'false';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';


/**
 * Generate mock detailed risk score
 */
const generateMockDetailedRisk = (sensorData) => {
  const baseTemp = sensorData.temperature || 25;
  const baseHumidity = sensorData.humidity || 50;
  const fireDistance = sensorData.nearestFireDistance || 50;

  // Simple mock calculation
  const mlScore = Math.min(100, (baseTemp - 20) * 3 + (50 - baseHumidity) * 0.5 + (10 / (fireDistance + 1)) * 5);
  const ruleScore = Math.min(100, (baseTemp - 15) * 2 + (55 - baseHumidity) * 0.8);
  
  const mlLevel = mlScore > 60 ? 'HIGH' : mlScore > 30 ? 'MEDIUM' : 'LOW';
  const ruleLevel = ruleScore > 60 ? 'HIGH' : ruleScore > 30 ? 'MEDIUM' : 'LOW';
  
  const combinedScore = (mlScore * 0.6 + ruleScore * 0.4);
  const combinedLevel = combinedScore > 60 ? 'HIGH' : combinedScore > 30 ? 'MEDIUM' : 'LOW';

  return {
    ml_score: parseFloat(mlScore.toFixed(2)),
    ml_level: mlLevel,
    ml_confidence: 0.82 + Math.random() * 0.15, // 82-97%
    rule_score: parseFloat(ruleScore.toFixed(2)),
    rule_level: ruleLevel,
    combined_score: parseFloat(combinedScore.toFixed(2)),
    combined_level: combinedLevel,
    model_version: 'v1.0-mock',
    model_drift: {
      has_drift: false,
      rmse_change_pct: 2.3,
      num_predictions: 127,
    }
  };
};

/**
 * Generate mock model health
 */
const generateMockModelHealth = () => {
  return {
    status: 'HEALTHY',
    drift_detected: false,
    predictions_count: 127,
    rmse: 8.23,
    accuracy: 0.929,
    baseline_rmse: 8.05,
    recommendations: [],
  };
};

/**
 * Get detailed risk scoring with ML breakdown
 * @param {Object} sensorData - Sensor payload
 * @returns {Promise<Object>} Detailed scoring response
 */
export const getDetailedRisk = async (sensorData) => {
  try {
    if (USE_MOCK_API) {
      // Return mock data immediately
      return new Promise((resolve) => {
        setTimeout(() => resolve(generateMockDetailedRisk(sensorData)), 300);
      });
    }

    const response = await fetch(`${API_BASE_URL}/risk-detailed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sensorData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching detailed risk:', error);
    return generateMockDetailedRisk(sensorData); // Fallback to mock
  }
};

/**
 * Get model health status
 * Includes drift detection and performance metrics
 * @returns {Promise<Object>} Model health response
 */
export const getModelHealth = async () => {
  try {
    if (USE_MOCK_API) {
      // Return mock data immediately
      return new Promise((resolve) => {
        setTimeout(() => resolve(generateMockModelHealth()), 200);
      });
    }

    const response = await fetch(`${API_BASE_URL}/model-health`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching model health:', error);
    return generateMockModelHealth(); // Fallback to mock
  }
};