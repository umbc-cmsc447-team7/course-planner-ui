import { apiGet } from "./client";

export const PAGE_SIZE = 20;

// Team B returns the whole catalog in one response, with no search or paging.
// Keep one in-flight request so paging and course lookup reuse it.
let catalogRequest;

function loadCatalog() {
  if (!catalogRequest) {
    catalogRequest = apiGet("/courses")
      .then((body) => {
        if (!Array.isArray(body)) {
          throw new Error("Course catalog response was not a list.");
        }
        return body;
      })
      .catch((error) => {
        catalogRequest = undefined;
        throw error;
      });
  }

  return catalogRequest;
}

export async function getCourses(search, page) {
  const catalog = await loadCatalog();
  const term = (search ?? "").trim().toLowerCase();
  const matches = term
    ? catalog.filter((course) => {
        const identifier = course.course_identifier ?? "";
        const title = course.course_title ?? "";
        return (
          identifier.toLowerCase().includes(term) ||
          title.toLowerCase().includes(term)
        );
      })
    : catalog;
  const start = page * PAGE_SIZE;

  return {
    courses: matches.slice(start, start + PAGE_SIZE),
    count: matches.length,
  };
}

// course_id -> course, for showing course history and plans by code and title.
export async function getCatalogIndex() {
  const catalog = await loadCatalog();
  return new Map(catalog.map((course) => [course.course_id, course]));
}

// Routes use the course code. Team B looks up a course by numeric id, so the
// code is resolved from the cached catalog first.
export async function getCourse(course_identifier) {
  const catalog = await loadCatalog();
  const match = catalog.find(
    (course) => course.course_identifier === course_identifier
  );

  if (!match) return null;

  try {
    return await apiGet(`/courses/${encodeURIComponent(match.course_id)}`);
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

// Team B's graph: the course plus every prerequisite above it, in
// Cytoscape.js JSON ({ elements: { nodes, edges } }). Returns null when the
// course is not in their graph.
export async function getPrereqGraph(course_id) {
  try {
    return await apiGet(`/prereq-graph/${encodeURIComponent(course_id)}`);
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}
