const API_URL = 'http://localhost:5001/api';

export const getSensors = async () => {
  const response = await fetch(`${API_URL}/sensors`);
  if (!response.ok) throw new Error('Failed to fetch sensors');
  return response.json();
};

export const getRiskMapData = async () => {
  const response = await fetch(`${API_URL}/sensors`);
  if (!response.ok) throw new Error('Failed to fetch risk map');
  return response.json();
};

export const getSensorById = async (sensorId) => {
  const response = await fetch(`${API_URL}/sensor/${sensorId}`);
  if (!response.ok) throw new Error('Failed to fetch sensor');
  return response.json();
};

export const getSensorMLRisk = async (sensorId) => {
  const response = await fetch(`${API_URL}/sensor/${sensorId}/ml-risk`);
  if (!response.ok) throw new Error('Failed to fetch ML risk');
  return response.json();
};

export const getSensorFireSpread = async (sensorId, hours = 12) => {
  const response = await fetch(`${API_URL}/sensor/${sensorId}/fire-spread?hours=${hours}`);
  if (!response.ok) throw new Error('Failed to fetch fire spread');
  return response.json();
};

export const getModelHealth = async () => {
  const response = await fetch(`${API_URL}/health`);
  if (!response.ok) throw new Error('Failed to fetch model health');
  return response.json();
};

export const getNASAFires = async () => {
  const response = await fetch(`${API_URL}/nasa-fires`);
  if (!response.ok) throw new Error('Failed to fetch NASA fires');
  return response.json();
};