import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Settings, Rocket, Sigma
} from "lucide-react";
import "../styles/navbar.css";

const LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/classes", label: "Classes", icon: BookOpen },
  { to: "/graphplotting", label: "Graph Plotter", icon: Sigma },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark"><Rocket size={16} /></div>
        <span>EduVision</span>
      </div>

      <nav className="sidebar-nav">
        {LINKS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <NavLink to="/settings" className={({ isActive }) => "sidebar-link sidebar-settings" + (isActive ? " active" : "")}>
        <Settings size={17} />
        <span>Profile & Settings</span>
      </NavLink>
    </aside>
  );
}
