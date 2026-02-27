import axios from 'axios'

// Default to Flask backend on port 5000 if env not set
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

