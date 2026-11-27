import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Plus, Trash2, X } from "lucide-react";
import { getCatalogIndex, getCourses, getPrereqGraph } from "../api/courseAPI";
import { getPlanningTerms } from "../api/termAPI";
import { getStudentHistory } from "../api/userAPI";
import { createPlan, getPlan, updatePlan } from "../api/planAPI";
import { MOCK } from "../api/config";
import { useAuth } from "../auth/AuthContext";
import { existingCredit, summarizeRecord } from "../lib/grades";
import { checkPrereqs } from "../lib/prereqCheck";
import "./Courses.css";
import "./Pages.css";

function emptyPlan(terms) {
  return {
    name: "My degree plan",
    terms: terms
      .filter((t) => !/summer/i.test(t.term_name))
      .slice(0, 2)
      .map((t) => ({ term_id: t.term_id, course_ids: [] })),
  };
}

export default function Planner() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { studentProfile } = useAuth();
  const studentId = studentProfile?.student_id;

  const [base, setBase] = useState({ loading: true, error: "" });
  const [plan, setPlan] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [graphs, setGraphs] = useState(new Map());
  const requestedGraphs = useRef(new Set());

  const [search, setSearch] = useState("");
  const [results, setResults] = useState({ courses: [], count: 0 });
  const [targetTerm, setTargetTerm] = useState("");
  const [newTerm, setNewTerm] = useState("");

  // Catalog, planning terms, the student's record, and the plan itself.
  useEffect(() => {
    let active = true;

    async function load() {
      setBase({ loading: true, error: "" });
      try {
        const [catalog, terms, history, saved] = await Promise.all([
          getCatalogIndex(),
          getPlanningTerms(),
          getStudentHistory(studentId),
          planId ? getPlan(planId) : null,
        ]);
        if (!active) return;

        if (planId && (!saved || saved.student_id !== studentId)) {
          setBase({ loading: false, error: "This plan does not exist." });
          return;
        }

        setBase({
          loading: false,
          error: "",
          catalog,
          terms,
          termIndex: new Map(terms.map((t, i) => [t.term_id, i])),
          record: summarizeRecord(history.course_history, history.external_credits),
        });
        setPlan(saved ? { name: saved.name, terms: saved.terms } : emptyPlan(terms));
        setTargetTerm("");
        setNewTerm("");
        setDirty(false);
      } catch (error) {
        if (active) setBase({ loading: false, error: error.message || "Unable to load the planner." });
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [planId, studentId]);

  // Course search (reuses the cached catalog).
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      getCourses(search, 0)
        .then((found) => active && setResults(found))
        .catch(() => active && setResults({ courses: [], count: 0 }));
    }, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search]);

  const plannedIds = useMemo(
    () => new Set(plan?.terms.flatMap((t) => t.course_ids) ?? []),
    [plan]
  );

  // Fetch the prerequisite graph for every planned course once.
  useEffect(() => {
    for (const id of plannedIds) {
      if (requestedGraphs.current.has(id)) continue;
      requestedGraphs.current.add(id);
      getPrereqGraph(id)
        .catch(() => "error")
        .then((graph) => setGraphs((current) => new Map(current).set(id, graph ?? null)));
    }
  }, [plannedIds]);

  function change(updater) {
    setPlan((current) => updater(current));
    setDirty(true);
    setNotice("");
  }

  function sortTerms(terms) {
    return [...terms].sort(
      (a, b) => (base.termIndex.get(a.term_id) ?? 999) - (base.termIndex.get(b.term_id) ?? 999)
    );
  }

  function addCourse(courseId) {
    // Fall back to the first term if the selected one is not in this plan.
    const selected = Number(targetTerm);
    const termId = plan.terms.some((t) => t.term_id === selected)
      ? selected
      : plan.terms[0]?.term_id;
    if (!termId) {
      setNotice("Add a term to the plan first.");
      return;
    }
    if (plannedIds.has(courseId)) {
      setNotice("That course is already in this plan.");
      return;
    }
    change((current) => ({
      ...current,
      terms: current.terms.map((t) =>
        t.term_id === termId ? { ...t, course_ids: [...t.course_ids, courseId] } : t
      ),
    }));
  }

  function removeCourse(termId, courseId) {
    change((current) => ({
      ...current,
      terms: current.terms.map((t) =>
        t.term_id === termId
          ? { ...t, course_ids: t.course_ids.filter((id) => id !== courseId) }
          : t
      ),
    }));
  }

  function moveCourse(fromTermId, toTermId, courseId) {
    change((current) => ({
      ...current,
      terms: current.terms.map((t) => {
        if (t.term_id === fromTermId) return { ...t, course_ids: t.course_ids.filter((id) => id !== courseId) };
        if (t.term_id === toTermId) return { ...t, course_ids: [...t.course_ids, courseId] };
        return t;
      }),
    }));
  }

  function addTerm() {
    const termId = Number(newTerm);
    if (!termId) return;
    change((current) => ({
      ...current,
      terms: sortTerms([...current.terms, { term_id: termId, course_ids: [] }]),
    }));
    setNewTerm("");
  }

  function removeTerm(termId) {
    const term = plan.terms.find((t) => t.term_id === termId);
    if (term.course_ids.length && !window.confirm("Remove this term and its courses from the plan?")) {
      return;
    }
    change((current) => ({
      ...current,
      terms: current.terms.filter((t) => t.term_id !== termId),
    }));
    if (Number(targetTerm) === termId) setTargetTerm("");
  }

  async function save() {
    if (!plan.name.trim()) {
      setNotice("Give the plan a name before saving.");
      return;
    }
    setSaving(true);
    try {
      const body = { student_id: studentId, name: plan.name, terms: plan.terms };
      if (planId) {
        await updatePlan(planId, body);
      } else {
        const created = await createPlan(body);
        navigate(`/planner/${created.plan_id}`, { replace: true });
      }
      setDirty(false);
      setNotice("Plan saved.");
    } catch (error) {
      setNotice(error.message || "Unable to save the plan.");
    } finally {
      setSaving(false);
    }
  }

  if (!studentId) {
    return (
      <section className="courses-page">
        <div className="courses-panel courses-state">
          <h2>No student profile</h2>
          <p>Plans are saved to a student profile, and this account does not have one.</p>
        </div>
      </section>
    );
  }

  if (base.loading) {
    return (
      <section className="courses-page">
        <div className="courses-panel courses-state" role="status">Loading planner…</div>
      </section>
    );
  }

  if (base.error) {
    return (
      <section className="courses-page">
        <Link className="courses-back" to="/saved">← Back to saved plans</Link>
        <div className="courses-panel courses-state" role="alert">
          <h2>We couldn’t open this plan</h2>
          <p>{base.error}</p>
        </div>
      </section>
    );
  }

  const { catalog, terms, record } = base;
  const termName = new Map(terms.map((t) => [t.term_id, t.term_name]));
  const unusedTerms = terms.filter((t) => !plan.terms.some((p) => p.term_id === t.term_id));
  const totalCredits = plan.terms
    .flatMap((t) => t.course_ids)
    .reduce((sum, id) => sum + (catalog.get(id)?.credits ?? 0), 0);

  // Courses planned in earlier terms, for each term (assumed passed).
  const beforeTerm = plan.terms.map((_, index) =>
    new Set(plan.terms.slice(0, index).flatMap((t) => t.course_ids))
  );

  return (
    <section className="courses-page">
      <header className="courses-heading">
        <div>
          <p className="courses-eyebrow">DEGREE PLANNER</p>
          <label className="courses-sr-only" htmlFor="plan-name">Plan name</label>
          <input
            id="plan-name"
            className="plan-name-input"
            value={plan.name}
            onChange={(event) => change((current) => ({ ...current, name: event.target.value }))}
          />
          <p>
            {plan.terms.length} terms · {plannedIds.size} courses · {totalCredits} credits
            {MOCK.plans && " · saved in this browser until Team B’s /plans endpoint is live"}
          </p>
        </div>
        <div className="planner-save">
          {notice && <span role="status">{notice}</span>}
          {dirty && !notice && <span>Unsaved changes</span>}
          <button className="courses-button" onClick={save} disabled={saving || (!dirty && !!planId)}>
            {saving ? "Saving…" : planId ? "Save changes" : "Save plan"}
          </button>
        </div>
      </header>

      <div className="planner-layout">
        <div className="planner-terms">
          {plan.terms.map((term, termIndex) => {
            const before = beforeTerm[termIndex];
            const credits = term.course_ids.reduce((s, id) => s + (catalog.get(id)?.credits ?? 0), 0);

            return (
              <section key={term.term_id} className="courses-panel planner-term">
                <div className="planner-term-heading">
                  <h2>{termName.get(term.term_id) ?? `Term ${term.term_id}`}</h2>
                  <span>{credits} credits</span>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Remove ${termName.get(term.term_id)}`}
                    onClick={() => removeTerm(term.term_id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {term.course_ids.length === 0 ? (
                  <p className="courses-muted planner-empty">No courses yet. Add some from the list on the right.</p>
                ) : (
                  <ul className="planner-courses">
                    {term.course_ids.map((id) => {
                      const course = catalog.get(id);
                      const graph = graphs.get(id);
                      const same = new Set(term.course_ids.filter((other) => other !== id));
                      const check =
                        graph === undefined
                          ? null
                          : graph === "error"
                            ? "error"
                            : checkPrereqs(graph, id, { record, plannedBefore: before, plannedSame: same });
                      const credit = existingCredit(record, id);

                      return (
                        <li key={id} className="planner-course">
                          <div className="planner-course-main">
                            <Link
                              className="courses-code"
                              to={`/catalog/${encodeURIComponent(course?.course_identifier ?? "")}`}
                            >
                              {course?.course_identifier ?? `Course ${id}`}
                            </Link>
                            <span className="courses-title">{course?.course_title}</span>
                            <span className="courses-muted planner-credits">{course?.credits ?? "?"} cr</span>

                            {check === null ? (
                              <span className="prereq-badge">Checking prerequisites…</span>
                            ) : check === "error" ? (
                              <span className="prereq-badge">Couldn’t check prerequisites</span>
                            ) : check.ok ? (
                              <span className="prereq-badge ok">
                                <CheckCircle2 size={14} aria-hidden="true" />
                                {check.hasPrereqs ? "Prerequisites met" : "No prerequisites"}
                              </span>
                            ) : (
                              <span className="prereq-badge warn">
                                <AlertTriangle size={14} aria-hidden="true" />
                                Prerequisites not met
                              </span>
                            )}
                            {credit && (
                              <span className="prereq-badge warn">Already have credit: {credit}</span>
                            )}

                            {check && check !== "error" && !check.ok && (
                              <ul className="prereq-reasons">
                                {check.reasons.map((reason) => (
                                  <li key={reason}>{reason}</li>
                                ))}
                              </ul>
                            )}
                          </div>

                          <div className="planner-course-actions">
                            <label className="courses-sr-only" htmlFor={`move-${id}`}>Move to term</label>
                            <select
                              id={`move-${id}`}
                              value={term.term_id}
                              onChange={(event) => moveCourse(term.term_id, Number(event.target.value), id)}
                            >
                              {plan.terms.map((t) => (
                                <option key={t.term_id} value={t.term_id}>
                                  {termName.get(t.term_id)}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              className="icon-button"
                              aria-label={`Remove ${course?.course_identifier ?? id}`}
                              onClick={() => removeCourse(term.term_id, id)}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}

          {unusedTerms.length > 0 && (
            <div className="planner-add-term">
              <label className="courses-sr-only" htmlFor="add-term">Term to add</label>
              <select id="add-term" value={newTerm} onChange={(event) => setNewTerm(event.target.value)}>
                <option value="">Choose a term…</option>
                {unusedTerms.map((t) => (
                  <option key={t.term_id} value={t.term_id}>{t.term_name}</option>
                ))}
              </select>
              <button className="courses-button secondary" onClick={addTerm} disabled={!newTerm}>
                <Plus size={16} aria-hidden="true" /> Add term
              </button>
            </div>
          )}
        </div>

        <aside className="courses-panel planner-search">
          <h2>Add courses</h2>
          <label htmlFor="planner-search">Search the catalog</label>
          <input
            id="planner-search"
            type="search"
            placeholder="Course code or title"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <label htmlFor="planner-target">Add to</label>
          <select
            id="planner-target"
            value={
              plan.terms.some((t) => t.term_id === Number(targetTerm))
                ? targetTerm
                : plan.terms[0]?.term_id ?? ""
            }
            onChange={(event) => setTargetTerm(event.target.value)}
            disabled={plan.terms.length === 0}
          >
            {plan.terms.map((t) => (
              <option key={t.term_id} value={t.term_id}>{termName.get(t.term_id)}</option>
            ))}
          </select>

          <p className="courses-muted planner-result-count">
            {results.count} matches{results.count > results.courses.length && `, showing ${results.courses.length}`}
          </p>
          <ul className="planner-results">
            {results.courses.map((course) => {
              const inPlan = plannedIds.has(course.course_id);
              return (
                <li key={course.course_id}>
                  <div>
                    <span className="courses-code">{course.course_identifier}</span>
                    <span className="courses-title">{course.course_title}</span>
                  </div>
                  <button
                    type="button"
                    className="courses-button secondary"
                    onClick={() => addCourse(course.course_id)}
                    disabled={inPlan || plan.terms.length === 0}
                    aria-label={`Add ${course.course_identifier}`}
                  >
                    {inPlan ? "Added" : "Add"}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </section>
  );
}
