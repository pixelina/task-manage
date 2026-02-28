import axios from 'axios'

/**
 * Set VITE_MOCKAPI_BASE_URL in .env (see .env.example).
 * Create your API at https://mockapi.io and add resources: projects, tasks.
 */
function getBaseURL(): string {
  const v = import.meta.env.VITE_MOCKAPI_BASE_URL
  return typeof v === 'string' && v.trim() !== '' ? v : 'https://placeholder.mockapi.io/api/v1'
}

const baseURL = getBaseURL()

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})
