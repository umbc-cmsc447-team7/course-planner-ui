// The signed-in session: { access_token, user, student_profile }.
// Kept in sessionStorage so it ends when the browser tab closes.
const KEY = "course-planner.session";

export function loadSession() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY)) ?? null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  sessionStorage.setItem(KEY, JSON.stringify(session));
}

export function clearSession() {
  sessionStorage.removeItem(KEY);
}

export function getAccessToken() {
  return loadSession()?.access_token ?? null;
}
