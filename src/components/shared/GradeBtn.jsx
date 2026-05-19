import { useRef, useState } from "react";

import { getCourseSlots } from "../../lib/courseRules.js";

import { GRADE_MAX } from "../../lib/plannerRules.js";



export function GradeBtn({ grade, plan, selectedCourse, gradeSlots,
                   getCoursesBeforeGrade, getAllCoursesUpTo, getUnmetPrereqs,
                   getCoreConflict, planUids, setPlan,
                   showToast, setModalWarn }) {
  // btnState: "idle" | "adding" | "done" | "removing"
  const [btnState, setBtnState] = useState("idle");
  // justAdded: true right after clicking add — prevents immediate × Remove on hover
  const justAdded = useRef(false);
  const [hovered, setHovered] = useState(false);
  const canUseHover = typeof window !== "undefined" &&
    window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches;
  const actionDelay = canUseHover ? 220 : 120;

  const already     = !selectedCourse.repeatable && Object.values(plan).flat().includes(selectedCourse.id);
  const inThisGrade = (plan[grade]||[]).includes(selectedCourse.id);
  const usedSlots   = gradeSlots(plan, grade);
  const wouldExceed = !inThisGrade && usedSlots + getCourseSlots(selectedCourse) > GRADE_MAX;
  const full        = usedSlots >= GRADE_MAX;
  // disabled only when another grade has it AND not repeatable, or grade is full (but not for the grade it's already IN)
  const disabled    = (already && !inThisGrade && !selectedCourse.repeatable) || wouldExceed;
  const isDone      = btnState === "done" || (btnState === "idle" && inThisGrade);
  const isRemoving  = btnState === "removing";

  function doAdd() {
    setBtnState("adding");
    setTimeout(() => {
      let added = false;
      setPlan(p => {
        const n = JSON.parse(JSON.stringify(p));
        if (!selectedCourse.repeatable && Object.values(n).flat().includes(selectedCourse.id)) return p;
        n[grade].push(selectedCourse.id);
        planUids.current[grade].push(Math.random().toString(36).slice(2));
        added = true;
        return n;
      });
      if (added) {
        setBtnState("done");
        justAdded.current = true;
        setModalWarn(null);
        showToast("Added \"" + selectedCourse.name + "\" to Grade " + grade);
      } else {
        setBtnState("idle");
      }
    }, actionDelay);
  }

  function doRemove() {
    setBtnState("removing");
    setTimeout(() => {
      setPlan(p => {
        const n = JSON.parse(JSON.stringify(p));
        const idx = n[grade].indexOf(selectedCourse.id);
        if (idx === -1) return p;
        n[grade].splice(idx, 1);
        planUids.current[grade].splice(idx, 1);
        return n;
      });
      justAdded.current = false;
      setBtnState("idle");
      showToast("Removed \"" + selectedCourse.name + "\" from Grade " + grade);
    }, actionDelay);
  }

  function handleClick() {
    if (disabled) return;
    if (isDone || isRemoving) {
      if (!canUseHover || !hovered || justAdded.current) return;
      doRemove();
      return;
    }
    if (btnState !== "idle") return;
    const before = getCoursesBeforeGrade(plan, grade);
    const upTo   = getAllCoursesUpTo(plan, grade);
    const unmet  = getUnmetPrereqs(selectedCourse.id, before, upTo);
    if (unmet.length > 0) {
      setModalWarn({ grade, unmet, coreConflict: null });
      return;
    }
    const conflict = getCoreConflict(selectedCourse.id, grade);
    if (conflict) {
      setModalWarn({ grade, unmet: [], coreConflict: conflict });
      return;
    }
    doAdd();
  }

  // Visual state derivations
  // "Grade X" visible when: idle and not done
  // "✓ Added!" visible when: done
  // "× Remove" label slides in from below when hovering done state — handled via CSS hover
  // We use a third span for the remove hint on hover
  const showDone    = isDone && !isRemoving;
  const showLeaving = btnState === "adding" || (isRemoving);
  // Border / bg based on state
  const borderCol = isDone ? "#059669" : full ? "var(--border)" : "var(--border)";
  const bgCol     = isDone ? "#F0FDF4" : full ? "#F9FAFB" : "white";
  const textCol   = isDone ? "#166634" : full ? "var(--muted)" : "var(--text)";
  const scaling   = (btnState === "adding" || isRemoving) ? "scale(0.93)" : "scale(1)";

  return (
    <button onClick={handleClick}
      className={"grade-toggle-btn" + (isDone ? " grade-done" : "")}
      style={{
        fontSize:"13px", fontWeight:700,
        cursor: disabled ? "not-allowed" : "pointer",
        borderRadius:"8px", overflow:"hidden", position:"relative",
        border:"1.5px solid " + borderCol,
        background: bgCol, color: textCol,
        fontFamily:"inherit", height:"40px", minWidth:"100px",
        display:"flex", alignItems:"center", justifyContent:"center",
        transform: scaling,
        transition:"transform 0.2s cubic-bezier(0.34,1.56,0.64,1), background 0.25s, border-color 0.25s, color 0.25s",
        opacity: disabled ? 0.45 : 1,
      }}
      onMouseEnter={e=>{ if(disabled || !canUseHover) return;
        justAdded.current = false;
        setHovered(true);
        if(isDone){
          e.currentTarget.style.background="#FFF0F0";
          e.currentTarget.style.color="var(--red)";
          e.currentTarget.style.borderColor="var(--red)";
          e.currentTarget.style.transform="scale(1.06)";
        } else {
          e.currentTarget.style.background="#B00804";
          e.currentTarget.style.color="white";
          e.currentTarget.style.borderColor="#B00804";
          e.currentTarget.style.transform="scale(1.06)";
        }
      }}
      onMouseLeave={e=>{ if(disabled || !canUseHover) return;
        justAdded.current = false;
        setHovered(false);
        e.currentTarget.style.background=bgCol;
        e.currentTarget.style.color=textCol;
        e.currentTarget.style.borderColor=borderCol;
        e.currentTarget.style.transform="scale(1)";
      }}
      onTouchStart={()=>setHovered(false)}
      onPointerCancel={()=>setHovered(false)}
      onBlur={()=>setHovered(false)}>
      {/* "Grade X" — idle label, slides out when adding or done */}
      <span style={{
        position:"absolute", left:0, right:0,
        display:"flex", alignItems:"center", justifyContent:"center",
        transition:"transform 0.3s cubic-bezier(0.19,1,0.22,1), opacity 0.25s",
        transform: (showLeaving || showDone) ? "translateY(-110%)" : "translateY(0)",
        opacity:   (showLeaving || showDone) ? 0 : 1,
        pointerEvents:"none",
      }}>
        {wouldExceed ? "No room" : full ? "Full " + grade : "Grade " + grade}
      </span>
      {/* "✓ Added!" — done label; shows × Remove only after mouse leaves + re-enters */}
      <span style={{
        position:"absolute", left:0, right:0,
        display:"flex", alignItems:"center", justifyContent:"center",
        transition:"transform 0.35s cubic-bezier(0.19,1,0.22,1), opacity 0.3s",
        transform: (showDone && !isRemoving) ? "translateY(0)" : isRemoving ? "translateY(-110%)" : "translateY(110%)",
        opacity:   (showDone && !isRemoving) ? 1 : 0,
        pointerEvents:"none",
      }}>
        {(hovered && !justAdded.current) ? (
          <span style={{ color:"var(--red)" }}>× Remove</span>
        ) : (
          <span>✓ Added!</span>
        )}
      </span>
      {/* "Grade X" slides back in after removal */}
    </button>
  );
}
