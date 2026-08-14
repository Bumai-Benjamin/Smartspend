import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSpend, fmt } from "../../context/SpendContext";
import ProgressBar from "../../components/ProgressBar";
import "./dashboard.css";
import "./CategoryDetail.css";

export default function CategoryDetail() {
  const { catKey } = useParams();
  const navigate = useNavigate();
  const { cats, spentByCat, budgets, transactions, monthlyTotalsByCat, daysLeft } = useSpend();

  const c = cats[catKey];
  if (!c) return null;

  const s = spentByCat[catKey] || 0;
  const b = budgets[catKey] || 0;
  const pct = b ? Math.min(s / b, 1) : 0;
  const over = s > b;

  const items = transactions
    .filter((t) => t.cat === catKey)
    .map((t) => ({
      n: t.n,
      amt: t.amt,
      meta: `${t.occurred_at.toLocaleDateString("en-US", { month: "short", day: "numeric" })}${t.meta ? ` · ${t.meta}` : ""}`
    }));

  const trend = monthlyTotalsByCat[catKey] || [];
  const maxTrend = Math.max(...trend.map((m) => m.v), b, 1);

  return (
    <div className="page">
      <div className="catdetail-header">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Back">←</button>
        <h1 className="h1" style={{ margin: 0, fontSize: 20 }}>{c.n}</h1>
      </div>

      <div className="tint-card">
        <p className="kicker">Spent this month</p>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginTop: 8 }}>
          <span className="big-num">{fmt(s)}</span>
          <span className="of-budget">{b ? `of ${fmt(b)} budgeted` : "no budget set"}</span>
        </div>
        <div style={{ marginTop: 16 }}>
          <ProgressBar pct={pct} color={c.c} bg="rgba(var(--ink-rgb), 0.12)" height={11} />
        </div>
        <p className="tint-line">
          {!b
            ? "Set a budget for this category on the Plan tab."
            : over
            ? `Over by ${fmt(s - b)}.`
            : daysLeft > 0
            ? `${fmt(b - s)} left, ${daysLeft} day${daysLeft === 1 ? "" : "s"} to go — about ${fmt((b - s) / daysLeft)} a day.`
            : `${fmt(b - s)} left this month.`}
        </p>
      </div>

      <div className="section">
        <p className="kicker">Last six months</p>
        <div className="cd-bars-row">
          {trend.map((m, i) => (
            <div key={m.m + i} className="cd-bar-col">
              <div className="cd-bar" style={{ height: `${(m.v / maxTrend) * 100}%`, background: m.current ? c.c : "var(--track-alt)" }} />
              <span className="cd-bar-month">{m.m}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <p className="kicker">Every charge</p>
        {items.length === 0 ? (
          <p className="empty-text">Nothing logged in this category yet.</p>
        ) : (
          <div className="card" style={{ marginTop: 0, padding: 0, overflow: "hidden" }}>
            {items.map((t, i) => (
              <div key={t.n + i} className={`tx-row ${i > 0 ? "tx-divider" : ""}`}>
                <div style={{ flex: 1 }}>
                  <p className="tx-name">{t.n}</p>
                  <p className="tx-meta">{t.meta}</p>
                </div>
                <span className="tx-amt">{fmt(t.amt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
