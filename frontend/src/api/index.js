const API_URL = '/api';

export const fetchCakes = async (search) => {
  const url = search ? `${API_URL}/cakes?search=${encodeURIComponent(search)}` : `${API_URL}/cakes`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch cakes');
  return (await res.json()).data;
};

export const fetchCake = async (id) => {
  const res = await fetch(`${API_URL}/cakes/${id}`);
  if (!res.ok) throw new Error('Failed to fetch cake');
  return (await res.json()).data;
};

export const fetchRatings = async (id) => {
  const res = await fetch(`${API_URL}/ratings/cake/${id}`);
  if (!res.ok) throw new Error('Failed to fetch ratings');
  return (await res.json()).data;
};

export const submitRating = async (data) => {
  const res = await fetch(`${API_URL}/ratings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to submit rating');
  return (await res.json()).data;
};

export const fetchBasket = async (userId) => {
  const res = await fetch(`${API_URL}/basket/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch basket');
  return (await res.json()).data;
};

export const addToBasket = async (data) => {
  const res = await fetch(`${API_URL}/basket`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add to basket');
  return await res.json();
};

export const checkoutBasket = async (userId) => {
  const res = await fetch(`${API_URL}/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Failed to checkout');
  return (await res.json()).data;
};

export const fetchNotifications = async (userId) => {
  const res = await fetch(`${API_URL}/notifications/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return (await res.json()).data;
};
