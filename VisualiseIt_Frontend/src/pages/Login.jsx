import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Rocket } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/auth.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters.";
    return e;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setErrors((prev) => ({ ...prev, general: err.message }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-brand">
        <div className="auth-brand-mark">
          <div className="dot"><Rocket size={17} /></div>
          EduVision
        </div>
        <div className="auth-brand-copy">
          <h2>Concepts you can rotate, zoom, and rebuild.</h2>
          <p>
            Gravity, atoms, the beating heart, sorting algorithms — EduVision turns the
            textbook page into something you can reach into and take apart.
          </p>
        </div>
        <div className="auth-orbit-deco" />
      </div>

      <div className="auth-form-side">
        <form className="auth-form-card" onSubmit={onSubmit} noValidate>
          <p className="eyebrow">Welcome back</p>
          <h1>Log in to your account</h1>
          <p className="page-sub">Pick up right where you left off.</p>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email" type="email" placeholder="you@school.edu" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password" type="password" placeholder="••••••••" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="auth-forgot">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <button className="btn primary block" type="submit" disabled={submitting}>
            {submitting ? "Logging in…" : "Log in"}
          </button>
          {errors.general && <div className="field-error" style={{ marginTop: 10 }}>{errors.general}</div>}

          <p className="auth-switch">
            New to EduVision? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
