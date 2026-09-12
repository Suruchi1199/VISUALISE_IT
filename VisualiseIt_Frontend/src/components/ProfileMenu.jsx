import { useEffect, useRef, useState } from "react";
import { BookOpen, ChevronDown, LayoutDashboard, LogOut, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const FULL_MENU_LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/classes", label: "Classes", icon: BookOpen },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function ProfileMenu({ user, buttonLabel = "Profile", compact = false }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const menuLinks = compact ? [{ to: "/settings", label: "Settings", icon: Settings }] : FULL_MENU_LINKS;

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleSignOut = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <div className={"profile-menu" + (compact ? " compact" : "")} ref={menuRef}>
      <button
        type="button"
        className={"profile-trigger" + (open ? " open" : "")}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div className="avatar">{(user?.name || "?").slice(0, 1).toUpperCase()}</div>
        <div className="profile-trigger-copy">
          <span className="profile-trigger-label">{buttonLabel}</span>
          <span className="profile-trigger-name">{user?.name || "Learner"}</span>
        </div>
        <ChevronDown size={16} className="profile-trigger-icon" />
      </button>

      {open && (
        <div className="profile-dropdown" role="menu">
          <div className="profile-dropdown-head">
            <div className="avatar large">{(user?.name || "?").slice(0, 1).toUpperCase()}</div>
            <div className="profile-dropdown-meta">
              <span className="profile-dropdown-name">{user?.name || "Learner"}</span>
              <span className="profile-dropdown-email">{user?.email}</span>
            </div>
          </div>

          <div className="profile-dropdown-list">
            {menuLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className="profile-menu-link" onClick={() => setOpen(false)} role="menuitem">
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            ))}

            <button type="button" className="profile-menu-link danger" onClick={handleSignOut} role="menuitem">
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
