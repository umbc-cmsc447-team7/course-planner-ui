import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUsers } from "../api/userAPI";
import "./Pages.css";

// Counselors and admins: every student, with a link to the full record.
export default function StudentDirectory() {
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState({ loading: true, error: "", students: [] });

  useEffect(() => {
    let active = true;
    getUsers()
      .then((accounts) => {
        if (!active) return;
        const students = accounts
          .filter(({ user, student_profile }) => user.role === "student" && student_profile)
          .sort((a, b) => a.user.last_name.localeCompare(b.user.last_name));
        setState({ loading: false, error: "", students });
      })
      .catch((error) => {
        if (active) setState({ loading: false, error: error.message, students: [] });
      });
    return () => {
      active = false;
    };
  }, [retry]);

  const { loading, error, students } = state;

  return (
    <section className="courses-page">
      <header className="courses-heading">
        <div>
          <p className="courses-eyebrow">STUDENT DIRECTORY</p>
          <h1>Students</h1>
          <p>Open a student to see their profile, course history and transfer or AP credit.</p>
        </div>
      </header>

      <div className="courses-panel">
        {loading ? (
          <div className="courses-state" role="status">Loading students…</div>
        ) : error ? (
          <div className="courses-state" role="alert">
            <h2>We couldn’t load students</h2>
            <p>{error}</p>
            <button
              className="courses-button"
              onClick={() => {
                setState({ loading: true, error: "", students: [] });
                setRetry((v) => v + 1);
              }}
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="courses-table-wrap">
            <table className="courses-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Student number</th>
                  <th>Type</th>
                  <th>Catalog year</th>
                  <th>GPA</th>
                  <th><span className="courses-sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {students.map(({ user, student_profile: profile }) => (
                  <tr key={user.user_id}>
                    <td>
                      <span className="courses-title">
                        {user.first_name} {user.last_name}
                      </span>
                      <span className="courses-muted">{user.email}</span>
                    </td>
                    <td>{profile.student_number ?? "—"}</td>
                    <td>{profile.student_type === "transfer" ? "Transfer" : "Regular"}</td>
                    <td>{profile.catalog_year ?? "—"}</td>
                    <td>{profile.current_gpa != null ? profile.current_gpa.toFixed(2) : "N/A"}</td>
                    <td>
                      <Link className="courses-detail-link" to={`/students/${user.user_id}`}>
                        View record →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
