import { supabase } from "./supabaseClient";

export const PAGE_SIZE = 20;

const courseColumns = `
  course_id,
  department_id,
  course_identifier,
  course_prefix,
  course_title,
  course_description,
  credits,
  course_level,
  is_repeatable,
  departments(department_name)
`;

export async function getCourses(search, page) {
  let query = supabase
    .from("courses")
    .select(courseColumns, { count: "exact" });

  // Only allow ordinary search characters in PostgREST's OR expression.
  const term = search
    .replace(/[^a-zA-Z0-9 .-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (term) {
    query = query.or(
      `course_identifier.ilike.%${term}%,course_title.ilike.%${term}%`
    );
  }

  const { data, count, error } = await query
    .order("course_identifier")
    .order("course_id")
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  if (error) throw error;

  return { courses: data ?? [], count: count ?? 0 };
}

export async function getCourse(course_identifier) {
  const { data, error } = await supabase
    .from("courses")
    .select(courseColumns)
    .eq("course_identifier", course_identifier)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getPrerequisiteGroups(course_id) {
  const { data, error } = await supabase
    .from("prerequisite_groups")
    .select(`
      prerequisite_group_id,
      course_id,
      group_operator,
      parent_group_id,
      prerequisites(
        prerequisite_id,
        prerequisite_group_id,
        prerequisite_course_id,
        negative_prerequisite,
        min_grade,
        concurrent_allowed
      )
    `)
    .eq("course_id", course_id)
    .order("prerequisite_group_id");

  if (error) throw error;

  const groups = data ?? [];
  const course_ids = [
    ...new Set(
      groups.flatMap((group) =>
        (group.prerequisites ?? []).map(
          (prerequisite) => prerequisite.prerequisite_course_id
        )
      )
    ),
  ];

  if (!course_ids.length) {
    return { groups, prerequisiteCourses: {} };
  }

  const { data: courses, error: coursesError } = await supabase
    .from("courses")
    .select("course_id, course_identifier, course_title")
    .in("course_id", course_ids);

  if (coursesError) throw coursesError;

  return {
    groups,
    prerequisiteCourses: Object.fromEntries(
      (courses ?? []).map((course) => [course.course_id, course])
    ),
  };
}