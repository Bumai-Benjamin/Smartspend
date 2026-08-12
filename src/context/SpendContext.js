import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import { CATS, BASE_GROUPS, INCOME, SAVINGS, DEBT, CAT_HISTORY, GOALS } from "../data";

const SpendContext = createContext(null);

export function fmt(n, showCents = true) {
  const neg = n < 0;
  const v = Math.abs(n);
  const str = showCents ? v.toFixed(2) : Math.round(v).toString();
  const parts = str.split(".");
  const int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (neg ? "\u2212$" : "$") + int + (parts[1] ? "." + parts[1] : "");
}
export function short(n) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

const GUESS_MAP = [
  [["lunch", "dinner", "coffee", "cafe", "café", "ramen", "pizza", "breakfast", "snack", "restaurant", "takeout", "doordash", "eats"], "food"],
  [["grocery", "groceries", "market", "trader", "walmart", "safeway", "produce"], "groc"],
  [["uber", "lyft", "metro", "gas", "parking", "transit", "train", "bus", "toll"], "trans"],
  [["movie", "cinema", "concert", "bar", "drinks", "game", "ticket"], "fun"],
  [["netflix", "spotify", "subscription", "gym", "membership", "streaming"], "subs"],
  [["rent", "mortgage", "utilities", "electric", "wifi", "internet"], "home"],
  [["pharmacy", "doctor", "clinic", "meds", "dentist"], "health"]
];
export function guessCat(text) {
  const t = (text || "").toLowerCase();
  for (const [words, cat] of GUESS_MAP) if (words.some((w) => t.indexOf(w) >= 0)) return cat;
  return "food";
}
export function parseAmt(text) {
  const m = (text || "").match(/\d+(?:\.\d{1,2})?/g);
  return m ? parseFloat(m[m.length - 1]) : 0;
}
export function cleanLabel(text) {
  const t = (text || "").replace(/\d+(?:\.\d{1,2})?/g, "").trim().replace(/\s+/g, " ");
  if (!t) return CATS[guessCat(text)].n;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

const TOTAL_BUDGET = 2400;
const DAY_OF_MONTH = 12;
const DAYS_IN_MONTH = 31;
const DAYS_LEFT = 19;

export function SpendProvider({ children }) {
  const [budgets, setBudgets] = useState(() => {
    const b = {};
    Object.keys(CATS).forEach((k) => { b[k] = CATS[k].b; });
    return b;
  });
  const [extra, setExtra] = useState([]); // {n, cat, amt, meta}
  const [prefs, setPrefs] = useState({ nudges: true, weekly: true, round: false, faceid: true });

  const bumpBudget = useCallback((key, delta) => {
    setBudgets((b) => ({ ...b, [key]: Math.max(0, b[key] + delta) }));
  }, []);

  const togglePref = useCallback((key) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }, []);

  const addExpense = useCallback((tx) => {
    setExtra((e) => [{ meta: "just now", ...tx }, ...e]);
  }, []);

  const spentByCat = useMemo(() => {
    const s = {};
    Object.keys(CATS).forEach((k) => { s[k] = CATS[k].s; });
    extra.forEach((t) => { s[t.cat] = (s[t.cat] || 0) + t.amt; });
    return s;
  }, [extra]);

  const totalSpent = useMemo(
    () => Object.values(spentByCat).reduce((a, v) => a + v, 0),
    [spentByCat]
  );

  const left = TOTAL_BUDGET - totalSpent;
  const daily = Math.max(left, 0) / DAYS_LEFT;
  const pace = Math.min(totalSpent / TOTAL_BUDGET, 1);
  const expected = (TOTAL_BUDGET * DAY_OF_MONTH) / DAYS_IN_MONTH;
  const ahead = expected - totalSpent;

  const heroLine =
    left < 0
      ? `Over by ${fmt(-left)}. No lecture \u2014 just ease off Fun and Food for a week and it closes.`
      : ahead > 0
      ? `Rent already took its bite, so you are ${fmt(ahead)} ahead of pace. Bragging rights: unlocked.`
      : `Running ${fmt(-ahead)} hot. Nothing dramatic, but Fun is doing the damage.`;

  const catRows = useMemo(() => {
    return Object.keys(CATS)
      .map((k) => {
        const c = CATS[k];
        const b = budgets[k];
        const s = spentByCat[k];
        const pct = b ? Math.min(s / b, 1) : 0;
        const note =
          s > b
            ? `${fmt(s - b)} over its ${short(b)} budget`
            : b - s < b * 0.15
            ? `${fmt(b - s)} left \u2014 getting thin`
            : `${fmt(b - s)} left of ${short(b)}`;
        return { k, n: c.n, c: c.c, s, b, pct, note, over: s > b };
      })
      .sort((a, b) => b.s - a.s);
  }, [budgets, spentByCat]);

  const groups = useMemo(() => {
    return BASE_GROUPS.map((g, i) => {
      let items = g.items;
      if (i === 0 && extra.length) items = [...extra, ...items];
      const total = items.reduce((a, t) => a + t.amt, 0);
      return { label: g.label, items, total };
    });
  }, [extra]);

  const allocated = useMemo(
    () => Object.values(budgets).reduce((a, v) => a + v, 0),
    [budgets]
  );

  const STATUS_WORD = { green: "Good", yellow: "Needs improvement", red: "Low" };
  const STATUS_SCORE = { green: 92, yellow: 58, red: 28 };

  const health = useMemo(() => {
    const rawPace = totalSpent / TOTAL_BUDGET;
    const spendingStatus = rawPace <= 0.85 ? "green" : rawPace <= 1 ? "yellow" : "red";

    const savingsRate = SAVINGS.thisMonth / INCOME;
    const savingsStatus = savingsRate >= SAVINGS.targetRate ? "green" : savingsRate >= 0.05 ? "yellow" : "red";

    const debtToIncome = DEBT.balance / INCOME;
    const debtStatus = debtToIncome < 0.3 ? "green" : debtToIncome < 0.5 ? "yellow" : "red";

    const emergencyFund = GOALS.find((g) => g.n === "Emergency fund");
    const emergencyMonths = emergencyFund ? emergencyFund.saved / TOTAL_BUDGET : 0;
    const emergencyStatus = emergencyMonths >= 3 ? "green" : emergencyMonths >= 1 ? "yellow" : "red";

    const cashFlow = INCOME - TOTAL_BUDGET;
    const cashFlowStatus = cashFlow >= 200 ? "green" : cashFlow >= 0 ? "yellow" : "red";

    const breakdown = [
      { k: "spending", label: "Spending", status: spendingStatus, word: STATUS_WORD[spendingStatus] },
      { k: "savings", label: "Savings", status: savingsStatus, word: STATUS_WORD[savingsStatus] },
      { k: "debt", label: "Debt", status: debtStatus, word: STATUS_WORD[debtStatus] },
      { k: "emergency", label: "Emergency fund", status: emergencyStatus, word: STATUS_WORD[emergencyStatus] },
      { k: "cashflow", label: "Monthly cash flow", status: cashFlowStatus, word: STATUS_WORD[cashFlowStatus] }
    ];

    const score = Math.round(
      breakdown.reduce((a, b) => a + STATUS_SCORE[b.status], 0) / breakdown.length
    );
    const label = score >= 80 ? "Great" : score >= 65 ? "Good" : score >= 45 ? "Fair" : "Needs work";

    let biggestProblem = null;
    let worstPct = 0;
    Object.keys(CAT_HISTORY).forEach((k) => {
      const hist = CAT_HISTORY[k];
      const avg = hist.reduce((a, v) => a + v, 0) / hist.length;
      if (!avg) return;
      const spent = spentByCat[k] || 0;
      const pct = ((spent - avg) / avg) * 100;
      if (pct > worstPct && pct >= 10) {
        worstPct = pct;
        biggestProblem = {
          cat: k,
          name: CATS[k].n,
          pct: Math.round(pct),
          text: `Your biggest problem this month is ${CATS[k].n.toLowerCase()} spending. You're spending ${Math.round(pct)}% more than your 3-month average.`
        };
      }
    });

    return { score, label, breakdown, biggestProblem };
  }, [totalSpent, spentByCat]);

  const value = {
    cats: CATS,
    budgets,
    bumpBudget,
    extra,
    addExpense,
    prefs,
    togglePref,
    spentByCat,
    totalSpent,
    totalBudget: TOTAL_BUDGET,
    left,
    daily,
    pace,
    heroLine,
    daysLeft: DAYS_LEFT,
    dayOfMonth: DAY_OF_MONTH,
    daysInMonth: DAYS_IN_MONTH,
    catRows,
    groups,
    allocated,
    health
  };

  return <SpendContext.Provider value={value}>{children}</SpendContext.Provider>;
}

export function useSpend() {
  const ctx = useContext(SpendContext);
  if (!ctx) throw new Error("useSpend must be used within SpendProvider");
  return ctx;
}
