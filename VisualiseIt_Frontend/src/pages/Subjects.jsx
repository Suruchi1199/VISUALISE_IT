import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Binary, BookOpenText, FlaskConical, Globe2, HeartPulse, Orbit, Sigma } from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchClassById, fetchSubjectsByClass, fetchChaptersBySubject } from "../data/api.js";
import "../styles/subjects.css";

const ICONS = {
  physics: Orbit,
  chemistry: FlaskConical,
  biology: HeartPulse,
  mathematics: Sigma,
  "computer-science": Binary,
  geography: Globe2,
  science: FlaskConical,
  english: BookOpenText,
  "social-science": Globe2,
};

export default function Subjects() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { selectedClass, setSelectedClass, authenticatedFetch } = useAuth();
  const [currentClass, setCurrentClass] = useState(undefined);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (classId && selectedClass !== classId) {
      setSelectedClass(classId);
    }
  }, [classId, selectedClass, setSelectedClass]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const cls = await fetchClassById(classId, authenticatedFetch).catch(() => null);
        const subs = await fetchSubjectsByClass(classId, authenticatedFetch).catch(() => []);

        const enriched = await Promise.all(
          (Array.isArray(subs) ? subs : []).map(async (item) => {
            // Fetch chapters for this subject to get chapter count
            const chapters = await fetchChaptersBySubject(item.id, authenticatedFetch).catch(() => []);
            
            return {
              id: item.id,
              name: item.name || item.label || item.id,
              chapters: (Array.isArray(chapters) ? chapters.length : 0),
              progress: item.progress || 0,
              color: item.color || cls?.color || "#8f7ee8",
              blurb: item.blurb || item.description || "",
              topics: item.topics || [],
              resources: item.resources || [],
            };
          })
        );

        if (!mounted) return;
        setCurrentClass(cls);
        setSubjects(enriched);
      } catch (err) {
        console.warn("Error loading class/subjects:", err);
        if (mounted) {
          setCurrentClass(null);
          setSubjects([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (classId) load();
    return () => { mounted = false; };
  }, [classId, authenticatedFetch]);

  if (loading) {
    return <div className="class-grid"><div className="class-loading-card">Loading subjects…</div></div>;
  }

  if (!currentClass) {
    return <Navigate to="/classes" replace />;
  }

  return (
    <div>
      <div className="subject-page-top">
        <Link to="/classes" className="subject-back-link">
          <ArrowLeft size={15} /> Back to classes
        </Link>
      </div>

      <p className="eyebrow">Explore</p>
      <h1 className="page-title">{currentClass.label} subjects</h1>
      <p className="page-sub">
        Choose a subject for {currentClass.label} and open a cleaner, more focused study page for it.
      </p>

      <div className="class-summary-card card" style={{ "--class-color": currentClass.color }}>
        <div>
          <span className="badge">{currentClass.label}</span>
          <h3>{currentClass.focus}</h3>
          <p>{currentClass.description}</p>
        </div>
        <button type="button" className="btn" onClick={() => navigate("/classes")}>
          Change class
        </button>
      </div>

      <div className="subject-grid">
        {subjects.map((s) => {
          const Icon = ICONS[s.id] || BookOpenText;
          return (
            <button
              type="button"
              className="subject-card subject-card-button"
              key={s.id}
              style={{ "--subject-color": s.color }}
              onClick={() => navigate(`/classes/${classId}/${s.id}`)}
            >
              <div className="subject-card-glow" />
              <div className="subject-card-icon"><Icon size={20} /></div>
              <h3>{s.name}</h3>
              <p>{s.blurb}</p>
              <div className="topic-pill-row">
                {s.topics.slice(0, 3).map((topic) => (
                  <span key={topic} className="topic-pill">{topic}</span>
                ))}
              </div>
              <div className="subject-card-footer">
                <div className="bar"><div className="bar-fill" style={{ width: `${s.progress}%` }} /></div>
                <span>{s.chapters} chapters</span>
              </div>
              <div className="subject-card-link">
                <span>Open subject</span>
                <ArrowRight size={15} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}