import React, { useState, useEffect, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import LogoMark from "../components/LogoMark";
import ThemeToggle from "../components/ThemeToggle";
import "./Landing.css";

const IntroSplash = lazy(() => import("../components/IntroSplash"));

const FEATURES = [
  {
    title: "Financial Health score",
    body: "One number — spending, savings, debt, emergency fund, and cash flow rolled into a 0–100 score, not just a balance.",
    color: "#c67139"
  },
  {
    title: "Real budgets, not guesses",
    body: "Set a budget per category and watch it update live as you log expenses — on your phone or in the browser.",
    color: "#56633f"
  },
  {
    title: "Catches what's running hot",
    body: "SmartSpend compares this month against your own history and tells you where you're actually overspending.",
    color: "#8c491a"
  }
];

export default function Landing() {
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("smartspend_intro_seen");
    if (!seen) {
      setShowIntro(true);
      sessionStorage.setItem("smartspend_intro_seen", "1");
    }
  }, []);

  return (
    <div className="landing">
      {showIntro && (
        <Suspense fallback={<div className="intro-splash-fallback" />}>
          <IntroSplash onDone={() => setShowIntro(false)} />
        </Suspense>
      )}

      <header className="landing-nav">
        <div className="landing-logo">
          <LogoMark size={32} radius={9} />
          <span>SmartSpend</span>
        </div>
        <div className="landing-nav-links">
          <ThemeToggle />
          <Link to="/login" className="nav-link">Sign in</Link>
          <Link to="/signup" className="nav-cta">Get started</Link>
        </div>
      </header>

      <section className="landing-hero">
        <p className="hero-kicker">Budgeting that tells you the truth</p>
        <h1 className="hero-title">Know your money's<br />financial health.</h1>
        <p className="hero-body">
          Not just a balance — a real score for spending, savings, debt, and emergency fund,
          plus the one habit costing you the most this month.
        </p>
        <div className="hero-ctas">
          <Link to="/signup" className="hero-primary-btn">Start tracking, free</Link>
          <Link to="/login" className="hero-secondary-btn">I already have an account</Link>
        </div>
      </section>

      <section className="landing-mock-wrap">
        <div className="landing-mock">
          <div className="mock-card">
            <p className="mock-kicker">Financial health</p>
            <div className="mock-score-row">
              <span className="mock-score">78</span>
              <span className="mock-score-max">/100</span>
              <span className="mock-score-label">— Good</span>
            </div>
            <div className="mock-rows">
              <div className="mock-row"><span className="mock-dot" style={{ background: "#56633f" }} />Spending<span className="mock-word" style={{ color: "#56633f" }}>Good</span></div>
              <div className="mock-row"><span className="mock-dot" style={{ background: "#c67139" }} />Savings<span className="mock-word" style={{ color: "#c67139" }}>Needs improvement</span></div>
              <div className="mock-row"><span className="mock-dot" style={{ background: "#56633f" }} />Emergency fund<span className="mock-word" style={{ color: "#56633f" }}>Good</span></div>
            </div>
            <div className="mock-callout">Your biggest problem this month is food spending — 23% above your 3-month average.</div>
          </div>
        </div>
      </section>

      <section className="landing-features">
        {FEATURES.map((f) => (
          <div key={f.title} className="feature-card">
            <div className="feature-dot" style={{ background: f.color }} />
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </div>
        ))}
      </section>

      <section className="landing-cta-band">
        <h2>Track it from your phone or your browser.</h2>
        <p>Same account, same data, same score — everywhere you check it.</p>
        <Link to="/signup" className="hero-primary-btn">Create your free account</Link>
      </section>

      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} SmartSpend</span>
        <div className="landing-footer-links">
          <Link to="/login">Sign in</Link>
          <Link to="/signup">Sign up</Link>
        </div>
      </footer>
    </div>
  );
}
