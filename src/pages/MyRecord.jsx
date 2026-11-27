import { useAuth } from "../auth/AuthContext";
import StudentRecord from "../components/StudentRecord";

export default function MyRecord() {
  const { user } = useAuth();
  return (
    <section className="courses-page">
      <StudentRecord userId={user.user_id} />
    </section>
  );
}
