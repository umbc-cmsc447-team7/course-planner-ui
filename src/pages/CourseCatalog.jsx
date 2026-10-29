
import { useState } from "react";
import { Link } from "react-router-dom";
import { courses } from "../data/mockCourses";

export default function CourseCatalog() {
  const [search, setSearch] = useState("");

  const filteredCourses = courses.filter((course) => {
    const text = `${course.code} ${course.title}`;
    return text.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <h1>Course Catalog</h1>

      <input
        type="text"
        placeholder="Search courses..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table>
        <thead>
          <tr>
            <th>Course Code</th>
            <th>Title</th>
            <th>Credits</th>
            <th>Details</th>
          </tr>
        </thead>

        <tbody>
          {filteredCourses.map((course) => (
            <tr key={course.code}>
              <td>{course.code}</td>
              <td>{course.title}</td>
              <td>{course.credits}</td>
              <td>
                <Link to={`/catalog/${encodeURIComponent(course.code)}`}>
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredCourses.length === 0 && <p>No matching courses found.</p>}
    </div>
  );
}
