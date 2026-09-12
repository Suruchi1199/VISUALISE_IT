import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Layers3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchSubjectsByClass } from "../data/api.js";
import "../styles/subjects.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

export default function Classes() {
  const navigate = useNavigate();
  const {user, authenticatedFetch, logout, updateUserProfile, selectedClass, setSelectedClass, getToken } = useAuth();
  const [classes, setClasses] = useState([]);
  const [subjectsMap, setSubjectsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();

    const loadClasses = async () => {
      setLoading(true);
      setError("");

      try {
        const token = getToken();
        const res = await fetch(`${API_URL}/api/classes`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        
        if (!res.ok) {
          console.log(res);
          throw new Error("Could not fetch classes from the backend.");
        }

        const data = await res.json();
         console.log(res);
        if (!Array.isArray(data)) {
          throw new Error("Invalid response from classes API.");
        }

        const mapped = data.map((item) => {
          const classId = String(item.id ?? item.gradeLevel);

          return {
            id: classId,
            label: item.label || item.name || `Class ${classId}`,
            description: item.description || "",
            focus: item.focus || "",
            highlight: item.highlight || "",
            color: item.color || "#8f7ee8",
          };
        });

        setClasses(mapped);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load classes.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
    return () => controller.abort();
  }, [authenticatedFetch]);

  // Load subjects summary for displayed classes (to show subject counts and chips)
  useEffect(() => {
    let mounted = true;
    async function loadSubjectsMap() {
      try {
        const pairs = await Promise.all(
          classes.map(async (c) => {
            try {
              const subs = await fetchSubjectsByClass(c.id, authenticatedFetch);
              return [c.id, subs];
            } catch (e) {
              return [c.id, []];
            }
          }),
        );
        if (!mounted) return;
        const map = Object.fromEntries(pairs);
        setSubjectsMap(map);
      } catch (e) {
        if (!mounted) return;
        setSubjectsMap({});
      }
    }

    if (classes.length) loadSubjectsMap();
    return () => { mounted = false; };
  }, [classes, authenticatedFetch]);

  const handleChooseClass = (classId) => {
    setSelectedClass(classId);
    navigate(`/classes/${classId}`);
  };

  return (
    <div>
      <p className="eyebrow">Explore</p>
      <h1 className="page-title">Choose your class</h1>
      <p className="page-sub">
        Start with a class from 6th to 10th, then move into the subjects designed for that level.
      </p>

      {error && <p className="page-sub" style={{ color: "#d9534f" }}>{error}</p>}

      {loading ? (
        <div className="class-grid">
          <div className="class-loading-card">Loading classes…</div>
        </div>
      ) : (
        <div className="class-grid">
          {classes.map((classItem) => {
            const subjects = subjectsMap[classItem.id] || [];
            const isActive = selectedClass === classItem.id;

            return (
              <article
                key={classItem.id}
                className={"class-card" + (isActive ? " active" : "")}
                style={{ "--class-color": classItem.color }}
              >
                <div className="subject-card-glow" />
                <div className="class-card-head">
                  <span className="badge">{classItem.label}</span>
                  {isActive && (
                    <span className="class-active-tag">
                      <CheckCircle2 size={14} /> Selected
                    </span>
                  )}
                </div>

                <h3>{classItem.focus}</h3>
                <p>{classItem.description}</p>

                <div className="class-meta-row">
                  <span>
                    <Layers3 size={15} /> {subjects.length} subjects
                  </span>
                  <span>{classItem.highlight}</span>
                </div>

                <div className="class-chip-row">
                  {subjects.slice(0, 4).map((subject) => (
                    <span key={subject.id} className="class-chip">
                      {subject.name}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn primary class-card-btn"
                  onClick={() => handleChooseClass(classItem.id)}
                >
                  {isActive ? "Open selected class" : "Choose class"} <ArrowRight size={16} />
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
