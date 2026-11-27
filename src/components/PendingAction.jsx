// A button for an action the user's role allows but Team B has no endpoint
// for yet. Shown disabled so the screen is complete; enable it when the
// write endpoint ships.
export default function PendingAction({ children }) {
  return (
    <button
      type="button"
      className="courses-button secondary pending-action"
      disabled
      title="Waiting on Team B’s write endpoint"
    >
      {children}
      <span>Coming soon</span>
    </button>
  );
}
