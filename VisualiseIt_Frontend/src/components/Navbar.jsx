import { Search, Flame, Coins } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import ProfileMenu from "./ProfileMenu.jsx";
import { STATS } from "../data/mockData.js";
import "../styles/navbar.css";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-search">
        <Search size={16} />
        <input placeholder="Search classes, subjects, animations…" />
      </div>

      <div className="topbar-stats">
        <span className="stat-pill"><Flame size={14} /> {STATS.streak}-day streak</span>
        <span className="stat-pill"><Coins size={14} /> {STATS.coins}</span>
      </div>

      <div className="topbar-user">
        <ProfileMenu user={user} buttonLabel="Profile" compact />
      </div>
    </header>
  );
}
