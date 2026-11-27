import { apiGet } from "./client";

// GET /users -> [{ user, student_profile }]
export function getUsers() {
  return apiGet("/users");
}

// GET /users/{user_id} -> { user, student_profile }
export async function getUser(userId) {
  try {
    return await apiGet(`/users/${encodeURIComponent(userId)}`);
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

// GET /historys/{student_id} -> { student_id, course_history, external_credits }
// Team B answers 404 when a student has no records yet; treat that as empty.
export async function getStudentHistory(studentId) {
  try {
    return await apiGet(`/historys/${encodeURIComponent(studentId)}`);
  } catch (error) {
    if (error.status === 404) {
      return { student_id: studentId, course_history: [], external_credits: [] };
    }
    throw error;
  }
}
