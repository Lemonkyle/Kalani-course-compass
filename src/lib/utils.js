import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabase.js";
import {
  COURSES, GRAD_REQUIREMENTS, PREREQ_EQUIV, HONORS_DEFS,
  BEYOND_ALG2_IDS, DEPT_COLORS, DEFAULT_PLAN, DEPT_ORDER,
} from "./data.js";

// ───────────────────────────────────────────────────────────────────────────
export const GRADE_MAX = 9.0;

export function gradeSlots(plan, grade) {
  return (plan[grade] || []).reduce((s, cid) => {
    const c = COURSES.find(x => x.id === cid);
    return s + (c?.credits || 0);
  }, 0);
}


export function buildCourseSearchIndex(courses) {
  const index = new Map();
  for (const c of courses) {
    // name/code/dept/id → searched as substrings (precise fields)
    const nameText = [c.name, c.code, c.dept, c.id,
      c.ctePath, c.fineArtsType, c.miscType]
      .filter(Boolean).join(" ").toLowerCase();
    // desc/tips → tokenised into individual words for whole-word matching only
    const descWords = new Set(
      [c.desc, c.tips].filter(Boolean).join(" ")
        .toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length > 2)
    );
    index.set(c.id, { course: c, nameText, descWords });
  }
  return index;
}
export function filterIndexedCourses(index, query, limit) {
  if (!query || !query.trim()) return [];
  const tokens = query.trim().toLowerCase().split(/\s+/);
  const results = [];
  for (const { course, nameText, descWords } of index.values()) {
    let score = 0;
    const nameLow = (course.name || "").toLowerCase();
    for (const token of tokens) {
      // Tier 1 (10): exact full-name match
      if (nameLow === token) { score += 10; continue; }
      // Tier 2 (7): name starts with token (e.g. "AP " matches all AP courses)
      if (nameLow.startsWith(token + " ") || nameLow === token) { score += 7; continue; }
      // Tier 3 (5): name contains token as word (e.g. "calculus" in "AP Calculus")
      if (new RegExp("\\b" + token).test(nameLow)) { score += 5; continue; }
      // Tier 4 (3): code / dept / id / pathway substring match
      if (nameText.includes(token)) { score += 3; continue; }
      // Tier 5 (1): whole-word match in description only — no substring
      if (descWords.has(token)) { score += 1; }
    }
    if (score > 0) results.push({ course, score });
  }
  results.sort((a, b) => b.score - a.score);
  const out = results.map(r => r.course);
  return limit ? out.slice(0, limit) : out;
}


// ─── BACKEND ADAPTER ─────────────────────────────────────────────────────────────────────────────────
// V2: data is hardcoded below. V3: swap useCourseData() to fetch from Supabase/Firebase.
// DATA_SOURCE: "local" | "supabase" — now fetching from Supabase with local fallback

export function normalizeCourse(row) {
  // Convert Supabase row (snake_case, pg arrays) back to the shape the app expects
  return {
    id:                  row.id,
    code:                row.code || "",
    name:                row.name,
    subtitle:            row.subtitle || "",
    dept:                row.dept,
    ctePath:             row.cte_path || "",
    fineArtsType:        row.fine_arts_type || "",
    miscType:            row.misc_type || "",
    credits:             row.credits,
    gradeLevel:          row.grade_level || [],
    prereqs:             row.prereqs || [],
    concurrentOk:        row.concurrent_ok || [],
    gradCategory:        row.grad_category || null,
    gradCredits:         row.grad_credits ?? null,
    isAP:                row.is_ap || false,
    repeatable:          row.repeatable || false,
    teacherSigRequired:  row.teacher_sig_required || false,
    isOffCampus:         row.is_off_campus || false,
    desc:                row.desc || "",
    tips:                row.tips || "",
    gradeReqs:           row.grade_reqs || {},
    // Off Campus special fields — not stored in Supabase, injected here
    ...(row.is_off_campus ? {
      eligibility: [
        "Met ALL graduation requirements (except ELA 12 & Social Studies)",
        "Completed the Personal Transition Plan (PTP)",
        "Have a qualifying reason (see below)",
      ],
      reasons: [
        { label:"✅ Early graduation (Semester A only)", limit:"One semester maximum — Grade 12 Sem A only" },
        { label:"🟡 Work study / employment during school day", limit:"Requires proof of employment + counselor approval" },
      ],
      submissions: [
        "Google Off Campus Request Form (submitted online)",
        "Parent/guardian signature on the request form",
        "Counselor approval prior to off campus period",
      ],
      warning: "Off Campus approval is not automatic. All three eligibility conditions must be met and administrative approval granted.",
      deadline: "See counselor for current deadline",
    } : {}),
  };
}

// Custom dept + grade sort order matching original catalog

export function sortCourses(arr) {
  return [...arr].sort((a, b) => {
    // 1. Dept order
    const di = DEPT_ORDER.indexOf(a.dept);
    const dj = DEPT_ORDER.indexOf(b.dept);
    if (di !== dj) return (di === -1 ? 99 : di) - (dj === -1 ? 99 : dj);
    // 2. Within dept: lowest grade level first
    const gi = Math.min(...(a.gradeLevel || a.grade_level || [99]));
    const gj = Math.min(...(b.gradeLevel || b.grade_level || [99]));
    if (gi !== gj) return gi - gj;
    // 3. Alphabetical within same grade
    return (a.name || "").localeCompare(b.name || "");
  });
}

export function useCourseData() {
  const [courses, setCourses] = useState(sortCourses(COURSES));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .or("archived.is.null,archived.eq.false")
        .limit(500);

      if (error) {
        console.error("[Kalani Compass] fetchCourses error:", error.message);
        // Fallback: keep using local COURSES array
        setLoading(false);
        return;
      }
      if (data && data.length > 0) {
        console.log("[Kalani Compass] fetchCourses: got", data.length, "courses from Supabase");
        setCourses(sortCourses(data.map(normalizeCourse)));
      } else {
        console.warn("[Kalani Compass] fetchCourses: empty response, using local fallback");
      }
      setLoading(false);
    }
    fetchCourses();
  }, []);

  return { courses, gradReqs: GRAD_REQUIREMENTS, loading, error: null };
}
export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnnouncements() {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("visible", true)
        .or(`ends_at.is.null,ends_at.gte.${now}`)
        .order("created_at", { ascending: false });
      if (!error && data) setAnnouncements(data);
      setLoading(false);
    }
    fetchAnnouncements();
  }, []);

  return { announcements, loading };
}
// ─────────────────────────────────────────────────────────────────────────────────

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');`;

// ───────────────────────────────────────────────────────────────────────────
export function getCourse(id) { return COURSES.find(c => c.id === id); }
export function getCourseName(id) { const c = getCourse(id); return c ? c.name : id; }

// Returns display string for a prereq, including equivalents: "Chemistry or Honors Chemistry"
export function getPrereqDisplay(prereqId) {
  const equivs = PREREQ_EQUIV[prereqId] || [];
  const names = [getCourseName(prereqId), ...equivs.map(getCourseName)];
  return names.join(" or ");
}

// PREREQ_EQUIV imported from data.js

export function isPrereqSatisfied(prereqId, completedIds) {
  if (completedIds.includes(prereqId)) return true;
  const equivs = PREREQ_EQUIV[prereqId] || [];
  return equivs.some(eq => completedIds.includes(eq));
}

export function getCoursesBeforeGrade(plan, targetGrade) {
  return Object.entries(plan)
    .filter(([g]) => Number(g) < targetGrade)
    .flatMap(([, ids]) => ids);
}

export function getAllCoursesUpTo(plan, targetGrade) {
  return Object.entries(plan)
    .filter(([g]) => Number(g) <= targetGrade)
    .flatMap(([, ids]) => ids);
}

// prereqs = must be completed in PREVIOUS grades
// concurrentOk = can be in same grade OR previous grades
export function getUnmetPrereqs(courseId, completedBefore, completedUpTo) {
  const course = getCourse(courseId);
  if (!course) return [];
  const strictUnmet = (course.prereqs||[]).filter(pid => !isPrereqSatisfied(pid, completedBefore));
  const concurrentUnmet = (course.concurrentOk||[]).filter(pid => !isPrereqSatisfied(pid, completedUpTo||completedBefore));
  return [...strictUnmet, ...concurrentUnmet];
}



export function computeHonorsProgress(plan) {
  const allIds = Object.values(plan).flat();
  const allCourses = allIds.map(id => getCourse(id)).filter(Boolean);

  const mathCredits = allCourses.filter(c=>c.dept==="Mathematics").reduce((s,c)=>s+c.credits,0);
  const sciCredits  = allCourses.filter(c=>c.dept==="Science").reduce((s,c)=>s+c.credits,0);
  const hasAlg2     = allIds.some(id=>id==="ALG2");
  const hasBeyondAlg2 = allIds.some(id=>BEYOND_ALG2_IDS.includes(id));
  const hasBio1     = allIds.some(id=>["BIO1_9","BIO1_10"].includes(id));
  const apCredits   = allCourses.filter(c=>c.isAP).reduce((s,c)=>s+c.credits,0);
  const hasStemCap  = allIds.includes("STEM_CAP");

  const CTE_PATHWAYS = {
    "AFNR":           ["AFNR1","SAS","LAS","WBL_ANIMAL","AGRI_BIZ1","AGRI_PROD","AGRI_PROD2"],
    "Business":       ["BIZ1","ENT1","ENT2"],
    "Arts & Media":   ["DIGPHOTO1","DIGDESIGN1","DIGDESIGN2","FILM_FOUND","FILM1"],
    "Engineering":    ["ENG_FOUND","ENG1","ENG2","ENG3"],
    "Health Services":["HLTH_FOUND","ADV_HLTH","THERAPEUTIC"],
    "Culinary Arts":  ["CULINARY1","CULINARY2","CULINARY3"],
    "Computer Science":["CS_FOUND","AP_CSA","AP_CSP"],
    "JROTC":          [],  // JROTC explicitly does NOT count for CTE Honors
  };
  const ctePathwayCounts = {};
  Object.entries(CTE_PATHWAYS).forEach(([pathway, ids]) => {
    const credits = ids.filter(id => allIds.includes(id))
      .reduce((s, id) => { const c = getCourse(id); return s + (c?.credits||0); }, 0);
    if (credits > 0) ctePathwayCounts[pathway] = credits;
  });
  // CS Honors requires BOTH AP_CSA AND AP_CSP
  const hasCSHonors = allIds.includes("AP_CSA") && allIds.includes("AP_CSP");
  const hasCTESeq = hasCSHonors ||
    Object.entries(ctePathwayCounts)
      .filter(([k]) => k !== "Computer Science")
      .some(([,v]) => v >= 2);

  const math4Met = mathCredits >= 4 && hasAlg2 && hasBeyondAlg2;
  const sci4Met  = sciCredits >= 4 && hasBio1;

  return {
    academic: {
      math4: { met: math4Met, detail: `${mathCredits.toFixed(1)}/4.0 math credits${hasAlg2?"":", needs Algebra 2"}${hasBeyondAlg2?"":", needs one course beyond Algebra 2"}` },
      sci4:   { met: sci4Met,  detail: `${sciCredits.toFixed(1)}/4.0 science credits${hasBio1?"":", needs Biology 1"}` },
      ap2:    { met: apCredits>=2, detail: `${apCredits.toFixed(1)}/2.0 AP credits` },
    },
    stem: {
      math4:    { met: math4Met,   detail: `${mathCredits.toFixed(1)}/4.0 math credits${hasAlg2?"":", needs Algebra 2"}${hasBeyondAlg2?"":", needs one course beyond Algebra 2"}` },
      sci4:     { met: sci4Met,    detail: `${sciCredits.toFixed(1)}/4.0 science credits${hasBio1?"":", needs Biology 1"}` },
      stem_cap: { met: hasStemCap, detail: hasStemCap ? "STEM Capstone added \u2713" : "Add STEM Capstone (XAT1000) to your plan" },
    },
    cte: {
      cte_seq:  { met: hasCTESeq, detail: hasCTESeq ? "2+ credits in one CTE pathway \u2713" : "Add 2+ courses in the same CTE pathway (CS requires both AP CSP + AP CSA)" },
      cte_perf: { met: false,      detail: "Assessed by teacher \u2014 cannot be tracked here" },
    },
  };
}

export function deptColor(dept) { return DEPT_COLORS[dept] || "#6B7280"; }


export function calcWlfa(plan) {
  // WLFA requires 2 credits in ONE of: same World Language, any Fine Arts, same CTE pathway
  // Returns { earned, overflow } where overflow flows to electives
  const allIds = Object.values(plan).flat();
  const allCourses = allIds.map(getCourse).filter(Boolean);
  const wlfaCourses = allCourses.filter(c => c.gradCategory === "wlfa");

  // World Language: group by language prefix (JPN/SPN/CHN/KOR)
  const langGroups = {};
  wlfaCourses.filter(c => c.dept === "World Language").forEach(c => {
    const lang = c.id.replace(/\d.*$/, ""); // JPN1→JPN, SPN2→SPN etc
    langGroups[lang] = (langGroups[lang] || 0) + c.gradCredits;
  });
  const worldLangMax = Object.values(langGroups).reduce((m, v) => Math.max(m, v), 0);

  // Fine Arts: all fine arts credits pool together (can mix Performing/Visual)
  const fineArtsTotal = wlfaCourses
    .filter(c => c.dept === "Fine Arts")
    .reduce((s, c) => s + c.gradCredits, 0);

  // CTE: group by ctePath
  const cteGroups = {};
  wlfaCourses.filter(c => c.dept === "CTE").forEach(c => {
    const path = c.ctePath || "Other";
    cteGroups[path] = (cteGroups[path] || 0) + c.gradCredits;
  });
  const cteMax = Object.values(cteGroups).reduce((m, v) => Math.max(m, v), 0);

  const bestSingle = Math.max(worldLangMax, fineArtsTotal, cteMax);
  const earned = Math.min(2.0, bestSingle);

  // Overflow = total wlfa credits planned minus what counts toward the requirement
  const totalWlfa = wlfaCourses.reduce((s, c) => s + c.gradCredits, 0);
  const overflow = Math.max(0, totalWlfa - earned);

  return { earned, overflow };
}

export function calcPlannerCredits(plan) {
  const raw = {};
  GRAD_REQUIREMENTS.forEach(r => { raw[r.id] = 0; });
  let total = 0;

  // First pass: accumulate all non-wlfa categories
  Object.values(plan).forEach(courses => {
    courses.forEach(cid => {
      const c = getCourse(cid);
      if (!c) return;
      total += c.credits;
      if (!c.gradCategory || c.gradCredits == null) return;
      if (c.gradCategory === "wlfa") return; // handled separately
      if (c.gradCategory === "electives") { raw.electives += c.gradCredits; return; }
      const req = GRAD_REQUIREMENTS.find(r => r.id === c.gradCategory);
      if (!req) return;
      const space = Math.max(0, req.required - raw[c.gradCategory]);
      const used = Math.min(c.gradCredits, space);
      raw[c.gradCategory] += used;
      raw.electives += (c.gradCredits - used);
    });
  });

  // WLFA: use pathway-aware calculation
  const { earned: wlfaEarned, overflow: wlfaOverflow } = calcWlfa(plan);
  raw.wlfa = wlfaEarned;
  raw.electives += wlfaOverflow;

  const cats = {};
  GRAD_REQUIREMENTS.forEach(r => { cats[r.id] = Math.min(raw[r.id] || 0, r.required); });
  return { cats, total };
}

// ── Animation variants — exact copy from planner-demo.jsx ──────
const cardVariants = {
  hidden: { height:0, opacity:0, marginBottom:0 },
  show: {
    height:"auto", opacity:1, marginBottom:8,
    transition:{ height:{ type:"spring", stiffness:400, damping:30 } }
  },
  exit: {
    height:0, opacity:0, marginBottom:0,
    transition:{
      delay:0.15,
      height:{ type:"spring", stiffness:400, damping:30 },
      opacity:{ delay:0.15 },
      marginBottom:{ delay:0.15 },
    }
  }
};
const contentVariants = {
  hidden: { x:50, opacity:0, scale:0.95 },
  show:  { x:0, opacity:1, scale:1, transition:{ type:"spring", stiffness:350, damping:25, delay:0.05 } },
  exit:  { x:-60, opacity:0, scale:0.95, filter:"blur(8px)", transition:{ type:"spring", stiffness:400, damping:25 } }
};
const shakeAnim = { x:[0,-8,8,-6,6,-3,3,0], transition:{ duration:0.4, ease:"easeInOut" } };

// ── PAGE TRANSITION (from nav-demo.jsx) ──────────────────────────────
const pageVariants = {
  initial: { opacity:0, y:15, filter:"blur(4px)", scale:0.98 },
  animate: { opacity:1, y:0,  filter:"blur(0px)", scale:1,
    transition:{ type:"spring", stiffness:300, damping:25, mass:0.8 } },
  exit:    { opacity:0, y:-15, filter:"blur(4px)", scale:0.98,
    transition:{ duration:0.2, ease:"easeIn" } },
};


// ── AnimatedProgressBar (inlined) ───────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────────────
export function AnimatedProgressBar({ req, earned, color, label, done }) {
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
    <div style={{ marginBottom:"12px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"5px" }}>
        <span style={{ fontSize:"11px", fontWeight:700,
          color:isDone?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.55)",
          display:"flex", alignItems:"center", gap:"4px" }}>
          {isDone ? <motion.span initial={{scale:0}} animate={{scale:1}} style={{color,fontSize:"10px"}}>✓</motion.span> : null}
          {label}
        </span>
        <motion.span
          key={label+earned}
          initial={{ scale:1.5, color:"#FBBF24" }}
          animate={{ scale:1, color:isDone?color:"rgba(255,255,255,0.35)" }}
          transition={{ type:"spring", stiffness:400, damping:15 }}
          style={{ fontSize:"11px", fontWeight:700, fontVariantNumeric:"tabular-nums", display:"inline-block" }}>
          {earned.toFixed(1)}/{req}
        </motion.span>
      </div>
      <div style={{ height:"6px", borderRadius:"999px", background:"rgba(255,255,255,0.1)", overflow:"hidden" }}>
        <motion.div
          animate={{ width:pct+"%" }}
          transition={{ type:"spring", stiffness:200, damping:15 }}
          style={{ height:"100%", borderRadius:"999px", background:color, overflow:"hidden", position:"relative" }}>
          <AnimatePresence>
            {justAdded && !isDone ? (
              <motion.div
                initial={{ x:"-100%", opacity:1 }}
                animate={{ x:"100%", opacity:0 }}
                transition={{ duration:0.6, ease:"easeOut" }}
                style={{ position:"absolute", inset:0,
                  background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.75),transparent)" }}
              />
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

// ── DataCitationFooter (inlined) ────────────────────────────────────────────
export function DataCitationFooter() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <footer style={{ background:"#F1F5F9", borderTop:"1px solid #E2E8F0", padding:"14px 24px",
        display:"flex", alignItems:"center", justifyContent:"center", gap:"16px", flexWrap:"wrap" }}>
        <span style={{ fontSize:"12px", color:"#64748B", lineHeight:1.5 }}>
          📋 Course data sourced from{" "}
          <em>Kalani High School 2026–27 Registration Guide & Course Catalog</em>{" "}
          and{" "}
          <em>Hawaii DOE Graduation Requirements (July 2023)</em>.
          For planning reference only.
        </span>
        <a href="https://www.kalanihighschool.org/admissions/course-registration-information/"
          target="_blank" rel="noopener noreferrer"
          style={{ fontSize:"11px", color:"#0369A1", background:"#EFF6FF", border:"1px solid #BFDBFE",
            borderRadius:"6px", padding:"4px 10px", textDecoration:"none", whiteSpace:"nowrap", fontWeight:700 }}>
          📋 Official Catalog ↗
        </a>
        <button onClick={()=>setOpen(true)}
          style={{ fontSize:"11px", color:"#475569", background:"white", border:"1px solid #CBD5E1",
            borderRadius:"6px", padding:"4px 10px", cursor:"pointer", whiteSpace:"nowrap",
            fontFamily:"inherit" }}>
          Data Sources & Disclaimer ›
        </button>
      </footer>
      {open && (
        <div className="overlay" onClick={()=>setOpen(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{ maxWidth:"520px", width:"92vw" }}>
            <div style={{ padding:"24px 26px", borderBottom:"1px solid #E5E7EB",
              display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <h2 style={{ fontSize:"17px", fontWeight:700, color:"#1C2B3A",
                fontFamily:"'Playfair Display',serif" }}>Data Sources & Disclaimer</h2>
              <button onClick={()=>setOpen(false)}
                style={{ background:"#FFF1F0", border:"none", borderRadius:"50%", width:"32px",
                  height:"32px", cursor:"pointer", fontSize:"16px", color:"#B00804" }}>✕</button>
            </div>
            <div style={{ padding:"22px 26px", display:"flex", flexDirection:"column", gap:"16px" }}>
              {[
                { icon:"📖", label:"Primary Source", text:"Kalani High School 2026–2027 Registration Guide & Course Catalog. All course names, codes, credit values, grade levels, and prerequisite chains are derived from this document." },
                { icon:"🎓", label:"Graduation Requirements", text:"Hawaii Department of Education Graduation Requirements, effective July 2023. Credit minimums and subject-area breakdowns follow this policy document." },
                { icon:"⚠️", label:"Planning Reference Only", text:"Kalani Compass is an unofficial planning tool. It is not affiliated with Kalani High School or the Hawaii DOE. Always confirm your 4-year plan with your school counselor before submitting your registration card." },
                { icon:"🔄", label:"Last Data Update", text:"Course catalog last reviewed: March 2026. Based on the 2026–2027 Kalani High School Course Catalog." },
              ].map(({icon,label,text})=>(
                <div key={label} style={{ display:"flex", gap:"13px", alignItems:"flex-start" }}>
                  <span style={{ fontSize:"20px", flexShrink:0, marginTop:"2px" }}>{icon}</span>
                  <div>
                    <div style={{ fontSize:"12px", fontWeight:700, color:"#475569",
                      textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:"4px" }}>{label}</div>
                    <div style={{ fontSize:"13px", color:"#374151", lineHeight:1.6 }}>{text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
// ── GradeBtn — slide-text animation, supports add + remove toggle ──
export function GradeBtn({ grade, plan, selectedCourse, GRADE_MAX, gradeSlots,
                   getCoursesBeforeGrade, getAllCoursesUpTo, getUnmetPrereqs,
                   getCoreConflict, planUids, setPlan,
                   showToast, modalWarn, setModalWarn }) {
  // btnState: "idle" | "adding" | "done" | "removing"
  const [btnState, setBtnState] = useState("idle");
  // justAdded: true right after clicking add — prevents immediate × Remove on hover
  const justAdded = useRef(false);
  const [hovered, setHovered] = useState(false);

  const already     = !selectedCourse.repeatable && Object.values(plan).flat().includes(selectedCourse.id);
  const inThisGrade = (plan[grade]||[]).includes(selectedCourse.id);
  const full        = gradeSlots(plan, grade) >= GRADE_MAX;
  // disabled only when another grade has it AND not repeatable, or grade is full (but not for the grade it's already IN)
  const disabled    = (already && !inThisGrade && !selectedCourse.repeatable) || (full && !inThisGrade);
  const isDone      = btnState === "done" || (btnState === "idle" && inThisGrade);
  const isRemoving  = btnState === "removing";

  function doAdd() {
    setBtnState("adding");
    setTimeout(() => {
      planUids.current[grade].push(Math.random().toString(36).slice(2));
      setPlan(p => {
        const n = JSON.parse(JSON.stringify(p));
        if (!selectedCourse.repeatable && Object.values(n).flat().includes(selectedCourse.id)) return p;
        n[grade].push(selectedCourse.id);
        return n;
      });
      setBtnState("done");
      justAdded.current = true;
      setModalWarn(null);
      showToast("Added \"" + selectedCourse.name + "\" to Grade " + grade);
    }, 320);
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
    }, 320);
  }

  function handleClick() {
    if (disabled) return;
    if (isDone || isRemoving) { doRemove(); return; }
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
      onMouseEnter={e=>{ if(disabled) return;
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
      onMouseLeave={e=>{ if(disabled) return;
        justAdded.current = false;
        setHovered(false);
        e.currentTarget.style.background=bgCol;
        e.currentTarget.style.color=textCol;
        e.currentTarget.style.borderColor=borderCol;
        e.currentTarget.style.transform="scale(1)";
      }}>
      {/* "Grade X" — idle label, slides out when adding or done */}
      <span style={{
        position:"absolute", left:0, right:0,
        display:"flex", alignItems:"center", justifyContent:"center",
        transition:"transform 0.3s cubic-bezier(0.19,1,0.22,1), opacity 0.25s",
        transform: (showLeaving || showDone) ? "translateY(-110%)" : "translateY(0)",
        opacity:   (showLeaving || showDone) ? 0 : 1,
        pointerEvents:"none",
      }}>
        {full ? "Full " + grade : "Grade " + grade}
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

// renderPage avoids putting </motion.div> before } which triggers esbuild
export function renderPage(condition, pageKey, children) {
  if (!condition) return null;
  return (
    <motion.div key={pageKey} variants={pageVariants}
      initial="initial" animate="animate" exit="exit"
      style={{ width:"100%" }}>
      {children}
    </motion.div>
  );
}
