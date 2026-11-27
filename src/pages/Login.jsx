import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { DEMO_ACCOUNTS, MOCK } from "../api/config";
import "./Pages.css";

export default function Login() {
  const { session, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const destination = location.state?.from?.pathname ?? "/";

  if (session) return <Navigate to={destination} replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err.status === 401
          ? "Email or password is incorrect."
          : err.message || "Unable to sign in."
      );
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <span className="sidebar-brand-icon">
            <GraduationCap size={25} strokeWidth={1.7} aria-hidden="true" />
          </span>
          <div>
            <strong>Course Planner</strong>
            <span>Sign in to continue</span>
          </div>
        </div>

        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button className="courses-button login-submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>

        {MOCK.auth && (
          <div className="login-demo">
            <p>
              <strong>Demo mode.</strong> Team B’s login endpoint isn’t live yet,
              so the password isn’t checked. Pick a mock account:
            </p>
            <div className="login-demo-list">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  className="chip-button"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword("demo");
                  }}
                >
                  {account.label}
                  <span>{account.role}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </main>
  );
}
