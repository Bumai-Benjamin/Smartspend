import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSpend } from "../context/SpendContext";
import { useAuth } from "../context/AuthContext";
import LogoMark from "../components/LogoMark";
import ThemeToggle from "../components/ThemeToggle";
import "./AuthPage.css";
import "./Onboarding.css";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export default function Onboarding() {
  const { avatarUrl, updateProfile, uploadAvatar } = useSpend();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [name, setName] = useState("");
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setAvatarError("");
    if (!file.type.startsWith("image/")) { setAvatarError("Pick an image file."); return; }
    if (file.size > MAX_AVATAR_BYTES) { setAvatarError("Image must be under 5MB."); return; }
    setAvatarBusy(true);
    try {
      await uploadAvatar(file);
    } finally {
      setAvatarBusy(false);
    }
  }

  function finish(withName) {
    setBusy(true);
    const patch = { onboarded: true };
    if (withName) {
      const trimmed = name.trim();
      if (trimmed) patch.display_name = trimmed;
    }
    updateProfile(patch);
    navigate("/app", { replace: true });
  }

  return (
    <div className="auth-screen">
      <div className="auth-top-row">
        <div className="auth-logo-link">
          <LogoMark size={36} radius={10} />
          <span className="auth-logo-text">SmartSpend</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="auth-card onboarding-card">
        <h1 className="auth-title">Welcome to SmartSpend</h1>
        <p className="onboarding-sub">Add a name and a photo — or skip and do it later from the You tab.</p>

        <div className="onboarding-avatar-row">
          <button
            type="button"
            className="onboarding-avatar avatar-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarBusy}
            aria-label="Add a profile picture"
          >
            {avatarUrl ? <img src={avatarUrl} alt="" className="avatar-img" /> : (user?.email || "?").charAt(0).toUpperCase()}
            <span className="avatar-edit-badge">{avatarBusy ? "…" : "✎"}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="avatar-file-input"
            onChange={handleAvatarChange}
          />
        </div>
        {avatarError && <p className="auth-error" style={{ textAlign: "center" }}>{avatarError}</p>}

        <label className="auth-field">
          <span>Your name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What should we call you?"
            maxLength={40}
          />
        </label>

        <button type="button" className="auth-submit" disabled={busy} onClick={() => finish(true)}>
          {busy ? "Please wait…" : "Continue"}
        </button>
        <button type="button" className="onboarding-skip" disabled={busy} onClick={() => finish(false)}>
          Skip for now
        </button>
      </div>
    </div>
  );
}
