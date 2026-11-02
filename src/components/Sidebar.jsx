import { NavLink } from "react-router-dom";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Route,
  Bookmark,
  Sparkles,
} from "lucide-react";

const navigation = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/catalog", label: "Course catalog", icon: BookOpen },
  { to: "/planner", label: "Degree planner", icon: Route, upcoming: true },
  { to: "/saved", label: "Saved plans", icon: Bookmark, upcoming: true },
];

export default function Sidebar() {
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
        {navigation.map((item) => {
          const Icon = item.icon;

          const content = (
            <>
              <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
              <span>{item.label}</span>
              {item.upcoming && <span className="sidebar-soon">Soon</span>}
            </>
          );

          return item.upcoming ? (
            <span key={item.to} className="sidebar-nav-disabled">
              {content}
            </span>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {content}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <Sparkles size={18} aria-hidden="true" />
        <div>
          <strong>Start with curiosity.</strong>
          <p>Explore a course. Discover your next step.</p>
        </div>
      </div>
    </aside>
  );
}
