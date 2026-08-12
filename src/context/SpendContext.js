import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";
import { CATS } from "../data";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const SpendContext = createContext(null);

export function fmt(n, showCents = true) {
  const neg = n < 0;
  const v = Math.abs(n);
  const str = showCents ? v.toFixed(2) : Math.round(v).toString();
  const parts = str.split(".");
  const int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (neg ? "−$" : "$") + int + (parts[1] ? "." + parts[1] : "");
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

function dayLabel(date, now) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((today - d) / 86400000);
  if (diffDays === 0) return `Today · ${d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })}`;
  if (diffDays === 1) return `Yesterday · ${d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })}`;
  return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "long" });
}

const DEFAULT_PREFS = { nudges: true, weekly: true, round: false, faceid: false };
const STATUS_WORD = { green: "Good", yellow: "Needs improvement", red: "Low" };
const STATUS_SCORE = { green: 92, yellow: 58, red: 28 };

export function SpendProvider({ children }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [budgets, setBudgets] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [healthInputs, setHealthInputs] = useState(null);

  useEffect(() => {
    let cancelled = false;

    if (!user) {
      setProfile(null);
      setBudgets({});
      setTransactions([]);
      setGoals([]);
      setSubscriptions([]);
      setHealthInputs(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    (async () => {
      const [profileRes, budgetsRes, txRes, goalsRes, subsRes, healthRes] = await Promise.all([
        supabase.from("profiles").select("display_name, prefs, created_at").eq("id", user.id).single(),
        supabase.from("budgets").select("category_key, amount").eq("user_id", user.id),
        supabase
          .from("transactions")
          .select("id, category_key, label, amount, meta, occurred_at")
          .eq("user_id", user.id)
          .order("occurred_at", { ascending: false })
          .limit(1000),
        supabase.from("goals").select("id, name, saved, target, note").eq("user_id", user.id).order("created_at"),
        supabase.from("subscriptions").select("id, name, amount, next_charge_day, note, color").eq("user_id", user.id).order("next_charge_day"),
        supabase.from("health_inputs").select("*").eq("user_id", user.id).single()
      ]);
      if (cancelled) return;

      setProfile(profileRes.data || { display_name: "You", prefs: DEFAULT_PREFS });

      const b = {};
      (budgetsRes.data || []).forEach((row) => { b[row.category_key] = Number(row.amount); });
      setBudgets(b);

      setTransactions(
        (txRes.data || []).map((row) => ({
          id: row.id,
          cat: row.category_key,
          n: row.label,
          amt: Number(row.amount),
          meta: row.meta,
          occurred_at: new Date(row.occurred_at)
        }))
      );

      setGoals((goalsRes.data || []).map((g) => ({ ...g, saved: Number(g.saved), target: Number(g.target) })));
      setSubscriptions((subsRes.data || []).map((s) => ({ ...s, amount: Number(s.amount) })));
      setHealthInputs(healthRes.data || null);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [user?.id]);

  const addExpense = useCallback(async (tx) => {
    if (!user) return;
    const amount = Number(tx.amt);
    if (!amount) return;
    const { data, error } = await supabase
      .from("transactions")
      .insert({ user_id: user.id, category_key: tx.cat, label: tx.n, amount, meta: tx.meta || "typed by you" })
      .select()
      .single();
    if (error) { console.warn(error.message); return; }
    setTransactions((prev) => [
      { id: data.id, cat: data.category_key, n: data.label, amt: Number(data.amount), meta: data.meta, occurred_at: new Date(data.occurred_at) },
      ...prev
    ]);
  }, [user]);

  const bumpBudget = useCallback((key, delta) => {
    if (!user) return;
    setBudgets((prev) => {
      const next = Math.max(0, (prev[key] || 0) + delta);
      supabase
        .from("budgets")
        .upsert({ user_id: user.id, category_key: key, amount: next, updated_at: new Date().toISOString() })
        .then(({ error }) => { if (error) console.warn(error.message); });
      return { ...prev, [key]: next };
    });
  }, [user]);

  const togglePref = useCallback((key) => {
    if (!user) return;
    setProfile((prev) => {
      const nextPrefs = { ...(prev?.prefs || DEFAULT_PREFS), [key]: !(prev?.prefs || DEFAULT_PREFS)[key] };
      supabase.from("profiles").update({ prefs: nextPrefs }).eq("id", user.id).then(({ error }) => { if (error) console.warn(error.message); });
      return { ...(prev || {}), prefs: nextPrefs };
    });
  }, [user]);

  const updateHealthInputs = useCallback((patch) => {
    if (!user) return;
    setHealthInputs((prev) => ({ ...(prev || {}), ...patch }));
    supabase
      .from("health_inputs")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .then(({ error }) => { if (error) console.warn(error.message); });
  }, [user]);

  const addSubscription = useCallback(async (payload) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("subscriptions")
      .insert({ user_id: user.id, ...payload })
      .select()
      .single();
    if (error) { console.warn(error.message); return; }
    setSubscriptions((prev) =>
      [...prev, { ...data, amount: Number(data.amount) }].sort((a, b) => (a.next_charge_day || 99) - (b.next_charge_day || 99))
    );
  }, [user]);

  const deleteSubscription = useCallback((id) => {
    if (!user) return;
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    supabase.from("subscriptions").delete().eq("id", id).then(({ error }) => { if (error) console.warn(error.message); });
  }, [user]);

  const updateEmergencyFund = useCallback((patch) => {
    if (!user) return;
    setGoals((prev) => prev.map((g) => (g.name === "Emergency fund" ? { ...g, ...patch } : g)));
    const fund = goals.find((g) => g.name === "Emergency fund");
    if (!fund) return;
    supabase.from("goals").update(patch).eq("id", fund.id).then(({ error }) => { if (error) console.warn(error.message); });
  }, [user, goals]);

  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(daysInMonth - dayOfMonth, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const spentByCat = useMemo(() => {
    const s = {};
    Object.keys(CATS).forEach((k) => { s[k] = 0; });
    transactions.forEach((t) => {
      if (t.occurred_at >= monthStart) s[t.cat] = (s[t.cat] || 0) + t.amt;
    });
    return s;
  }, [transactions]);

  const totalSpent = useMemo(() => Object.values(spentByCat).reduce((a, v) => a + v, 0), [spentByCat]);
  const totalBudget = useMemo(() => Object.values(budgets).reduce((a, v) => a + v, 0), [budgets]);
  const allocated = totalBudget;

  const left = totalBudget - totalSpent;
  const daily = Math.max(left, 0) / Math.max(daysLeft, 1);
  const pace = totalBudget ? Math.min(totalSpent / totalBudget, 1) : 0;
  const expected = (totalBudget * dayOfMonth) / daysInMonth;
  const ahead = expected - totalSpent;

  const heroLine = !totalBudget
    ? "Set your budgets on the Plan tab to start tracking your pace."
    : left < 0
    ? `Over by ${fmt(-left)}. No lecture — trim whatever's running hottest for a few days and it closes.`
    : ahead > 0
    ? `You're ${fmt(ahead)} ahead of pace for day ${dayOfMonth}. Nice.`
    : `Running ${fmt(-ahead)} hot for day ${dayOfMonth}, but nothing dramatic.`;

  const catRows = useMemo(() => {
    return Object.keys(CATS)
      .map((k) => {
        const c = CATS[k];
        const b = budgets[k] || 0;
        const s = spentByCat[k] || 0;
        const pct = b ? Math.min(s / b, 1) : 0;
        const note = !b
          ? "No budget set yet"
          : s > b
          ? `${fmt(s - b)} over its ${short(b)} budget`
          : b - s < b * 0.15
          ? `${fmt(b - s)} left — getting thin`
          : `${fmt(b - s)} left of ${short(b)}`;
        return { k, n: c.n, c: c.c, s, b, pct, note, over: s > b };
      })
      .sort((a, b) => b.s - a.s);
  }, [budgets, spentByCat]);

  const groups = useMemo(() => {
    const map = new Map();
    transactions.forEach((t) => {
      const label = dayLabel(t.occurred_at, now);
      if (!map.has(label)) map.set(label, []);
      map.get(label).push(t);
    });
    return Array.from(map.entries()).map(([label, items]) => ({
      label,
      items,
      total: items.reduce((a, t) => a + t.amt, 0)
    }));
  }, [transactions]);

  const monthlyTotals = useMemo(() => {
    const buckets = {};
    transactions.forEach((t) => {
      const key = `${t.occurred_at.getFullYear()}-${t.occurred_at.getMonth()}`;
      buckets[key] = (buckets[key] || 0) + t.amt;
    });
    const out = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      out.push({ m: d.toLocaleDateString("en-US", { month: "short" }), v: buckets[key] || 0, current: i === 0 });
    }
    return out;
  }, [transactions]);

  const calAmts = useMemo(() => {
    const arr = new Array(daysInMonth).fill(0);
    transactions.forEach((t) => {
      if (t.occurred_at.getFullYear() === now.getFullYear() && t.occurred_at.getMonth() === now.getMonth()) {
        arr[t.occurred_at.getDate() - 1] += t.amt;
      }
    });
    return arr;
  }, [transactions]);

  const monthlyTotalsByCat = useMemo(() => {
    const buckets = {};
    Object.keys(CATS).forEach((k) => { buckets[k] = {}; });
    transactions.forEach((t) => {
      const key = `${t.occurred_at.getFullYear()}-${t.occurred_at.getMonth()}`;
      if (!buckets[t.cat]) return;
      buckets[t.cat][key] = (buckets[t.cat][key] || 0) + t.amt;
    });
    const out = {};
    Object.keys(CATS).forEach((k) => {
      const arr = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        arr.push({ m: d.toLocaleDateString("en-US", { month: "short" }), v: buckets[k][key] || 0, current: i === 0 });
      }
      out[k] = arr;
    });
    return out;
  }, [transactions]);

  const catHistory = useMemo(() => {
    const sums = {};
    Object.keys(CATS).forEach((k) => { sums[k] = {}; });
    transactions.forEach((t) => {
      const key = `${t.occurred_at.getFullYear()}-${t.occurred_at.getMonth()}`;
      if (!sums[t.cat]) return;
      sums[t.cat][key] = (sums[t.cat][key] || 0) + t.amt;
    });
    const monthsBack = [1, 2, 3].map((i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return `${d.getFullYear()}-${d.getMonth()}`;
    });
    const out = {};
    Object.keys(CATS).forEach((k) => { out[k] = monthsBack.map((mk) => sums[k][mk] || 0); });
    return out;
  }, [transactions]);

  const upcoming = useMemo(() => {
    return subscriptions
      .filter((s) => s.next_charge_day && s.next_charge_day >= dayOfMonth)
      .sort((a, b) => a.next_charge_day - b.next_charge_day)
      .map((s) => ({ day: String(s.next_charge_day), n: s.name, amt: s.amount }));
  }, [subscriptions, dayOfMonth]);
  const upcomingTotal = upcoming.reduce((a, u) => a + u.amt, 0);

  const health = useMemo(() => {
    const income = Number(healthInputs?.income || 0);
    const rawPace = totalBudget ? totalSpent / totalBudget : 0;
    const spendingStatus = !totalBudget ? "yellow" : rawPace <= 0.85 ? "green" : rawPace <= 1 ? "yellow" : "red";

    const savingsThisMonth = Number(healthInputs?.savings_this_month || 0);
    const targetRate = Number(healthInputs?.savings_target_rate || 0.15);
    const savingsRate = income ? savingsThisMonth / income : 0;
    const savingsStatus = !income ? "yellow" : savingsRate >= targetRate ? "green" : savingsRate >= 0.05 ? "yellow" : "red";

    const debtBalance = Number(healthInputs?.debt_balance || 0);
    const debtToIncome = income ? debtBalance / income : 0;
    const debtStatus = !debtBalance ? "green" : !income ? "yellow" : debtToIncome < 0.3 ? "green" : debtToIncome < 0.5 ? "yellow" : "red";

    const emergencyFund = goals.find((g) => g.name === "Emergency fund");
    const emergencyMonths = emergencyFund && totalBudget ? emergencyFund.saved / totalBudget : 0;
    const emergencyStatus = !totalBudget ? "yellow" : emergencyMonths >= 3 ? "green" : emergencyMonths >= 1 ? "yellow" : "red";

    const cashFlow = income - totalBudget;
    const cashFlowStatus = !income ? "yellow" : cashFlow >= 200 ? "green" : cashFlow >= 0 ? "yellow" : "red";

    const breakdown = [
      { k: "spending", label: "Spending", status: spendingStatus, word: STATUS_WORD[spendingStatus] },
      { k: "savings", label: "Savings", status: savingsStatus, word: STATUS_WORD[savingsStatus] },
      { k: "debt", label: "Debt", status: debtStatus, word: STATUS_WORD[debtStatus] },
      { k: "emergency", label: "Emergency fund", status: emergencyStatus, word: STATUS_WORD[emergencyStatus] },
      { k: "cashflow", label: "Monthly cash flow", status: cashFlowStatus, word: STATUS_WORD[cashFlowStatus] }
    ];

    const score = Math.round(breakdown.reduce((a, b) => a + STATUS_SCORE[b.status], 0) / breakdown.length);
    const label = score >= 80 ? "Great" : score >= 65 ? "Good" : score >= 45 ? "Fair" : "Needs work";

    let biggestProblem = null;
    let worstPct = 0;
    Object.keys(catHistory).forEach((k) => {
      const hist = catHistory[k];
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

    return { score, label, breakdown, biggestProblem, ready: income > 0 };
  }, [totalSpent, totalBudget, healthInputs, goals, catHistory, spentByCat]);

  const emergencyFund = goals.find((g) => g.name === "Emergency fund") || null;

  const value = {
    loading,
    displayName: profile?.display_name || "You",
    memberSince: profile?.created_at ? new Date(profile.created_at) : null,
    cats: CATS,
    budgets,
    bumpBudget,
    transactions,
    addExpense,
    prefs: profile?.prefs || DEFAULT_PREFS,
    togglePref,
    spentByCat,
    totalSpent,
    totalBudget,
    left,
    daily,
    pace,
    heroLine,
    daysLeft,
    dayOfMonth,
    daysInMonth,
    catRows,
    groups,
    allocated,
    health,
    monthlyTotals,
    monthlyTotalsByCat,
    calAmts,
    upcoming,
    upcomingTotal,
    goals,
    subscriptions,
    addSubscription,
    deleteSubscription,
    healthInputs,
    updateHealthInputs,
    emergencyFund,
    updateEmergencyFund
  };

  return <SpendContext.Provider value={value}>{children}</SpendContext.Provider>;
}

export function useSpend() {
  const ctx = useContext(SpendContext);
  if (!ctx) throw new Error("useSpend must be used within SpendProvider");
  return ctx;
}
