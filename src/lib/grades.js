// Grading rules from the stakeholder requirements:
//   A > B > C > D > F. P satisfies a minimum of C or below.
//   W and I do not count as completion. If a course is retaken, the best grade counts.
const RANK = { A: 4, B: 3, C: 2, D: 1, F: 0 };

export function meetsMinimum(grade, minGrade) {
  if (!grade || grade === "W" || grade === "I" || grade === "F") return false;
  if (grade === "P") return !minGrade || RANK[minGrade] <= RANK.C;
  if (!(grade in RANK)) return false;
  if (!minGrade) return true;
  return RANK[grade] >= (RANK[minGrade] ?? Infinity);
}

// Best of several attempts. Letter grades beat P; anything beats W/I/none.
export function bestGrade(grades) {
  const score = (g) => (g in RANK ? RANK[g] + 1 : g === "P" ? 0.5 : -1);
  return grades.reduce(
    (best, g) => (best == null || score(g) > score(best) ? g : best),
    null
  );
}

export const STATUS_LABELS = {
  completed: "Completed",
  in_progress: "In progress",
  withdrawn: "Withdrawn",
  incomplete: "Incomplete",
  unknown: "Unknown",
};

// What a student already has, for prerequisite checks:
//   completed: course_id -> [grades]      (history rows with status completed)
//   inProgress: Set(course_id)
//   transfer: Set(course_id)              (approved external credit with a catalog equivalent)
// Credit with no catalog equivalent is ignored, per the requirements.
export function summarizeRecord(history = [], externals = []) {
  const completed = new Map();
  const inProgress = new Set();
  for (const row of history) {
    if (row.status === "completed") {
      completed.set(row.course_id, [...(completed.get(row.course_id) ?? []), row.grade]);
    } else if (row.status === "in_progress") {
      inProgress.add(row.course_id);
    }
  }
  const transfer = new Set(
    externals
      .filter((c) => c.approval_status === "approved" && c.equivalent_course_id != null)
      .map((c) => c.equivalent_course_id)
  );
  return { completed, inProgress, transfer };
}

// Does the student already have credit for this course?
// Returns null, or a short reason such as "Completed with B" / "Transfer/AP credit".
export function existingCredit(record, courseId) {
  if (record.transfer.has(courseId)) return "Transfer/AP credit";
  const grades = record.completed.get(courseId);
  if (grades) {
    const best = bestGrade(grades);
    if (meetsMinimum(best, null)) return `Completed with ${best}`;
  }
  if (record.inProgress.has(courseId)) return "In progress now";
  return null;
}
