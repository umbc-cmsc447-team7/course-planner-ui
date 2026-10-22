
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>UMBC Course Planner</h2>

      <nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/catalog">Course Catalog</NavLink>
        <NavLink to="/planner">Degree Planner</NavLink>
        <NavLink to="/saved">Saved Plans</NavLink>
      </nav>
    </aside>
  );
}
