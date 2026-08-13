import React, { useState, useEffect } from "react";
import LoadingScene from "./LoadingScene";
import "./IntroSplash.css";

export default function IntroSplash({ onDone }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 1900);
    const t2 = setTimeout(() => onDone(), 2450);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className={`intro-splash ${fading ? "fade-out" : ""}`}>
      <LoadingScene />
      <div className="intro-overlay">
        <p className="intro-wordmark">SmartSpend</p>
        <div className="intro-bar"><div className="intro-bar-fill" /></div>
      </div>
    </div>
  );
}
