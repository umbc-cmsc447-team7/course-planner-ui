import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { deletePlan, listPlans } from "../api/planAPI";
import { getCatalogIndex } from "../api/courseAPI";
import { getTerms } from "../api/termAPI";
import { useAuth } from "../auth/AuthContext";
import "./Courses.css";
import "./Pages.css";

export default function SavedPlans() {
  const { studentProfile } = useAuth();
  const studentId = studentProfile?.student_id;
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState({ loading: true, error: "", plans: [] });

  useEffect(() => {
    let active = true;
    Promise.all([listPlans(studentId), getCatalogIndex(), getTerms()])
      .then(([plans, catalog, terms]) => {
        if (active) {
          setState({
            loading: false,
            error: "",
            plans,
            catalog,
            termName: new Map(terms.map((t) => [t.term_id, t.term_name])),
          });
        }
      })
      .catch((error) => active && setState({ loading: false, error: error.message, plans: [] }));
    return () => {
      active = false;
    };
  }, [studentId, retry]);

  async function remove(plan) {
    if (!window.confirm(`Delete “${plan.name}”? This can’t be undone.`)) return;
    try {
      await deletePlan(plan.plan_id);
      setRetry((v) => v + 1);
    } catch (error) {
      window.alert(error.message || "Unable to delete the plan.");
    }
  }

  const { loading, error, plans, catalog, termName } = state;

  return (
    <section className="courses-page">
      <header className="courses-heading">
        <div>
          <p className="courses-eyebrow">SAVED PLANS</p>
          <h1>Your plans</h1>
          <p>Open a plan to keep working on it, or start a new one.</p>
        </div>
        <Link className="dashboard-primary-link" to="/planner">
          <Plus size={18} aria-hidden="true" /> New plan
        </Link>
      </header>

      {loading ? (
        <div className="courses-panel courses-state" role="status">Loading plans…</div>
      ) : error ? (
        <div className="courses-panel courses-state" role="alert">
          <h2>We couldn’t load your plans</h2>
          <p>{error}</p>
          <button
            className="courses-button"
            onClick={() => {
              setState({ loading: true, error: "", plans: [] });
              setRetry((v) => v + 1);
            }}
          >
            Try again
          </button>
        </div>
      ) : plans.length === 0 ? (
        <div className="courses-panel courses-state">
          <h2>No saved plans yet</h2>
          <p>Build a plan in the degree planner and save it to see it here.</p>
        </div>
      ) : (
        <div className="saved-grid">
          {plans.map((plan) => {
            const ids = plan.terms.flatMap((t) => t.course_ids);
            const credits = ids.reduce((sum, id) => sum + (catalog.get(id)?.credits ?? 0), 0);
            const first = termName.get(plan.terms[0]?.term_id);
            const last = termName.get(plan.terms.at(-1)?.term_id);
            return (
              <article key={plan.plan_id} className="courses-panel saved-card">
                <h2>{plan.name}</h2>
                <p className="courses-muted">
                  {first ? (first === last ? first : `${first} – ${last}`) : "No terms"}
                </p>
                <dl className="saved-facts">
                  <div><dt>Terms</dt><dd>{plan.terms.length}</dd></div>
                  <div><dt>Courses</dt><dd>{ids.length}</dd></div>
                  <div><dt>Credits</dt><dd>{credits}</dd></div>
                </dl>
                <p className="courses-muted saved-updated">
                  Updated {new Date(plan.updated_at).toLocaleString()}
                </p>
                <div className="saved-actions">
                  <Link className="courses-button" to={`/planner/${plan.plan_id}`}>Open</Link>
                  <button className="courses-button secondary" onClick={() => remove(plan)}>Delete</button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
