import { apiGet, apiPost } from "./client";
import { MOCK } from "./config";

// Contract: POST /auth/login {email, password}
//   -> { access_token, user, student_profile }
export async function login(email, password) {
  if (!MOCK.auth) {
    return apiPost("/auth/login", { email, password });
  }

  // Mock: Team B has no login endpoint yet, so find the account in GET /users.
  // The password is NOT checked here; Supabase Auth will check it once
  // /auth/login is live.
  const accounts = await apiGet("/users");
  const match = accounts.find(
    ({ user }) => user.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (!match) {
    const error = new Error("No account matches that email.");
    error.status = 401;
    throw error;
  }

  return {
    access_token: `mock.${match.user.user_id}`,
    user: match.user,
    student_profile: match.student_profile,
  };
}
