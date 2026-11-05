const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export async function apiGet(path, params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value != null && value !== "")
  ).toString();

  let response;
  try {
    response = await fetch(`${API_URL}${path}${query ? `?${query}` : ""}`);
  } catch {
    throw new Error("Unable to reach the course planner API.");
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      typeof body?.detail === "string"
        ? body.detail
        : `Request failed with status ${response.status}.`
    );
    error.status = response.status;
    throw error;
  }

  return body;
}
