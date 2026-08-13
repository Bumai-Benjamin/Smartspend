import React from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useSpend, fmt, short } from "../../context/SpendContext";
import ProgressBar from "../../components/ProgressBar";
import HealthCard from "../../components/HealthCard";
import "./dashboard.css";

const MONTH_YEAR = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

export default function Home() {
  const { openAdd } = useOutletContext();
  const {
    totalSpent, totalBudget, left, pace, heroLine, daysLeft, dayOfMonth, daysInMonth,
    catRows, addExpense, health, upcoming, upcomingTotal, displayName
  } = useSpend();

  const quickAdds = [
    { label: "Coffee $5.40", c: "#d67f48", cat: "food", amt: 5.4, n: "Coffee" },
    { label: "Transit $2.75", c: "#8c491a", cat: "trans", amt: 2.75, n: "Transit" },
    { label: "Lunch $14", c: "#f6a06b", cat: "food", amt: 14, n: "Lunch" }
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="kicker">{MONTH_YEAR}</p>
          <h1 className="h1">Hey {displayName}</h1>
        </div>
        <button className="add-btn" onClick={openAdd}>+</button>
      </div>

      <div className="hero-card">
        <p className="kicker">Left to spend</p>
        <div className="hero-num-row">
          <span className="hero-num">{fmt(left)}</span>
          <span className="hero-sub">of {short(totalBudget)} · {daysLeft} days to go</span>
        </div>
        <div style={{ margin: "18px 0 10px" }}>
          <ProgressBar pct={pace} />
        </div>
        <div className="row-between">
          <span className="meta-bold">{fmt(totalSpent)} spent</span>
          <span className="meta-bold">day {dayOfMonth} of {daysInMonth}</span>
        </div>
        <div className="hero-divider" />
        <p className="hero-line">{heroLine}</p>
      </div>

      <HealthCard health={health} />

      <div className="section">
        <p className="kicker">One tap, done</p>
        <div className="chips-row">
          {quickAdds.map((q) => (
            <button key={q.label} className="quick-pill" onClick={() => addExpense({ n: q.n, cat: q.cat, amt: q.amt })}>
              <span className="dot" style={{ background: q.c }} />
              {q.label}
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="row-between">
          <h2 className="h2">Where it's going</h2>
          <Link to="/app/insights" className="link">All categories</Link>
        </div>
        <div className="cat-rows">
          {catRows.slice(0, 4).map((c) => (
            <Link key={c.k} to={`/app/category/${c.k}`} className="cat-row">
              <div className="row-between">
                <div className="row-center">
                  <span className="dot-sm" style={{ background: c.c }} />
                  <span className="row-label">{c.n}</span>
                </div>
                <span className="row-label">{fmt(c.s)}</span>
              </div>
              <div style={{ marginTop: 6 }}>
                <ProgressBar pct={c.pct} color={c.c} bg="#e3d8c2" height={9} />
              </div>
              <p className="row-note">{c.note}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="upcoming-card">
        <div className="row-between">
          <h3 className="upcoming-title">Coming out soon</h3>
          {upcoming.length > 0 && <span className="upcoming-meta">{fmt(upcomingTotal)} left this month</span>}
        </div>
        {upcoming.length === 0 ? (
          <p className="upcoming-empty">No recurring charges added yet. Add one on the Plan tab.</p>
        ) : (
          <div className="upcoming-list">
            {upcoming.map((u) => (
              <div key={u.n} className="row-center">
                <div className="day-badge">{u.day}</div>
                <span className="row-label" style={{ flex: 1, color: "#272e1b" }}>{u.n}</span>
                <span className="upcoming-amt">{fmt(u.amt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
