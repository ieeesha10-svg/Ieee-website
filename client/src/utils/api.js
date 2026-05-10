import axios from 'axios';

const api = axios.create({
	// Fallback to localhost if the backend env variable is missing
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // <--- CRITICAL: This sends the cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;