import { ONE_OF_PREFIX, OR_SEPARATOR } from "../lib/prereqCheck";

// Unmet-prerequisite reasons from checkPrereqs. "Needs one of" reasons are
// shown with each option on its own line.
export default function ReasonList({ reasons, className }) {
  return (
    <ul className={className}>
      {reasons.map((reason) =>
        reason.startsWith(ONE_OF_PREFIX) ? (
          <li key={reason}>
            Needs one of:
            <ul className="reason-options">
              {reason
                .slice(ONE_OF_PREFIX.length)
                .split(OR_SEPARATOR)
                .map((option) => (
                  <li key={option}>{option}</li>
                ))}
            </ul>
          </li>
        ) : (
          <li key={reason}>{reason}</li>
        )
      )}
    </ul>
  );
}
