import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  GitBranch,
  Route,
  Bookmark,
  GraduationCap,
  Users,
  UserCog,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";

const features = [
  {
    title: "Course catalog",
    description:
      "Find courses, explore descriptions, and review prerequisite requirements.",
    icon: BookOpen,
    to: "/catalog",
    label: "Explore courses",
  },
  {
    title: "My academic record",
    description: "See your academic history and progress.",
    icon: GitBranch,
    to: "/record",
    label: "View record",
    roles: ["student"],
  },
  {
    title: "Degree planner",
    description:
      "Organize your courses into a plan that supports your academic goals.",
    icon: Route,
    to: "/planner",
    label: "Start a plan",
    roles: ["student"],
  },
  {
    title: "Saved plans",
    description:
      "Keep your academic plans together and return to them when you need.",
    icon: Bookmark,
    to: "/saved",
    label: "Open saved plans",
    roles: ["student"],
  },
  {
    title: "Students",
    description:
      "Look up a student’s profile, course history and transfer or AP credit.",
    icon: Users,
    to: "/students",
    label: "Open directory",
    roles: ["counselor", "admin"],
  },
  {
    title: "All accounts",
    description: "Review every user account and its role.",
    icon: UserCog,
    to: "/accounts",
    label: "Manage accounts",
    roles: ["admin"],
  },
];

export default function Dashboard() {
  const { user, role } = useAuth();
  const visible = features.filter(
    (feature) => !feature.roles || feature.roles.includes(role)
  );

  return (
    <div className="dashboard-page">
      <header className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <p className="dashboard-eyebrow">
            WELCOME BACK, {user?.first_name?.toUpperCase()}
          </p>
          <h1>A clearer path to your degree.</h1>
          <p>
            Explore your options, understand the requirements, and take the next
            step toward your goals.
          </p>

          <Link to="/catalog" className="dashboard-primary-link">
            Browse the catalog
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>

        <div className="dashboard-hero-art" aria-hidden="true">
          <GraduationCap size={72} strokeWidth={1.3} />
        </div>
      </header>

      <section aria-labelledby="dashboard-tools-title">
        <div className="dashboard-section-heading">
          <div>
            <h2 id="dashboard-tools-title">Your planning toolkit</h2>
            <p>Everything you need to explore what comes next.</p>
          </div>
        </div>

        <div className="dashboard-grid">
          {visible.map((feature) => {
            const Icon = feature.icon;

            const content = (
              <>
                <div className="dashboard-card-top">
                  <span className="dashboard-icon">
                    <Icon size={24} strokeWidth={1.7} aria-hidden="true" />
                  </span>

                  {!feature.to && (
                    <span className="dashboard-status">Coming soon</span>
                  )}
                </div>

                <h3>{feature.title}</h3>
                <p>{feature.description}</p>

                {feature.to && (
                  <span className="dashboard-card-action">
                    {feature.label}
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </span>
                )}
              </>
            );

            return feature.to ? (
              <Link
                key={feature.title}
                to={feature.to}
                className="dashboard-card dashboard-card-ready"
              >
                {content}
              </Link>
            ) : (
              <article key={feature.title} className="dashboard-card">
                {content}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
