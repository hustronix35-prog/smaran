import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { BarChart3, BookOpen, CalendarClock, Plus, Settings } from "lucide-react";

export default function Shell({ children }) {
  const { pathname } = useLocation();
  const inSession = pathname === "/recall" || pathname.startsWith("/teach");
  useEffect(() => {
    document.title = "smaran — Ambient Learning";
  }, []);

  return (
    <div className="app">
      <a className="skip" href="#content">
        Skip to content
      </a>
      <header className="topbar">
        <NavLink to="/" className="brand" end>
          <Mark />
          <span className="brand-text">
            <strong>smaran</strong>
            <small>LEARN IT. KEEP IT.</small>
          </span>
        </NavLink>
        <nav className="nav" aria-label="Primary">
          <NavLink to="/" end>
            Today
          </NavLink>
          <NavLink to="/upload">Material</NavLink>
          <NavLink to="/plan">Plan</NavLink>
          <NavLink to="/progress">Progress</NavLink>
          <NavLink to="/library">Library</NavLink>
        </nav>
        <NavLink to="/settings" className="icon-link" aria-label="Settings">
          <Settings size={18} />
        </NavLink>
      </header>
      <main id="content" className={inSession ? "main session" : "main"}>
        {children}
      </main>
      <nav className={inSession ? "tabbar is-hidden" : "tabbar"} aria-label="Mobile" aria-hidden={inSession}>
        <NavLink to="/" end>
          <CalendarClock size={18} />
          Today
        </NavLink>
        <NavLink to="/upload">
          <Plus size={18} />
          Add
        </NavLink>
        <NavLink to="/recall">
          <BookOpen size={18} />
          Learn
        </NavLink>
        <NavLink to="/progress">
          <BarChart3 size={18} />
          Progress
        </NavLink>
      </nav>
    </div>
  );
}

function Mark() {
  return (
    <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#D7F078" />
      <path d="M8 22c4-1 6-4 8-8 2 4 4 7 8 8" fill="none" stroke="#101C25" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 22c2.2-.4 3.4-2 4.2-4.2" fill="none" stroke="#101C25" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="22.5" r="1.5" fill="#101C25" />
    </svg>
  );
}
