import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import { AuthProvider } from "./auth/AuthContext";
import { RequireAuth, RequireRole } from "./auth/guards";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CourseCatalog from "./pages/CourseCatalog";
import CourseDetails from "./pages/CourseDetails";
import MyRecord from "./pages/MyRecord";
import StudentDirectory from "./pages/StudentDirectory";
import StudentDetail from "./pages/StudentDetail";
import Accounts from "./pages/Accounts";
import Planner from "./pages/Planner";
import SavedPlans from "./pages/SavedPlans";

import "./App.css";

function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

const STUDENT = ["student"];
const STAFF = ["counselor", "admin"];
const ADMIN = ["admin"];

// App routes must not reuse an API path that Vite/Vercel forward to Team B
// (/courses, /prereq-graph, /users, /historys, /auth, /plans, /terms).
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/catalog" element={<CourseCatalog />} />
            <Route path="/catalog/:code" element={<CourseDetails />} />

            <Route path="/record" element={<RequireRole roles={STUDENT}><MyRecord /></RequireRole>} />
            <Route path="/planner" element={<RequireRole roles={STUDENT}><Planner /></RequireRole>} />
            <Route path="/planner/:planId" element={<RequireRole roles={STUDENT}><Planner /></RequireRole>} />
            <Route path="/saved" element={<RequireRole roles={STUDENT}><SavedPlans /></RequireRole>} />

            <Route path="/students" element={<RequireRole roles={STAFF}><StudentDirectory /></RequireRole>} />
            <Route path="/students/:userId" element={<RequireRole roles={STAFF}><StudentDetail /></RequireRole>} />
            <Route path="/accounts" element={<RequireRole roles={ADMIN}><Accounts /></RequireRole>} />

            <Route path="*" element={<h2>Page not found.</h2>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
