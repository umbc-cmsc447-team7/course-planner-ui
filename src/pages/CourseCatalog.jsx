
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
      <h2>Coming Soon</h2>
    </div>
  );
}
