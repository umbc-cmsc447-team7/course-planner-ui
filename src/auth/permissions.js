// Team A's permission matrix (User_Profiles_Info.pdf, Nov 2026). Supabase RLS
// enforces the same rules on the database; the UI uses these to hide or
// disable actions a role cannot take.
const RULES = {
  viewStudentDirectory: ["counselor", "admin"],
  viewAllAccounts: ["admin"],
  editUserNames: ["admin"],
  editStudentProfiles: ["admin"],
  updateGpa: ["admin"],
  editCourseHistory: ["admin"],
  editExternalCredits: ["counselor"],
  planCourses: ["student"],
};

export function can(role, action) {
  return RULES[action]?.includes(role) ?? false;
}

export const ROLE_LABELS = {
  student: "Student",
  counselor: "Counselor",
  admin: "Admin",
};
