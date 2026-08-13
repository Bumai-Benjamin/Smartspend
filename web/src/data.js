// Static category metadata. Budgets, spend, goals, subscriptions and health
// figures all come from Supabase — see src/context/SpendContext.jsx.
export const CATS = {
  home:   { n: "Home & bills",  c: "#645c50", max: 3000 },
  food:   { n: "Food & drink",  c: "#d67f48", max: 800 },
  groc:   { n: "Groceries",     c: "#8fa073", max: 800 },
  fun:    { n: "Fun",           c: "#f6a06b", max: 500 },
  subs:   { n: "Subscriptions", c: "#56633f", max: 300 },
  trans:  { n: "Transport",     c: "#8c491a", max: 500 },
  health: { n: "Health",        c: "#a19786", max: 500 }
};
