import { useEffect, useState } from "react";
import {
  ArrowRight, BookOpenText, Compass, Mail, Rocket, Sparkles, UserRound, X
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ProfileMenu from "../components/ProfileMenu.jsx";
import { useAuth } from "../context/AuthContext.jsx";

import "../styles/home.css";

const VALUE_POINTS = [
  {
    icon: Sparkles,
    title: "Interactive understanding",
    description: "Turn abstract chapters into guided visuals that feel clear, calm, and approachable.",
  },
  {
    icon: BookOpenText,
    title: "Structured for real study",
    description: "Move from class selection to subjects to practice without losing momentum or context.",
  },
  {
    icon: Compass,
    title: "Built for confidence",
    description: "The experience stays encouraging, professional, and focused on steady progress.",
  },
];

export default function Home() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [authMode, setAuthMode] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });

  useEffect(() => {
    const auth = searchParams.get("auth");
    if ((auth === "signin" || auth === "signup") && !user) {
      setAuthMode(auth);
      return;
    }

    setAuthMode(null);
  }, [searchParams, user]);

  const openAuth = (mode) => {
    setErrors({});
    setForm({ name: "", email: "", password: "", confirm: "" });
    setSearchParams({ auth: mode });
  };

  const closeAuth = () => {
    setErrors({});
    setSearchParams({}, { replace: true });
  };

  const validate = () => {
    const nextErrors = {};

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (form.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (authMode === "signup") {
      if (form.name.trim().length < 2) {
        nextErrors.name = "Enter your full name.";
      }

      if (form.confirm !== form.password) {
        nextErrors.confirm = "Passwords don't match.";
      }
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      if (authMode === "signup") {
        await register(form);
      } else {
        await login(form);
      }

      closeAuth();
      navigate("/", { replace: true });
    } catch (err) {
      setErrors((prev) => ({ ...prev, general: err.message }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="home-page" id="home">
      <header className="landing-header">
        <div className="landing-nav">
          <Link to="/" className="landing-brand">
            <div className="landing-brand-mark"><Rocket size={16} /></div>
            <span>EduVision</span>
          </Link>

          <nav className="landing-links" aria-label="Primary">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>

          <div className="landing-actions">
            {user ? (
              <ProfileMenu user={user} />
            ) : (
              <>
                <button type="button" className="btn ghost landing-auth-btn" onClick={() => openAuth("signin")}>
                  Sign in
                </button>
                <button type="button" className="btn primary" onClick={() => openAuth("signup")}>
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </header>
//CLASSES
      <main className="landing-main">
        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow">Learn with clarity</p>
            <h1>Visual learning that feels focused, modern, and full of possibility.</h1>
            <p className="hero-sub">
              EduVision helps students understand difficult ideas through class-based subject journeys,
              guided exploration, and a study experience designed to feel optimistic from the first click.
            </p>

            <div className="hero-actions">
              {user ? (
                <>
                  <Link to="/dashboard" className="btn primary">
                    Go to dashboard <ArrowRight size={16} />
                  </Link>
                  <Link to="/classes" className="btn">
                    Choose class
                  </Link>
                </>
              ) : (
                <>
                  <button type="button" className="btn primary" onClick={() => openAuth("signup")}>
                    Start learning <ArrowRight size={16} />
                  </button>
                  <button type="button" className="btn" onClick={() => openAuth("signin")}>
                    Sign in
                  </button>
                </>
              )}
            </div>

            <div className="hero-metrics">
              <div className="hero-metric">
                <span className="hero-metric-value">5</span>
                <span className="hero-metric-label">class levels</span>
              </div>
              <div className="hero-metric">
                <span className="hero-metric-value">6+</span>
                <span className="hero-metric-label">subject tracks</span>
              </div>
              <div className="hero-metric">
                <span className="hero-metric-value">1</span>
                <span className="hero-metric-label">clear starting flow</span>
              </div>
            </div>
          </div>

          <div className="hero-panel card">
            <div className="hero-panel-glow" />
            <div className="hero-panel-top">
              <span className="badge">Student-ready</span>
              <span className="hero-status">Guided learning path</span>
            </div>
            <h2>Make every topic feel easier to begin.</h2>
            <p>
              Choose a class first, open the subjects for that level, and then move into focused study pages.
            </p>

            <div className="hero-subject-preview">
              {/* {CLASSES.map((classItem) => (
                <div key={classItem.id} className="hero-subject-chip">
                  <span className="hero-subject-dot" style={{ background: classItem.color }} />
                  <span>{classItem.label}</span>
                </div>
              ))} */}
            </div>

            <div className="hero-panel-note">
              <UserRound size={16} />
              <span>{user ? `Welcome back, ${user.name}.` : "Create your account and continue from Home."}</span>
            </div>
          </div>
        </section>

        <section className="value-section" id="about">
          <div className="section-heading">
            <p className="eyebrow">About</p>
            <h2 className="page-title">A professional first impression with a learner-first mindset.</h2>
            <p className="page-sub">
              The platform keeps the interface calm and structured while still feeling encouraging for new users.
            </p>
          </div>

          <div className="value-grid">
            {VALUE_POINTS.map(({ icon: Icon, title, description }) => (
              <article key={title} className="card value-card">
                <div className="value-icon"><Icon size={18} /></div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="card contact-card">
            <div>
              <p className="eyebrow">Contact</p>
              <h2 className="page-title">Stay connected with the learning journey.</h2>
              <p className="page-sub">
                Reach out for support, feedback, or collaboration ideas as the platform grows.
              </p>
            </div>

            <div className="contact-actions">
              <a href="mailto:support@eduvision.app" className="btn">
                <Mail size={16} />
                support@eduvision.app
              </a>
              {!user && (
                <button type="button" className="btn primary" onClick={() => openAuth("signup")}>
                  Join now
                </button>
              )}
            </div>
          </div>
        </section>
      </main>

      {authMode && !user && (
        <div className="auth-modal-backdrop" role="presentation" onClick={closeAuth}>
          <div className="auth-modal-card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="auth-modal-close" onClick={closeAuth} aria-label="Close authentication form">
              <X size={18} />
            </button>

            <div className="auth-modal-tabs">
              <button
                type="button"
                className={"auth-modal-tab" + (authMode === "signin" ? " active" : "")}
                onClick={() => openAuth("signin")}
              >
                Sign in
              </button>
              <button
                type="button"
                className={"auth-modal-tab" + (authMode === "signup" ? " active" : "")}
                onClick={() => openAuth("signup")}
              >
                Sign up
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <p className="eyebrow">{authMode === "signup" ? "Create account" : "Welcome back"}</p>
              <h2 className="auth-modal-title">
                {authMode === "signup" ? "Start your learning journey." : "Continue learning from Home."}
              </h2>
              <p className="page-sub auth-modal-sub">
                {authMode === "signup"
                  ? "Register once and explore the platform with a steady, optimistic flow."
                  : "Sign in and keep exploring without leaving the landing page."}
              </p>

              {authMode === "signup" && (
                <div className="field">
                  <label htmlFor="name">Full name</label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Ada Lovelace"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                  />
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>
              )}

              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@school.edu"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                />
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              {authMode === "signup" && (
                <div className="field">
                  <label htmlFor="confirm">Confirm password</label>
                  <input
                    id="confirm"
                    type="password"
                    placeholder="••••••••"
                    value={form.confirm}
                    onChange={(event) => setForm({ ...form, confirm: event.target.value })}
                  />
                  {errors.confirm && <span className="field-error">{errors.confirm}</span>}
                </div>
              )}

              <button className="btn primary block" type="submit" disabled={submitting}>
                {submitting
                  ? authMode === "signup" ? "Creating account…" : "Signing in…"
                  : authMode === "signup" ? "Create account" : "Sign in"}
              </button>
              {errors.general && <div className="field-error" style={{ marginTop: 10 }}>{errors.general}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
