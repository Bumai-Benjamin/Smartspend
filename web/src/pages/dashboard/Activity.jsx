import React, { useState, useMemo } from "react";
import { useSpend, fmt } from "../../context/SpendContext";
import "./dashboard.css";
import "./Activity.css";

export default function Activity() {
  const { groups, totalSpent, cats } = useSpend();
  const [filter, setFilter] = useState("all");

  const filters = [{ k: "all", n: "Everything" }, ...Object.keys(cats).map((k) => ({ k, n: cats[k].n }))];

  const filtered = useMemo(() => {
    return groups
      .map((g) => {
        const items = filter === "all" ? g.items : g.items.filter((t) => t.cat === filter);
        return { ...g, items, total: items.reduce((a, t) => a + t.amt, 0) };
      })
      .filter((g) => g.items.length);
  }, [groups, filter]);

  const txnCount = groups.reduce((a, g) => a + g.items.length, 0);

  return (
    <div className="page">
      <div style={{ paddingTop: 8 }}>
        <h1 className="h1" style={{ marginTop: 0 }}>Activity</h1>
        <p className="sub">
          {txnCount === 0 ? "No expenses logged yet" : `${fmt(totalSpent)} across ${txnCount} charge${txnCount === 1 ? "" : "s"}`}
        </p>
      </div>

      <div className="filter-scroll">
        {filters.map((f) => (
          <button key={f.k} className={`filter-chip ${filter === f.k ? "active" : ""}`} onClick={() => setFilter(f.k)}>
            {f.n}
          </button>
        ))}
      </div>

      <div className="tx-groups">
        {filtered.length === 0 && (
          <p className="empty-text">{txnCount === 0 ? "Add your first expense from the + button." : "Nothing in this category yet."}</p>
        )}
        {filtered.map((g) => (
          <div key={g.label}>
            <div className="row-between group-head">
              <span className="group-label">{g.label.toUpperCase()}</span>
              <span className="group-total">{fmt(g.total)}</span>
            </div>
            <div className="card" style={{ padding: 0, overflow: "hidden", marginTop: 0 }}>
              {g.items.map((t, i) => (
                <div key={t.id} className={`tx-row ${i > 0 ? "tx-divider" : ""}`}>
                  <div className="tx-avatar" style={{ background: cats[t.cat].c }}>{t.n.charAt(0).toUpperCase()}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="tx-name">{t.n}</p>
                    <p className="tx-meta">{cats[t.cat].n}{t.meta ? ` · ${t.meta}` : ""}</p>
                  </div>
                  <span className="tx-amt">{fmt(t.amt)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
