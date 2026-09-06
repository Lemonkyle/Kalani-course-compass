import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { planAdditionError, planAdditionWarnings } from "../../lib/plannerRules.js";

export function GradeBtn({ grade, plan, selectedCourse, getCourse, priorCredits, onAdd, onRemove }) {
  const [showRemove, setShowRemove] = useState(false);
  const reduceMotion = useReducedMotion();
  const index = (plan[grade] || []).indexOf(selectedCourse.id);
  const added = index !== -1;
  const error = added ? null : planAdditionError(plan, grade, selectedCourse, getCourse);
  const warnings = added || error ? [] : planAdditionWarnings(plan, grade, selectedCourse, getCourse, priorCredits);
  const removing = added && showRemove;
  const label = added ? (removing ? "× Remove" : "✓ Added!") : `Grade ${grade}${warnings.length ? " ⚠" : ""}`;

  return (
    <motion.button type="button" className="grade-toggle-btn" disabled={Boolean(error)}
      aria-label={`${added ? "Remove" : "Add"} ${selectedCourse.name} ${added ? "from" : "to"} Grade ${grade}`}
      aria-pressed={added}
      title={error || (added ? `Click to remove from Grade ${grade}` : warnings.map(warning => warning.message).join("\n")) || undefined}
      onClick={() => {
        setShowRemove(false);
        if (added) onRemove(grade, index);
        else onAdd(grade, selectedCourse.id);
      }}
      onHoverStart={() => setShowRemove(added)} onHoverEnd={() => setShowRemove(false)}
      onBlur={() => setShowRemove(false)}
      whileHover={!error && !reduceMotion ? { scale: 1.04 } : undefined}
      whileTap={!error && !reduceMotion ? { scale: 0.93 } : undefined}
      animate={{
        backgroundColor: removing ? "#FFF0F0" : added ? "#F0FDF4" : "#FFFFFF",
        borderColor: removing ? "#B00804" : added ? "#059669" : "#E2E8F0",
        color: removing ? "#B00804" : added ? "#166534" : "#1E293B",
      }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
      style={{fontSize:13,fontWeight:700,borderRadius:8,padding:"10px 14px",fontFamily:"inherit",
        border:"1.5px solid",height:42,minWidth:105,overflow:"hidden",position:"relative",
        cursor:error ? "not-allowed" : "pointer",opacity:error ? .45 : 1,touchAction:"manipulation"}}>
      <AnimatePresence initial={false} mode="wait">
        <motion.span key={added ? (removing ? "remove" : "added") : "idle"} aria-hidden="true"
          initial={{opacity:0,y:reduceMotion ? 0 : 20}}
          animate={{opacity:1,y:0}}
          exit={{opacity:0,y:reduceMotion ? 0 : -20}}
          transition={{duration:reduceMotion ? 0 : 0.18,ease:"easeOut"}}
          style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
          {label}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
