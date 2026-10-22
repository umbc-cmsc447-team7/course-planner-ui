
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div>
      <h1>Plan Your Academic Journey</h1>
      <p>
        Search courses, explore prerequisites,
        and build your personalized degree plan.
      </p>

      <div className="dashboard-grid">
        <Link to="/catalog" className="dashboard-card">
          <h3>Browse Course Catalog</h3>
          <p>Search and view course details</p>
        </Link>

        <div className="dashboard-card">
          <h3>View Prerequisite Graph</h3>
          <p>Explore course relationships</p>
          <small>Coming soon</small>
        </div>

        <div className="dashboard-card">
          <h3>Build a Degree Plan</h3>
          <p>Generate your academic plan</p>
          <small>Coming soon</small>
        </div>

        <div className="dashboard-card">
          <h3>View Saved Plans</h3>
          <p>Access saved academic plans</p>
          <small>Coming soon</small>
        </div>
      </div>
    </div>
  );
}
