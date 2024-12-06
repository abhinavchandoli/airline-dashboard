import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

export const fetchAirlineData = (airlineId) =>
  axios.get(`${API_BASE_URL}/airline-data/${airlineId}`);
