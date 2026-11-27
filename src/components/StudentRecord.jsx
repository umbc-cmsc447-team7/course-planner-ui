import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUser, getStudentHistory } from "../api/userAPI";
import { getCatalogIndex } from "../api/courseAPI";
import { getTerms } from "../api/termAPI";
import { useAuth } from "../auth/AuthContext";
import { can } from "../auth/permissions";
import { STATUS_LABELS } from "../lib/grades";
import PendingAction from "./PendingAction";
import "../pages/Pages.css";

function formatDate(value) {
  if (!value) return "Not listed";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

function CourseCell({ course, fallbackId }) {
  if (!course) return <span className="courses-title">Course {fallbackId}</span>;
  return (
    <>
      <Link className="courses-code" to={`/catalog/${encodeURIComponent(course.course_identifier)}`}>
        {course.course_identifier}
      </Link>
      <span className="courses-title">{course.course_title}</span>
    </>
  );
}

// Profile, GPA, course history and external credits for one student.
// Used by "My academic record" (students) and the student directory (staff).
export default function StudentRecord({ userId }) {
  const { role } = useAuth();
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState({ loading: true, error: "", data: null });

  useEffect(() => {
    let active = true;

    async function load() {
      setState({ loading: true, error: "", data: null });
      try {
        const [account, catalog, terms] = await Promise.all([
          getUser(userId),
          getCatalogIndex(),
          getTerms(),
        ]);
        const studentId = account?.student_profile?.student_id;
        const history = studentId != null ? await getStudentHistory(studentId) : null;
        if (active) {
          setState({
            loading: false,
            error: "",
            data: {
              account,
              history,
              catalog,
              terms: new Map(terms.map((t) => [t.term_id, t])),
              termOrder: new Map(terms.map((t, i) => [t.term_id, i])),
            },
          });
        }
      } catch (error) {
        if (active) {
          setState({ loading: false, error: error.message || "Unable to load this record.", data: null });
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [userId, retry]);

  const { loading, error, data } = state;

  if (loading) {
    return (
      <div className="courses-panel courses-state" role="status">
        Loading academic record…
      </div>
    );
  }

  if (error) {
    return (
      <div className="courses-panel courses-state" role="alert">
        <h2>We couldn’t load this record</h2>
        <p>{error}</p>
        <button className="courses-button" onClick={() => setRetry((v) => v + 1)}>
          Try again
        </button>
      </div>
    );
  }

  const { account, history, catalog, terms, termOrder } = data;
  const profile = account?.student_profile;

  if (!account || !profile) {
    return (
      <div className="courses-panel courses-state">
        <h2>No student profile</h2>
        <p>This account does not have a student profile.</p>
      </div>
    );
  }

  const courseHistory = [...history.course_history].sort(
    (a, b) =>
      (termOrder.get(a.term_id) ?? 999) - (termOrder.get(b.term_id) ?? 999) ||
      a.history_id - b.history_id
  );
  const externals = history.external_credits;
  const earned = courseHistory.reduce((sum, row) => sum + (row.credits_earned ?? 0), 0);
  const externalApproved = externals
    .filter((c) => c.approval_status === "approved")
    .reduce((sum, c) => sum + (c.credits_awarded ?? 0), 0);

  const { user } = account;
  const isTransfer = profile.student_type === "transfer";

  return (
    <>
      <header className="courses-hero">
        <p className="courses-eyebrow">{profile.student_number ?? "STUDENT"}</p>
        <h1>
          {user.first_name} {user.last_name}
        </h1>
        <p>
          {user.email} · {isTransfer ? "Transfer student" : "Regular student"}
        </p>

        <dl className="courses-facts">
          <div>
            <dt>Current GPA</dt>
            <dd>{profile.current_gpa != null ? profile.current_gpa.toFixed(2) : "N/A"}</dd>
          </div>
          <div>
            <dt>Admission / catalog year</dt>
            <dd>
              {profile.admission_year ?? "—"} / {profile.catalog_year ?? "—"}
            </dd>
          </div>
          <div>
            <dt>Expected graduation</dt>
            <dd>{formatDate(profile.expected_graduation)}</dd>
          </div>
          <div>
            <dt>JHU credits earned</dt>
            <dd>{earned}</dd>
          </div>
          <div>
            <dt>External approved</dt>
            <dd>{externalApproved}</dd>
          </div>
          <div>
            <dt>Combined</dt>
            <dd>{earned + externalApproved}</dd>
          </div>
        </dl>

        {can(role, "editStudentProfiles") && (
          <div className="record-actions">
            <PendingAction>Edit profile &amp; GPA</PendingAction>
            <PendingAction>Edit name</PendingAction>
          </div>
        )}
      </header>

      <section className="courses-panel record-section">
        <div className="courses-panel-heading">
          <h2>Course history</h2>
          <div className="record-heading-right">
            <span>{courseHistory.length} records</span>
            {can(role, "editCourseHistory") && <PendingAction>Add course</PendingAction>}
          </div>
        </div>
        {courseHistory.length === 0 ? (
          <p className="courses-state courses-muted">No courses recorded yet.</p>
        ) : (
          <div className="courses-table-wrap">
            <table className="courses-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Term</th>
                  <th>Grade</th>
                  <th>Status</th>
                  <th>Credits earned</th>
                </tr>
              </thead>
              <tbody>
                {courseHistory.map((row) => (
                  <tr key={row.history_id}>
                    <td>
                      <CourseCell course={catalog.get(row.course_id)} fallbackId={row.course_id} />
                    </td>
                    <td>{terms.get(row.term_id)?.term_name ?? `Term ${row.term_id}`}</td>
                    <td>{row.grade ?? "—"}</td>
                    <td>
                      <span className={`status-pill status-${row.status}`}>
                        {STATUS_LABELS[row.status] ?? row.status}
                      </span>
                    </td>
                    <td>{row.credits_earned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="courses-panel record-section">
        <div className="courses-panel-heading">
          <h2>Transfer &amp; AP credits</h2>
          <div className="record-heading-right">
            <span>{externals.length} records</span>
            {can(role, "editExternalCredits") && <PendingAction>Add credit</PendingAction>}
          </div>
        </div>
        {externals.length === 0 ? (
          <p className="courses-state courses-muted">No transfer or AP credit recorded.</p>
        ) : (
          <div className="courses-table-wrap">
            <table className="courses-table">
              <thead>
                <tr>
                  <th>Source / original course</th>
                  <th>Grade / score</th>
                  <th>Equivalent course</th>
                  <th>Original / awarded</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {externals.map((credit) => (
                  <tr key={credit.external_credit_id}>
                    <td>
                      <span className="courses-code">
                        {credit.credit_source?.toUpperCase()} · {credit.source_institution}
                      </span>
                      <span className="courses-title">{credit.original_course_or_exam}</span>
                    </td>
                    <td>{credit.exam_score ?? credit.original_grade ?? "—"}</td>
                    <td>
                      {credit.equivalent_course_id == null ? (
                        <span className="courses-muted">None (not used for prerequisites)</span>
                      ) : (
                        <CourseCell
                          course={catalog.get(credit.equivalent_course_id)}
                          fallbackId={credit.equivalent_course_id}
                        />
                      )}
                    </td>
                    <td>
                      {credit.original_credits ?? "N/A"}{" "}
                      / {credit.credits_awarded}
                    </td>
                    <td>
                      <span className={`status-pill status-${credit.approval_status}`}>
                        {credit.approval_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
