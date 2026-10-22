
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import CourseCatalog from "./pages/CourseCatalog";
import CourseDetails from "./pages/CourseDetails";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/catalog" element={<CourseCatalog />} />
            <Route
              path="/catalog/:code"
              element={<CourseDetails />}
            />
            <Route path="*" element={<h2>Page coming soon.</h2>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
