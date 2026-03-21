import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function AnimatedProgressBar({ req, earned, color, label, done }) {
  const pct = Math.min(100, (earned / req) * 100);
  const isDone = done || earned >= req;
  const prevRef = useRef(0);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (earned > prevRef.current) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 800);
    }
    prevRef.current = earned;
  }, [earned]);

  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, color: isDone ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", gap: "4px" }}>
          {isDone ? <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ color, fontSize: "10px" }}>✓</motion.span> : null}
          {label}
        </span>
        <motion.span
          key={label + earned}
          initial={{ scale: 1.5, color: "#FBBF24" }}
          animate={{ scale: 1, color: isDone ? color : "rgba(255,255,255,0.35)" }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          style={{ fontSize: "11px", fontWeight: 700, fontVariantNumeric: "tabular-nums", display: "inline-block" }}
        >
          {earned.toFixed(1)}/{req}
        </motion.span>
      </div>
      <div style={{ height: "6px", borderRadius: "999px", background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <motion.div
          animate={{ width: pct + "%" }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          style={{ height: "100%", borderRadius: "999px", background: color, overflow: "hidden", position: "relative" }}
        >
          <AnimatePresence>
            {justAdded && !isDone ? (
              <motion.div
                initial={{ x: "-100%", opacity: 1 }}
                animate={{ x: "100%", opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.75),transparent)" }}
              />
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
