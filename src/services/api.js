import { getToken } from './authService'

const API_URL = 'http://localhost:8000/api'

export async function fetchWithAuth(url, options = {}) {
  const token = getToken()

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'API Error')
  }

  return response.json()
}
