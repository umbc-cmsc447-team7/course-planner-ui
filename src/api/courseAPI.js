import { apiGet } from "./client";

export const PAGE_SIZE = 20;

export async function getCourses(search, page) {
  const { courses, count } = await apiGet("/api/courses", { search, page });
  return { courses: courses ?? [], count: count ?? 0 };
}

export async function getCourse(course_identifier) {
  try {
    return await apiGet(
      `/api/courses/${encodeURIComponent(course_identifier)}`
    );
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

export async function getPrerequisiteGroups(course_id) {
  const { groups, prerequisiteCourses } = await apiGet(
    `/api/courses/${encodeURIComponent(course_id)}/prerequisites`
  );
  return {
    groups: groups ?? [],
    prerequisiteCourses: prerequisiteCourses ?? {},
  };
}
