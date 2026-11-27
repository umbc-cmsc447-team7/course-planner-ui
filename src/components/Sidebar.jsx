import { NavLink, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Route,
  Bookmark,
  GitBranch,
  Users,
  UserCog,
  LogOut,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { ROLE_LABELS } from "../auth/permissions";

// Each role sees only its own screens.
const navigation = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/catalog", label: "Course catalog", icon: BookOpen },
  { to: "/record", label: "My academic record", icon: GitBranch, roles: ["student"] },
  { to: "/planner", label: "Degree planner", icon: Route, roles: ["student"], end: true },
  { to: "/saved", label: "Saved plans", icon: Bookmark, roles: ["student"] },
  { to: "/students", label: "Students", icon: Users, roles: ["counselor", "admin"] },
  { to: "/accounts", label: "All accounts", icon: UserCog, roles: ["admin"] },
];

export default function Sidebar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <NavLink
        to="/"
        className="sidebar-brand"
        aria-label="Course Planner home"
      >
        <span className="sidebar-brand-icon">
          <GraduationCap size={25} strokeWidth={1.7} aria-hidden="true" />
        </span>
        <span>
          <strong>Course Planner</strong>
          <span className="sidebar-brand-subtitle">Academic planning</span>
        </span>
      </NavLink>

      <p className="sidebar-section-label">WORKSPACE</p>

      <nav aria-label="Main navigation">
        {navigation
          .filter((item) => !item.roles || item.roles.includes(role))
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
      </nav>

      {user && (
        <div className="sidebar-user">
          <div>
            <strong>
              {user.first_name} {user.last_name}
            </strong>
            <span>{ROLE_LABELS[role] ?? role}</span>
          </div>
          <button
            type="button"
            className="sidebar-logout"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          >
            <LogOut size={16} aria-hidden="true" />
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}
