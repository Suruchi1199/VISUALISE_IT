import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock3,
  Compass,
  Cpu,
  FlaskConical,
  Globe2,
  RotateCcw,
  Sparkles,
  Sigma,
  Target,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  fetchActivityCalendar,
  fetchClasses,
  fetchDashboard,
  fetchRecommendations,
  getLocalDateString,
  recordWebsiteVisit,
} from "../data/api.js";
import "../styles/dashboard.css";

const EMPTY_DASHBOARD = {
  totalXp: 0,
  completedChapters: 0,
  quizzesCompleted: 0,
  averageScore: 0,
  inProgressChapters: 0,
  weeklyStudyMinutes: 0,
  weeklyActivity: [],
  subjectProgress: [],
  recentActivity: [],
  recentCompletions: [],
};

function chapterPath(item) {
  return `/classes/${item.classId}/${item.subjectId}/${item.chapterId}`;
}

function formatStudyTime(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

function formatLastAccessed(value) {
  if (!value) return "Recently";
  const elapsed = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(elapsed) || elapsed < 0) return "Recently";
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

function MetricCard({ icon: Icon, label, value, caption }) {
  return (
    <article className="dashboard-metric">
      <div className="dashboard-metric-icon"><Icon size={18} aria-hidden="true" /></div>
      <div className="dashboard-metric-label">{label}</div>
      <strong className="dashboard-metric-value">{value}</strong>
      <span>{caption}</span>
    </article>
  );
}

function getSubjectIcon(name) {
  const normalized = name.toLowerCase();
  if (normalized.includes("math")) return Sigma;
  if (normalized.includes("science") || normalized.includes("physics")
      || normalized.includes("chemistry") || normalized.includes("biology")) return FlaskConical;
  if (normalized.includes("computer")) return Cpu;
  if (normalized.includes("social") || normalized.includes("geography")) return Globe2;
  return BookOpen;
}

function getRecommendationIcon(type) {
  if (type === "REVISE") return RotateCcw;
  if (type === "PRACTICE") return Target;
  if (type === "CONTINUE") return BookOpen;
  return Compass;
}

function DashboardLoading() {
  return (
    <div className="dashboard-state" role="status">
      <span className="dashboard-spinner" />
      <p>Gathering your learning progress…</p>
    </div>
  );
}

export default function Dashboard() {
  const { user, selectedClass, setSelectedClass, authenticatedFetch } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [calendarMonth, setCalendarMonth] = useState(() => getLocalDateString().slice(0, 7));
  const [activeDates, setActiveDates] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [calendarError, setCalendarError] = useState("");
  const [calendarReload, setCalendarReload] = useState(0);
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError] = useState("");
  const [classesReload, setClassesReload] = useState(0);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [recommendationsError, setRecommendationsError] = useState("");
  const [recommendationsReload, setRecommendationsReload] = useState(0);

  useEffect(() => {
    let mounted = true;
    setClassesLoading(true);
    setClassesError("");
    fetchClasses(authenticatedFetch)
      .then((result) => {
        if (mounted) {
          setClasses(result
            .filter((classItem) => Number(classItem.id) >= 6 && Number(classItem.id) <= 10)
            .sort((first, second) => Number(first.id) - Number(second.id)));
        }
      })
      .catch((err) => {
        if (mounted) setClassesError(err.message || "We couldn't load your classes.");
      })
      .finally(() => {
        if (mounted) setClassesLoading(false);
      });
    return () => { mounted = false; };
  }, [authenticatedFetch, classesReload]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    fetchDashboard(authenticatedFetch)
      .then((result) => {
        if (mounted) setDashboard({ ...EMPTY_DASHBOARD, ...result });
      })
      .catch((err) => {
        if (mounted) setError(err.message || "We couldn't load your learning progress.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [authenticatedFetch, reload]);

  useEffect(() => {
    let mounted = true;
    setCalendarLoading(true);
    setCalendarError("");
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const loadCalendar = async () => {
      if (calendarMonth === getLocalDateString().slice(0, 7)) {
        await recordWebsiteVisit(getLocalDateString(), authenticatedFetch);
      }
      return fetchActivityCalendar(calendarMonth, timeZone, authenticatedFetch);
    };
    loadCalendar()
      .then((result) => {
        if (mounted) setActiveDates(Array.isArray(result.activeDates) ? result.activeDates : []);
      })
      .catch((err) => {
        if (mounted) setCalendarError(err.message || "We couldn't load this month's activity.");
      })
      .finally(() => {
        if (mounted) setCalendarLoading(false);
      });
    return () => { mounted = false; };
  }, [authenticatedFetch, calendarMonth, calendarReload]);

  const unfinished = useMemo(
    () => (dashboard?.recentActivity || []).filter((item) => !item.completed),
    [dashboard],
  );
  const availableSubjects = dashboard?.subjectProgress || [];
  const activeClass = classes.find((classItem) => String(classItem.id) === String(selectedClass))
    || classes[0]
    || null;
  const recommendationClassId = activeClass?.id || selectedClass;

  useEffect(() => {
    if (classesLoading) return undefined;
    let mounted = true;
    setRecommendationsLoading(true);
    setRecommendationsError("");
    setRecommendations([]);
    fetchRecommendations(recommendationClassId, authenticatedFetch)
      .then((result) => {
        if (mounted) setRecommendations(result);
      })
      .catch((err) => {
        if (mounted) setRecommendationsError(err.message || "We couldn't load your recommendations.");
      })
      .finally(() => {
        if (mounted) setRecommendationsLoading(false);
      });
    return () => { mounted = false; };
  }, [authenticatedFetch, classesLoading, recommendationClassId, recommendationsReload]);

  const recommendationSubjects = activeClass
    ? availableSubjects.filter((subject) => String(subject.classId) === String(activeClass.id))
    : [];
  const lastUnfinished = unfinished[0];
  const nextSubject = recommendationSubjects.find((subject) => subject.nextChapterId);
  const resumeTarget = lastUnfinished || (nextSubject ? {
    chapterId: nextSubject.nextChapterId,
    chapterTitle: nextSubject.nextChapterTitle,
    subjectId: nextSubject.subjectId,
    classId: nextSubject.classId,
    subjectName: nextSubject.subjectName,
  } : null);
  const continueHref = resumeTarget ? chapterPath(resumeTarget) : "/classes";
  const continueSubject = dashboard?.subjectProgress?.find(
    (subject) => subject.subjectId === resumeTarget?.subjectId,
  );
  if (loading) return <DashboardLoading />;

  if (error) {
    return (
      <section className="dashboard-state dashboard-error" role="alert">
        <p className="eyebrow">Dashboard unavailable</p>
        <h1 className="page-title">We couldn’t load your progress.</h1>
        <p>{error}</p>
        <button className="btn primary" onClick={() => setReload((current) => current + 1)}>Try again</button>
      </section>
    );
  }

  const subjects = recommendationSubjects;
  const recentCompletions = dashboard.recentCompletions || [];
  const [calendarYear, calendarMonthNumber] = calendarMonth.split("-").map(Number);
  const monthStart = new Date(calendarYear, calendarMonthNumber - 1, 1);
  const daysInMonth = new Date(calendarYear, calendarMonthNumber, 0).getDate();
  const today = getLocalDateString();
  const monthDays = [
    ...Array(monthStart.getDay()).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => ({
      day: index + 1,
      date: getLocalDateString(new Date(calendarYear, calendarMonthNumber - 1, index + 1)),
    })),
  ];
  while (monthDays.length % 7) monthDays.push(null);
  const activeDateSet = new Set(activeDates);
  const currentMonth = today.slice(0, 7);
  const monthlyMonthLabel = new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(monthStart);
  const changeCalendarMonth = (offset) => {
    const nextMonth = new Date(calendarYear, calendarMonthNumber - 1 + offset, 1);
    setCalendarMonth(`${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`);
  };

  return (
    <main className="student-dashboard">
      <header className="dashboard-heading">
        <div>
          <p className="eyebrow">Student dashboard</p>
          <h1 className="page-title">Welcome back{user?.name ? `, ${user.name}` : ""}.</h1>
          <p className="page-sub">A clear view of your progress and what to learn next.</p>
        </div>
        <div className="dashboard-heading-actions">
          <span className="dashboard-xp"><Sparkles size={14} aria-hidden="true" /> {dashboard.totalXp} XP earned</span>
        </div>
      </header>

      <section className="dashboard-hero" aria-labelledby="continue-title">
        <div className="dashboard-hero-copy">
          <span className="dashboard-hero-kicker"><BookOpen size={15} aria-hidden="true" /> CONTINUE LEARNING</span>
          <h2 id="continue-title">{resumeTarget?.chapterTitle || "Your next learning win is waiting."}</h2>
          <p>
            {resumeTarget
              ? `${resumeTarget.subjectName || "Your subject"}${lastUnfinished ? ` · Last opened ${formatLastAccessed(lastUnfinished.lastAccessed)}` : ""}`
              : "Choose a class and find a topic to get started."}
          </p>
          {continueSubject && (
            <div className="dashboard-hero-progress" aria-label={`${continueSubject.progressPercentage}% subject progress`}>
              <div className="dashboard-progress-track">
                <span style={{ width: `${continueSubject.progressPercentage}%` }} />
              </div>
              <span>{continueSubject.progressPercentage}% subject progress</span>
            </div>
          )}
          <Link className="btn primary dashboard-continue" to={continueHref}>
            {lastUnfinished ? "Continue learning" : resumeTarget ? "Start learning" : "Explore classes"}
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <BookOpen className="dashboard-hero-mark" size={42} strokeWidth={1.5} aria-hidden="true" />
      </section>

      <section className="dashboard-metrics" aria-label="Learning overview">
        <MetricCard icon={CheckCircle2} label="Topics completed" value={dashboard.completedChapters} caption="Quiz-completed chapters" />
        <MetricCard icon={BookOpen} label="In progress" value={dashboard.inProgressChapters} caption="Topics you’ve opened" />
        <MetricCard icon={Target} label="Average quiz score" value={`${dashboard.averageScore}%`} caption={`${dashboard.quizzesCompleted} quizzes completed`} />
        <MetricCard icon={Clock3} label="Study time this week" value={formatStudyTime(dashboard.weeklyStudyMinutes)} caption="Time spent learning" />
      </section>

      <div className="dashboard-columns">
        <div className="dashboard-primary-column">
          <section className="dashboard-panel" aria-labelledby="subject-progress-title">
            <div className="dashboard-section-heading dashboard-subject-heading">
              <div>
                <p className="eyebrow">Your curriculum</p>
                <h2 id="subject-progress-title">Your subjects</h2>
              </div>
              {classes.length > 0 && (
                <div className="dashboard-class-selector" role="group" aria-label="Choose class">
                  {classes.map((classItem) => (
                    <button
                      type="button"
                      key={classItem.id}
                      className={String(activeClass?.id) === String(classItem.id) ? "active" : ""}
                      aria-pressed={String(activeClass?.id) === String(classItem.id)}
                      onClick={() => setSelectedClass(classItem.id)}
                    >
                      {classItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {classesLoading ? (
              <p className="dashboard-empty">Loading your classes…</p>
            ) : classesError ? (
              <div className="dashboard-empty" role="alert">
                <p>{classesError}</p>
                <button className="dashboard-inline-action" onClick={() => setClassesReload((value) => value + 1)}>Try again</button>
              </div>
            ) : !classes.length ? (
              <div className="dashboard-empty">
                <p>No classes from 6 to 10 are currently available.</p>
                <Link to="/classes">Browse classes <ArrowRight size={15} /></Link>
              </div>
            ) : subjects.length ? (
              <div className="dashboard-subject-grid">
                {subjects.map((subject) => {
                  const Icon = getSubjectIcon(subject.subjectName);
                  return (
                    <Link
                      className="dashboard-subject-card"
                      key={subject.subjectId}
                      to={`/classes/${subject.classId}/${subject.subjectId}`}
                    >
                      <div className="dashboard-subject-card-heading">
                        <span className="dashboard-subject-card-icon"><Icon size={19} aria-hidden="true" /></span>
                        <span className="dashboard-subject-card-arrow"><ArrowRight size={15} aria-hidden="true" /></span>
                      </div>
                      <strong className="dashboard-subject-card-title">{subject.subjectName}</strong>
                      <span className="dashboard-subject-card-class">{subject.className}</span>
                      <div className="dashboard-subject-card-count">
                        <span>{subject.completedChapters} of {subject.totalChapters} topics</span>
                        <span>{subject.progressPercentage}%</span>
                      </div>
                      <div className="dashboard-progress-track" role="progressbar" aria-label={`${subject.className} ${subject.subjectName} progress`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={subject.progressPercentage}>
                        <span style={{ width: `${subject.progressPercentage}%` }} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="dashboard-empty">
                <p>No subjects are available for {activeClass?.label || "this class"} yet.</p>
                <Link to={`/classes/${activeClass.id}`}>Open class <ArrowRight size={15} /></Link>
              </div>
            )}
          </section>

          <section className="dashboard-panel" aria-labelledby="recommendations-title">
            <div className="dashboard-section-heading">
              <div>
                <p className="eyebrow">Picked for you</p>
                <h2 id="recommendations-title">Your next recommendations</h2>
              </div>
              <Sparkles size={19} aria-hidden="true" />
            </div>
            {recommendationsLoading ? (
              <p className="dashboard-empty" role="status">Finding topics that fit your progress…</p>
            ) : recommendationsError ? (
              <div className="dashboard-empty" role="alert">
                <p>{recommendationsError}</p>
                <button
                  className="dashboard-inline-action"
                  onClick={() => setRecommendationsReload((value) => value + 1)}
                >
                  Try again
                </button>
              </div>
            ) : recommendations.length ? (
              <div className="dashboard-recommendations">
                {recommendations.map((recommendation) => {
                  const Icon = getRecommendationIcon(recommendation.type);
                  return (
                    <Link
                      className="dashboard-recommendation"
                      key={`${recommendation.topicId}-${recommendation.type}`}
                      to={recommendation.destination}
                    >
                      <span className="dashboard-recommendation-icon"><Icon size={18} aria-hidden="true" /></span>
                      <span className="dashboard-recommendation-copy">
                        <strong>{recommendation.title}</strong>
                        <span>{recommendation.reason}</span>
                        <span className="dashboard-recommendation-link">{recommendation.actionLabel} <ArrowRight size={14} /></span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="dashboard-empty">
                <p>No new topics to recommend just yet.</p>
                <Link to="/classes">Find a topic <ArrowRight size={15} /></Link>
              </div>
            )}
          </section>
        </div>

        <aside className="dashboard-secondary-column">
          <section className="dashboard-panel dashboard-calendar-panel" aria-labelledby="monthly-activity-title">
            <div className="dashboard-section-heading">
              <div>
                <p className="eyebrow">Your consistency</p>
                <h2 id="monthly-activity-title">Monthly activity</h2>
              </div>
              {!calendarLoading && !calendarError && (
                <span className="dashboard-activity-total">
                  {activeDates.length} active {activeDates.length === 1 ? "day" : "days"}
                </span>
              )}
            </div>
            <div className="dashboard-calendar">
              <div className="dashboard-calendar-header">
                <strong>{monthlyMonthLabel}</strong>
                <div className="dashboard-calendar-navigation">
                  <button
                    type="button"
                    aria-label="Previous month"
                    onClick={() => changeCalendarMonth(-1)}
                  >
                    <ChevronLeft size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next month"
                    disabled={calendarMonth >= currentMonth}
                    onClick={() => changeCalendarMonth(1)}
                  >
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
              {calendarLoading ? (
                <div className="dashboard-calendar-message" role="status">Loading activity…</div>
              ) : calendarError ? (
                <div className="dashboard-calendar-message dashboard-calendar-error" role="alert">
                  <span>{calendarError}</span>
                  <button type="button" onClick={() => setCalendarReload((value) => value + 1)}>Retry</button>
                </div>
              ) : (
                <>
                  <div className="dashboard-month-calendar" role="grid" aria-label={`Activity calendar for ${monthlyMonthLabel}`}>
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <span className="dashboard-month-weekday" role="columnheader" key={day}>{day}</span>
                    ))}
                    {monthDays.map((item, index) => {
                      if (!item) return <span className="dashboard-month-blank" role="gridcell" aria-hidden="true" key={`blank-${index}`} />;
                      const isActive = activeDateSet.has(item.date);
                      const isToday = item.date === today;
                      const dateLabel = new Intl.DateTimeFormat(undefined, { dateStyle: "full" })
                        .format(new Date(calendarYear, calendarMonthNumber - 1, item.day));
                      return (
                        <span
                          className={`dashboard-month-day${isActive ? " is-active" : ""}${isToday ? " is-today" : ""}`}
                          role="gridcell"
                          aria-label={`${dateLabel}${isActive ? ", activity recorded" : ", no activity"}${isToday ? ", today" : ""}`}
                          title={`${dateLabel}${isActive ? " · Activity recorded" : " · No activity"}${isToday ? " · Today" : ""}`}
                          key={item.date}
                        >
                          {isActive && <Check size={13} strokeWidth={3} aria-hidden="true" />}
                          <span>{item.day}</span>
                        </span>
                      );
                    })}
                  </div>
                  <div className="dashboard-calendar-legend" aria-label="Calendar legend">
                    <span><i className="legend-active"><Check size={10} strokeWidth={3} /></i> Activity</span>
                    <span><i className="legend-inactive" /> No activity</span>
                    <span><i className="legend-today" /> Today</span>
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="dashboard-panel" aria-labelledby="resume-title">
            <div className="dashboard-section-heading">
              <div>
                <p className="eyebrow">Pick up where you left off</p>
                <h2 id="resume-title">Recently accessed</h2>
              </div>
            </div>
            {unfinished.length ? (
              <ul className="dashboard-recent-list">
                {unfinished.slice(0, 5).map((item) => (
                  <li key={item.chapterId}>
                    <div className="dashboard-recent-icon"><BookOpen size={17} aria-hidden="true" /></div>
                    <div className="dashboard-recent-copy">
                      <strong>{item.chapterTitle}</strong>
                      <span>{item.subjectName} · {formatLastAccessed(item.lastAccessed)}</span>
                    </div>
                    <Link className="dashboard-resume-link" to={chapterPath(item)} aria-label={`Resume ${item.chapterTitle}`}>
                      <ArrowRight size={17} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="dashboard-empty">
                <p>No unfinished topics yet. Open a chapter and your recent learning will be saved here.</p>
                <Link to="/classes">Browse topics <ArrowRight size={15} /></Link>
              </div>
            )}
          </section>

          <section className="dashboard-panel" aria-labelledby="quiz-history-title">
            <div className="dashboard-section-heading">
              <div>
                <p className="eyebrow">Keep it going</p>
                <h2 id="quiz-history-title">Recent quiz results</h2>
              </div>
              <Target size={19} aria-hidden="true" />
            </div>
            {recentCompletions.length ? (
              <ul className="dashboard-quiz-list">
                {recentCompletions.slice(0, 5).map((item) => (
                  <li key={item.chapterId}>
                    <span className="dashboard-quiz-icon"><CheckCircle2 size={16} aria-hidden="true" /></span>
                    <span className="dashboard-quiz-copy">
                      <strong>{item.chapterTitle}</strong>
                      <span>{item.score}/{item.totalQuestions} correct · +{item.xpEarned} XP</span>
                    </span>
                    <span className="dashboard-quiz-score">
                      {item.totalQuestions ? Math.round((item.score / item.totalQuestions) * 100) : 0}%
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="dashboard-empty">Your completed quizzes and scores will appear here.</p>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}
