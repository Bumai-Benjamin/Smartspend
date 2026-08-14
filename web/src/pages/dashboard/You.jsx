import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSpend, fmt } from "../../context/SpendContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import "./dashboard.css";
import "./You.css";

const THEME_OPTIONS = [["system", "System"], ["light", "Light"], ["dark", "Dark"]];

function monthsSince(date) {
  if (!date) return 0;
  const now = new Date();
  return Math.max(0, (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth()));
}

export default function You() {
  const { prefs, togglePref, displayName, memberSince, healthInputs, transactions, cats } = useSpend();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const prefRows = [
    ["nudges", "Gentle nudges", "A poke when a category is nearly empty"],
    ["weekly", "Sunday recap", "One card, 20 seconds, no spreadsheet"],
    ["round", "Round-ups to savings", "Spare change lands in Emergency fund"],
    ["faceid", "Face ID to open", "Because rent is nobody else's business"]
  ];

  const months = monthsSince(memberSince);
  const initial = (displayName || "?").charAt(0).toUpperCase();

  function exportCsv() {
    const rows = [["Date", "Category", "Label", "Amount"]];
    transactions.forEach((t) => {
      rows.push([t.occurred_at.toISOString().slice(0, 10), cats[t.cat]?.n || t.cat, t.n, t.amt.toFixed(2)]);
    });
    const csv = rows.map((r) => r.map((f) => `"${String(f).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "smartspend-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  return (
    <div className="page">
      <div className="profile-row">
        <div className="avatar">{initial}</div>
        <div>
          <p className="you-name">{displayName}</p>
          <p className="you-sub">{user?.email}{months > 0 ? ` · ${months} month${months === 1 ? "" : "s"} on SmartSpend` : ""}</p>
        </div>
      </div>

      <div className="card">
        <div className="row-between">
          <p className="kicker" style={{ margin: 0 }}>Monthly income</p>
          <Link to="/app/plan?health=1" className="edit-link">Edit</Link>
        </div>
        <p className="income-val">{fmt(Number(healthInputs?.income || 0))}</p>
        <p className="income-note">Entered manually — SmartSpend doesn't link bank accounts yet.</p>
      </div>

      <div className="card">
        <p className="kicker" style={{ margin: 0 }}>Appearance</p>
        <div className="seg-wrap" style={{ marginTop: 12, marginLeft: 0, marginRight: 0 }}>
          {THEME_OPTIONS.map(([k, label]) => (
            <button key={k} className={`seg-opt ${theme === k ? "active" : ""}`} onClick={() => setTheme(k)}>{label}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {prefRows.map(([key, n, meta], i) => (
          <div key={key} className={`pref-row ${i > 0 ? "pref-divider" : ""}`}>
            <div style={{ flex: 1 }}>
              <p className="pref-name">{n}</p>
              <p className="tx-meta" style={{ margin: "2px 0 0" }}>{meta}</p>
            </div>
            <label className="switch">
              <input type="checkbox" checked={!!prefs[key]} onChange={() => togglePref(key)} />
              <span className="switch-track" />
            </label>
          </div>
        ))}
        <p className="pref-footer-note">Some of these are still being built — your choice is saved and we'll start honoring it as each one ships.</p>
      </div>

      <div className="you-footer">
        <p className="footer-text">SmartSpend 1.0 · your data is stored securely and only visible to you.</p>
        <button className="export-link" onClick={exportCsv}>Export all as CSV</button>
        <button className="signout-link" onClick={handleSignOut}>Sign out</button>
      </div>
    </div>
  );
}
