// src/api/authService.js
const API_URL = 'http://localhost:8000/api';

// 🔹 Login saves token and user (including role) in localStorage.
export async function login(email, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (response.ok) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user)); // Stores role
    return data;
  } else {
    throw new Error(data.message || 'Login failed');
  }
}

export async function registerUser(formData) {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }

  return data;
}

export function getToken() {
  return localStorage.getItem('token');
}

export function getUserRole() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.role || null;
  } catch (e) {
    console.error('Erreur parsing user:', e);
    return null;
  }
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
