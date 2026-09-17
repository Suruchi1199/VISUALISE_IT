import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchChapterQuiz, submitChapterQuiz } from "../data/api.js";
import "../styles/chapterdetail.css";

export default function ChapterQuiz() {
  const { classId, subjectId, chapterId } = useParams();
  const { authenticatedFetch } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchChapterQuiz(chapterId, authenticatedFetch).then(setQuiz).catch((err) => setError(err.message));
  }, [chapterId, authenticatedFetch]);

  const submit = async (event) => {
    event.preventDefault();
    if (!quiz || Object.keys(answers).length !== quiz.questions.length) {
      setError("Please answer every question before submitting.");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      setResult(await submitChapterQuiz(chapterId, answers, authenticatedFetch));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (error && !quiz) return <div className="chapter-detail error"><div className="error-message"><p>{error}</p><Link to={`/classes/${classId}/${subjectId}/${chapterId}`}>Back to chapter</Link></div></div>;
  if (!quiz) return <div className="chapter-detail loading"><p>Loading quiz...</p></div>;

  if (result) {
    return <div className="chapter-detail"><div className="quiz-result card">
      <p className="eyebrow">Chapter complete</p><h1>🎉 Quiz Completed!</h1>
      <p className="quiz-score">{result.score}/{result.totalQuestions} correct · {result.percentage}% · {result.passed ? "Passed" : "Keep practising"}</p>
      <div className="stat-row"><div className="stat-box"><div className="val">+{result.xpEarned}</div><div className="lbl">XP earned</div></div><div className="stat-box"><div className="val">{result.totalXp}</div><div className="lbl">Total XP</div></div></div>
      <p>{result.alreadyCompleted ? "This quiz was already completed, so your saved score and XP are shown." : "Your chapter progress has been saved."}</p>
      <div className="chapter-pagination"><button className="btn secondary" onClick={() => navigate(`/classes/${classId}/${subjectId}/${chapterId}`)}>Review chapter</button><button className="btn primary" onClick={() => navigate("/dashboard")}>View dashboard</button></div>
    </div></div>;
  }

  return <div className="chapter-detail"><div className="chapter-header"><Link to={`/classes/${classId}/${subjectId}/${chapterId}`} className="back-link">← Back to chapter</Link><div className="chapter-title-section"><h1>{quiz.title} Quiz</h1><p className="chapter-description">Answer all questions. Your score and XP are calculated securely when you submit.</p></div></div>
    <form className="quiz-form" onSubmit={submit}>{quiz.questions.map((question, index) => <fieldset className="quiz-question" key={question.id}><legend>{index + 1}. {question.question}</legend>{question.options.map((option) => <label key={option}><input type="radio" name={question.id} value={option} checked={answers[question.id] === option} onChange={() => setAnswers({ ...answers, [question.id]: option })} /> {option}</label>)}</fieldset>)}
      {error && <p className="quiz-error">{error}</p>}<button className="btn primary" type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit quiz"}</button>
    </form></div>;
}
