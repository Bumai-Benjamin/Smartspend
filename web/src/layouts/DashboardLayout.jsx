import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useSpend } from "../context/SpendContext";
import AddExpenseModal from "../components/AddExpenseModal";
import LogoMark from "../components/LogoMark";
import ThemeToggle from "../components/ThemeToggle";
import "./DashboardLayout.css";

const NAV = [
  ["/app", "Home", "home", true],
  ["/app/activity", "Activity", "activity", false],
  ["/app/insights", "Insights", "insights", false],
  ["/app/plan", "Plan", "plan", false],
  ["/app/you", "You", "you", false]
];

const ICONS = {
  home: "M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  activity: "M4 6h16M4 12h16M4 18h10",
  insights: "M4 19V10M10 19V5M16 19v-7M22 19H2",
  plan: "M3 7h18M3 12h18M3 17h10",
  you: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0"
};

function Icon({ name, avatarUrl }) {
  if (name === "you" && avatarUrl) {
    return <img src={avatarUrl} alt="" className="dash-nav-avatar" />;
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={ICONS[name]} />
    </svg>
  );
}

export default function DashboardLayout() {
  const [addOpen, setAddOpen] = useState(false);
  const { avatarUrl } = useSpend();

  return (
    <div className="dash-shell">
      <aside className="dash-sidebar">
        <div className="dash-sidebar-logo">
          <LogoMark size={30} radius={8} />
          <span>SmartSpend</span>
          <ThemeToggle className="dash-sidebar-theme" />
        </div>
        <nav className="dash-sidebar-nav">
          {NAV.map(([to, label, icon]) => (
            <NavLink key={to} to={to} end={to === "/app"} className={({ isActive }) => `dash-nav-link ${isActive ? "active" : ""}`}>
              <span className="dash-nav-icon">
                <Icon name={icon} avatarUrl={icon === "you" ? avatarUrl : undefined} />
              </span>
              {label}
            </NavLink>
          ))}
        </nav>
        <button className="dash-sidebar-add" onClick={() => setAddOpen(true)}>+ Add expense</button>
      </aside>

      <main className="dash-main">
        <Outlet context={{ openAdd: () => setAddOpen(true) }} />
      </main>

      <nav className="dash-bottom-nav">
        {NAV.map(([to, label, icon]) => (
          <NavLink key={to} to={to} end={to === "/app"} className={({ isActive }) => `dash-bottom-link ${isActive ? "active" : ""}`}>
            <span className="dash-bottom-icon">
              <Icon name={icon} avatarUrl={icon === "you" ? avatarUrl : undefined} />
            </span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="dash-fab" onClick={() => setAddOpen(true)} aria-label="Add expense">+</button>

      {addOpen && <AddExpenseModal onClose={() => setAddOpen(false)} />}
    </div>
  );
}
