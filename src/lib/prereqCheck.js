import { bestGrade, meetsMinimum } from "./grades";

// An unmet OR group is reported as one reason: ONE_OF_PREFIX + options joined
// by OR_SEPARATOR. ReasonList splits it back into a list for display.
export const ONE_OF_PREFIX = "Needs one of: ";
export const OR_SEPARATOR = " OR ";

// Checks one planned course against Team B's prerequisite graph
// (GET /prereq-graph/{course_id}, Cytoscape JSON). Edges point from a
// prerequisite (course or group) to the group or course that needs it; the
// course -> group edge carries min_grade, concurrent_allowed and
// negative_prerequisite.
//
// This runs in the browser for now. Once Team B ships POST /plans/validate
// (their plangen.py), swap this out for that response.
//
// ctx = {
//   record,        // summarizeRecord(history, externals)
//   plannedBefore, // Set(course_id) planned in earlier terms of this plan
//   plannedSame,   // Set(course_id) planned in the same term (excluding this course)
// }
// Returns { ok, hasPrereqs, reasons: [string] }.
export function checkPrereqs(graph, courseId, ctx) {
  const nodes = new Map();
  for (const { data } of graph?.elements?.nodes ?? []) nodes.set(String(data.id), data);

  const incoming = new Map();
  for (const { data } of graph?.elements?.edges ?? []) {
    const target = String(data.target);
    incoming.set(target, [...(incoming.get(target) ?? []), data]);
  }

  const visiting = new Set();

  function label(id) {
    return nodes.get(id)?.course_identifier ?? `Course ${id}`;
  }

  function evalCourse(id, edge) {
    const courseId = Number(id);
    const code = label(id);
    const min = edge.min_grade ?? null;
    const { record, plannedBefore, plannedSame } = ctx;
    const grades = record.completed.get(courseId);

    if (edge.negative_prerequisite) {
      const has =
        grades?.some((g) => meetsMinimum(g, null)) ||
        record.transfer.has(courseId) ||
        record.inProgress.has(courseId) ||
        plannedBefore.has(courseId);
      return has ? { ok: false, reasons: [`Cannot be taken after ${code}`] } : { ok: true, reasons: [] };
    }

    if (record.transfer.has(courseId)) return { ok: true, reasons: [] };
    if (grades && meetsMinimum(bestGrade(grades), min)) return { ok: true, reasons: [] };
    // In-progress and earlier planned courses are assumed to be passed.
    if (record.inProgress.has(courseId) || plannedBefore.has(courseId)) {
      return { ok: true, reasons: [] };
    }
    if (plannedSame.has(courseId)) {
      return edge.concurrent_allowed
        ? { ok: true, reasons: [] }
        : { ok: false, reasons: [`${code} is planned for the same term (it must be completed first)`] };
    }
    if (grades) {
      const best = bestGrade(grades) ?? "no grade";
      return {
        ok: false,
        reasons: [`${code} completed with ${best} (${min ? `${min} or better` : "a passing grade"} required)`],
      };
    }
    return {
      ok: false,
      reasons: [`${code} not taken${min ? ` (${min} or better required)` : ""}`],
    };
  }

  function evalEdge(edge) {
    const source = String(edge.source);
    return nodes.get(source)?.node_type === "group" ? evalGroup(source) : evalCourse(source, edge);
  }

  function evalGroup(id) {
    if (visiting.has(id)) return { ok: true, reasons: [] };
    visiting.add(id);
    const results = (incoming.get(id) ?? []).map(evalEdge);
    visiting.delete(id);
    if (results.length === 0) return { ok: true, reasons: [] };

    const operator = String(nodes.get(id)?.operator ?? "AND").toUpperCase();
    if (operator === "OR") {
      if (results.some((r) => r.ok)) return { ok: true, reasons: [] };
      const options = results.flatMap((r) => r.reasons);
      return {
        ok: false,
        reasons: [options.length > 1 ? ONE_OF_PREFIX + options.join(OR_SEPARATOR) : options[0]],
      };
    }
    return {
      ok: results.every((r) => r.ok),
      reasons: results.flatMap((r) => r.reasons),
    };
  }

  const roots = incoming.get(String(courseId)) ?? [];
  if (roots.length === 0) return { ok: true, hasPrereqs: false, reasons: [] };

  const results = roots.map(evalEdge);
  return {
    ok: results.every((r) => r.ok),
    hasPrereqs: true,
    reasons: results.flatMap((r) => r.reasons),
  };
}
