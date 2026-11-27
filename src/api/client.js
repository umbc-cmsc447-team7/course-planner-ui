import { clearSession, getAccessToken } from "../auth/session";

const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

async function request(method, path, { params = {}, body } = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value != null && value !== "")
  ).toString();

  const headers = {};
  const token = getAccessToken();
  // Mock tokens are not sent: Team B's API does not know them yet.
  if (token && !token.startsWith("mock.")) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response;
  try {
    response = await fetch(`${API_URL}${path}${query ? `?${query}` : ""}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error("Unable to reach the course planner API.");
  }

  const data = await response.json().catch(() => null);

  if (response.status === 401 && headers.Authorization) {
    clearSession();
    window.location.assign("/login");
  }

  if (!response.ok) {
    const error = new Error(
      typeof data?.detail === "string"
        ? data.detail
        : `Request failed with status ${response.status}.`
    );
    error.status = response.status;
    throw error;
  }

  return data;
}

export function apiGet(path, params = {}) {
  return request("GET", path, { params });
}

export function apiPost(path, body) {
  return request("POST", path, { body });
}

export function apiPut(path, body) {
  return request("PUT", path, { body });
}

export function apiDelete(path) {
  return request("DELETE", path);
}
