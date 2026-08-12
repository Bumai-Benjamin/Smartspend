# SmartSpend (Expo / React Native)

Real app codebase implementing the "1a" interactive prototype: Home, Activity,
Insights, Plan, You tabs, category detail, and the numpad/type-it add-expense
sheet. Styled from the Organic design system tokens (cream ground, terracotta
accent, sage second accent, Caprasimo + Figtree).

## Run it

```
cd app
npm install
npx expo install   # aligns native module versions to your Expo SDK
npx expo start
```

Scan the QR code with Expo Go, or press `a` for an Android emulator.

## Build an APK

```
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```

The `preview` profile in `eas.json` is set to `buildType: apk`, so this
produces an installable `.apk` (not an `.aab`) you can sideload directly.

## Structure

- `App.js` — loads fonts, wraps the app in `SpendProvider` and the navigator.
- `src/context/SpendContext.js` — all app state and derived numbers (spend
  totals, pace, category rows, budgets) plus the free-text parser used by
  "Type it" add-expense (`guessCat`, `parseAmt`, `cleanLabel`).
- `src/data.js` — mock categories, transactions, subscriptions, goals.
- `src/screens/` — one file per screen, matching the prototype 1:1.
- `src/navigation/RootNavigator.js` — bottom tabs + category detail push +
  add-expense modal.
- `src/theme.js` — colors/fonts/radii lifted from the Organic tokens.

## Known gaps to fill in for production

- All data in `src/data.js` is mock/static — wire up real bank sync or a
  backend before shipping.
- No persistence yet (added expenses reset on app restart) — add
  `AsyncStorage` or a backend.
- No auth / Face ID gating despite the toggle in **You** — the toggle is
  currently cosmetic.
- App icon/splash are Expo defaults — drop in real assets and reference them
  in `app.json` before a store build.
