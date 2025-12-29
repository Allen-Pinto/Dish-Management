const API_BASE = 'https://dish-management-1.onrender.com/api';

export async function fetchDishes() {
  const response = await fetch(`${API_BASE}/dishes`);
  if (!response.ok) throw new Error('Failed to fetch dishes');
  return response.json();
}

export async function toggleDishStatus(dishId) {
  const response = await fetch(`${API_BASE}/dishes/${dishId}/toggle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to toggle dish status');
  return response.json();
}