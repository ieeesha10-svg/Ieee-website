import React from "react";

const QUOTES = [
  "Hold on, the server is taking a sip of coffee... ☕",
  "Compiling some greatness... just a sec! ✨",
];

export default function LoadingPage() {
  const quote = React.useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)])[0];

  return (
    <div className="loader-screen">
      <div className="spinner-container">
        <div className="ring-outer"></div>
        <div className="ring-inner"></div>
      </div>
      <div className="loader-text-container">
        <h2 className="loader-title">IEEE El-Sherouk Academy</h2>
        <p className="loader-subtitle">Loading</p>
        <p className="loader-quote">{quote}</p>
      </div>
    </div>
  );
}
