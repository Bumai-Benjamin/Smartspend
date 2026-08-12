export const CATS = {
  home:   { n: "Home & bills",  c: "#645c50", b: 1050, s: 1050 },
  food:   { n: "Food & drink",  c: "#d67f48", b: 320,  s: 268.40 },
  groc:   { n: "Groceries",     c: "#8fa073", b: 300,  s: 214.10 },
  fun:    { n: "Fun",           c: "#f6a06b", b: 220,  s: 154.00 },
  subs:   { n: "Subscriptions", c: "#56633f", b: 95,   s: 63.15 },
  trans:  { n: "Transport",     c: "#8c491a", b: 140,  s: 62.75 },
  health: { n: "Health",        c: "#a19786", b: 75,   s: 0 }
};

export const BASE_GROUPS = [
  { label: "Today · Wed 12", items: [
    { n: "Blue Bottle", cat: "food", amt: 5.40, meta: "card ·1274" },
    { n: "Metro top-up", cat: "trans", amt: 2.75, meta: "typed by you" },
    { n: "Corner store", cat: "groc", amt: 2.50, meta: "cash" } ] },
  { label: "Yesterday · Tue 11", items: [
    { n: "Trader Joe's", cat: "groc", amt: 63.28, meta: "card ·1274" },
    { n: "Ramen Kiyo", cat: "food", amt: 20.03, meta: "card ·1274" },
    { n: "Rialto Cinema", cat: "fun", amt: 18.00, meta: "card ·1274" },
    { n: "Spotify", cat: "subs", amt: 11.99, meta: "recurring · 11th" } ] },
  { label: "Mon 10 August", items: [
    { n: "Rent — Ardmore St", cat: "home", amt: 1050, meta: "transfer · monthly" },
    { n: "Lunch, Café Otto", cat: "food", amt: 16.50, meta: "card ·1274" },
    { n: "Metro card", cat: "trans", amt: 8.15, meta: "card ·1274" } ] },
  { label: "Sun 9 August", items: [
    { n: "Sunday market", cat: "groc", amt: 34.25, meta: "cash" },
    { n: "Kombucha", cat: "food", amt: 7.00, meta: "card ·1274" } ] }
];

export const SUBS_DATA = [
  { n: "Spotify Duo", amt: 11.99, meta: "Charged on the 11th · used daily", c: "#56633f" },
  { n: "Ridge Gym", amt: 29.00, meta: "Charged on the 21st · idle since June", c: "#8c491a" },
  { n: "Cloud Drive 2TB", amt: 2.99, meta: "Charged on the 18th · used weekly", c: "#8fa073" },
  { n: "Streamline TV", amt: 15.99, meta: "Charged on the 24th · used weekly", c: "#d67f48" },
  { n: "Figtree Pro fonts", amt: 12.00, meta: "Charged on the 28th · work expense", c: "#645c50" },
  { n: "The Long Read", amt: 5.00, meta: "Charged on the 3rd · paid", c: "#a19786" }
];

// spend per day for days 1-12 (day 12 = today); days 13-31 are future / not yet spent
export const CAL_AMTS = [42.40, 118.60, 26.50, 88.75, 62.10, 0, 154.30, 79.90, 41.25, 1074.65, 113.30, 10.65];

export const MONTHS_DATA = [
  { m: "Mar", v: 2180 }, { m: "Apr", v: 2410 }, { m: "May", v: 2260 },
  { m: "Jun", v: 2520 }, { m: "Jul", v: 2330 }
];

export const UPCOMING = [
  { day: "18", n: "Cloud Drive 2TB", amt: 2.99 },
  { day: "21", n: "Ridge Gym", amt: 29.00 },
  { day: "24", n: "Streamline TV", amt: 15.99 },
  { day: "28", n: "Figtree Pro fonts", amt: 12.00 }
];

export const GOALS = [
  { n: "Emergency fund", saved: 1240, target: 3000, note: "At $180 a month you are there by next April. Round-ups would shave five weeks off." },
  { n: "New laptop", saved: 620, target: 1800, note: "Funded by whatever Fun does not spend. Last month contributed $66." }
];

export const SOURCES = [
  { n: "Ardmore Credit Union ·1274", meta: "synced 6 min ago", dot: "#7a8a5e" },
  { n: "Cash & typed entries", meta: "11 this month", dot: "#c67139" },
  { n: "Receipts (beta)", meta: "not set up", dot: "#c0b6a5" }
];

export const INCOME = 3200;

export const SAVINGS = { thisMonth: 220, targetRate: 0.15 };

export const DEBT = { balance: 650, limit: 2500, note: "Card ·1274 · min payment made on time" };

// last 3 months of spend per category, for trend comparisons
export const CAT_HISTORY = {
  home:   [1050, 1050, 1050],
  food:   [225, 210, 225],
  groc:   [270, 255, 258],
  fun:    [145, 138, 142],
  subs:   [64, 66, 63],
  trans:  [68, 72, 70],
  health: [15, 10, 18]
};

export const TAKEAWAYS = [
  { kicker: "Habit spotted", text: "Every Friday costs you about $38. That is one whole envelope a month.", bg: "#fff2eb", kc: "#8c491a", tc: "#643312" },
  { kicker: "Quietly good", text: "Groceries are down 18% on July while eating out held flat. Cooking is winning.", bg: "#f0fae1", kc: "#56633f", tc: "#272e1b" },
  { kicker: "Watch this", text: "Subscriptions creep: three renewals land in the last week of the month, right when cash is thin.", bg: "#ebddc5", kc: "rgba(32,30,29,0.55)", tc: "#201e1d" }
];
