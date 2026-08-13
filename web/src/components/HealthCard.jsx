import React from "react";
import { Link } from "react-router-dom";
import { colors } from "../theme";
import "./HealthCard.css";

const STATUS_COLOR = { green: colors.sage, yellow: colors.accent, red: colors.danger };

export default function HealthCard({ health }) {
  const { score, label, breakdown, biggestProblem, ready } = health;

  if (!ready) {
    return (
      <div className="health-card">
        <p className="health-kicker">Financial health</p>
        <h3 className="health-empty-title">Add your income to see your score</h3>
        <p className="health-empty-body">
          Spending, savings, debt, emergency fund and cash flow all factor in — we just need your income first.
        </p>
        <Link to="/app/plan?health=1" className="health-setup-btn">Set up income</Link>
      </div>
    );
  }

  return (
    <div className="health-card">
      <p className="health-kicker">Financial health</p>
      <div className="health-score-row">
        <span className="health-score">{score}</span>
        <span className="health-score-max">/100</span>
        <span className="health-score-label">— {label}</span>
      </div>
      <div className="health-rows">
        {breakdown.map((b) => (
          <div key={b.k} className="health-row">
            <div className="health-row-left">
              <span className="health-dot" style={{ background: STATUS_COLOR[b.status] }} />
              <span className="health-row-label">{b.label}</span>
            </div>
            <span className="health-row-word" style={{ color: STATUS_COLOR[b.status] }}>{b.word}</span>
          </div>
        ))}
      </div>
      {biggestProblem && (
        <div className="health-callout">
          <p>{biggestProblem.text}</p>
        </div>
      )}
    </div>
  );
}
