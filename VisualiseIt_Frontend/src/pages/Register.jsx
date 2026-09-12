import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Rocket } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/auth.css";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters.";
    if (form.confirm !== form.password) e.confirm = "Passwords don't match.";
    return e;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    try {
      await register(form);
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
          <h2>Six subjects. One playground.</h2>
          <p>
            Physics, chemistry, biology, math, computer science, and geography —
            each with interactive models you control, not just watch.
          </p>
        </div>
        <div className="auth-orbit-deco" />
      </div>

      <div className="auth-form-side">
        <form className="auth-form-card" onSubmit={onSubmit} noValidate>
          <p className="eyebrow">Get started</p>
          <h1>Create your account</h1>
          <p className="page-sub">Free to join — start with any subject.</p>

          <div className="field">
            <label htmlFor="name">Full name</label>
            <input
              id="name" type="text" placeholder="Ada Lovelace" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

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

          <div className="field">
            <label htmlFor="confirm">Confirm password</label>
            <input
              id="confirm" type="password" placeholder="••••••••" value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            />
            {errors.confirm && <span className="field-error">{errors.confirm}</span>}
          </div>

          <button className="btn primary block" type="submit" disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </button>
          {errors.general && <div className="field-error" style={{ marginTop: 10 }}>{errors.general}</div>}

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
