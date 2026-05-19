import { useState } from "react";

export function useStartupDisclaimer() {
  const [showStartupDisclaimer, setShowStartupDisclaimer] = useState(() => {
    try {
      return localStorage.getItem("kalani-disclaimer-dismissed") !== "true";
    } catch {
      return true;
    }
  });
  const [neverShowDisclaimer, setNeverShowDisclaimer] = useState(false);

  function closeStartupDisclaimer() {
    if (neverShowDisclaimer) {
      try {
        localStorage.setItem("kalani-disclaimer-dismissed", "true");
      } catch {}
    }
    setShowStartupDisclaimer(false);
  }

  return {
    showStartupDisclaimer,
    neverShowDisclaimer,
    setNeverShowDisclaimer,
    closeStartupDisclaimer,
  };
}
