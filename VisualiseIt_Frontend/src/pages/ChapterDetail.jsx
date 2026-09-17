import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchChaptersBySubject, fetchChapterSections } from "../data/api";
import { getVisualizationComponent } from "../data/visualizationRegistry";
import "../styles/chapterdetail.css";

export default function ChapterDetail() {
  const { classId, subjectId, chapterId } = useParams();
  const { authenticatedFetch } = useAuth();
  const navigate = useNavigate();

  const [chapter, setChapter] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const storageKey = `chapter-page-${chapterId}`;
  const [currentPage, setCurrentPage] = useState(() => Number(sessionStorage.getItem(storageKey)) || 0);

  useEffect(() => {
    const loadChapterAndSections = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch chapters to find the selected one
        const chapters = await fetchChaptersBySubject(subjectId, authenticatedFetch);
        const selectedChapter = chapters.find(
          (c) => String(c.id) === String(chapterId)
        );

        if (!selectedChapter) {
          setError("Chapter not found");
          setLoading(false);
          return;
        }

        setChapter(selectedChapter);

        const chapterSections = await fetchChapterSections(chapterId, authenticatedFetch);
        setSections(chapterSections);
      } catch (err) {
        console.error("Error loading chapter details:", err);
        setError(err.message || "Failed to load chapter details");
      } finally {
        setLoading(false);
      }
    };

    loadChapterAndSections();
  }, [chapterId, subjectId, authenticatedFetch]);

  useEffect(() => {
    if (sections.length && currentPage >= sections.length) setCurrentPage(0);
  }, [sections.length, currentPage]);

  const changePage = (page) => {
    sessionStorage.setItem(storageKey, String(page));
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="chapter-detail loading">
        <p>Loading chapter...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chapter-detail error">
        <div className="error-message">
          <p>Error: {error}</p>
          <Link to={`/classes/${classId}/${subjectId}`}>← Back to subject</Link>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="chapter-detail not-found">
        <div className="error-message">
          <p>Chapter not found</p>
          <Link to={`/classes/${classId}/${subjectId}`}>← Back to subject</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="chapter-detail">
      <div className="chapter-header">
        <Link to={`/classes/${classId}/${subjectId}`} className="back-link">
          ← Back to subject
        </Link>
        <div className="chapter-title-section">
          <h1>Chapter {chapter.chapterNumber}: {chapter.title}</h1>
          {chapter.description && (
            <p className="chapter-description">{chapter.description}</p>
          )}
        </div>
      </div>

      <div className="chapter-content-wrapper">
        {sections.length === 0 ? (
          <div className="theory-placeholder"><p>No chapter content is available yet.</p></div>
        ) : (() => {
          const section = sections[currentPage];
          const Visualizer = section.visualizationId
            ? getVisualizationComponent(section.visualizationId)
            : null;

          return <>
            <section className="chapter-section" key={section.id}>
              <div className="theory-section">
                <h2>{section.heading}</h2>
                {section.summary && (
                  <div className="chapter-summary">
                    <strong>In simple words</strong>
                    <p>{section.summary}</p>
                  </div>
                )}
                <div className="section-content">{section.content}</div>
                {section.keyPoints.length > 0 && (
                  <div className="chapter-key-points">
                    <h3>Remember</h3>
                    <ul>
                      {section.keyPoints.map((point) => <li key={point}>{point}</li>)}
                    </ul>
                  </div>
                )}
              </div>
              {Visualizer && (
                <aside className="visualization-section" aria-label={`${section.heading} visualization`}>
                  <Visualizer data={section.visualizationData} />
                </aside>
              )}
            </section>
            <nav className="chapter-pagination" aria-label="Chapter sections">
              <button className="btn secondary" onClick={() => changePage(currentPage - 1)} disabled={currentPage === 0}>← Previous</button>
              <span>Section {currentPage + 1} of {sections.length}</span>
              {currentPage === sections.length - 1 ? (
                <button className="btn primary" onClick={() => navigate(`/classes/${classId}/${subjectId}/${chapterId}/quiz`)}>Take Quiz →</button>
              ) : <button className="btn primary" onClick={() => changePage(currentPage + 1)}>Next →</button>}
            </nav>
          </>;
        })()}
      </div>
    </div>
  );
}
