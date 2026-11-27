import { Link, useParams } from "react-router-dom";
import StudentRecord from "../components/StudentRecord";

export default function StudentDetail() {
  const { userId } = useParams();
  return (
    <section className="courses-page">
      <Link className="courses-back" to="/students">
        ← Back to students
      </Link>
      <StudentRecord userId={userId} />
    </section>
  );
}
