import React, { useState } from "react";
import { useSpend, fmt, short } from "../../context/SpendContext";
import DonutChart from "../../components/DonutChart";
import "./dashboard.css";
import "./Insights.css";

const VIZ = [["rings", "Rings"], ["spine", "Six months"], ["cal", "Calendar"]];

function bucket(v) {
  if (v === 0) return { bg: "#efe4d0", fg: "rgba(32,30,29,0.35)" };
  if (v < 40) return { bg: "#ffe1d0", fg: "#8c491a" };
  if (v < 100) return { bg: "#ffc6a5", fg: "#643312" };
  if (v < 200) return { bg: "#f6a06b", fg: "#402310" };
  return { bg: "#c67139", fg: "#fff2eb" };
}

export default function Insights() {
  const { catRows, totalSpent, dayOfMonth, daysInMonth, daysLeft, totalBudget, monthlyTotals, calAmts } = useSpend();
  const [viz, setViz] = useState("rings");

  const segments = catRows.map((c) => ({ color: c.c, value: c.s }));
  const legend = catRows.slice(0, 5).map((c) => ({ ...c, share: totalSpent ? Math.round((c.s / totalSpent) * 100) : 0 }));

  const maxMonth = Math.max(...monthlyTotals.map((m) => m.v), totalBudget, 1);
  const dailyPace = dayOfMonth ? totalSpent / dayOfMonth : 0;
  const forecast = totalSpent + dailyPace * daysLeft;

  const weekHeads = ["S", "M", "T", "W", "T", "F", "S"];
  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  const pad = firstOfMonth.getDay();

  return (
    <div className="page">
      <div style={{ paddingTop: 8 }}>
        <h1 className="h1" style={{ marginTop: 0 }}>Insights</h1>
        <p className="sub">Same month, three ways to read it.</p>
      </div>

      <div className="seg-wrap">
        {VIZ.map(([k, label]) => (
          <button key={k} className={`seg-opt ${viz === k ? "active" : ""}`} onClick={() => setViz(k)}>{label}</button>
        ))}
      </div>

      {viz === "rings" && (
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <DonutChart segments={segments} centerLabel={short(totalSpent)} centerSub="spent" />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9 }}>
              {totalSpent === 0 ? (
                <p className="card-note">Log an expense to see your category breakdown here.</p>
              ) : (
                legend.map((l) => (
                  <div key={l.k} className="legend-row">
                    <span className="dot-sm" style={{ background: l.c, marginRight: 0 }} />
                    <span className="legend-name">{l.n}</span>
                    <span className="legend-share">{l.share}%</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {viz === "spine" && (
        <div className="card">
          <p className="kicker">Six months</p>
          <div className="bars-row">
            {monthlyTotals.map((m) => (
              <div key={m.m} className="bar-col">
                <span className="bar-amt">{short(m.v)}</span>
                <div className="bar" style={{ height: `${(m.v / maxMonth) * 100}%`, background: m.current ? "#c67139" : "#dcd3c4" }} />
                <span className="bar-month" style={{ color: m.current ? "#8c491a" : undefined }}>{m.m}</span>
              </div>
            ))}
          </div>
          <div className="hr" />
          <p className="card-note">
            {totalBudget === 0
              ? "Set a budget on the Plan tab to see a month-end forecast here."
              : <>This month so far. On today's pace you land near <b>{short(forecast)}</b> by month end.</>}
          </p>
        </div>
      )}

      {viz === "cal" && (
        <div className="card">
          <div className="cal-grid">
            {weekHeads.map((d, i) => <span key={i} className="cal-head">{d}</span>)}
          </div>
          <div className="cal-grid">
            {Array.from({ length: pad }).map((_, i) => <div key={"pad" + i} className="cal-cell" />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const future = day > dayOfMonth;
              const v = future ? 0 : calAmts[day - 1] || 0;
              const b = future ? { bg: "transparent", fg: "rgba(32,30,29,0.28)" } : bucket(v);
              return (
                <div key={day} className="cal-cell" style={{ background: b.bg, border: future ? "1px dashed rgba(32,30,29,0.16)" : "none" }}>
                  <span className="cal-day" style={{ color: b.fg }}>{day}</span>
                  {!future && <span className="cal-tick" style={{ color: b.fg }}>{v ? Math.round(v) : "·"}</span>}
                </div>
              );
            })}
          </div>
          <p className="card-note">Darker means heavier spending that day.</p>
        </div>
      )}
    </div>
  );
}
