import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCourse, getPrerequisiteGroups } from "../api/courseAPI";
import "./Courses.css";

function PrerequisiteGroup({
  group,
  groups,
  prerequisiteCourses,
  ancestors = [],
}) {
  const id = group.prerequisite_group_id;

  if (ancestors.includes(id)) {
    return (
      <p role="alert">This prerequisite rule contains a circular reference.</p>
    );
  }

  const children = groups.filter((item) => item.parent_group_id === id);
  const prerequisites = group.prerequisites ?? [];
  const operator = group.group_operator?.toUpperCase();

  return (
    <div className="courses-rule">
      <p className="courses-rule-label">
        {operator === "AND"
          ? "All of the following"
          : operator === "OR"
            ? "At least one of the following"
            : "Rule operator unavailable"}
      </p>

      {!children.length && !prerequisites.length && (
        <p>No requirements have been entered in this group.</p>
      )}

      <ul>
        {prerequisites.map((prerequisite) => {
          const course =
            prerequisiteCourses[prerequisite.prerequisite_course_id];

          return (
            <li key={prerequisite.prerequisite_id}>
              {prerequisite.negative_prerequisite && (
                <strong>Must not have completed: </strong>
              )}

              {course ? (
                <Link
                  to={`/catalog/${encodeURIComponent(course.course_identifier)}`}
                >
                  {course.course_identifier} — {course.course_title}
                </Link>
              ) : (
                <span>
                  Course ID {prerequisite.prerequisite_course_id} (details
                  unavailable)
                </span>
              )}

              <div className="courses-rule-notes">
                {prerequisite.min_grade && (
                  <span>
                    Required grade: {prerequisite.min_grade} or better
                  </span>
                )}
                {prerequisite.concurrent_allowed && (
                  <span>Concurrent enrollment allowed</span>
                )}
              </div>
            </li>
          );
        })}

        {children.map((child) => (
          <li key={child.prerequisite_group_id}>
            <PrerequisiteGroup
              group={child}
              groups={groups}
              prerequisiteCourses={prerequisiteCourses}
              ancestors={[...ancestors, id]}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CourseDetails() {
  const { code } = useParams();
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState({
    course: null,
    loading: true,
    error: "",
    groups: [],
    prerequisiteCourses: {},
    rulesError: "",
  });

  useEffect(() => {
    let active = true;

    async function loadCourse() {
      setState({
        course: null,
        loading: true,
        error: "",
        groups: [],
        prerequisiteCourses: {},
        rulesError: "",
      });

      try {
        const course = await getCourse(code);
        let rules = { groups: [], prerequisiteCourses: {} };
        let rulesError = "";

        if (course) {
          try {
            rules = await getPrerequisiteGroups(course.course_id);
          } catch (error) {
            rulesError = error.message || "Unable to load prerequisite rules.";
          }
        }

        if (active) {
          setState({
            course,
            ...rules,
            rulesError,
            loading: false,
            error: "",
          });
        }
      } catch (error) {
        if (active) {
          setState((current) => ({
            ...current,
            loading: false,
            error: error.message || "Unable to load this course.",
          }));
        }
      }
    }

    loadCourse();
    return () => {
      active = false;
    };
  }, [code, retry]);

  const { course, loading, error, groups, prerequisiteCourses, rulesError } =
    state;
  const roots = groups.filter((group) => group.parent_group_id == null);

  return (
    <section className="courses-page">
      <Link className="courses-back" to="/catalog">
        ← Back to catalog
      </Link>

      {loading ? (
        <div className="courses-panel courses-state" role="status">
          Loading course details…
        </div>
      ) : error ? (
        <div className="courses-panel courses-state" role="alert">
          <h2>We couldn’t load this course</h2>
          <p>{error}</p>
          <button
            className="courses-button"
            onClick={() => setRetry((value) => value + 1)}
          >
            Try again
          </button>
        </div>
      ) : !course ? (
        <div className="courses-panel courses-state">
          <h2>Course not found</h2>
          <p>This course may have moved or may not be available.</p>
        </div>
      ) : (
        <>
          <header className="courses-hero">
            <p className="courses-eyebrow">{course.course_identifier}</p>
            <h1>{course.course_title}</h1>
            <p>
              {course.departments?.department_name ?? "Department not listed"}
            </p>

            <dl className="courses-facts">
              <div>
                <dt>Credits</dt>
                <dd>{course.credits ?? "Not listed"}</dd>
              </div>
              <div>
                <dt>Course level</dt>
                <dd>{course.course_level ?? "Not listed"}</dd>
              </div>
              <div>
                <dt>Repeatable for credit</dt>
                <dd>
                  {course.is_repeatable == null
                    ? "Not listed"
                    : course.is_repeatable
                      ? "Yes"
                      : "No"}
                </dd>
              </div>
            </dl>
          </header>

          <div className="courses-detail-grid">
            <section className="courses-panel courses-section">
              <h2>About this course</h2>
              <p className="courses-description">
                {course.course_description?.trim() ||
                  "A description has not been added for this course."}
              </p>
            </section>

            <section className="courses-panel courses-section">
              <h2>Prerequisite requirements</h2>
              <p className="courses-muted">
                Catalog rules are shown below. Your grades and transfer credits
                must be evaluated separately to determine eligibility.
              </p>

              {rulesError ? (
                <p role="alert">
                  Prerequisite information is unavailable: {rulesError}
                </p>
              ) : groups.length === 0 ? (
                <p>No prerequisite rules are recorded in the catalog.</p>
              ) : roots.length === 0 ? (
                <p role="alert">
                  Prerequisite groups are recorded, but their hierarchy is
                  incomplete. Eligibility cannot be determined here.
                </p>
              ) : (
                <>
                  {roots.length > 1 && (
                    <p className="courses-muted">
                      Multiple top-level groups are recorded. Their combined
                      interpretation must be confirmed by the catalog service.
                    </p>
                  )}
                  {roots.map((group) => (
                    <PrerequisiteGroup
                      key={group.prerequisite_group_id}
                      group={group}
                      groups={groups}
                      prerequisiteCourses={prerequisiteCourses}
                    />
                  ))}
                </>
              )}
            </section>
          </div>
        </>
      )}
    </section>
  );
}
