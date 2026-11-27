import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, HelpCircle, Info } from "lucide-react";
import { getPrereqGraph } from "../api/courseAPI";
import { getStudentHistory } from "../api/userAPI";
import { existingCredit, summarizeRecord } from "../lib/grades";
import { checkPrereqs } from "../lib/prereqCheck";
import ReasonList from "./ReasonList";
import "../pages/Pages.css";

const NOTHING_PLANNED = new Set();

// "Can I take this course?" for the signed-in student: checks the course's
// prerequisite rules against their course history and approved transfer/AP
// credit, and explains anything that is not met.
export default function PrereqStatus({ courseId, studentId }) {
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState({ loading: true, error: "", result: null });

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [graph, history] = await Promise.all([
          getPrereqGraph(courseId),
          getStudentHistory(studentId),
        ]);
        const record = summarizeRecord(history.course_history, history.external_credits);
        // null means Team B's graph does not have this course (404), so its
        // prerequisites are unknown. A course with no prerequisites still
        // comes back as a graph, just without rules.
        const check = graph
          ? checkPrereqs(graph, courseId, {
              record,
              plannedBefore: NOTHING_PLANNED,
              plannedSame: NOTHING_PLANNED,
            })
          : null;
        if (active) {
          setState({
            loading: false,
            error: "",
            result: { check, credit: existingCredit(record, courseId) },
          });
        }
      } catch (error) {
        if (active) {
          setState({
            loading: false,
            error: error.message || "Unable to check prerequisites.",
            result: null,
          });
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [courseId, studentId, retry]);

  const { loading, error, result } = state;

  if (loading) {
    return (
      <section className="courses-panel prereq-status" role="status">
        <p className="courses-muted">Checking your prerequisites…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="courses-panel prereq-status" role="alert">
        <p className="courses-muted">We couldn’t check your prerequisites. {error}</p>
        <button
          className="courses-button secondary"
          onClick={() => {
            setState({ loading: true, error: "", result: null });
            setRetry((v) => v + 1);
          }}
        >
          Try again
        </button>
      </section>
    );
  }

  const { check, credit } = result;
  const tone = !check ? "unknown" : check.ok ? "ok" : "warn";
  const Icon = !check ? HelpCircle : check.ok ? CheckCircle2 : AlertTriangle;
  const title = !check
    ? "Prerequisite information isn’t available"
    : !check.hasPrereqs
      ? "No prerequisites"
      : check.ok
        ? "You meet the prerequisites"
        : "You don’t meet the prerequisites yet";

  return (
    <section className={`courses-panel prereq-status is-${tone}`} aria-labelledby="prereq-status-title">
      <div className="prereq-status-heading">
        <Icon size={22} aria-hidden="true" />
        <div>
          <p className="courses-eyebrow">YOUR PREREQUISITE STATUS</p>
          <h2 id="prereq-status-title">{title}</h2>
        </div>
      </div>

      {!check && (
        <p className="courses-muted">
          This course isn’t in the prerequisite data yet, so we can’t check it.
          Ask your counselor before registering.
        </p>
      )}

      {check && !check.ok && (
        <>
          <p className="courses-muted">Here’s what’s missing:</p>
          <ReasonList className="prereq-status-reasons" reasons={check.reasons} />
        </>
      )}

      {check?.ok && check.hasPrereqs && (
        <p className="courses-muted">
          Based on your completed courses, courses in progress, and approved transfer or AP credit.
        </p>
      )}

      {credit && (
        <p className="prereq-status-note">
          <Info size={16} aria-hidden="true" />
          You already have credit for this course: {credit}.
        </p>
      )}
    </section>
  );
}
