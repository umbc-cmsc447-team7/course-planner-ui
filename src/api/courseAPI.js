import { apiGet, GRAPH_API_URL } from "./client";

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

// Team B's graph service: the course plus every prerequisite above it, in
// Cytoscape.js JSON ({ elements: { nodes, edges } }). Returns null when the
// course is not in their graph.
export async function getPrereqGraph(course_id) {
  try {
    return await apiGet(
      `/prereq-graph/${encodeURIComponent(course_id)}`,
      {},
      GRAPH_API_URL
    );
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}
