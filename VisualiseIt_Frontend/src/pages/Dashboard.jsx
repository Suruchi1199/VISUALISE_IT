import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import {
  BADGES,  CONTINUE_LEARNING, TODAYS_GOAL, WEEKLY_PROGRESS, STATS,
} from "../data/mockData.js";
import { fetchClassById, fetchSubjectsByClass } from "../data/api.js";
import { useEffect, useState } from "react";
import "../styles/dashboard.css";
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function GoalRing({ done, target }) {
  const pct = Math.min(done / target, 1);
  const r = 34, c = 2 * Math.PI * r;
  return (
    <div className="goal-ring-wrap">
      <svg width="84" height="84">
        <circle cx="42" cy="42" r={r} stroke="#253352" strokeWidth="7" fill="none" />
        <circle
          cx="42" cy="42" r={r} stroke="#e8a33d" strokeWidth="7" fill="none"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round"
        />
      </svg>
      <div className="goal-ring-label">{Math.round(pct * 100)}%</div>
    </div>
  );
}//CLASSES

export default function Dashboard() {
  const { user, selectedClass, setSelectedClass, authenticatedFetch } = useAuth();
  const navigate = useNavigate();
  const maxWeek = Math.max(...WEEKLY_PROGRESS);
  const [activeClass, setActiveClass] = useState(null);
  const [classSubjects, setClassSubjects] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function loadActive() {
      try {
        const cls = await fetchClassById(selectedClass, authenticatedFetch) || await fetchClassById(CONTINUE_LEARNING.classId, authenticatedFetch);
        if (!mounted) return;
        setActiveClass(cls);
        const subs = await fetchSubjectsByClass(cls?.id, authenticatedFetch);
        if (!mounted) return;
        setClassSubjects((subs || []).slice(0, 5));
      } catch (e) {
        if (!mounted) return;
        setActiveClass(null);
        setClassSubjects([]);
      }
    }

    loadActive();
    return () => { mounted = false; };
  }, [selectedClass, authenticatedFetch]);
  const focusSubject = classSubjects[0] || {};
  const activeClassLabel = activeClass?.label || "Study path";
  const activeClassDescription = activeClass?.description || "";
  const activeClassId = activeClass?.id;
  const recentConcepts = classSubjects.slice(0, 3).map((subject) => ({
    title: subject.nextLesson || "No next lesson available",
    subject: subject.name || "Subject",
    when: `${activeClassLabel} plan`,
  }));
  const roadmapSubjects = classSubjects.slice(0, 3);

  const handleGraphPlotting = () => {
    navigate("/graphplotting");
  };

  const handleOpenClass = () => {
    if (!activeClass) {
      return;
    }

    setSelectedClass(activeClass.id);
    navigate(`/classes/${activeClass.id}`);
  };

  return (
    <div>
      <p className="eyebrow">Dashboard</p>
      <h1 className="page-title">Welcome back{user?.name ? `, ${user.name}` : ""}.</h1>
      <p className="page-sub">Here's where you left off, and what's worth exploring next.</p>

      <div className="dash-grid">
        <div className="dash-col">
          {/* Continue Learning */}
          <div className="continue-card">
            <div className="continue-orb" />
            <span className="badge">{activeClassLabel}</span>
            <h3>{activeClassId && focusSubject?.id ? focusSubject?.name || "Subject not available" : "Choose a class and personalize your learning path."}</h3>
            <p>
              {activeClassId && focusSubject?.id
                ? `Pick up with ${focusSubject?.nextLesson ? focusSubject.nextLesson.toLowerCase() : "your next lesson"} and continue where ${activeClassLabel} left off.`
                : "Start with a class selection so your subjects, study flow, and next steps feel more focused."}
            </p>
            <div className="continue-progress-row">
              <div className="bar"><div className="bar-fill" style={{ width: `${CONTINUE_LEARNING.progress}%` }} /></div>
              <span>{CONTINUE_LEARNING.progress}%</span>
            </div>
            <button
              className="btn primary"
              onClick={activeClassId && focusSubject?.id ? () => navigate(`/classes/${activeClassId}/${focusSubject.id}`) : () => navigate("/classes")}
            >
              {activeClassId && focusSubject?.id ? "Continue learning" : "Choose class"}
            </button>
          </div>

          {activeClass && (
            <div className="card">
              <p className="section-title">Current class</p>
              <div className="visualization-options class-focus-panel">
                <div className="viz-option">
                  <h4>{activeClass.label}</h4>
                  <p>{activeClass.description}</p>
                  <div className="dashboard-chip-row">
                    {classSubjects.map((subject) => (
                      <span key={subject.id} className="dashboard-chip">{subject.name}</span>
                    ))}
                  </div>
                  <div className="dashboard-action-row">
                    <button className="btn" onClick={handleOpenClass}>
                      View class subjects
                    </button>
                    <button className="btn secondary" onClick={handleGraphPlotting}>
                      Open Graph Plotter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="card list-card">
            <p className="section-title">Next concepts</p>
            <ul>
              {recentConcepts.map((c, i) => (
                <li className="list-row" key={i}>
                  <div className="list-row-main">
                    <span className="list-row-title">{c.title}</span>
                    <span className="list-row-sub">{c.subject} · {c.when}</span>
                  </div>
                  <span className="list-row-tag">Planned</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <p className="section-title">Class roadmap</p>
            <div className="recommend-grid">
              {activeClass && roadmapSubjects.map((subject) => (
                <div className="recommend-card" key={subject.id}>
                  <span className="list-row-tag">{activeClass.label}</span>
                  <h4>{subject.name}</h4>
                  <p>{subject.objective}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dash-col">
          {/* XP / coins / streak */}
          <div className="card">
            <p className="section-title">Your stats</p>
            <div className="stat-row">
              <div className="stat-box"><div className="val">{STATS.xp}</div><div className="lbl">XP</div></div>
              <div className="stat-box"><div className="val">{STATS.coins}</div><div className="lbl">Coins</div></div>
              <div className="stat-box"><div className="val">{STATS.streak}</div><div className="lbl">Streak</div></div>
            </div>
          </div>

          {/* Today's goal */}
          <div className="card goal-card">
            <GoalRing done={TODAYS_GOAL.doneMinutes} target={TODAYS_GOAL.targetMinutes} />
            <div className="goal-meta">
              <p className="section-title" style={{ marginBottom: 2 }}>Today's goal</p>
              <p>{TODAYS_GOAL.doneMinutes} / {TODAYS_GOAL.targetMinutes} minutes learned</p>
            </div>
          </div>

          {/* Weekly progress (pure CSS bar chart) */}
          <div className="card">
            <p className="section-title">This week</p>
            <div className="week-bars">
              {WEEKLY_PROGRESS.map((m, i) => (
                <div className="week-bar" key={i}>
                  <div className="fill" style={{ height: `${(m / maxWeek) * 100}%` }} />
                  <span className="day">{DAYS[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="card">
            <p className="section-title">Badges</p>
            <div className="badge-row">
              {BADGES.map((b) => (
                <div className={"badge-chip" + (b.earned ? " earned" : "")} key={b.id}>
                  <div className="ring">🏅</div>
                  <span className="label">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
