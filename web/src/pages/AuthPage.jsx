import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LogoMark from "../components/LogoMark";
import ThemeToggle from "../components/ThemeToggle";
import "./AuthPage.css";

export default function AuthPage({ mode: initialMode }) {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!email.trim() || !password) {
      setError("Enter an email and password.");
      return;
    }
    if (mode === "signup" && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn(email.trim(), password);
        navigate("/app");
      } else {
        await signUp(email.trim(), password);
        setNotice("Check your email to confirm your account, then sign in.");
        setMode("signin");
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-top-row">
        <Link to="/" className="auth-logo-link">
          <LogoMark size={36} radius={10} />
          <span className="auth-logo-text">SmartSpend</span>
        </Link>
        <ThemeToggle />
      </div>

      <form className="auth-card" onSubmit={submit}>
        <h1 className="auth-title">{mode === "signin" ? "Welcome back" : "Let's set up your budget"}</h1>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === "signin" ? "active" : ""}`}
            onClick={() => { setMode("signin"); setError(""); setNotice(""); }}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === "signup" ? "active" : ""}`}
            onClick={() => { setMode("signup"); setError(""); setNotice(""); }}
          >
            Sign up
          </button>
        </div>

        <label className="auth-field">
          <span>Email</span>
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>
        <label className="auth-field">
          <span>Password</span>
          <input
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>

        {error && <p className="auth-error">{error}</p>}
        {notice && <p className="auth-notice">{notice}</p>}

        <button type="submit" className="auth-submit" disabled={busy}>
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>
    </div>
  );
}
