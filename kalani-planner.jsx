import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "./src/supabase.js";

// ─── BACKEND ADAPTER ─────────────────────────────────────────────────────────────────────────────────
// V2: data is hardcoded below. V3: swap useCourseData() to fetch from Supabase/Firebase.
// DATA_SOURCE: "local" | "supabase" — now fetching from Supabase with local fallback
const DATA_SOURCE = "supabase";

function normalizeCourse(row) {
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
const DEPT_ORDER = [
  "English","Social Studies","Mathematics","Science",
  "Health & PE","CTE","World Language","Fine Arts","Miscellaneous","Off Campus"
];

function sortCourses(arr) {
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

function useCourseData() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("archived", false)
        .limit(500);

      if (error) {
        console.error("[Kalani Compass] fetchCourses error:", error.message);
        // No local fallback — Supabase required
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
function useAnnouncements() {
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

const GRAD_REQUIREMENTS = [
  { id:"english",  label:"English",           required:4.0, color:"#C84B31",
    breakdown:["ELA 1 (1.0)","ELA 2 (1.0)","ELA 3 or AP English 3 (1.0)","ELA 4 or AP English 4 (1.0)"] },
  { id:"ss",       label:"Social Studies",    required:4.0, color:"#7C3AED",
    breakdown:["Participation in Democracy (0.5)","Modern History of Hawaiʻi (0.5)","US History/Gov (1.0)","World History (1.0)","Grade 12 SS elective (1.0)"] },
  { id:"math",     label:"Mathematics",       required:3.0, color:"#059669",
    breakdown:["Geometry (1.0)","Algebra 1 (1.0)","Algebra 2 or other math elective (1.0)"] },
  { id:"science",  label:"Science",           required:3.0, color:"#D97706",
    breakdown:["Biology 1 (1.0)","Science electives (2.0)"] },
  { id:"wlfa",     label:"World Lang / Fine Arts / CTE", required:2.0, color:"#0891B2",
    breakdown:["2 credits in one area: World Language, Fine Arts, or CTE pathway sequence"] },
  { id:"pe",       label:"Physical Education",required:1.0, color:"#10B981",
    breakdown:["PE Lifetime Fitness (0.5) — required","PE Lifetime Activities (0.5) — required"] },
  { id:"health",   label:"Health",            required:0.5, color:"#EC4899",
    breakdown:["Health Today & Tomorrow (0.5)"] },
  { id:"ptp",      label:"Personal Transition Plan",required:0.5, color:"#84CC16",
    breakdown:["Personal Transition Plan (0.5)"] },
  { id:"electives",label:"Electives",         required:6.0, color:"#F97316",
    breakdown:["Any subject area — overflow from subject buckets also counts (6.0 credits)"] },
];


const DEPT_COLORS = {
  "English":"#C84B31","Social Studies":"#7C3AED","Mathematics":"#059669",
  "Science":"#D97706","Health & PE":"#0891B2","CTE":"#B00804",
  "World Language":"#0284C7","Fine Arts":"#DB2777",
  "Miscellaneous":"#6B7280","Off Campus":"#475569",
};

const DEFAULT_PLAN = {
  9:  ["GEO","ELA1","PID","MHH","ISCI","PE_LF","HEALTH","PTP"],
  10: ["ALG1","ELA2","USH","BIO1_10","PE_LA","JPN1"],
  11: ["ALG2","ELA3","WH","HCHEM","JPN2"],
  12: ["TRIG","ELA4","ECON","PSYCH","MARINE"],
};

function getCourse(id) { return null; } // overridden inside component with liveCourses
function getCourseName(id) { const c = getCourse(id); return c ? c.name : id; }

// Returns display string for a prereq, including equivalents: "Chemistry or Honors Chemistry"
function getPrereqDisplay(prereqId) {
  const equivs = PREREQ_EQUIV[prereqId] || [];
  const names = [getCourseName(prereqId), ...equivs.map(getCourseName)];
  return names.join(" or ");
}

const PREREQ_EQUIV = {
  "BIO1_10": ["BIO1_9"],
  "BIO1_9":  ["BIO1_10"],
  "CHEM":    ["HCHEM"],
  "USH":     ["AP_USH"],
  "WH":      ["AP_WH"],
  "ELA3":    ["AP_ENG3"],
  "JPN2":    ["JPN2H"],
  "JPN3":    ["JPN3H"],
};

function isPrereqSatisfied(prereqId, completedIds) {
  if (completedIds.includes(prereqId)) return true;
  const equivs = PREREQ_EQUIV[prereqId] || [];
  return equivs.some(eq => completedIds.includes(eq));
}

function getCoursesBeforeGrade(plan, targetGrade) {
  return Object.entries(plan)
    .filter(([g]) => Number(g) < targetGrade)
    .flatMap(([, ids]) => ids);
}

function getAllCoursesUpTo(plan, targetGrade) {
  return Object.entries(plan)
    .filter(([g]) => Number(g) <= targetGrade)
    .flatMap(([, ids]) => ids);
}

// prereqs = must be completed in PREVIOUS grades
// concurrentOk = can be in same grade OR previous grades
function getUnmetPrereqs(courseId, completedBefore, completedUpTo) {
  const course = getCourse(courseId);
  if (!course) return [];
  const strictUnmet = (course.prereqs||[]).filter(pid => !isPrereqSatisfied(pid, completedBefore));
  const concurrentUnmet = (course.concurrentOk||[]).filter(pid => !isPrereqSatisfied(pid, completedUpTo||completedBefore));
  return [...strictUnmet, ...concurrentUnmet];
}

const HONORS_DEFS = [
  {
    id: "academic",
    label: "Academic Honors",
    color: "#7C3AED",
    icon: "\ud83c\udf96",
    description: "Cumulative GPA 3.500+ required",
    checks: [
      { id:"math4", label:"4 credits Math (Algebra 2 + one beyond)", desc:"Algebra 2 + one of: Trig/PreCal, Alg3/Stats, Calculus, AP Calculus, AP Stats, AP CS A, AP CS Principles, Intro to College Math" },
      { id:"sci4",  label:"4 credits Science (incl. Biology 1)",     desc:"Biology 1 + 3 other science credits" },
      { id:"ap2",   label:"2+ AP/IB/Running Start credits",          desc:"At least 2 credits from AP, IB, or Running Start courses" },
    ],
  },
  {
    id: "stem",
    label: "STEM Honors",
    color: "#0891B2",
    icon: "\ud83d\udd2c",
    description: "Cumulative GPA 3.500+ required",
    checks: [
      { id:"math4",    label:"4 credits Math (Algebra 2 + one beyond)", desc:"Same math requirement as Academic Honors" },
      { id:"sci4",     label:"4 credits Science (incl. Biology 1)",     desc:"Same science requirement as Academic Honors" },
      { id:"stem_cap", label:"STEM Capstone Project (XAT1000)",         desc:"Successful completion of STEM Capstone. Required for class of 2016 and beyond." },
    ],
  },
  {
    id: "cte",
    label: "CTE Honors",
    color: "#B00804",
    icon: "\ud83d\udee0",
    description: "Cumulative GPA 3.0+ required",
    checks: [
      { id:"cte_seq",  label:"Complete 2–3 course CTE pathway sequence", desc:"2-3 courses in the same approved CTE pathway with B or better in each. \u26a0\ufe0f Computer Science pathway requires BOTH AP CSP AND AP CSA. JROTC courses do NOT count toward CTE Honors." },
      { id:"cte_perf", label:"Meet/exceed proficiency on performance assessment", desc:"Assessed per program of study by teacher — cannot be tracked here." },
    ],
  },
];

const BEYOND_ALG2_IDS = ["TRIG","ALG3","CALC","AP_CALC","AP_STATS","AP_CSA","AP_CSP","ICMATH"];

function computeHonorsProgress(plan) {
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

function deptColor(dept) { return DEPT_COLORS[dept] || "#6B7280"; }


function calcWlfa(plan) {
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

function calcPlannerCredits(plan) {
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

// ─── FRAMER MOTION VARIANTS ──────────────────────────────────────────────────
const cardVariants = {
  hidden: { height:0, opacity:0, marginBottom:0 },
  show: {
    height:"auto", opacity:1, marginBottom:8,
    transition:{ height:{ type:"spring", stiffness:400, damping:30 } }
  },
  exit: {
    height:0, opacity:0, marginBottom:0,
    transition:{ delay:0.15,
      height:{ type:"spring", stiffness:400, damping:30 },
      opacity:{ delay:0.15 }, marginBottom:{ delay:0.15 } }
  },
};
const contentVariants = {
  hidden: { x:50, opacity:0, scale:0.95 },
  show: { x:0, opacity:1, scale:1,
    transition:{ type:"spring", stiffness:350, damping:25, delay:0.05 } },
  exit: { x:-60, opacity:0, scale:0.95, filter:"blur(8px)",
    transition:{ type:"spring", stiffness:400, damping:25 } },
};
const shakeAnim = { x:[0,-8,8,-6,6,-3,3,0], transition:{ duration:0.4, ease:"easeInOut" } };

export default function KalaniPlanner() {
  // V4: courses fetched from Supabase, falls back to local COURSES if unavailable
  const { courses: liveCourses, gradReqs: liveGradReqs, loading: dataLoading } = useCourseData();

  // Override getCourse to use live Supabase data inside this component
  // This shadows the global getCourse() for all component code below
  function getCourse(id) { return liveCourses.find(c => c.id === id); }
  const { announcements } = useAnnouncements();

  const [page, setPage] = useState("home");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [homeSearch, setHomeSearch] = useState("");
  const [homeSearchFocus, setHomeSearchFocus] = useState(false);
  const [ratings, setRatings] = useState({}); // { courseId: { avg, count } }
  const [myRatings, setMyRatings] = useState({}); // { courseId: starCount }
  const [pendingRating, setPendingRating] = useState(null); // { courseId, stars }
  const [hoverStar, setHoverStar] = useState(0);
  const [dismissedAnns, setDismissedAnns] = useState([]);
  const [ratingAnimating, setRatingAnimating] = useState(false);
  const [starVisible, setStarVisible] = useState([]);
  const [filterDept, setFilterDept] = useState("All");
  const [plan, setPlan] = useState(() => {
    try {
      const saved = localStorage.getItem('kalani-compass-plan');
      if (saved) return JSON.parse(saved);
    } catch {}
    return JSON.parse(JSON.stringify(DEFAULT_PLAN));
  });
  const [addTarget, setAddTarget] = useState(null);
  const [addSearch, setAddSearch] = useState("");
  const [honorsOpen, setHonorsOpen] = useState({academic:false,stem:false,cte:false});
  const [prereqWarn, setPrereqWarn] = useState(null); // {courseId, grade, unmet:[]}
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [filterCtePath, setFilterCtePath] = useState("All CTE");
  const [filterFineArts, setFilterFineArts] = useState("All Fine Arts");
  const [filterMisc, setFilterMisc] = useState("All Miscellaneous");
  const [toast, setToast] = useState(null); // {msg, grade}
  const [shakeGrade, setShakeGrade] = useState(null);
  const [removingCards, setRemovingCards] = useState(new Set()); // keys being animated out

  useEffect(() => {
    try { localStorage.setItem('kalani-compass-plan', JSON.stringify(plan)); } catch {}
  }, [plan]);

  // Pop stars in one-by-one when course modal opens
  useEffect(() => {
    if (!selectedCourse) { setStarVisible([]); return; }
    setStarVisible([]);
    setPendingRating(null);
    setHoverStar(0);
    [1,2,3,4,5].forEach((s,i) => setTimeout(() => setStarVisible(v => [...v,s]), i*70));
  }, [selectedCourse?.id]);

  // Auto-dismiss toast after 2.5s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!shakeGrade) return;
    const t = setTimeout(() => setShakeGrade(null), 450);
    return () => clearTimeout(t);
  }, [shakeGrade]);

  function showToast(msg) { setToast(msg); }

  // Stable browser fingerprint for anonymous rating dedup
  function getFingerprint() {
    const raw = [navigator.userAgent, screen.width, screen.height, Intl.DateTimeFormat().resolvedOptions().timeZone].join("|");
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash) + raw.charCodeAt(i);
      hash |= 0;
    }
    return "fp_" + Math.abs(hash).toString(36);
  }

  // Fetch latest ratings from Supabase and update state
  async function fetchRatings() {
    const { data, error } = await supabase
      .from("ratings")
      .select("course_id, rating, fingerprint")
      .limit(10000);

    if (error) {
      console.error("[Kalani Compass] fetchRatings error:", error.message, error);
      return;
    }
    if (!data || data.length === 0) {
      console.log("[Kalani Compass] fetchRatings: no data returned");
      setRatings({});
      return;
    }

    console.log("[Kalani Compass] fetchRatings: got", data.length, "rows");

    const fp = getFingerprint();
    const grouped = {};
    const mine = {};

    data.forEach(r => {
      if (!grouped[r.course_id]) grouped[r.course_id] = { total: 0, count: 0 };
      grouped[r.course_id].total += r.rating;
      grouped[r.course_id].count += 1;
      if (r.fingerprint === fp) mine[r.course_id] = r.rating;
    });

    const averaged = {};
    Object.entries(grouped).forEach(([cid, v]) => {
      averaged[cid] = { avg: v.total / v.count, count: v.count };
    });

    setRatings(averaged);
    setMyRatings(mine);
  }

  // Load ratings on mount
  useEffect(() => { fetchRatings(); }, []);

  async function submitRating(courseId, stars) {
    const fp = getFingerprint();
    const semester = (() => {
      const m = new Date().getMonth();
      const y = new Date().getFullYear();
      // Academic year: Aug-Dec = current/next, Jan-Jul = prev/current
      return m >= 7 ? `${y}-${y+1}` : `${y-1}-${y}`;
    })();

    const { error } = await supabase.from("ratings").insert({
      course_id: courseId,
      rating: stars,
      semester,
      fingerprint: fp,
    });

    if (error) {
      showToast("Could not submit rating. You may have already rated this course.");
      return;
    }

    // Re-fetch everything from Supabase — gets accurate count + includes other people's ratings
    await fetchRatings();
    showToast(`⭐ Rated ${stars} star${stars > 1 ? "s" : ""} — thanks!`);
    setPendingRating(null);
    setHoverStar(0);
  }
  function navigate(p) { setPage(p); window.scrollTo({ top:0, behavior:"instant" }); }

  const { cats, total } = useMemo(() => calcPlannerCredits(plan), [plan]);

  const filteredCourses = useMemo(() => {
    let list = liveCourses;
    if (filterDept !== "All") list = list.filter(c => c.dept === filterDept);
    if (filterDept === "CTE" && filterCtePath !== "All CTE")
      list = list.filter(c => c.ctePath === filterCtePath);
    if (filterDept === "Fine Arts" && filterFineArts !== "All Fine Arts")
      list = list.filter(c => c.fineArtsType === filterFineArts);
    if (filterDept === "Miscellaneous" && filterMisc !== "All Miscellaneous")
      list = list.filter(c => c.miscType === filterMisc);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.subtitle||"").toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dept.toLowerCase().includes(q) ||
        (c.ctePath||c.fineArtsType||c.miscType||"").toLowerCase().includes(q) ||
        (c.desc||"").toLowerCase().includes(q)
      );
    }
    return list;
  }, [filterDept, filterCtePath, filterFineArts, filterMisc, searchQuery, liveCourses]);

  const homeSearchResults = useMemo(() => {
    if (!homeSearch.trim()) return [];
    const q = homeSearch.toLowerCase();
    return liveCourses.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.subtitle||"").toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.dept.toLowerCase().includes(q) ||
      (c.ctePath||c.fineArtsType||c.miscType||"").toLowerCase().includes(q) ||
      (c.desc||"").toLowerCase().includes(q)
    ).slice(0, 4);
  }, [homeSearch, liveCourses]);

  const addSearchResults = useMemo(() => {
    if (!addSearch.trim()) return liveCourses.slice(0, 14);
    const q = addSearch.toLowerCase();
    return liveCourses.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.subtitle||"").toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.dept.toLowerCase().includes(q) ||
      (c.ctePath||c.fineArtsType||c.miscType||"").toLowerCase().includes(q) ||
      (c.desc||"").toLowerCase().includes(q)
    ).slice(0, 16);
  }, [addSearch, liveCourses]);

  const honorsProgress = useMemo(() => computeHonorsProgress(plan), [plan]);

  function removeCourse(grade, idx) {
    const key = `${grade}-${idx}`;
    setRemovingCards(prev => new Set([...prev, key]));
    setTimeout(() => {
      setPlan(p => { const n = JSON.parse(JSON.stringify(p)); n[grade].splice(idx, 1); return n; });
      setRemovingCards(prev => { const s = new Set(prev); s.delete(key); return s; });
    }, 360);
  }
  const GRADE_MAX = 9.0; // 9 slots = up to 9 credits (0.5cr courses use 0.5 slot)


  // Core subjects limited to 1 per grade year (English, Math, Social Studies)
  const CORE_LIMIT_DEPTS = ["English", "Mathematics", "Social Studies"];

  function getCoreConflict(courseId, grade) {
    const course = getCourse(courseId);
    if (!course) return null;
    if (!CORE_LIMIT_DEPTS.includes(course.dept)) return null;
    // Check if there's already a course of the same dept in this grade
    const existing = (plan[grade] || []).find(cid => {
      const c = getCourse(cid);
      return c && c.dept === course.dept && cid !== courseId;
    });
    if (!existing) return null;
    return getCourse(existing)?.name || existing;
  }
  function addCourseToPlan(courseId) {
    if (!addTarget) return;
    const course = getCourse(courseId);
    if (gradeSlots(plan, addTarget) >= GRADE_MAX) {
      setShakeGrade(addTarget);
      showToast(`✋ Grade ${addTarget} is full — max ${GRADE_MAX} slots`);
      return;
    }
    const completedBefore = getCoursesBeforeGrade(plan, addTarget);
    const completedUpTo = getAllCoursesUpTo(plan, addTarget);
    const unmet = getUnmetPrereqs(courseId, completedBefore, completedUpTo);
    if (unmet.length > 0) {
      setPrereqWarn({ courseId, grade: addTarget, unmet });
      return;
    }
    const coreConflict = getCoreConflict(courseId, addTarget);
    if (coreConflict) {
      setPrereqWarn({ courseId, grade: addTarget, unmet: [], coreConflict });
      return;
    }
    setPlan(p => {
      const n = JSON.parse(JSON.stringify(p));
      if (!course?.repeatable && Object.values(n).flat().includes(courseId)) return p;
      n[addTarget].push(courseId);
      return n;
    });
    setAddTarget(null); setAddSearch("");
  }
  function forceAddCourse(courseId) {
    if (!addTarget) return;
    const course = getCourse(courseId);
    if (gradeSlots(plan, addTarget) >= GRADE_MAX) return;
    setPlan(p => {
      const n = JSON.parse(JSON.stringify(p));
      if (!course?.repeatable && Object.values(n).flat().includes(courseId)) return p;
      n[addTarget].push(courseId);
      return n;
    });
    setAddTarget(null); setAddSearch(""); setPrereqWarn(null);
  }

  // Slot = credits for normal courses, 1 for Off Campus (0-credit)
  function gradeSlots(p, grade) {
    return (p[grade]||[]).reduce((sum, cid) => {
      const c = getCourse(cid);
      if (!c) return sum;
      return sum + (c.id === "OFF_CAMPUS" ? 1 : (c.credits || 0));
    }, 0);
  }

  return (
    <>
      <style>{`
        ${FONTS}
        @keyframes annSlideDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes starPop{0%{opacity:0;transform:scale(0) rotate(-20deg)}60%{transform:scale(1.35) rotate(4deg)}100%{opacity:1;transform:scale(1) rotate(0)}}
        /* Planner card animations */
        @keyframes planCardIn{
          0%{opacity:0;transform:translateX(50px) scale(0.95);max-height:0;margin-bottom:0;}
          30%{opacity:1;}
          100%{opacity:1;transform:translateX(0) scale(1);max-height:120px;margin-bottom:4px;}
        }
        @keyframes planCardOut{
          0%{opacity:1;transform:translateX(0) scale(1);max-height:120px;margin-bottom:4px;}
          30%{opacity:0;transform:translateX(-60px) scale(0.95);}
          100%{opacity:0;transform:translateX(-60px) scale(0.95);max-height:0;margin-bottom:0;padding:0;}
        }
        @keyframes gradeShake{
          0%  {transform:translateX(0);}
          10% {transform:translateX(-8px);}
          20% {transform:translateX(8px);}
          30% {transform:translateX(-6px);}
          40% {transform:translateX(6px);}
          50% {transform:translateX(-3px);}
          65% {transform:translateX(3px);}
          80% {transform:translateX(-1.5px);}
          100%{transform:translateX(0);}
        }
        @keyframes reqBarFill{from{transform:scaleX(0);transform-origin:left;}to{transform:scaleX(1);}}
        @keyframes reqNumPop{
          0%  {transform:scale(1.65);color:#F59E0B;}
          55% {transform:scale(0.88);}
          80% {transform:scale(1.06);}
          100%{transform:scale(1);}
        }
        @keyframes shimmerSweep{
          from{left:-60%;}to{left:120%;}
        }
        @keyframes infiniteShimmer{
          0%  {left:-60%;}
          100%{left:160%;}
        }
        @keyframes barComplete{
          0%  {transform:scaleX(1);}
          25% {transform:scaleX(1.012);}
          55% {transform:scaleX(0.996);}
          100%{transform:scaleX(1);}
        }
        .plan-card-removing{
          animation:planCardOut 0.38s cubic-bezier(0.4,0,0.2,1) forwards !important;
          overflow:hidden;pointer-events:none;
        }
        .plan-card-new{
          animation:planCardIn 0.38s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        .grade-shake{
          animation:gradeShake 0.4s ease-in-out !important;
        }
        @keyframes ratingPopIn{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}
        @keyframes confirmSlideIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}
        *{box-sizing:border-box;margin:0;padding:0;}
        :root{
          --red:#B00804; --red-dark:#950A07; --red-deep:#6B0503;
          --slate:#1C2B3A; --slate-mid:#2D3F52; --slate-light:#3D5166;
          --bg:#F7F8FA; --card:#fff; --text:#111827; --muted:#6B7280;
          --border:#E5E7EB; --light-red:#FFF1F0;
        }
        body{font-family:'Plus Jakarta Sans',sans-serif;background:var(--bg);}
        .fade-in{animation:fadeIn 0.3s ease;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .nav-link{cursor:pointer;padding:8px 15px;border-radius:8px;font-weight:600;font-size:14px;
          color:rgba(255,255,255,0.65);transition:all 0.2s;white-space:nowrap;}
        .nav-link:hover{color:#fff;background:rgba(255,255,255,0.14);}
        .nav-link.active{color:#fff;background:rgba(255,255,255,0.22);}
        .c-card{background:white;border-radius:12px;padding:16px;border:1px solid var(--border);
          cursor:pointer;transition:all 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.06);}
        .c-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.1);border-color:var(--red);}
        .badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:11px;
          font-weight:700;letter-spacing:0.03em;text-transform:uppercase;}
        .req-bar{height:6px;border-radius:3px;background:rgba(255,255,255,0.12);overflow:hidden;}
        .req-fill{height:100%;border-radius:3px;transition:width 0.6s cubic-bezier(.4,0,.2,1);}
        .plan-cell{background:white;border-radius:12px;padding:14px;border:1px solid var(--border);}
        .p-tag{display:flex;align-items:center;gap:7px;padding:6px 9px;border-radius:7px;
          margin:2px;font-size:12px;font-weight:600;flex:1 0 calc(50% - 4px);min-width:150px;}
        .rm-btn{margin-left:auto;cursor:pointer;color:#9CA3AF;font-size:16px;line-height:1;padding:0 2px;flex-shrink:0;}
        .rm-btn:hover{color:var(--red);}
        .delete-btn-wrap{ opacity:0; transform:translateX(12px);
          transition:opacity 0.22s ease, transform 0.28s cubic-bezier(0.34,1.4,0.64,1); }
        .card-hover-group:hover .delete-btn-wrap{ opacity:1; transform:translateX(0); }
        .add-btn{border:1.5px dashed #D1D5DB;border-radius:7px;padding:7px;text-align:center;
          font-size:11px;color:#9CA3AF;cursor:pointer;margin-top:6px;transition:all 0.2s;}
        .add-btn:hover{border-color:var(--red);color:var(--red);background:var(--light-red);}
        .overlay{position:fixed;inset:0;background:rgba(17,24,39,0.65);display:flex;align-items:center;
          justify-content:center;z-index:1000;padding:20px;backdrop-filter:blur(5px);}
        .modal{background:white;border-radius:20px;max-width:620px;width:100%;max-height:90vh;
          overflow-y:auto;box-shadow:0 25px 60px rgba(0,0,0,0.22);}
        .si{width:100%;padding:11px 16px;border-radius:10px;border:2px solid var(--border);
          font-size:14px;font-family:'Plus Jakarta Sans',sans-serif;outline:none;transition:border 0.2s;background:#fff;}
        .si:focus{border-color:var(--red);}
        .tag-ap{background:#FEF3C7;color:#92400E;padding:2px 7px;border-radius:4px;font-size:10px;font-weight:800;}
        .prereq-chip{padding:5px 11px;border-radius:7px;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.15s;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:3px;}
        .warn-banner{background:#FEF9C3;border:1.5px solid #EAB308;border-radius:10px;padding:12px 16px;margin:10px 0;font-size:13px;color:#78350F;}
        .honors-check{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);}
        .honors-check:last-child{border-bottom:none;}
        @media(max-width:900px){
          .plan-grid{grid-template-columns:1fr 1fr !important;}
        }
        @media(max-width:768px){
          .planner-layout{flex-direction:column !important;}
          .planner-sidebar{width:100% !important;position:static !important;margin-top:28px;}
          .planner-sidebar > div{position:static !important;}
        }
        @media(max-width:600px){
          .plan-grid{grid-template-columns:1fr !important;}
          .catalog-grid{grid-template-columns:1fr !important;}
          .stat-grid{grid-template-columns:1fr 1fr !important;}
          .grad-grid{grid-template-columns:1fr !important;}
          nav{gap:0 !important;padding:0 12px !important;}
          .nav-link{padding:8px 10px !important;font-size:12px !important;}
          .modal{border-radius:14px !important;margin:10px !important;}
          h1{font-size:28px !important;}
          .hero-btns{flex-direction:column !important;align-items:center !important;}
        }
      `}</style>

      <div style={{ minHeight:"100vh" }}>

        {/* NAV */}
        <nav style={{ background:`linear-gradient(90deg,var(--red-deep),var(--red-dark) 50%,var(--red))`,
          padding:"0 24px", display:"flex", alignItems:"center", gap:"2px", height:"58px",
          position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 20px rgba(107,5,3,0.4)" }}>
          <div onClick={()=>navigate("home")}
            style={{ fontFamily:"'Playfair Display',serif", color:"white", fontSize:"20px", fontWeight:700,
              marginRight:"20px", cursor:"pointer", textShadow:"0 1px 4px rgba(0,0,0,0.3)" }}>
            🦅 Kalani Compass
          </div>
          {[["home","Home"],["catalog","Courses"],["planner","4-Year Planner"]].map(([id,label])=>(
            <div key={id} onClick={()=>navigate(id)}
              style={{ position:"relative", cursor:"pointer", padding:"8px 15px", borderRadius:"8px" }}>
              {page===id && (
                <motion.div layoutId="nav-pill"
                  style={{ position:"absolute", inset:0, borderRadius:"8px",
                    background:"rgba(255,255,255,0.22)", boxShadow:"0 2px 8px rgba(0,0,0,0.15) inset" }}
                  transition={{ type:"spring", stiffness:400, damping:28 }}/>
              )}
              <span style={{ position:"relative", zIndex:1, fontWeight:600, fontSize:"14px",
                color: page===id?"white":"rgba(255,255,255,0.65)",
                transition:"color 0.2s", whiteSpace:"nowrap" }}>
                {label}
              </span>
            </div>
          ))}
          <div style={{ marginLeft:"auto" }} />
        </nav>

        {/* ANNOUNCEMENT BANNER */}
        {announcements.filter(a=>!dismissedAnns.includes(a.id)).map((a,i) => {
          const palBg  = a.type==="new"?"linear-gradient(90deg,#14532D,#166534)":a.type==="warning"?"linear-gradient(90deg,#78350F,#92400E)":"linear-gradient(90deg,#1E3A5F,#1E40AF)";
          const palBar = a.type==="new"?"#22C55E":a.type==="warning"?"#F59E0B":"#3B82F6";
          const palTxt = a.type==="new"?"#DCFCE7":a.type==="warning"?"#FEF9C3":"#DBEAFE";
          const palSub = a.type==="new"?"rgba(220,252,231,0.75)":a.type==="warning"?"rgba(254,249,195,0.75)":"rgba(219,234,254,0.75)";
          const palBtn = a.type==="new"?"rgba(34,197,94,0.25)":a.type==="warning"?"rgba(245,158,11,0.25)":"rgba(59,130,246,0.25)";
          const icon   = a.type==="new"?"🆕":a.type==="warning"?"⚠️":"📢";
          return (
            <div key={a.id} style={{
              background:palBg, borderBottom:`2px solid ${palBar}`,
              padding:"9px 20px", display:"flex", alignItems:"center", gap:"10px",
              animation:`annSlideDown 0.32s cubic-bezier(.25,.46,.45,.94) ${i*0.06}s both`,
              position:"sticky", top:`${58 + i * 42}px`, zIndex: 99 - i,
            }}>
              <span style={{ fontSize:"14px", flexShrink:0 }}>{icon}</span>
              <div style={{ flex:1, fontSize:"13px", lineHeight:1.4 }}>
                <span style={{ fontWeight:700, color:palTxt }}>{a.title}</span>
                {a.body && <span style={{ color:palSub }}> — {a.body}</span>}
              </div>
              {a.link_url && (
                <a href={a.link_url} target="_blank" rel="noopener noreferrer"
                  style={{ background:palBtn, border:`1px solid ${palBar}`,
                    borderRadius:"7px", padding:"5px 12px", fontSize:"12px",
                    fontWeight:700, color:palTxt, textDecoration:"none",
                    whiteSpace:"nowrap", flexShrink:0, transition:"opacity 0.15s" }}
                  onMouseEnter={e=>e.currentTarget.style.opacity="0.8"}
                  onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                  {a.type==="new"?"Take Survey ↗":"Learn More ↗"}
                </a>
              )}
              <button
                onClick={()=>setDismissedAnns(d=>[...d,a.id])}
                style={{ background:"rgba(255,255,255,0.18)", border:"none", borderRadius:"50%",
                  width:"22px", height:"22px", cursor:"pointer", color:"white",
                  fontSize:"12px", display:"flex", alignItems:"center", justifyContent:"center",
                  flexShrink:0, lineHeight:1 }}>
                ✕
              </button>
            </div>
          );
        })}

        {/* ── HOME ── */}
        {page==="home" && (
          <div className="fade-in">
            <div style={{ background:`linear-gradient(135deg,var(--red-deep) 0%,var(--red-dark) 55%,var(--red) 100%)`,
              padding:"64px 24px 72px", textAlign:"center", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", inset:0, opacity:0.04,
                backgroundImage:"radial-gradient(circle, white 1.5px, transparent 1.5px)", backgroundSize:"28px 28px" }} />
              <div style={{ position:"relative", zIndex:1 }}>
                <p style={{ color:"rgba(255,255,255,0.65)", fontSize:"12px", fontWeight:800,
                  letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:"14px" }}>
                  Kalani High School — Honolulu, Hawaiʻi
                </p>
                <h1 style={{ fontFamily:"'Playfair Display',serif", color:"white",
                  fontSize:"clamp(30px,5.5vw,58px)", fontWeight:700, lineHeight:1.15, marginBottom:"18px",
                  textShadow:"0 2px 8px rgba(0,0,0,0.2)" }}>
                  Plan your 4 years<br/>at Kalani
                </h1>
                <p style={{ color:"rgba(255,255,255,0.72)", fontSize:"16px", maxWidth:"460px",
                  margin:"0 auto 36px", lineHeight:1.7 }}>
                  Explore every course, understand prerequisites, and build a graduation plan before you register.
                </p>
                <div className="hero-btns" style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap" }}>
                  <button onClick={()=>navigate("catalog")}
                    style={{ background:"white", color:"var(--red)", border:"none", borderRadius:"10px",
                      padding:"13px 26px", fontSize:"14px", fontWeight:800, cursor:"pointer",
                      boxShadow:"0 4px 20px rgba(0,0,0,0.2)", fontFamily:"inherit" }}>
                    Browse All Courses →
                  </button>
                  <button onClick={()=>navigate("planner")}
                    style={{ background:"rgba(255,255,255,0.1)", color:"white",
                      border:"1.5px solid rgba(255,255,255,0.35)", borderRadius:"10px",
                      padding:"13px 26px", fontSize:"14px", fontWeight:800, cursor:"pointer",
                      fontFamily:"inherit" }}>
                    Open 4-Year Planner
                  </button>
                </div>
              </div>
            </div>

            {/* Search */}
            <div style={{ maxWidth:"580px", margin:"-26px auto 0", padding:"0 24px", position:"relative", zIndex:10 }}>
              <input className="si" placeholder="🔍  Search — try 'AP Calculus', 'Computer Science', 'Marine Science'…"
                value={homeSearch}
                onChange={e=>setHomeSearch(e.target.value)}
                onFocus={()=>setHomeSearchFocus(true)}
                onBlur={()=>setTimeout(()=>setHomeSearchFocus(false), 150)}
                onKeyDown={e=>{
                  if(e.key==="Enter" && homeSearch.trim()) {
                    setSearchQuery(homeSearch);
                    setHomeSearchFocus(false);
                    navigate("catalog");
                  }
                  if(e.key==="Escape") { setHomeSearchFocus(false); setHomeSearch(""); }
                }}
                style={{ boxShadow:"0 8px 32px rgba(176,8,4,0.15)", fontSize:"15px", padding:"16px 20px" }} />

              {/* Autocomplete dropdown */}
              {homeSearchFocus && homeSearchResults.length > 0 && (
                <div style={{ position:"absolute", top:"calc(100% + 6px)", left:"24px", right:"24px",
                  background:"white", borderRadius:"14px", boxShadow:"0 12px 40px rgba(0,0,0,0.15)",
                  border:"1px solid var(--border)", overflow:"hidden", zIndex:200 }}>
                  {homeSearchResults.map(c => {
                    const col = deptColor(c.dept);
                    const subLabel = c.ctePath||c.fineArtsType||c.miscType||c.dept;
                    return (
                      <div key={c.id}
                        onMouseDown={()=>{
                          setSelectedCourse(c);
                          setHomeSearchFocus(false);
                          setSearchQuery(homeSearch);
                          navigate("catalog");
                        }}
                        style={{ display:"flex", alignItems:"center", gap:"12px", padding:"11px 16px",
                          cursor:"pointer", borderBottom:"1px solid var(--border)", transition:"background 0.1s" }}
                        onMouseEnter={e=>e.currentTarget.style.background="var(--light-red)"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <div style={{ width:"8px", height:"8px", borderRadius:"50%",
                          background:col, flexShrink:0 }}/>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:"13px", fontWeight:700, color:"var(--text)",
                            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                            {c.name}
                            {c.isAP && <span className="tag-ap" style={{ marginLeft:"6px" }}>AP</span>}
                          </div>
                          <div style={{ fontSize:"11px", color:"var(--muted)" }}>
                            {subLabel} · {c.credits}cr · Grade {c.gradeLevel.join("/")}
                          </div>
                        </div>
                        <span style={{ fontSize:"11px", color:"var(--muted)", flexShrink:0 }}>View →</span>
                      </div>
                    );
                  })}
                  <div
                    onMouseDown={()=>{ setSearchQuery(homeSearch); setHomeSearchFocus(false); navigate("catalog"); }}
                    style={{ padding:"10px 16px", fontSize:"12px", fontWeight:700,
                      color:"var(--red)", cursor:"pointer", textAlign:"center",
                      background:"#FFF8F8", transition:"background 0.1s" }}
                    onMouseEnter={e=>e.currentTarget.style.background=deptColor("English")+"14"}
                    onMouseLeave={e=>e.currentTarget.style.background="#FFF8F8"}>
                    See all results for "{homeSearch}" →
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="stat-grid" style={{ maxWidth:"840px", margin:"44px auto 0", padding:"0 24px",
              display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:"14px" }}>
              {[{n:"24",l:"Credits to graduate",i:"🎓",c:"#B00804"},{n:"140+",l:"Courses in catalog",i:"📚",c:"#0369A1"},
                {n:"18",l:"AP courses offered",i:"⭐",c:"#7C3AED"},{n:"8",l:"CTE career pathways",i:"🛠",c:"#0F766E"}].map(s=>(
                <div key={s.n} style={{ background:"white", borderRadius:"14px", padding:"22px",
                  textAlign:"center", border:"1px solid var(--border)", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
                  <div style={{ fontSize:"28px", marginBottom:"8px" }}>{s.i}</div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"34px", fontWeight:700,
                    color:s.c }}>{s.n}</div>
                  <div style={{ fontSize:"12px", color:"var(--muted)", lineHeight:1.4 }}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Dept links */}
            <div style={{ maxWidth:"840px", margin:"32px auto 0", padding:"0 24px" }}>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", color:"var(--text)",
                marginBottom:"14px" }}>Browse by Department</h2>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                {DEPTS.filter(d=>d!=="All").map(d=>(
                  <div key={d} onClick={()=>{ setFilterDept(d); setFilterCtePath("All CTE"); setFilterFineArts("All Fine Arts"); setFilterMisc("All Miscellaneous"); navigate("catalog"); }}
                    style={{ padding:"7px 15px", borderRadius:"8px", cursor:"pointer",
                      background:deptColor(d)+"14", border:`1.5px solid ${deptColor(d)}35`,
                      color:deptColor(d), fontWeight:700, fontSize:"13px", transition:"all 0.2s" }}
                    onMouseEnter={e=>e.currentTarget.style.background=deptColor(d)+"28"}
                    onMouseLeave={e=>e.currentTarget.style.background=deptColor(d)+"14"}>
                    {d}
                  </div>
                ))}
              </div>
            </div>

            {/* Grad requirements */}
            <div style={{ maxWidth:"840px", margin:"36px auto 64px", padding:"0 24px" }}>
              <div style={{ background:`linear-gradient(135deg,var(--slate) 0%,var(--slate-mid) 100%)`,
                borderRadius:"18px", padding:"28px" }}>
                <h2 style={{ fontFamily:"'Playfair Display',serif", color:"white", fontSize:"22px",
                  marginBottom:"6px" }}>🎓 Graduation Requirements</h2>
                <p style={{ color:"rgba(255,255,255,0.55)", fontSize:"13px", marginBottom:"22px" }}>
                  24 total credits required for a Hawaiʻi High School Diploma
                </p>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:"12px" }}>
                  {GRAD_REQUIREMENTS.map(r=>(
                    <div key={r.id} style={{ background:"rgba(255,255,255,0.07)", borderRadius:"10px", padding:"14px",
                      borderLeft:`3px solid ${r.color}` }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px",
                        fontSize:"13px", fontWeight:700 }}>
                        <span style={{ color:"rgba(255,255,255,0.92)" }}>{r.label}</span>
                        <span style={{ color:r.color, fontVariantNumeric:"tabular-nums" }}>{r.required} cr</span>
                      </div>
                      <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.48)", lineHeight:1.55 }}>
                        {r.breakdown.join(" • ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── CATALOG ── */}
        {page==="catalog" && (
          <div className="fade-in" style={{ maxWidth:"1200px", margin:"0 auto", padding:"32px 24px" }}>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"30px", color:"var(--red-dark)",
              marginBottom:"22px" }}>Course Catalog</h1>
            <div style={{ display:"flex", gap:"12px", marginBottom:"20px", flexWrap:"wrap", alignItems:"center" }}>
              <input className="si" placeholder="🔍 Search courses…" value={searchQuery}
                onChange={e=>setSearchQuery(e.target.value)}
                style={{ flex:"1", minWidth:"200px", maxWidth:"320px" }} />
              <div style={{ display:"flex", flexWrap:"wrap", gap:"5px" }}>
                {DEPTS.map(d=>(
                  <div key={d} onClick={()=>{ setFilterDept(d); setFilterCtePath("All CTE"); setFilterFineArts("All Fine Arts"); setFilterMisc("All Miscellaneous"); }}
                    style={{ padding:"6px 12px", borderRadius:"7px", cursor:"pointer", fontSize:"12px",
                      fontWeight:700, transition:"all 0.15s",
                      background:filterDept===d?"var(--red)":"white",
                      color:filterDept===d?"white":"var(--muted)",
                      border:`1.5px solid ${filterDept===d?"var(--red)":"var(--border)"}` }}>
                    {d}
                  </div>
                ))}
              </div>
            </div>
            {filterDept === "CTE" && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:"5px", marginBottom:"12px" }}>
                {CTE_PATHS.map(p=>(
                  <div key={p} onClick={()=>setFilterCtePath(p)}
                    style={{ padding:"5px 11px", borderRadius:"7px", cursor:"pointer", fontSize:"11px",
                      fontWeight:700, transition:"all 0.15s",
                      background:filterCtePath===p?"var(--red)":"white",
                      color:filterCtePath===p?"white":"var(--muted)",
                      border:`1.5px solid ${filterCtePath===p?"var(--red)":"var(--border)"}` }}>
                    {p}
                  </div>
                ))}
              </div>
            )}
            {filterDept === "Fine Arts" && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:"5px", marginBottom:"12px" }}>
                {FINE_ARTS_TYPES.map(t=>(
                  <div key={t} onClick={()=>setFilterFineArts(t)}
                    style={{ padding:"5px 11px", borderRadius:"7px", cursor:"pointer", fontSize:"11px",
                      fontWeight:700, transition:"all 0.15s",
                      background:filterFineArts===t?"#DB2777":"white",
                      color:filterFineArts===t?"white":"var(--muted)",
                      border:`1.5px solid ${filterFineArts===t?"#DB2777":"var(--border)"}` }}>
                    {t}
                  </div>
                ))}
              </div>
            )}
            {filterDept === "Miscellaneous" && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:"5px", marginBottom:"12px" }}>
                {MISC_TYPES.map(t=>(
                  <div key={t} onClick={()=>setFilterMisc(t)}
                    style={{ padding:"5px 11px", borderRadius:"7px", cursor:"pointer", fontSize:"11px",
                      fontWeight:700, transition:"all 0.15s",
                      background:filterMisc===t?"#6B7280":"white",
                      color:filterMisc===t?"white":"var(--muted)",
                      border:`1.5px solid ${filterMisc===t?"#6B7280":"var(--border)"}` }}>
                    {t}
                  </div>
                ))}
              </div>
            )}
            <p style={{ fontSize:"13px", color:"var(--muted)", marginBottom:"18px" }}>
              Showing {filteredCourses.length} course{filteredCourses.length!==1?"s":""}
            </p>
            <div className="catalog-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(295px,1fr))", gap:"14px" }}>
              {filteredCourses.map(c=>(
                <div key={c.id} className="c-card" onClick={()=>setSelectedCourse(c)}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"8px" }}>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"4px", alignItems:"center" }}>
                      <span className="badge" style={{ background:deptColor(c.dept)+"1A", color:deptColor(c.dept) }}>{c.ctePath||c.fineArtsType||c.miscType||c.dept}</span>
                      {c.teacherSigRequired&&<span style={{ fontSize:"10px",background:"#FEF3C7",color:"#92400E",padding:"2px 6px",borderRadius:"4px",fontWeight:700 }}>✍ Sig. req.</span>}
                    </div>
                    <div style={{ display:"flex", gap:"5px", alignItems:"center" }}>
                      {c.isAP&&<span className="tag-ap">AP</span>}
                      <span style={{ fontSize:"12px", fontWeight:700, color:"var(--muted)" }}>{c.credits}cr</span>
                    </div>
                  </div>
                  <h3 style={{ fontSize:"14px", fontWeight:700, color:"var(--text)", lineHeight:1.35, marginBottom:"2px" }}>{c.name}</h3>
                  {c.subtitle&&<p style={{ fontSize:"11px", color:"var(--muted)", fontStyle:"italic", marginBottom:"3px" }}>{c.subtitle}</p>}
                  {c.code&&<p style={{ fontSize:"11px", color:"#A08080", marginBottom:"6px" }}>{c.code}</p>}
                  <p style={{ fontSize:"12px", color:"var(--muted)", lineHeight:1.5,
                    display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{c.desc}</p>
                  {(c.prereqs.length>0 || (c.concurrentOk||[]).length>0)&&(
                    <div style={{ marginTop:"9px", fontSize:"11px", fontWeight:700 }}>
                      {c.prereqs.length>0&&(
                        <span style={{ color:"var(--red)" }}>
                          Prereq: {c.prereqs.map(pid=>{
                            const equivs=(PREREQ_EQUIV[pid]||[]);
                            return equivs.length>0
                              ? `${getCourseName(pid)} (or ${equivs.map(getCourseName).join("/")})`
                              : getCourseName(pid);
                          }).join(" + ")}
                        </span>
                      )}
                      {c.prereqs.length>0&&(c.concurrentOk||[]).length>0&&<span style={{color:"var(--muted)"}}> · </span>}
                      {(c.concurrentOk||[]).length>0&&(
                        <span style={{ color:"#1D4ED8" }}>
                          🔄 concurrent: {(c.concurrentOk||[]).map(cid=>{
                            const equivs=(PREREQ_EQUIV[cid]||[]);
                            return equivs.length>0
                              ? `${getCourseName(cid)} (or ${equivs.map(getCourseName).join("/")})`
                              : getCourseName(cid);
                          }).join(" or ")}
                        </span>
                      )}
                    </div>
                  )}
                  <div style={{ marginTop:"8px", fontSize:"11px", color:"var(--muted)",
                    display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span>Grade {c.gradeLevel.join("/")} · {c.credits===0.5?"Semester":"Year"}</span>
                    {ratings[c.id] && (
                      <span style={{ color:"#92400E", fontWeight:700 }}>
                        ⭐ {ratings[c.id].avg.toFixed(1)}
                        <span style={{ color:"var(--muted)", fontWeight:400 }}> ({ratings[c.id].count})</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {filteredCourses.length===0&&(
                <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"60px", color:"var(--muted)" }}>
                  <div style={{ fontSize:"44px", marginBottom:"16px" }}>🔍</div>
                  <p style={{ fontSize:"16px", fontWeight:700 }}>No courses found</p>
                  <p style={{ fontSize:"13px" }}>Try a different search term or department filter</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PLANNER ── */}
        {page==="planner" && (
          <div className="fade-in" style={{ maxWidth:"1180px", margin:"0 auto", padding:"32px 24px" }}>
            <div className="planner-layout" style={{ display:"flex", gap:"28px", alignItems:"flex-start", flexWrap:"wrap" }}>
              <div style={{ flex:"1", minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", flexWrap:"wrap", gap:"10px", marginBottom:"6px" }}>
                  <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"28px", color:"var(--red-dark)" }}>4-Year Course Planner</h1>
                  {showResetConfirm ? (
                    <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap" }}>
                      <span style={{ fontSize:"12px", color:"var(--muted)", fontWeight:600 }}>
                        Reset all 4 grades?
                      </span>
                      <button onClick={()=>{ setPlan(JSON.parse(JSON.stringify(DEFAULT_PLAN))); setShowResetConfirm(false); }}
                        style={{ background:"var(--red)", color:"white", border:"none",
                          borderRadius:"7px", padding:"5px 12px", fontSize:"12px", fontWeight:700,
                          cursor:"pointer", fontFamily:"inherit" }}>
                        Yes, reset
                      </button>
                      <button onClick={()=>setShowResetConfirm(false)}
                        style={{ background:"white", color:"var(--muted)", border:"1.5px solid var(--border)",
                          borderRadius:"7px", padding:"5px 12px", fontSize:"12px", fontWeight:600,
                          cursor:"pointer", fontFamily:"inherit" }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                  <button onClick={()=>setShowResetConfirm(true)}
                    style={{ background:"white", color:"var(--muted)", border:"1.5px solid var(--border)",
                      borderRadius:"8px", padding:"6px 13px", fontSize:"12px", fontWeight:600,
                      cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
                    ↺ Reset Plan
                  </button>
                  )}
                </div>
                <p style={{ fontSize:"13px", color:"var(--muted)", marginBottom:"22px" }}>
                  Click a course name to view details · ⚠️ = missing prereq · Click × to remove
                </p>

                <div className="plan-grid" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"16px", marginBottom:"8px" }}>
                {[9,10,11,12].map(grade=>{
                  const gradeCredits = plan[grade].reduce((s,cid)=>{ const c=getCourse(cid); return s+(c?.credits||0); },0);
                  const usedSlots = gradeSlots(plan, grade);
                  const atCap = usedSlots >= GRADE_MAX;
                  return (
                    <motion.div key={grade}
                      animate={shakeGrade===grade ? shakeAnim : {}}>
                      <div style={{ background:"white", borderRadius:"20px", border:"1px solid #E2E8F0",
                        boxShadow:"0 1px 4px rgba(0,0,0,0.05)", overflow:"hidden" }}>
                        <div style={{ padding:"16px 18px 12px", borderBottom:"1px solid #F1F5F9",
                          display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                          <h2 style={{ fontSize:"20px", fontWeight:900, color:"#0F172A",
                            letterSpacing:"-0.04em", lineHeight:1 }}>Grade {grade}</h2>
                          <span style={{ fontSize:"11px", fontWeight:700,
                            color:atCap?"#F59E0B":"#94A3B8", background:atCap?"#FEF9C3":"#F8FAFC",
                            padding:"3px 8px", borderRadius:"999px",
                            border:`1px solid ${atCap?"#FDE68A":"#E2E8F0"}` }}>
                            {usedSlots.toFixed(1)}/{GRADE_MAX}
                          </span>
                        </div>
                        <div style={{ padding:"12px 14px 0" }}>
                        <AnimatePresence>
                          {plan[grade].map((cid,idx)=>{
                            const c=getCourse(cid);
                            if(!c) return null;
                            const col=deptColor(c.dept);
                            const isOffCampus = cid==="OFF_CAMPUS";
                            const before = getCoursesBeforeGrade(plan, grade);
                            const upTo = getAllCoursesUpTo(plan, grade);
                            const unmet = isOffCampus ? [] : getUnmetPrereqs(cid, before, upTo);
                            return (
                              <motion.div key={`${cid}-${idx}`}
                                layout="position"
                                variants={cardVariants}
                                initial="hidden" animate="show" exit="exit"
                                style={{ overflow:"hidden" }}>
                                <motion.div className="card-hover-group"
                                  variants={contentVariants}
                                  whileHover={{ x:3, boxShadow:"0 4px 14px rgba(0,0,0,0.08)" }}
                                  transition={{ type:"spring", stiffness:400, damping:28 }}
                                  style={{ display:"flex", alignItems:"center",
                                    background:isOffCampus?"#F8FAFC":"white",
                                    border:`1px solid ${isOffCampus?"#CBD5E1":col+"28"}`,
                                    borderRadius:"12px", overflow:"hidden",
                                    position:"relative", marginBottom:"6px" }}>
                                  <div style={{ width:"4px", alignSelf:"stretch",
                                    background:isOffCampus?"#475569":col, flexShrink:0 }}/>
                                  <motion.div
                                    initial={{ x:"-150%", skewX:-12 }}
                                    animate={{ x:"250%", skewX:-12 }}
                                    transition={{ duration:0.9, ease:"easeInOut", delay:0.12 }}
                                    style={{ position:"absolute", top:"-30%", bottom:"-30%",
                                      left:0, width:"55%", zIndex:20, pointerEvents:"none",
                                      background:`linear-gradient(to right,transparent,${
                                        isOffCampus?"rgba(71,85,105,0.22)":col+"44"},transparent)` }}/>
                                  <div style={{ flex:1, padding:"9px 10px", minWidth:0, position:"relative" }}>
                                    <div style={{ display:"flex", alignItems:"center", gap:"4px", marginBottom:"2px" }}>
                                      <span style={{ fontSize:"9px", fontWeight:900, letterSpacing:"0.07em",
                                        textTransform:"uppercase",
                                        background:isOffCampus?"#E2E8F0":col+"18",
                                        color:isOffCampus?"#475569":col,
                                        padding:"2px 6px", borderRadius:"4px", flexShrink:0 }}>
                                        {isOffCampus?"Off Campus":c.dept}
                                      </span>
                                      <span style={{ fontSize:"9px", fontWeight:800, color:"#94A3B8",
                                        background:"#F1F5F9", padding:"2px 5px",
                                        borderRadius:"4px", flexShrink:0 }}>{c.credits}cr</span>
                                      {c.isAP&&<span className="tag-ap" style={{fontSize:"9px"}}>AP</span>}
                                      {unmet.length>0 && (
                                        <span title={`Missing prereqs: ${unmet.map(getPrereqDisplay).join(", ")}`}
                                          style={{ fontSize:"11px", cursor:"help", flexShrink:0 }}>⚠️</span>
                                      )}
                                    </div>
                                    <span style={{ fontSize:"13px", fontWeight:700,
                                      color:isOffCampus?"#475569":"#0F172A",
                                      letterSpacing:"-0.01em", cursor:"pointer",
                                      overflow:"hidden", textOverflow:"ellipsis",
                                      display:"block", whiteSpace:"nowrap" }}
                                      onClick={()=>setSelectedCourse(c)}>
                                      {isOffCampus?"🚗 Off Campus":c.name}
                                    </span>
                                  </div>
                                  <div className="delete-btn-wrap" style={{ padding:"0 10px", flexShrink:0 }}>
                                    <motion.div
                                      whileHover={{ backgroundColor:"#EF4444", scale:1.12,
                                        boxShadow:"0 4px 12px rgba(239,68,68,0.4)" }}
                                      whileTap={{ scale:0.92 }}
                                      onClick={()=>removeCourse(grade,idx)}
                                      style={{ width:"30px", height:"30px", borderRadius:"50%",
                                        background:"#FEF2F2", display:"flex", alignItems:"center",
                                        justifyContent:"center", cursor:"pointer" }}>
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                        stroke="#EF4444" strokeWidth="2.5"
                                        strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"/>
                                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                        <path d="M10 11v6M14 11v6"/>
                                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                      </svg>
                                    </motion.div>
                                  </div>
                                </motion.div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                        <div style={{ display:"flex", gap:"8px", marginTop:"6px" }}>
                          <div className="add-btn" style={{ flex:1, opacity: atCap?0.4:1, cursor: atCap?"not-allowed":"pointer",
                            pointerEvents: atCap?"none":"auto" }}
                            onClick={()=>{ if(!atCap) setAddTarget(grade); }}>
                            {atCap ? `✋ Full (${GRADE_MAX} slots used)` : "+ Add a Course"}
                          </div>
                          {grade===12&&(
                            <div className="add-btn"
                              style={{ flex:"0 0 auto", borderColor:"#64748B", color:"#64748B",
                                opacity: atCap?0.4:1, cursor: atCap?"not-allowed":"pointer",
                                pointerEvents: atCap?"none":"auto" }}
                              onClick={()=>{ if(gradeSlots(plan,12)<GRADE_MAX) setPlan(p=>{ const n=JSON.parse(JSON.stringify(p)); n[12].push("OFF_CAMPUS"); return n; }); }}>
                              🚗 Off Campus
                            </div>
                          )}
                        </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                </div>
              </div>

              {/* ── SIDEBAR ── */}
              <div className="planner-sidebar" style={{ width:"265px", flexShrink:0 }}>
                <div style={{ background:`linear-gradient(170deg,var(--slate) 0%,var(--slate-mid) 100%)`,
                  borderRadius:"16px", padding:"22px", position:"sticky", top:"72px",
                  boxShadow:"0 8px 32px rgba(0,0,0,0.22)" }}>

                  <h2 style={{ fontFamily:"'Playfair Display',serif", color:"white", fontSize:"18px",
                    marginBottom:"4px" }}>Graduation Progress</h2>
                  <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.5)", marginBottom:"14px" }}>
                    {total.toFixed(1)} / 24.0 credits planned
                  </div>
                  <div style={{ height:"10px", borderRadius:"5px", background:"rgba(255,255,255,0.1)",
                    overflow:"hidden", marginBottom:"20px" }}>
                    <motion.div
                      animate={{ width:`${Math.min(100,(total/24)*100)}%` }}
                      transition={{ type:"spring", stiffness:200, damping:20 }}
                      style={{ height:"100%", borderRadius:"5px",
                        background:"linear-gradient(90deg,var(--red),#E53E3E)",
                        overflow:"hidden", position:"relative" }}>
                      <motion.div key={total}
                        initial={{ x:"-100%" }} animate={{ x:"200%" }}
                        transition={{ duration:0.9, ease:"easeOut", delay:0.1 }}
                        style={{ position:"absolute", inset:"-50% 0", width:"50%",
                          background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)",
                          pointerEvents:"none" }}/>
                    </motion.div>
                  </div>
                  {GRAD_REQUIREMENTS.map(r=>{
                    const earned=cats[r.id]||0;
                    const pct=Math.min(100,(earned/r.required)*100);
                    const done=earned>=r.required;
                    return (
                      <div key={r.id} style={{ marginBottom:"12px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between",
                          fontSize:"11px", fontWeight:700, marginBottom:"5px" }}>
                          <span style={{ color: done ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.65)",
                            display:"flex", alignItems:"center", gap:"4px" }}>
                            {done && <span style={{ color:r.color, fontSize:"10px" }}>✓</span>}
                            {r.label}
                          </span>
                          <motion.span key={`${r.id}-${earned}`}
                            initial={{ scale:1.5, color:"#FBBF24" }}
                            animate={{ scale:1, color:done?r.color:"rgba(255,255,255,0.4)" }}
                            transition={{ type:"spring", stiffness:400, damping:15 }}
                            style={{ fontVariantNumeric:"tabular-nums", display:"inline-block",
                              fontWeight:700, fontSize:"11px" }}>
                            {earned.toFixed(1)}/{r.required}
                          </motion.span>
                        </div>
                        <div className="req-bar" style={{ overflow:"hidden" }}>
                          <motion.div
                            animate={{ width:`${pct}%`,
                              background:done?`linear-gradient(90deg,${r.color},${r.color}cc)`:r.color }}
                            transition={{ type:"spring", stiffness:200, damping:20 }}
                            style={{ height:"100%", borderRadius:"3px",
                              overflow:"hidden", position:"relative" }}>
                            {pct>0 && !done && (
                              <motion.div key={earned}
                                initial={{ x:"-100%" }} animate={{ x:"200%" }}
                                transition={{ duration:0.7, ease:"easeOut", delay:0.1 }}
                                style={{ position:"absolute", inset:"-50% 0", width:"45%",
                                  background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)",
                                  pointerEvents:"none" }}/>
                            )}
                          </motion.div>
                        </div>
                      </div>
                    );
                  })}

                  <div style={{ borderTop:"1px solid rgba(255,255,255,0.12)", margin:"18px 0 14px" }} />
                  <div style={{ fontSize:"11px", fontWeight:800, letterSpacing:"0.1em",
                    textTransform:"uppercase", color:"rgba(255,255,255,0.4)", marginBottom:"10px" }}>
                    Honors Certificates
                  </div>
                  <p style={{ fontSize:"10px", color:"rgba(255,255,255,0.35)", marginBottom:"12px", lineHeight:1.5 }}>
                    All require GPA 3.0+. Tap to track progress.
                  </p>

                  {HONORS_DEFS.map(hdef=>{
                    const prog = honorsProgress[hdef.id];
                    const metCount = Object.values(prog).filter(v=>v.met).length;
                    const total_chks = hdef.checks.length;
                    const isOpen = honorsOpen[hdef.id];
                    const allMet = metCount === total_chks;
                    return (
                      <div key={hdef.id} style={{ marginBottom:"8px" }}>
                        <div onClick={()=>setHonorsOpen(o=>({...o,[hdef.id]:!o[hdef.id]}))}
                          style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                            padding:"8px 10px", borderRadius:"8px", cursor:"pointer",
                            background: allMet?"rgba(22,163,74,0.18)":"rgba(255,255,255,0.07)",
                            border:`1px solid ${allMet?"rgba(22,163,74,0.4)":"rgba(255,255,255,0.1)"}`,
                            transition:"all 0.15s" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:"7px" }}>
                            <span style={{ fontSize:"14px" }}>{hdef.icon}</span>
                            <span style={{ fontSize:"12px", fontWeight:700, color:"white" }}>{hdef.label}</span>
                          </div>
                          <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                            <span style={{ fontSize:"11px", fontWeight:700,
                              color: allMet?"#4ADE80":"rgba(255,255,255,0.45)" }}>
                              {metCount}/{total_chks}
                            </span>
                            <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.4)" }}>
                              {isOpen?"▲":"▼"}
                            </span>
                          </div>
                        </div>
                        {isOpen && (
                          <div style={{ background:"rgba(0,0,0,0.2)", borderRadius:"0 0 8px 8px",
                            padding:"10px", marginTop:"-4px", border:"1px solid rgba(255,255,255,0.08)",
                            borderTop:"none" }}>
                            {hdef.checks.map(chk=>{
                              const result = prog[chk.id];
                              return (
                                <div key={chk.id} style={{ display:"flex", gap:"8px", padding:"6px 0",
                                  borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                                  <span style={{ fontSize:"13px", flexShrink:0, marginTop:"1px" }}>
                                    {result?.met ? "✅" : "⬜"}
                                  </span>
                                  <div>
                                    <div style={{ fontSize:"11px", fontWeight:600, color:"rgba(255,255,255,0.85)", lineHeight:1.3 }}>
                                      {chk.label}
                                    </div>
                                    <div style={{ fontSize:"10px", marginTop:"2px",
                                      color: result?.met?"#4ADE80":"#FCD34D", lineHeight:1.4 }}>
                                      {result?.detail}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            <p style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", marginTop:"8px", lineHeight:1.4 }}>
                              ⚠️ GPA &amp; performance assessments cannot be tracked here.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  
                </div>
              </div>
            </div>
          </div>
        )}

                {/* ── COURSE DETAIL MODAL ── */}
        {selectedCourse&&(
          <div className="overlay" onClick={()=>setSelectedCourse(null)}>
            <div className="modal" onClick={e=>e.stopPropagation()}>
              <div style={{ padding:"24px 26px", borderBottom:"1px solid var(--border)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div style={{ flex:1, paddingRight:"12px" }}>
                    <span className="badge" style={{ background:deptColor(selectedCourse.dept)+"1A",
                      color:deptColor(selectedCourse.dept), marginBottom:"10px", display:"inline-block" }}>
                      {selectedCourse.dept}
                    </span>
                    <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", color:"var(--text)",
                      lineHeight:1.3, marginBottom:"4px" }}>{selectedCourse.name}</h2>
                    {selectedCourse.subtitle&&<p style={{ fontSize:"13px", color:"var(--muted)", fontStyle:"italic", marginBottom:"3px" }}>{selectedCourse.subtitle}</p>}
                    {selectedCourse.code&&<p style={{ fontSize:"12px",color:"var(--muted)" }}>{selectedCourse.code}</p>}
                  </div>
                  <button onClick={()=>setSelectedCourse(null)}
                    style={{ background:"var(--light-red)", border:"none", borderRadius:"50%", width:"34px",
                      height:"34px", cursor:"pointer", fontSize:"20px", color:"var(--red)",
                      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>×</button>
                </div>
              </div>
              <div style={{ padding:"22px 26px" }}>
                {selectedCourse.isOffCampus ? (
                  /* ── OFF CAMPUS STRUCTURED CARD ── */
                  <div>
                    <div style={{ background:"#F8FAFC", border:"1.5px solid #CBD5E1", borderRadius:"12px",
                      padding:"16px", marginBottom:"14px" }}>
                      <div style={{ fontSize:"11px", fontWeight:800, textTransform:"uppercase",
                        letterSpacing:"0.09em", color:"#64748B", marginBottom:"10px" }}>✅ Eligibility (all 3 required)</div>
                      {selectedCourse.eligibility.map((e,i)=>(
                        <div key={i} style={{ display:"flex", gap:"9px", alignItems:"flex-start",
                          padding:"6px 0", borderBottom: i<selectedCourse.eligibility.length-1?"1px solid #E2E8F0":"none" }}>
                          <span style={{ background:"#0F172A", color:"white", borderRadius:"50%",
                            width:"18px", height:"18px", display:"flex", alignItems:"center", justifyContent:"center",
                            fontSize:"10px", fontWeight:700, flexShrink:0, marginTop:"1px" }}>{i+1}</span>
                          <span style={{ fontSize:"13px", color:"#1E293B", lineHeight:1.5 }}>{e}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginBottom:"14px" }}>
                      <div style={{ fontSize:"11px", fontWeight:800, textTransform:"uppercase",
                        letterSpacing:"0.09em", color:"#64748B", marginBottom:"8px" }}>🗓 Qualifying Reasons & Limits</div>
                      {selectedCourse.reasons.map((r,i)=>(
                        <div key={i} style={{ background: i===0?"#F0FDF4":"#FFF7ED",
                          border:`1.5px solid ${i===0?"#BBF7D0":"#FED7AA"}`,
                          borderRadius:"9px", padding:"11px 14px", marginBottom:"8px" }}>
                          <div style={{ fontSize:"13px", fontWeight:700, color: i===0?"#15803D":"#9A3412", marginBottom:"3px" }}>
                            {r.label}
                          </div>
                          <div style={{ fontSize:"12px", color: i===0?"#166534":"#7C2D12" }}>{r.limit}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ background:"#FFFBEB", border:"1.5px solid #FDE68A",
                      borderRadius:"10px", padding:"13px 15px", marginBottom:"14px" }}>
                      <div style={{ fontSize:"11px", fontWeight:800, textTransform:"uppercase",
                        letterSpacing:"0.09em", color:"#92400E", marginBottom:"8px" }}>
                        📋 Required Submissions · Due {selectedCourse.deadline}
                      </div>
                      {selectedCourse.submissions.map((s,i)=>(
                        <div key={i} style={{ display:"flex", gap:"8px", fontSize:"12px", color:"#78350F",
                          padding:"5px 0", borderBottom: i<selectedCourse.submissions.length-1?"1px solid #FDE68A":"none" }}>
                          <span style={{ fontWeight:800, flexShrink:0, color:"#92400E" }}>{String.fromCharCode(65+i)}.</span>
                          <span style={{ lineHeight:1.5 }}>{s}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ background:"#FEF2F2", border:"1.5px solid #FECACA",
                      borderRadius:"9px", padding:"11px 14px", marginBottom:"12px" }}>
                      <div style={{ fontSize:"12px", fontWeight:700, color:"#991B1B", lineHeight:1.5 }}>
                        ⚠️ {selectedCourse.warning}
                      </div>
                    </div>

                    {selectedCourse.tips&&(
                      <div style={{ background:"#EFF6FF", border:"1.5px solid #BFDBFE",
                        borderRadius:"9px", padding:"11px 14px",
                        fontSize:"12px", color:"#1E40AF", lineHeight:1.65 }}>
                        <strong>💡 </strong>{selectedCourse.tips}
                      </div>
                    )}
                  </div>
                ) : (
                  /* ── REGULAR COURSE BODY ── */
                  <div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px", marginBottom:"16px" }}>
                      {[["Credits",selectedCourse.credits+" cr"],
                        ["Grade",selectedCourse.gradeLevel.join("/")],
                        ["Duration",selectedCourse.credits===0.5?"Semester":"Year"]].map(([k,v])=>(
                        <div key={k} style={{ background:"#F9FAFB", borderRadius:"9px", padding:"11px", textAlign:"center",
                          border:"1px solid var(--border)" }}>
                          <div style={{ fontSize:"10px",color:"var(--muted)",fontWeight:800,textTransform:"uppercase",
                            letterSpacing:"0.06em",marginBottom:"4px" }}>{k}</div>
                          <div style={{ fontSize:"15px",fontWeight:800,color:"var(--slate)" }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    {selectedCourse.isAP&&(
                      <div style={{ background:"#FFFBEB", border:"1.5px solid #F59E0B", borderRadius:"9px",
                        padding:"11px 14px", marginBottom:"14px", fontSize:"12px", color:"#78350F", fontWeight:600 }}>
                        ⭐ AP Course — Weighted on 5.0 scale. AP exam required in May (~$96). Signed contract + parent info session required.
                      </div>
                    )}
                    {selectedCourse.teacherSigRequired&&(
                      <div style={{ background:"#FEF9C3", border:"1.5px solid #EAB308", borderRadius:"8px",
                        padding:"8px 13px", marginBottom:"12px", fontSize:"12px", color:"#78350F", fontWeight:600 }}>
                        ✍️ Teacher/counselor signature required for enrollment
                      </div>
                    )}
                    <div style={{ marginBottom:"14px" }}>
                      <h3 style={{ fontSize:"11px",fontWeight:800,color:"var(--muted)",textTransform:"uppercase",
                        letterSpacing:"0.08em",marginBottom:"7px" }}>Description</h3>
                      <p style={{ fontSize:"13px",color:"var(--text)",lineHeight:1.7 }}>{selectedCourse.desc}</p>
                    </div>
                    {selectedCourse.gradeReqs && Object.keys(selectedCourse.gradeReqs).length>0 && (
                      <div style={{ background:"#F0FDF4", border:"1.5px solid #BBF7D0", borderRadius:"8px",
                        padding:"10px 13px", marginBottom:"12px" }}>
                        <div style={{ fontSize:"11px",fontWeight:800,color:"#166534",textTransform:"uppercase",
                          letterSpacing:"0.06em",marginBottom:"6px" }}>⭐ Grade Requirements</div>
                        {Object.entries(selectedCourse.gradeReqs).map(([pid,req])=>(
                          <div key={pid} style={{ fontSize:"12px",color:"#15803D", marginBottom:"3px" }}>
                            <strong>{getCourseName(pid)}</strong>: {req}
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedCourse.concurrentOk && selectedCourse.concurrentOk.length>0 && (
                      <div style={{ background:"#EFF6FF", border:"1.5px solid #BFDBFE", borderRadius:"8px",
                        padding:"10px 13px", marginBottom:"12px" }}>
                        <div style={{ fontSize:"11px",fontWeight:800,color:"#1E40AF",textTransform:"uppercase",
                          letterSpacing:"0.06em",marginBottom:"4px" }}>🔄 Can take concurrently with</div>
                        <div style={{ fontSize:"12px",color:"#1D4ED8" }}>
                          {selectedCourse.concurrentOk.map(id=>getCourseName(id)).join(" or ")}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {!selectedCourse.isOffCampus && (selectedCourse.prereqs.length>0 || (selectedCourse.concurrentOk||[]).length>0) &&(
                  <div style={{ marginBottom:"14px" }}>
                    <h3 style={{ fontSize:"11px",fontWeight:800,color:"var(--muted)",textTransform:"uppercase",
                      letterSpacing:"0.08em",marginBottom:"7px" }}>Prerequisites</h3>
                    <div style={{ display:"flex", gap:"7px", flexWrap:"wrap" }}>
                      {selectedCourse.prereqs.map(pid=>{
                        const pc=getCourse(pid);
                        const equivIds = PREREQ_EQUIV[pid]||[];
                        return (
                          <div key={pid} style={{ display:"flex", alignItems:"center", gap:"4px", flexWrap:"wrap" }}>
                            <div className="prereq-chip" onClick={()=>setSelectedCourse(pc)}
                              style={{ background:"#FEF2F2", border:"1px solid #FCA5A5", color:"#B91C1C" }}>
                              {getCourseName(pid)} →
                            </div>
                            {equivIds.map(eid=>(
                              <span key={eid} style={{ display:"flex", alignItems:"center", gap:"4px" }}>
                                <span style={{ fontSize:"11px", color:"var(--muted)", fontWeight:600 }}>or</span>
                                <div className="prereq-chip" onClick={()=>setSelectedCourse(getCourse(eid))}
                                  style={{ background:"#FFF7ED", border:"1px solid #FED7AA", color:"#9A3412" }}>
                                  {getCourseName(eid)} →
                                </div>
                              </span>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                    {(selectedCourse.concurrentOk||[]).length>0&&(
                      <div style={{ marginTop:"8px" }}>
                        <div style={{ fontSize:"11px", color:"#0369A1", fontWeight:700,
                          marginBottom:"5px" }}>🔄 Can take concurrently with (same year OK):</div>
                        <div style={{ display:"flex", gap:"7px", flexWrap:"wrap" }}>
                          {(selectedCourse.concurrentOk||[]).map(cid=>{
                            const equivIds = PREREQ_EQUIV[cid]||[];
                            return (
                              <div key={cid} style={{ display:"flex", alignItems:"center", gap:"4px", flexWrap:"wrap" }}>
                                <div className="prereq-chip" onClick={()=>setSelectedCourse(getCourse(cid))}
                                  style={{ background:"#EFF6FF", border:"1px solid #93C5FD", color:"#1D4ED8" }}>
                                  {getCourseName(cid)} 🔄
                                </div>
                                {equivIds.map(eid=>(
                                  <span key={eid} style={{ display:"flex", alignItems:"center", gap:"4px" }}>
                                    <span style={{ fontSize:"11px", color:"var(--muted)", fontWeight:600 }}>or</span>
                                    <div className="prereq-chip" onClick={()=>setSelectedCourse(getCourse(eid))}
                                      style={{ background:"#EFF6FF", border:"1px solid #93C5FD", color:"#1D4ED8" }}>
                                      {getCourseName(eid)} 🔄
                                    </div>
                                  </span>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {!selectedCourse.isOffCampus && (()=>{
                  const unlocks=liveCourses.filter(c=>c.prereqs.includes(selectedCourse.id));
                  return unlocks.length>0?(
                    <div style={{ marginBottom:"14px" }}>
                      <h3 style={{ fontSize:"11px",fontWeight:800,color:"var(--muted)",textTransform:"uppercase",
                        letterSpacing:"0.08em",marginBottom:"7px" }}>Leads To</h3>
                      <div style={{ display:"flex", gap:"7px", flexWrap:"wrap" }}>
                        {unlocks.map(c=>(
                          <div key={c.id} className="prereq-chip" onClick={()=>setSelectedCourse(c)}
                            style={{ background:deptColor(c.dept)+"14",
                              border:`1px solid ${deptColor(c.dept)}35`, color:deptColor(c.dept) }}>
                            {c.name}{c.isAP&&" ⭐"}
                          </div>
                        ))}
                      </div>
                    </div>
                  ):null;
                })()}
                {!selectedCourse.isOffCampus && selectedCourse.tips&&(
                  <div style={{ background:"#EFF6FF", border:"1.5px solid #BFDBFE",
                    borderRadius:"9px", padding:"12px 14px", fontSize:"13px", color:"#1E40AF",
                    lineHeight:1.65, marginBottom:"16px" }}>
                    <strong>💡 Tip: </strong>{selectedCourse.tips}
                  </div>
                )}
                {!selectedCourse.isOffCampus && <div style={{ borderTop:"1px solid var(--border)", paddingTop:"16px" }}>
                  <p style={{ fontSize:"12px",color:"var(--muted)",marginBottom:"9px",fontWeight:600 }}>
                    Add to 4-Year Plan:
                  </p>
                  <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                    {[9,10,11,12].map(g=>{
                      const already = !selectedCourse.repeatable && Object.values(plan).flat().includes(selectedCourse.id);
                      const full = gradeSlots(plan, g) >= GRADE_MAX;
                      const disabled = already || full;
                      return (
                        <button key={g} disabled={disabled}
                          onClick={()=>{
                            if (disabled) return;
                            const before = getCoursesBeforeGrade(plan, g);
                            const upTo = getAllCoursesUpTo(plan, g);
                            const unmet = getUnmetPrereqs(selectedCourse.id, before, upTo);
                            if (unmet.length > 0) {
                              setAddTarget(g);
                              setPrereqWarn({ courseId: selectedCourse.id, grade: g, unmet });
                              setSelectedCourse(null);
                              return;
                            }
                            const conflict = getCoreConflict(selectedCourse.id, g);
                            if (conflict) {
                              setAddTarget(g);
                              setPrereqWarn({ courseId: selectedCourse.id, grade: g, unmet: [], coreConflict: conflict });
                              setSelectedCourse(null);
                              return;
                            }
                            setPlan(p=>{const n=JSON.parse(JSON.stringify(p));if(!selectedCourse.repeatable&&Object.values(n).flat().includes(selectedCourse.id))return p;n[g].push(selectedCourse.id);return n;});
                            showToast(`Added "${selectedCourse.name}" to Grade ${g}`);
                            setSelectedCourse(null);
                          }}
                          style={{ padding:"8px 16px",fontSize:"13px",fontWeight:700,
                            cursor:disabled?"not-allowed":"pointer",
                            borderRadius:"8px",border:"1.5px solid var(--border)",
                            background:already?"#FFF0F0":full?"#F9FAFB":"white",
                            color:already?"var(--red)":full?"var(--muted)":"var(--text)",
                            transition:"all 0.15s",fontFamily:"inherit",
                            opacity:disabled?0.6:1 }}
                          onMouseEnter={e=>{ if(!disabled){e.currentTarget.style.background="var(--red)";e.currentTarget.style.color="white";e.currentTarget.style.borderColor="var(--red)";} }}
                          onMouseLeave={e=>{ if(!disabled){e.currentTarget.style.background="white";e.currentTarget.style.color="var(--text)";e.currentTarget.style.borderColor="var(--border)";} }}>
                          {already ? `✓ Gr ${g}` : full ? `Full ${g}` : `Grade ${g}`}
                        </button>
                      );
                    })}
                  </div>
                </div>}

                {/* RATING SECTION */}
                {!selectedCourse.isOffCampus && (
                  <div style={{ borderTop:"1px solid var(--border)", paddingTop:"16px", marginTop:"8px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between",
                      alignItems:"center", marginBottom:"12px" }}>
                      <p style={{ fontSize:"11px", color:"var(--muted)", fontWeight:700,
                        textTransform:"uppercase", letterSpacing:"0.06em" }}>Rate this course</p>
                      {ratings[selectedCourse.id] ? (
                        <span style={{ fontSize:"12px", color:"#92400E", fontWeight:700 }}>
                          ⭐ {ratings[selectedCourse.id].avg.toFixed(1)}
                          <span style={{ color:"var(--muted)", fontWeight:400 }}> · {ratings[selectedCourse.id].count} rating{ratings[selectedCourse.id].count!==1?"s":""}</span>
                        </span>
                      ) : (
                        <span style={{ fontSize:"11px", color:"var(--muted)" }}>No ratings yet — be the first!</span>
                      )}
                    </div>

                    {myRatings[selectedCourse.id] ? (
                      // Already rated
                      <div style={{ display:"flex", alignItems:"center", gap:"10px",
                        padding:"10px 14px", background:"#FFFBEB", borderRadius:"10px",
                        border:"1.5px solid #FDE68A", animation:"ratingPopIn 0.4s cubic-bezier(.34,1.56,.64,1)" }}>
                        <div style={{ display:"flex", gap:"2px" }}>
                          {[1,2,3,4,5].map(s=>(
                            <span key={s} style={{ fontSize:"20px", color:s<=myRatings[selectedCourse.id]?"#F59E0B":"#D1D5DB" }}>★</span>
                          ))}
                        </div>
                        <span style={{ fontSize:"13px", color:"#92400E", fontWeight:600 }}>
                          You rated this {myRatings[selectedCourse.id]} star{myRatings[selectedCourse.id]!==1?"s":""}
                        </span>
                      </div>
                    ) : (
                      // Stars + inline confirm
                      <div style={{ display:"flex", alignItems:"center", gap:"14px", minHeight:"44px" }}>
                        {/* Star picker */}
                        <div style={{ display:"flex", gap:"5px", flexShrink:0 }}
                          id={`stars-${selectedCourse.id}`}>
                          {[1,2,3,4,5].map(star => (
                            <span
                              key={star}
                              id={`star-${selectedCourse.id}-${star}`}
                              onClick={()=>{
                                if(ratingAnimating) return;
                                setPendingRating({ courseId:selectedCourse.id, stars:star });
                                // Elastic pop animation via animejs
                                if(typeof anime !== "undefined") {
                                  const targets = [];
                                  for(let i=1;i<=star;i++){
                                    const el = document.getElementById(`star-${selectedCourse.id}-${i}`);
                                    if(el) targets.push(el);
                                  }
                                  anime.waapi.animate(targets, {
                                    scale:[1, 1.65, 0.82, 1.12, 1],
                                    ease: anime.eases.outElastic(1, 0.42),
                                    duration:1100,
                                    delay: anime.stagger(80),
                                  });
                                }
                              }}
                              style={{ fontSize:"32px", cursor:"pointer", lineHeight:1,
                                display: starVisible.includes(star) ? "inline-block" : "none",
                                animation: starVisible.includes(star)
                                  ? `starPop 0.4s cubic-bezier(.34,1.56,.64,1) both` : "none",
                                color: star <= (pendingRating?.courseId===selectedCourse.id ? pendingRating.stars : 0)
                                  ? "#F59E0B" : "#D1D5DB",
                                willChange:"transform",
                              }}>★</span>
                          ))}
                        </div>

                        {/* Confirm panel — slides in from right */}
                        {pendingRating?.courseId === selectedCourse.id && (
                          <div style={{ display:"flex", gap:"8px", alignItems:"center",
                            animation:"confirmSlideIn 0.28s cubic-bezier(.25,.46,.45,.94)" }}>
                            <button
                              onClick={()=>{
                                if(ratingAnimating) return;
                                setRatingAnimating(true);
                                // Burst animation
                                if(typeof anime !== "undefined") {
                                  const targets = [];
                                  for(let i=1;i<=pendingRating.stars;i++){
                                    const el = document.getElementById(`star-${selectedCourse.id}-${i}`);
                                    if(el) targets.push(el);
                                  }
                                  anime.waapi.animate(targets, {
                                    scale:[1, 1.9, 0.75, 1.2, 1],
                                    ease: anime.eases.outElastic(1, 0.35),
                                    duration:1300,
                                    delay: anime.stagger(65),
                                  });
                                }
                                setTimeout(()=>{
                                  setRatingAnimating(false);
                                  submitRating(pendingRating.courseId, pendingRating.stars);
                                }, 900);
                              }}
                              style={{ background:"#B00804", color:"white", border:"none",
                                borderRadius:"8px", padding:"8px 16px", fontSize:"13px",
                                fontWeight:700, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
                              Confirm {pendingRating.stars}★
                            </button>
                            <button
                              onClick={()=>{ setPendingRating(null); }}
                              style={{ background:"#F3F4F6", color:"#1F2937",
                                border:"1.5px solid #9CA3AF", borderRadius:"8px",
                                padding:"8px 14px", fontSize:"13px", fontWeight:600,
                                cursor:"pointer", fontFamily:"inherit" }}>
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── ADD COURSE MODAL ── */}
        {addTarget!==null&&(
          <div className="overlay" onClick={()=>{ setAddTarget(null); setAddSearch(""); setPrereqWarn(null); }}>
            <div className="modal" style={{ maxWidth:"450px" }} onClick={e=>e.stopPropagation()}>
              <div style={{ padding:"20px 22px", borderBottom:"1px solid var(--border)" }}>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"19px", color:"var(--red-dark)", marginBottom:"3px" }}>
                  Add Course to Grade {addTarget}
                </h2>
                <p style={{ fontSize:"13px",color:"var(--muted)" }}>Search by name, code, or department · ⚠️ = missing prereqs</p>
              </div>
              <div style={{ padding:"14px 18px" }}>
                <input className="si" placeholder="e.g. Chemistry, AP, Japanese, Engineering…"
                  autoFocus value={addSearch} onChange={e=>setAddSearch(e.target.value)}
                  style={{ marginBottom:"10px" }} />

                {/* Prereq warning dialog */}
                {prereqWarn && (
                  <div style={{ background:"#FEF9C3", border:"1.5px solid #EAB308", borderRadius:"10px",
                    padding:"12px 14px", marginBottom:"10px" }}>
                    <div style={{ fontWeight:700, fontSize:"13px", color:"#78350F", marginBottom:"6px" }}>
                      {prereqWarn.coreConflict ? "⚠️ Subject Conflict" : "⚠️ Missing Prerequisites"}
                    </div>
                    <div style={{ fontSize:"12px", color:"#78350F", marginBottom:"10px" }}>
                      {prereqWarn.coreConflict ? (
                        <span>
                          You already have <strong>{prereqWarn.coreConflict}</strong> in Grade {prereqWarn.grade}.
                          Only one {getCourse(prereqWarn.courseId)?.dept} course is allowed per year.
                        </span>
                      ) : (
                        <>
                          <strong>{getCourse(prereqWarn.courseId)?.name}</strong> requires:
                          <ul style={{ marginTop:"4px", paddingLeft:"18px" }}>
                            {prereqWarn.unmet.map(pid=>(
                              <li key={pid}>{getPrereqDisplay(pid)}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                    <div style={{ display:"flex", gap:"8px" }}>
                      <button onClick={()=>forceAddCourse(prereqWarn.courseId)}
                        style={{ flex:1, background:"#B45309", color:"white", border:"none", borderRadius:"7px",
                          padding:"8px", fontSize:"12px", fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                        Add Anyway
                      </button>
                      <button onClick={()=>setPrereqWarn(null)}
                        style={{ flex:1, background:"white", color:"#374151", border:"1.5px solid #D1D5DB",
                          borderRadius:"7px", padding:"8px", fontSize:"12px", fontWeight:600,
                          cursor:"pointer", fontFamily:"inherit" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {addTarget && gradeSlots(plan, addTarget) >= GRADE_MAX && (
                  <div style={{ background:"#FEF3C7", border:"1.5px solid #F59E0B", borderRadius:"9px",
                    padding:"10px 14px", marginBottom:"12px", fontSize:"12px", color:"#78350F", fontWeight:600 }}>
                    ✋ Grade {addTarget} is at the {GRADE_MAX}-slot limit. Remove a course first.
                  </div>
                )}
                <div style={{ maxHeight:"320px", overflowY:"auto" }}>
                  {addSearchResults.map(c=>{
                    const already = !c.repeatable && Object.values(plan).flat().includes(c.id);
                    const courseSlots = c.id==="OFF_CAMPUS"?1:(c.credits||0);
                    const atCap = gradeSlots(plan, addTarget) + (already?0:courseSlots) > GRADE_MAX;
                    const blocked = already || atCap;
                    const completedBefore = getCoursesBeforeGrade(plan, addTarget);
                    const completedUpTo = getAllCoursesUpTo(plan, addTarget);
                    const unmet = c.id==="OFF_CAMPUS" ? [] : getUnmetPrereqs(c.id, completedBefore, completedUpTo);
                    const hasWarn = unmet.length > 0;
                    return (
                      <div key={c.id} onClick={()=>{ if(!blocked) addCourseToPlan(c.id); }}
                        style={{ display:"flex",alignItems:"center",gap:"10px",padding:"9px 10px",
                          borderRadius:"8px",cursor:blocked?"default":"pointer",transition:"background 0.12s",
                          background:already?"#FFF0F0":"transparent",opacity:blocked?0.45:1 }}
                        onMouseEnter={e=>{ if(!blocked) e.currentTarget.style.background="var(--light-red)"; }}
                        onMouseLeave={e=>{ e.currentTarget.style.background=already?"#FFF0F0":"transparent"; }}>
                        <div style={{ width:"8px",height:"8px",borderRadius:"50%",flexShrink:0,background:deptColor(c.dept) }}/>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:"13px",fontWeight:700,color:"var(--text)",
                            whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>
                            {c.id==="OFF_CAMPUS"?"🚗 "+c.name:c.name}{c.isAP&&" ⭐"}
                          </div>
                          <div style={{ fontSize:"11px",color: hasWarn?"#D97706":"var(--muted)" }}>
                            {c.dept} · {c.credits>0?c.credits+"cr":"free period"} · Gr {c.gradeLevel.join("/")}
                            {c.repeatable&&" · can add multiple times"}
                            {hasWarn && ` · ⚠️ needs: ${unmet.map(getPrereqDisplay).join(", ")}`}
                            {!hasWarn && getCoreConflict(c.id, addTarget) && ` · ⚠️ conflicts with: ${getCoreConflict(c.id, addTarget)}`}
                          </div>
                        </div>
                        {already
                          ?<span style={{ fontSize:"11px",color:"var(--red)",fontWeight:700,flexShrink:0 }}>Added</span>
                          :<span style={{ fontSize:"20px",color: hasWarn?"#D97706":"var(--red)",flexShrink:0 }}>{hasWarn?"⚠️":"+"}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── DATA CITATION FOOTER ── */}
      <DataCitationFooter />

      {/* ── TOAST ── */}
      {toast && (
        <div style={{ position:"fixed", bottom:"28px", left:"50%", transform:"translateX(-50%)",
          background:"#1C2B3A", color:"white", padding:"11px 22px", borderRadius:"10px",
          fontSize:"13px", fontWeight:600, boxShadow:"0 4px 20px rgba(0,0,0,0.3)",
          zIndex:2000, animation:"fadeIn 0.2s ease", pointerEvents:"none",
          display:"flex", alignItems:"center", gap:"8px" }}>
          ✅ {toast}
        </div>
      )}
    </>
  );
}

function DataCitationFooter() {
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
          Data Sources &amp; Disclaimer ›
        </button>
      </footer>

      {open && (
        <div className="overlay" onClick={()=>setOpen(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}
            style={{ maxWidth:"520px", width:"92vw" }}>
            <div style={{ padding:"24px 26px", borderBottom:"1px solid #E5E7EB",
              display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <h2 style={{ fontSize:"17px", fontWeight:700, color:"#1C2B3A",
                fontFamily:"'Playfair Display',serif" }}>Data Sources &amp; Disclaimer</h2>
              <button onClick={()=>setOpen(false)}
                style={{ background:"#FFF1F0", border:"none", borderRadius:"50%", width:"32px",
                  height:"32px", cursor:"pointer", fontSize:"16px", color:"#B00804" }}>✕</button>
            </div>
            <div style={{ padding:"22px 26px", display:"flex", flexDirection:"column", gap:"16px" }}>
              {[
                { icon:"📖", label:"Primary Source", text:"Kalani High School 2024–2025 Manual of Studies. All course names, codes, credit values, grade levels, and prerequisite chains are derived from this document." },
                { icon:"🎓", label:"Graduation Requirements", text:"Hawaii Department of Education Graduation Requirements, effective July 2023. Credit minimums and subject-area breakdowns follow this policy document." },
                { icon:"⚠️", label:"Planning Reference Only", text:"Kalani Compass is an unofficial planning tool built by a student volunteer. It is not affiliated with Kalani High School or the Hawaii DOE. Course availability, prerequisites, and requirements may change. Always confirm your 4-year plan with your school counselor before submitting your registration card." },
                { icon:"🔄", label:"Last Data Update", text:"Course catalog last reviewed: March 2026. Based on the 2026–2027 Kalani High School Course Catalog (Manual of Studies)." },
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
