
import { Link, useParams } from "react-router-dom";
import { courses } from "../data/mockCourses";

export default function CourseDetails() {
  const { code } = useParams();

  const course = courses.find(
    (item) => item.code === code
  );

  if (!course) {
    return <h2>Course not found.</h2>;
  }

  return (
    <div>
      <Link to="/catalog">← Back to Catalog</Link>

      <h1>{course.code} — {course.title}</h1>

      <div className="details-box">
        <p><strong>Credits:</strong> {course.credits}</p>

        <p>
          <strong>Department:</strong> {course.department}
        </p>

        <p>
          <strong>Description:</strong> {course.description}
        </p>
      </div>

      <h3>Prerequisites</h3>

      {course.prerequisites.length === 0 ? (
        <p>No prerequisites listed.</p>
      ) : (
        <ul>
          {course.prerequisites.map((prereq) => (
            <li key={prereq}>
              <Link to={`/catalog/${encodeURIComponent(prereq)}`}>
                {prereq}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <h3>Terms Offered</h3>
      <ul>
        {course.terms.map((term) => (
          <li key={term}>{term}</li>
        ))}
      </ul>
    </div>
  );
}
