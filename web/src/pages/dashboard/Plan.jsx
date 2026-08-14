import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useSpend, fmt, short } from "../../context/SpendContext";
import ProgressBar from "../../components/ProgressBar";
import "./dashboard.css";
import "./Plan.css";

const TABS = [["budgets", "Budgets"], ["subs", "Recurring"], ["goals", "Goals"], ["health", "Health"]];

export default function Plan() {
  const {
    catRows, budgets, setBudgetAmount, allocated,
    subscriptions, addSubscription, deleteSubscription,
    emergencyFund, updateEmergencyFund,
    healthInputs, updateHealthInputs
  } = useSpend();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState("budgets");

  useEffect(() => {
    if (searchParams.get("health")) setTab("health");
  }, [searchParams]);

  const subsTotal = subscriptions.reduce((a, s) => a + s.amount, 0);

  const sub = tab === "budgets"
    ? "Nudge a number and the home screen follows."
    : tab === "subs"
    ? "Recurring charges you've told us about."
    : tab === "goals"
    ? "What you're saving toward."
    : "Manual figures behind your Financial Health score.";

  return (
    <div className="page">
      <div style={{ paddingTop: 8 }}>
        <h1 className="h1" style={{ marginTop: 0 }}>Plan</h1>
        <p className="sub">{sub}</p>
      </div>

      <div className="seg-wrap">
        {TABS.map(([k, label]) => (
          <button key={k} className={`seg-opt ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>

      {tab === "budgets" && (
        <div className="tab-body">
          {catRows.map((c) => (
            <BudgetSliderRow key={c.k} c={c} budget={budgets[c.k] || 0} onCommit={(v) => setBudgetAmount(c.k, v)} />
          ))}
          <div className="allocated-card">
            <span className="allocated-label">Allocated</span>
            <span className="allocated-val">{short(allocated)}</span>
          </div>
        </div>
      )}

      {tab === "subs" && (
        <SubsTab subscriptions={subscriptions} subsTotal={subsTotal} addSubscription={addSubscription} deleteSubscription={deleteSubscription} />
      )}

      {tab === "goals" && (
        <div className="tab-body">
          {emergencyFund ? <GoalCard goal={emergencyFund} /> : <p className="empty-text">No goals yet.</p>}
          <p className="helper-text">Update your emergency fund on the Health tab.</p>
        </div>
      )}

      {tab === "health" && (
        <HealthTab healthInputs={healthInputs} updateHealthInputs={updateHealthInputs} emergencyFund={emergencyFund} updateEmergencyFund={updateEmergencyFund} />
      )}
    </div>
  );
}

function BudgetSliderRow({ c, budget, onCommit }) {
  const [localValue, setLocalValue] = useState(budget);
  useEffect(() => { setLocalValue(budget); }, [budget]);

  const pct = localValue ? Math.min(c.s / localValue, 1) : 0;
  const note = !localValue
    ? "No budget set yet"
    : c.s > localValue
    ? `${fmt(c.s - localValue)} over its ${short(localValue)} budget`
    : localValue - c.s < localValue * 0.15
    ? `${fmt(localValue - c.s)} left — getting thin`
    : `${fmt(localValue - c.s)} left of ${short(localValue)}`;

  function commit(e) {
    onCommit(Number(e.target.value));
  }

  return (
    <div className="budget-card">
      <div className="row-center" style={{ gap: 10 }}>
        <span className="dot-sm" style={{ background: c.c }} />
        <span className="row-label" style={{ flex: 1 }}>{c.n}</span>
        <span className="budget-val">{short(localValue)}</span>
      </div>
      <input
        type="range"
        className="budget-slider"
        min={0}
        max={c.max || 1000}
        step={5}
        value={localValue}
        style={{ accentColor: c.c }}
        onChange={(e) => setLocalValue(Number(e.target.value))}
        onMouseUp={commit}
        onTouchEnd={commit}
        onKeyUp={commit}
      />
      <div style={{ marginTop: 8 }}>
        <ProgressBar pct={pct} color={c.c} bg="var(--track)" height={8} />
      </div>
      <p className="budget-note" style={c.s > localValue ? { color: "#8c491a" } : undefined}>{note}</p>
    </div>
  );
}

function GoalCard({ goal }) {
  const pct = goal.target ? goal.saved / goal.target : 0;
  return (
    <div className="goal-card">
      <div className="row-between">
        <span className="goal-name">{goal.name}</span>
        <span className="goal-pct">{Math.round(pct * 100)}%</span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginTop: 10 }}>
        <span className="goal-saved">{short(goal.saved)}</span>
        <span className="goal-target">of {short(goal.target)}</span>
      </div>
      <div style={{ marginTop: 14 }}>
        <ProgressBar pct={pct} color="#728157" bg="#ccdbb2" height={10} />
      </div>
    </div>
  );
}

function SubsTab({ subscriptions, subsTotal, addSubscription, deleteSubscription }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [amt, setAmt] = useState("");
  const [day, setDay] = useState("");

  function save() {
    const amount = parseFloat(amt);
    const chargeDay = parseInt(day, 10);
    if (!name.trim() || !amount || !chargeDay || chargeDay < 1 || chargeDay > 31) return;
    addSubscription({ name: name.trim(), amount, next_charge_day: chargeDay });
    setName(""); setAmt(""); setDay(""); setAdding(false);
  }

  return (
    <div className="tab-body">
      <div className="subs-hero">
        <p className="kicker">Recurring, every month</p>
        <p className="subs-total">{fmt(subsTotal)}</p>
        <p className="subs-sub">That's {short(subsTotal * 12)} a year.</p>
      </div>

      {subscriptions.length === 0 && !adding && <p className="empty-text">No recurring charges added yet.</p>}

      {subscriptions.map((s) => (
        <div key={s.id} className="sub-row">
          <div className="sub-avatar" style={{ background: s.color || "#c67139" }}>{s.name.charAt(0).toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="row-label" style={{ margin: 0 }}>{s.name}</p>
            <p className="tx-meta" style={{ margin: "2px 0 0" }}>Charges on the {s.next_charge_day}{s.note ? ` · ${s.note}` : ""}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p className="row-label" style={{ margin: 0 }}>{fmt(s.amount)}</p>
            <p className="per-mo">/mo</p>
          </div>
          <button className="delete-btn" onClick={() => deleteSubscription(s.id)} aria-label="Delete">✕</button>
        </div>
      ))}

      {adding ? (
        <div className="add-card">
          <input className="add-input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <div style={{ display: "flex", gap: 10 }}>
            <input className="add-input" style={{ flex: 1 }} placeholder="Amount" value={amt} onChange={(e) => setAmt(e.target.value)} inputMode="decimal" />
            <input className="add-input" style={{ flex: 1 }} placeholder="Day (1-31)" value={day} onChange={(e) => setDay(e.target.value)} inputMode="numeric" />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={save}>Save</button>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className="add-row-btn" onClick={() => setAdding(true)}>+ Add a recurring charge</button>
      )}
    </div>
  );
}

function NumberField({ label, value, onCommit, prefix = "$" }) {
  const [text, setText] = useState(value != null ? String(value) : "");
  useEffect(() => { setText(value != null ? String(value) : ""); }, [value]);
  return (
    <div className="field-row">
      <span className="field-label">{label}</span>
      <div className="field-input-wrap">
        <span className="field-prefix">{prefix}</span>
        <input
          className="field-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => onCommit(parseFloat(text) || 0)}
          inputMode="decimal"
          placeholder="0"
        />
      </div>
    </div>
  );
}

function HealthTab({ healthInputs, updateHealthInputs, emergencyFund, updateEmergencyFund }) {
  return (
    <div className="tab-body" style={{ gap: 20 }}>
      <div className="health-form-card">
        <p className="kicker">Income & savings</p>
        <div className="fields-stack">
          <NumberField label="Monthly income" value={healthInputs?.income} onCommit={(v) => updateHealthInputs({ income: v })} />
          <NumberField label="Saved this month" value={healthInputs?.savings_this_month} onCommit={(v) => updateHealthInputs({ savings_this_month: v })} />
        </div>
      </div>
      <div className="health-form-card">
        <p className="kicker">Debt</p>
        <div className="fields-stack">
          <NumberField label="Current balance" value={healthInputs?.debt_balance} onCommit={(v) => updateHealthInputs({ debt_balance: v })} />
        </div>
      </div>
      <div className="health-form-card">
        <p className="kicker">Emergency fund</p>
        <div className="fields-stack">
          <NumberField label="Saved so far" value={emergencyFund?.saved} onCommit={(v) => updateEmergencyFund({ saved: v })} />
          <NumberField label="Target" value={emergencyFund?.target} onCommit={(v) => updateEmergencyFund({ target: v })} />
        </div>
      </div>
    </div>
  );
}
