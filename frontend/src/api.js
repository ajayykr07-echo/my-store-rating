import { API_BASE_URL, BACKEND_URL } from "./config";

export { API_BASE_URL, BACKEND_URL };
const API_URL = API_BASE_URL;

let onUnauthorizedCallback = null;

export function setOnUnauthorized(callback) {
  onUnauthorizedCallback = callback;
}

async function request(path, options = {}) {
  const url = `${API_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 && onUnauthorizedCallback) {
      onUnauthorizedCallback();
    }

    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    // Attach response status and ok flag
    data._ok = response.ok;
    data._status = response.status;

    return data;
  } catch (error) {
    return {
      _ok: false,
      _status: 0,
      message: error.message || "Network error. Please check backend connection.",
    };
  }
}

export async function login(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function signup(data) {
  return request("/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePassword(token, currentPassword, newPassword) {
  return request("/auth/password", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function getAdminDashboard(token) {
  return request("/admin/dashboard", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getAdminStores(token, filters = {}) {
  const params = new URLSearchParams();
  if (filters.name) params.append("name", filters.name);
  if (filters.email) params.append("email", filters.email);
  if (filters.address) params.append("address", filters.address);

  const query = params.toString() ? `?${params.toString()}` : "";
  return request(`/admin/stores${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function addStore(token, storeData) {
  return request("/admin/stores", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(storeData),
  });
}

export async function getAdminUsers(token, filters = {}) {
  const params = new URLSearchParams();
  if (filters.name) params.append("name", filters.name);
  if (filters.email) params.append("email", filters.email);
  if (filters.address) params.append("address", filters.address);
  if (filters.role) params.append("role", filters.role);

  const query = params.toString() ? `?${params.toString()}` : "";
  return request(`/admin/users${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function addUser(token, userData) {
  return request("/admin/users", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(userData),
  });
}

export async function getOwnerDashboard(token, storeId = null) {
  const query = storeId ? `?store_id=${storeId}` : "";
  return request(`/owner/dashboard${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getOwnerStores(token) {
  return request("/owner/stores", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function addOwnerStore(token, storeData) {
  return request("/owner/stores", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(storeData),
  });
}

export async function getStores(token, name = "", address = "") {
  const params = new URLSearchParams();
  if (name) params.append("name", name);
  if (address) params.append("address", address);

  const query = params.toString() ? `?${params.toString()}` : "";
  return request(`/ratings/stores${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function submitRating(token, storeId, rating) {
  return request("/ratings", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      store_id: storeId,
      rating: Number(rating),
    }),
  });
}

export async function updateRating(token, storeId, rating) {
  return request(`/ratings/${storeId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      rating: Number(rating),
    }),
  });
}
export async function deleteStore(token, storeId) {
  return request(`/admin/stores/${storeId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}
