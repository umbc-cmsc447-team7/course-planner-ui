import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCourses, PAGE_SIZE } from "../api/courseAPI";
import "./Courses.css";

export default function CourseCatalog() {
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({ search: "", page: 0 });
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState({
    courses: [],
    count: 0,
    loading: true,
    error: "",
  });

  useEffect(() => {
    let active = true;

    async function loadCourses() {
      setResult({ courses: [], count: 0, loading: true, error: "" });

      try {
        const data = await getCourses(filters.search, filters.page);

        if (active) {
          setResult({ ...data, loading: false, error: "" });
        }
      } catch (error) {
        if (active) {
          setResult({
            courses: [],
            count: 0,
            loading: false,
            error: error.message || "Unable to load courses.",
          });
        }
      }
    }

    loadCourses();
    return () => {
      active = false;
    };
  }, [filters, retry]);

  const { courses, count, loading, error } = result;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  function searchCourses(event) {
    event.preventDefault();
    setFilters({ search: searchInput.trim(), page: 0 });
  }

  return (
    <section className="courses-page">
      <header className="courses-heading">
        <div>
          <p className="courses-eyebrow">ACADEMIC EXPLORER</p>
          <h1>Course catalog</h1>
          <p>Explore courses and understand the requirements ahead.</p>
        </div>
        <span className="courses-tag">UMBC course catalog</span>
      </header>

      <form className="courses-search" onSubmit={searchCourses}>
        <div>
          <label htmlFor="course-search">Find a course</label>
          <input
            id="course-search"
            type="search"
            maxLength={120}
            placeholder="Search by course code or title"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        <button className="courses-button" type="submit">
          Search courses
        </button>
      </form>

      <div className="courses-panel" aria-busy={loading}>
        <div className="courses-panel-heading">
          <h2>Available courses</h2>
          <span aria-live="polite">
            {loading
              ? "Loading…"
              : error
                ? ""
                : `${count.toLocaleString()} results`}
          </span>
        </div>

        {loading ? (
          <div className="courses-state" role="status">
            Loading the course catalog…
          </div>
        ) : error ? (
          <div className="courses-state" role="alert">
            <h3>We couldn’t load the catalog</h3>
            <p>{error}</p>
            <button
              className="courses-button"
              onClick={() => setRetry((value) => value + 1)}
            >
              Try again
            </button>
          </div>
        ) : courses.length === 0 ? (
          <div className="courses-state">
            <h3>No courses found</h3>
            <p>Try another course code or title.</p>
          </div>
        ) : (
          <>
            <div className="courses-table-wrap">
              <table className="courses-table">
                <caption className="courses-sr-only">
                  Course search results
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Course</th>
                    <th scope="col">Department</th>
                    <th scope="col">Credits</th>
                    <th scope="col">Level</th>
                    <th scope="col">
                      <span className="courses-sr-only">Details</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.course_id}>
                      <td>
                        <span className="courses-code">
                          {course.course_identifier}
                        </span>
                        <span className="courses-title">
                          {course.course_title}
                        </span>
                      </td>
                      <td>
                        {course.departments?.department_name ?? "Not listed"}
                      </td>
                      <td>{course.credits ?? "Not listed"}</td>
                      <td>{course.course_level ?? "Not listed"}</td>
                      <td>
                        <Link
                          className="courses-detail-link"
                          to={`/catalog/${encodeURIComponent(
                            course.course_identifier,
                          )}`}
                          aria-label={`View ${course.course_identifier} details`}
                        >
                          View course →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <nav className="courses-pagination" aria-label="Catalog pages">
              <span>
                Page {filters.page + 1} of {totalPages}
              </span>
              <div>
                <button
                  className="courses-button secondary"
                  disabled={filters.page === 0}
                  onClick={() =>
                    setFilters((current) => ({
                      ...current,
                      page: current.page - 1,
                    }))
                  }
                >
                  Previous
                </button>
                <button
                  className="courses-button secondary"
                  disabled={filters.page + 1 >= totalPages}
                  onClick={() =>
                    setFilters((current) => ({
                      ...current,
                      page: current.page + 1,
                    }))
                  }
                >
                  Next
                </button>
              </div>
            </nav>
          </>
        )}
      </div>
    </section>
  );
}
