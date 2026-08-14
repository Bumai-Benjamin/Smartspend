import React, { useState } from "react";
import { useSpend, fmt, guessCat, parseAmt, cleanLabel } from "../context/SpendContext";
import "./AddExpenseModal.css";

export default function AddExpenseModal({ onClose }) {
  const { cats, addExpense } = useSpend();
  const [mode, setMode] = useState("numpad");
  const [amt, setAmt] = useState("");
  const [cat, setCat] = useState("food");
  const [typedText, setTypedText] = useState("");
  const [typedCatOverride, setTypedCatOverride] = useState(null);

  const catKeys = Object.keys(cats);
  const amtNum = parseFloat(amt || "0") || 0;
  const typedCat = typedCatOverride || guessCat(typedText);
  const typedAmt = parseAmt(typedText);
  const isType = mode === "type";
  const activeAmt = isType ? typedAmt : amtNum;
  const activeCat = isType ? typedCat : cat;

  function press(k) {
    if (k === "⌫") { setAmt((a) => a.slice(0, -1)); return; }
    if (k === ".") { setAmt((a) => (a.indexOf(".") >= 0 ? a : (a || "0") + ".")); return; }
    setAmt((a) => {
      if (a.indexOf(".") >= 0 && a.split(".")[1].length >= 2) return a;
      return (a === "0" ? "" : a) + k;
    });
  }

  function cycleTypedCat() {
    const i = catKeys.indexOf(typedCat);
    setTypedCatOverride(catKeys[(i + 1) % catKeys.length]);
  }

  function save() {
    if (!activeAmt) return;
    const label = isType && typedText.trim() ? cleanLabel(typedText) : `${cats[cat].n} — typed`;
    addExpense({ n: label, cat: activeCat, amt: activeAmt });
    onClose();
  }

  const typedHint = !typedText.trim()
    ? 'Try "lunch w/ sam 18.50" — I’ll pull the amount and guess a category.'
    : typedCatOverride
    ? `Set to ${cats[typedCat].n}. Click again to change it.`
    : `Guessed ${cats[typedCat].n} from your text — click the chip to change it.`;

  const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-row-between">
          <h2 className="modal-title">Spent on what?</h2>
          <button className="modal-cancel" onClick={onClose}>Cancel</button>
        </div>

        <div className="modal-seg">
          {[["numpad", "Numpad"], ["type", "Type it"]].map(([k, label]) => (
            <button key={k} className={`modal-seg-opt ${mode === k ? "active" : ""}`} onClick={() => setMode(k)}>
              {label}
            </button>
          ))}
        </div>

        {mode === "numpad" ? (
          <div>
            <div className="modal-amt-row">
              <span className="modal-dollar">$</span>
              <span className="modal-amt-display" style={{ color: amtNum > 0 ? "var(--ink)" : "rgba(var(--ink-rgb), 0.35)" }}>{amt || "0"}</span>
            </div>
            <div className="modal-chips-scroll">
              {catKeys.map((k) => (
                <button key={k} className={`modal-cat-chip ${cat === k ? "active" : ""}`} onClick={() => setCat(k)}>
                  <span className="modal-dot" style={{ background: cats[k].c }} />
                  {cats[k].n}
                </button>
              ))}
            </div>
            <div className="modal-keypad">
              {KEYS.map((k) => (
                <button key={k} className="modal-key" onClick={() => press(k)}>{k}</button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="modal-type-input-wrap">
              <input
                autoFocus
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                placeholder="lunch w/ sam 18.50"
                className="modal-type-input"
              />
            </div>
            <div className="modal-chips-row">
              <button className="modal-typed-cat-chip" onClick={cycleTypedCat}>
                <span className="modal-dot" style={{ background: cats[typedCat].c }} />
                {cats[typedCat].n}
              </button>
              <span className="modal-static-chip">{typedAmt > 0 ? fmt(typedAmt) : "Enter an amount"}</span>
              <span className="modal-static-chip">Today</span>
            </div>
            <p className="modal-hint">{typedHint}</p>
          </div>
        )}

        <button
          className="modal-save-btn"
          disabled={!(activeAmt > 0)}
          onClick={save}
        >
          {activeAmt > 0 ? `Log ${fmt(activeAmt)} to ${cats[activeCat].n}` : isType ? "Type an amount first" : "Click a number first"}
        </button>
      </div>
    </div>
  );
}
