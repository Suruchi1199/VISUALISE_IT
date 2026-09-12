import {
  ArrowLeft, ArrowRight, Binary, BookOpenText, FlaskConical, Globe2, HeartPulse, Orbit, Sigma, Sparkles, Target
} from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { fetchClassById, fetchSubject, fetchSubjectsByClass, fetchChaptersBySubject } from "../data/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useEffect, useState } from "react";
import "../styles/subjects.css";

export function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const ICONS = {
  mathematics: Sigma,
  science: FlaskConical,
  physics: Orbit,
  chemistry: FlaskConical,
  biology: HeartPulse,
  geography: Globe2,
  "computer-science": Binary,
  english: BookOpenText,
  "social-science": Globe2,
};

export default function SubjectDetail() {
  const { classId, subjectId } = useParams();
  const { authenticatedFetch } = useAuth();
  const [currentClass, setCurrentClass] = useState(null);
  const [subject, setSubject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [relatedSubjects, setRelatedSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        console.log("Loading subject details for:", { classId, subjectId });
        const cls = await fetchClassById(classId, authenticatedFetch);
        const allSubs = await fetchSubjectsByClass(classId, authenticatedFetch);
        console.log("All subjects:", allSubs.map(s => ({ id: s.id, name: s.name })));
        
        const subj = allSubs.find((s) => String(s.id) === String(subjectId));
        console.log("Found subject:", subj);
        
        if (!mounted) return;
        
        if (!cls) {
          setError("Class not found");
          setCurrentClass(null);
          setSubject(null);
          return;
        }
        
        if (!subj) {
          setError(`Subject ${subjectId} not found in class ${classId}`);
          setCurrentClass(cls);
          setSubject(null);
          return;
        }
        
        setCurrentClass(cls);
        setSubject(subj);
        setRelatedSubjects((allSubs || []).filter((item) => String(item.id) !== String(subjectId)).slice(0, 3));

        // Fetch chapters for this subject
        if (subj?.id) {
          const chaps = await fetchChaptersBySubject(subj.id, authenticatedFetch);
          if (mounted) setChapters(chaps || []);
        }
      } catch (e) {
        console.error("Error loading subject details:", e);
        if (!mounted) return;
        setError(e.message || "Failed to load subject details");
        setCurrentClass(null);
        setSubject(null);
        setChapters([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [classId, subjectId, authenticatedFetch]);

  if (loading) {
    return <div className="class-grid"><div className="class-loading-card">Loading subject details…</div></div>;
  }

  if (error || !currentClass || !subject) {
    console.log("Redirecting due to:", { error, hasClass: !!currentClass, hasSubject: !!subject });
    return <Navigate to="/classes" replace />;
  }

  const Icon = ICONS[subject.id] || BookOpenText;
  const topics = subject.topics || [];
  const resources = subject.resources || [];

  return (
    <div>
      <div className="subject-page-top">
        <Link to={`/classes/${classId}`} className="subject-back-link">
          <ArrowLeft size={15} /> Back to {currentClass.label}
        </Link>
      </div>

      <div className="subject-detail-hero card" style={{ "--subject-color": subject.color }}>
        <div className="subject-card-glow" />
        <div className="subject-detail-head">
          <div className="subject-card-icon"><Icon size={20} /></div>
          <div>
            <p className="eyebrow">{currentClass.label}</p>
            <h1 className="page-title">{subject.name}</h1>
          </div>
        </div>
        <p className="page-sub">{subject.blurb}</p>

        <div className="detail-stat-row">
          <div className="detail-stat-card">
            <span className="detail-stat-label">Progress</span>
            <strong>{subject.progress ?? "0"}%</strong>
          </div>
          <div className="detail-stat-card">
            <span className="detail-stat-label">Chapters</span>
            <strong>{chapters.length}</strong>
          </div>
          <div className="detail-stat-card">
            <span className="detail-stat-label">Next lesson</span>
            <strong>{subject.nextLesson || "Not available"}</strong>
          </div>
        </div>
      </div>

      <div className="subject-detail-grid">
        <section className="card">
          <p className="section-title">Learning objective</p>
          <div className="detail-callout">
            <Target size={18} />
            <p>{subject.objective || "No objective available"}</p>
          </div>

          {chapters.length > 0 && (
            <>
              <p className="section-title" style={{ marginTop: 22 }}>Chapters</p>
              <div className="detail-topic-list">
                {chapters.map((chapter) => (
                  <Link
                    key={chapter.id}
                    to={`/classes/${classId}/${subject.id}/${chapter.id}`}
                    className="detail-topic-item detail-topic-link"
                  >
                    <Sparkles size={15} />
                    <div>
                      <span>{chapter.chapterNumber}. {chapter.title}</span>
                      {chapter.description && (
                        <p style={{ fontSize: "0.85rem", color: "#666", marginTop: "4px" }}>
                          {chapter.description.substring(0, 100)}
                          {chapter.description.length > 100 ? "..." : ""}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {topics.length > 0 && (
            <>
              <p className="section-title" style={{ marginTop: 22 }}>Core topics</p>
              <div className="detail-topic-list">
                {topics.map((topic) => (
                  <Link
                    key={topic}
                    to={`/classes/${classId}/${subject.id}/${slugify(topic)}`}
                    className="detail-topic-item detail-topic-link"
                  >
                    <Sparkles size={15} />
                    <span>{topic}</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="card">
          <p className="section-title">Study resources</p>
          {resources.length > 0 ? (
            <div className="resource-chip-list">
              {resources.map((resource) => (
                <span key={resource} className="resource-chip">{resource}</span>
              ))}
            </div>
          ) : (
            <p style={{ color: "#666" }}>No resources available yet</p>
          )}

          {subject.id === "mathematics" && (
            <div className="subject-action-card">
              <p>Use the graph plotting tool when you want to test equations visually.</p>
              <Link to="/graphplotting" className="btn primary">
                Open graph plotter <ArrowRight size={16} />
              </Link>
            </div>
          )}

          <div className="subject-action-card">
            <p>Continue exploring the rest of the subjects in {currentClass.label}.</p>
            <Link to={`/classes/${classId}`} className="btn">
              View class subjects
            </Link>
          </div>
        </section>

        <section className="card">
          <p className="section-title">Related subjects</p>
          {relatedSubjects.length > 0 ? (
            <div className="related-subject-list">
              {relatedSubjects.map((item) => (
                <Link
                  key={item.id}
                  to={`/classes/${classId}/${item.id}`}
                  className="related-subject-item"
                  style={{ "--subject-color": item.color }}
                >
                  <span>{item.name}</span>
                  <ArrowRight size={15} />
                </Link>
              ))}
            </div>
          ) : (
            <p style={{ color: "#666" }}>No related subjects available</p>
          )}
        </section>
      </div>
    </div>
  );
}
