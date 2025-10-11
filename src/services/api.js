// src/services/api.js
// Servicios para llamadas a la API REST usando fetch

const API_URL = 'http://localhost:8080/api'; // Cambia la URL según tu backend

export async function registerUser(data) {
  const res = await fetch(`${API_URL}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error en registro');
  return res.json();
}

export async function loginUser(data) {
  const res = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error en login');
  return res.json();
}

export async function updateProfile(id, data, token) {
  const res = await fetch(`${API_URL}/users/${id}/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al actualizar perfil');
  return res.json();
}

export async function createShift(data, token) {
  const res = await fetch(`${API_URL}/shifts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al crear turno');
  return res.json();
}

export async function getShifts(userId, token) {
  const res = await fetch(`${API_URL}/shifts?userId=${userId}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!res.ok) throw new Error('Error al obtener turnos');
  return res.json();
}

export async function updateShift(id, data, token) {
  const res = await fetch(`${API_URL}/shifts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al actualizar turno');
  return res.json();
}

export async function deleteShift(id, token) {
  const res = await fetch(`${API_URL}/shifts/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!res.ok) throw new Error('Error al eliminar turno');
  return res.json();
}
