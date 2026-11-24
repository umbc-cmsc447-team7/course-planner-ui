import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCourse } from "../api/courseAPI";
import PrereqGraph from "../components/PrereqGraph";
import "./Courses.css";

export default function CourseDetails() {
  const { code } = useParams();
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState({
    course: null,
    loading: true,
    error: "",
  });

  useEffect(() => {
    let active = true;

    async function loadCourse() {
      setState({
        course: null,
        loading: true,
        error: "",
      });

      try {
        const course = await getCourse(code);

        if (active) {
          setState({
            course,
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

  const { course, loading, error } = state;

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

          <section className="courses-panel courses-section">
            <h2>About this course</h2>
            <p className="courses-description">
              {course.course_description?.trim() ||
                "A description has not been added for this course."}
            </p>
          </section>

          <section className="courses-panel courses-section courses-graph-section">
            <h2>Prerequisite graph</h2>
            <p className="courses-muted">
              The full chain of prerequisites leading to this course. Arrows
              point toward the course that needs them; AND means all are
              required, OR means one is. Select a course to open its details.
            </p>
            <PrereqGraph courseId={course.course_id} />
          </section>
        </>
      )}
    </section>
  );
}
