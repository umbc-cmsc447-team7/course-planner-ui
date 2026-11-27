import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUsers } from "../api/userAPI";
import { ROLE_LABELS } from "../auth/permissions";
import PendingAction from "../components/PendingAction";
import "./Pages.css";

// Admins only: every user account. Account creation, email changes, role
// assignment and deletion are out of scope this sprint (Team A's notes).
export default function Accounts() {
  const [state, setState] = useState({ loading: true, error: "", accounts: [] });

  useEffect(() => {
    let active = true;
    getUsers()
      .then((accounts) => active && setState({ loading: false, error: "", accounts }))
      .catch((error) => active && setState({ loading: false, error: error.message, accounts: [] }));
    return () => {
      active = false;
    };
  }, []);

  const { loading, error, accounts } = state;

  return (
    <section className="courses-page">
      <header className="courses-heading">
        <div>
          <p className="courses-eyebrow">ADMIN</p>
          <h1>All accounts</h1>
          <p>Every user in the system. Admins can edit names; roles and emails are managed by Team A.</p>
        </div>
      </header>

      <div className="courses-panel">
        {loading ? (
          <div className="courses-state" role="status">Loading accounts…</div>
        ) : error ? (
          <div className="courses-state" role="alert">
            <h2>We couldn’t load accounts</h2>
            <p>{error}</p>
          </div>
        ) : (
          <div className="courses-table-wrap">
            <table className="courses-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Student profile</th>
                  <th><span className="courses-sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {accounts.map(({ user, student_profile: profile }) => (
                  <tr key={user.user_id}>
                    <td>
                      <span className="courses-title">
                        {user.first_name} {user.last_name}
                      </span>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`status-pill role-${user.role}`}>
                        {ROLE_LABELS[user.role] ?? user.role}
                      </span>
                    </td>
                    <td>
                      {profile ? (
                        <Link className="courses-detail-link" to={`/students/${user.user_id}`}>
                          {profile.student_number ?? "View"} →
                        </Link>
                      ) : (
                        <span className="courses-muted">—</span>
                      )}
                    </td>
                    <td>
                      <PendingAction>Edit name</PendingAction>
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
