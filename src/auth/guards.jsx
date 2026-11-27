import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

// Sends signed-out visitors to /login and brings them back afterwards.
export function RequireAuth({ children }) {
  const { session, signedOut } = useAuth();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" replace state={signedOut ? undefined : { from: location }} />;
  }
  return children;
}

// Shows the page only to the listed roles.
export function RequireRole({ roles, children }) {
  const { role } = useAuth();

  if (!roles.includes(role)) {
    return (
      <section className="courses-page">
        <div className="courses-panel courses-state" role="alert">
          <h2>You don’t have access to this page</h2>
          <p>This page is for {roles.join(" and ")} accounts.</p>
        </div>
      </section>
    );
  }
  return children;
}
