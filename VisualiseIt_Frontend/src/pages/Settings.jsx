import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Bell, Eye, Lock, Trash2, User } from "lucide-react";
import "../styles/settings.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

export default function Settings() {
  const { user, authenticatedFetch, logout, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Profile settings state
  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });

  // Study preferences state
  const [preferences, setPreferences] = useState({
    dailyGoal: 30,
    theme: "light",
    notifications: true,
    emailNotifications: true,
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch user settings on mount
  useEffect(() => {
    if (user) {
      fetchUserSettings();
    }
  }, [user]);

  // API: Get user settings
  const fetchUserSettings = async () => {
    try {
      setLoading(true);
      const res = await authenticatedFetch(`${API_URL}/api/user/settings`);

      if (!res.ok) {
        throw new Error("Failed to fetch settings");
      }

      const data = await res.json();
      setProfile({
        name: data.name || user.name || "",
        email: data.email || user.email || "",
      });
      setPreferences({
        dailyGoal: data.dailyGoal || 30,
        theme: data.theme || "light",
        notifications: data.notifications !== false,
        emailNotifications: data.emailNotifications !== false,
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching settings:", err);
      // Set fallback values from user context
      setProfile({
        name: user.name || "",
        email: user.email || "",
      });
      setLoading(false);
    }
  };

  // API: Update profile settings
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await authenticatedFetch(`${API_URL}/api/user/profile`, {
        method: "PUT",
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed to update profile" }));
        throw new Error(err.message || "Failed to update profile");
      }

      // Update user state in context and localStorage
      updateUserProfile({
        name: profile.name,
        email: profile.email,
      });

      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);

    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // API: Update study preferences
  const handleUpdatePreferences = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await authenticatedFetch(`${API_URL}/api/user/preferences`, {
        method: "PUT",
        body: JSON.stringify({
          dailyGoal: preferences.dailyGoal,
          theme: preferences.theme,
          notifications: preferences.notifications,
          emailNotifications: preferences.emailNotifications,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed to update preferences" }));
        throw new Error(err.message || "Failed to update preferences");
      }

      setSuccess("Preferences saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update preferences");
    } finally {
      setSaving(false);
    }
  };

  // API: Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords don't match");
      setSaving(false);
      return;
    }

    try {
      const res = await authenticatedFetch(`${API_URL}/api/user/change-password`, {
        method: "POST",
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed to change password" }));
        throw new Error(err.message || "Failed to change password");
      }

      setSuccess("Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  // API: Delete account
  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure? This action cannot be undone.")) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await authenticatedFetch(`${API_URL}/api/user/account`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed to delete account" }));
        throw new Error(err.message || "Failed to delete account");
      }

      setSuccess("Account deleted. Logging out...");
      setTimeout(() => {
        logout();
        window.location.href = "/";
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to delete account");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <p className="eyebrow">Settings</p>
        <h1 className="page-title">Manage your learning profile.</h1>
        <p style={{ textAlign: "center", color: "var(--text-dim)" }}>Loading settings...</p>
      </div>
    );
  }

  return (
    <div>
      <p className="eyebrow">Settings</p>
      <h1 className="page-title">Manage your learning profile.</h1>
      <p className="page-sub">Update your account settings, preferences, and security options.</p>

      {error && <div className="alert alert-error" style={{ marginBottom: 24 }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: 24 }}>{success}</div>}

      {/* Profile Section */}
      <section className="settings-section card">
        <div className="settings-section-header">
          <User size={20} />
          <h2>Profile Information</h2>
        </div>
        <form onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Your name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              placeholder="your.email@example.com"
            />
          </div>
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </section>

      {/* Study Preferences Section */}
      <section className="settings-section card">
        <div className="settings-section-header">
          <Eye size={20} />
          <h2>Study Preferences</h2>
        </div>
        <form onSubmit={handleUpdatePreferences}>
          <div className="form-group">
            <label htmlFor="dailyGoal">Daily Study Goal (minutes)</label>
            <input
              id="dailyGoal"
              type="number"
              min="10"
              max="360"
              step="5"
              value={preferences.dailyGoal}
              onChange={(e) => setPreferences({ ...preferences, dailyGoal: parseInt(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="theme">Theme</label>
            <select
              id="theme"
              value={preferences.theme}
              onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          <div className="form-group checkbox">
            <input
              id="notifications"
              type="checkbox"
              checked={preferences.notifications}
              onChange={(e) => setPreferences({ ...preferences, notifications: e.target.checked })}
            />
            <label htmlFor="notifications">Enable in-app notifications</label>
          </div>
          <div className="form-group checkbox">
            <input
              id="emailNotifications"
              type="checkbox"
              checked={preferences.emailNotifications}
              onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
            />
            <label htmlFor="emailNotifications">Send email notifications</label>
          </div>
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </form>
      </section>

      {/* Notifications Section */}
      <section className="settings-section card">
        <div className="settings-section-header">
          <Bell size={20} />
          <h2>Notifications</h2>
        </div>
        <p style={{ color: "var(--text-dim)", marginBottom: 16 }}>
          Manage how you receive notifications from EduVision.
        </p>
        <div className="form-group checkbox">
          <input id="pushNotif" type="checkbox" defaultChecked />
          <label htmlFor="pushNotif">Push notifications for new lessons</label>
        </div>
        <div className="form-group checkbox">
          <input id="goalReminder" type="checkbox" defaultChecked />
          <label htmlFor="goalReminder">Daily study goal reminders</label>
        </div>
        <div className="form-group checkbox">
          <input id="achievementNotif" type="checkbox" defaultChecked />
          <label htmlFor="achievementNotif">Achievement and milestone notifications</label>
        </div>
      </section>

      {/* Security Section */}
      <section className="settings-section card">
        <div className="settings-section-header">
          <Lock size={20} />
          <h2>Security</h2>
        </div>
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              placeholder="Enter current password"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="Enter new password"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
              required
            />
          </div>
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? "Updating..." : "Change Password"}
          </button>
        </form>
      </section>

      {/* Danger Zone */}
      <section className="settings-section card danger-zone">
        <div className="settings-section-header">
          <Trash2 size={20} />
          <h2>Danger Zone</h2>
        </div>
        <p style={{ color: "var(--text-dim)", marginBottom: 16 }}>
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button
          type="button"
          className="btn danger"
          onClick={handleDeleteAccount}
          disabled={saving}
        >
          {saving ? "Deleting..." : "Delete Account"}
        </button>
      </section>
    </div>
  );
}
