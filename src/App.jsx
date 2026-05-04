import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "./supabase.js";
import {
  COURSES, GRAD_REQUIREMENTS, PREREQ_EQUIV, HONORS_DEFS, BEYOND_ALG2_IDS,
  DEPTS, CTE_PATHS, FINE_ARTS_TYPES, MISC_TYPES, DEPT_COLORS,
  DEFAULT_PLAN, DEPT_ORDER, COURSE_MATCH_TEMPLATES,
} from "./lib/data.js";
import {
  buildCourseSearchIndex, filterIndexedCourses,
  normalizeCourse, sortCourses,
  useCourseData, useAnnouncements,
  getCourseName, getPrereqDisplay,
  isPrereqSatisfied, getCoursesBeforeGrade, getAllCoursesUpTo, getUnmetPrereqs,
  computeHonorsProgress, deptColor, calcWlfa, calcPlannerCredits,
  AnimatedProgressBar, DataCitationFooter, GradeBtn, renderPage,
  cardVariants, contentVariants, shakeAnim,
} from "./lib/utils.jsx";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');`;

export default function App() {
  // V4: courses fetched from Supabase, falls back to local COURSES if unavailable
  const { courses: liveCourses, gradReqs: liveGradReqs, loading: dataLoading } = useCourseData();

  // Override getCourse to use live Supabase data inside this component
  // This shadows the global getCourse() for all component code below
  function getCourse(id) {
    return liveCourses.find(c => c.id === id) || customCourses.find(c => c.id === id);
  }
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
  const [gridKey, setGridKey] = useState(0);
  const [toast, setToast] = useState(null); // {msg, grade}
  const [shakeGrade, setShakeGrade] = useState(null);
  const [removingCards, setRemovingCards] = useState(new Set());
  const [modalWarn, setModalWarn] = useState(null); // { grade, unmet, coreConflict }
  // Middle-school prior credits (e.g. ALG1 completed before 9th grade)
  const [priorCredits, setPriorCredits] = useState(() => {
    try { return JSON.parse(localStorage.getItem("kalani-prior-credits") || "[]"); } catch { return []; }
  });
  const [alg1Anim, setAlg1Anim] = useState("idle"); // idle|toggling — for ALG1 toggle button
  // Custom user-defined courses (HOC, dual credit, summer school, etc.)
  const [customCourses, setCustomCourses] = useState(() => {
    try { return JSON.parse(localStorage.getItem("kalani-custom-courses") || "[]"); } catch { return []; }
  });
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customGradeTarget, setCustomGradeTarget] = useState(9);
  const [customForm, setCustomForm] = useState({ name:"", dept:"Mathematics", credits:0.5 });
  // Course Match
  const [matchSelected, setMatchSelected] = useState(null); // selected template for detail view
  const [applyConfirm, setApplyConfirm] = useState(false); // show apply confirmation
  // Stable UIDs for plan entries — prevents sibling cards re-animating on delete
  const planUids = useRef({
    9:  [], 10: [], 11: [], 12: [],
  });
  // Initialize UIDs lazily in render (for localStorage-restored plans)
  function ensureUids(grade) {
    const arr = planUids.current[grade];
    const needed = (plan[grade]||[]).length;
    while (arr.length < needed) arr.push(Math.random().toString(36).slice(2));
    return arr;
  }
  const [burstKey, setBurstKey] = useState(0);
  const [clickKey, setClickKey] = useState(0);
  const [ratingParticles, setRatingParticles] = useState([]);
  const starContainerRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem('kalani-compass-plan', JSON.stringify(plan)); } catch {}
  }, [plan]);
  useEffect(() => {
    try { localStorage.setItem("kalani-prior-credits", JSON.stringify(priorCredits)); } catch {}
  }, [priorCredits]);
  useEffect(() => {
    try { localStorage.setItem("kalani-custom-courses", JSON.stringify(customCourses)); } catch {}
  }, [customCourses]);

  // Pop stars in one-by-one when course modal opens
  useEffect(() => {
    if (!selectedCourse) { setStarVisible([]); setModalWarn(null); return; }
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

  function spawnRatingParticles() {
    setBurstKey(k=>k+1);
    const newP = Array.from({length:12}, (_,i) => ({
      id: Date.now()+i,
      angle: (Math.PI*2*i)/12 + (Math.random()*0.4-0.2),
      dist:  Math.random()*38+20,
      size:  Math.random()*5+4,
      color: ["#F59E0B","#FCD34D","#F97316","#FBBF24"][Math.floor(Math.random()*4)],
    }));
    setRatingParticles(newP);
    setTimeout(()=>setRatingParticles([]), 800);
  }
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
  const indexedCourses = useMemo(() => buildCourseSearchIndex(liveCourses), [liveCourses]);

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
      const allowedIds = new Set(filterIndexedCourses(indexedCourses, searchQuery).map(course => course.id));
      list = list.filter(c => allowedIds.has(c.id));
    }
    return list;
  }, [filterDept, filterCtePath, filterFineArts, filterMisc, searchQuery, liveCourses, indexedCourses]);

  const homeSearchResults = useMemo(() => {
    return filterIndexedCourses(indexedCourses, homeSearch, 4);
  }, [homeSearch, indexedCourses]);

  const addSearchResults = useMemo(() => {
    if (!addSearch.trim()) return liveCourses.slice(0, 14);
    return filterIndexedCourses(indexedCourses, addSearch, 16);
  }, [addSearch, liveCourses, indexedCourses]);

  const honorsProgress = useMemo(() => computeHonorsProgress(plan), [plan]);

  function removeCourse(grade, idx) {
    planUids.current[grade].splice(idx, 1);
    setPlan(p => { const n = JSON.parse(JSON.stringify(p)); n[grade].splice(idx, 1); return n; });
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
    const completedBefore = [...getCoursesBeforeGrade(plan, addTarget), ...priorCredits];
    const completedUpTo = [...getAllCoursesUpTo(plan, addTarget), ...priorCredits];
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
    planUids.current[addTarget].push(Math.random().toString(36).slice(2));
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
    planUids.current[addTarget].push(Math.random().toString(36).slice(2));
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
        @keyframes cardIn{from{opacity:0;transform:translateY(24px) scale(0.97);}to{opacity:1;transform:translateY(0) scale(1);}}
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
        @keyframes starBurst{
          0%{transform:scale(1);}25%{transform:scale(1.9) rotate(18deg);}
          55%{transform:scale(0.75) rotate(-8deg);}80%{transform:scale(1.2) rotate(4deg);}
          100%{transform:scale(1) rotate(0);}
        }
        @keyframes starElastic{
          0%{transform:scale(1);}20%{transform:scale(1.65) rotate(12deg);}
          50%{transform:scale(0.82) rotate(-6deg);}75%{transform:scale(1.15) rotate(3deg);}
          100%{transform:scale(1) rotate(0);}
        }
        /* GradeBtn: hover state controlled via React state, not CSS */
        @keyframes particle{
          0%{opacity:1;transform:translate(-50%,-50%) scale(0);}
          40%{opacity:1;transform:translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1.3);}
          100%{opacity:0;transform:translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0);}
        }
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
          cursor:pointer;transition:all 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.06);
          display:flex;flex-direction:column;height:100%;}
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
        .dept-btn{padding:6px 12px;border-radius:7px;cursor:pointer;font-size:12px;font-weight:700;
          font-family:inherit;position:relative;overflow:hidden;border:1.5px solid var(--border);
          background:white;color:var(--muted);
          transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1),border-color 0.18s,color 0.18s;}
        .dept-btn::before{content:'';position:absolute;left:0;right:0;bottom:0;height:0;
          background:linear-gradient(to top,var(--red-dark),var(--red));
          transition:height 0.3s cubic-bezier(0.25,0.46,0.45,0.94);z-index:0;}
        .dept-btn span{position:relative;z-index:1;}
        .dept-btn:hover{transform:scale(1.06) translateY(-1px);border-color:var(--red);color:var(--red);}
        .dept-btn.active::before{height:100%;}
        .dept-btn.active{color:white!important;border-color:var(--red)!important;box-shadow:0 4px 14px rgba(176,8,4,0.3);}
        .dept-btn.active:hover{transform:scale(1.03);color:white!important;}
        .delete-reveal{transition:opacity 0.22s ease,transform 0.28s cubic-bezier(0.34,1.4,0.64,1);}
        .add-btn{border:1.5px dashed #D1D5DB;border-radius:7px;padding:7px;text-align:center;
          font-size:11px;color:#9CA3AF;cursor:pointer;margin-top:6px;transition:all 0.2s;touch-action:manipulation;}
        .add-btn:hover{border-color:var(--red);color:var(--red);background:var(--light-red);}
        .dept-btn{touch-action:manipulation;}
        .prereq-chip{touch-action:manipulation;}
        button{touch-action:manipulation;}
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
          .catalog-search-row{flex-direction:column !important;align-items:stretch !important;}
          .catalog-search-row .si{max-width:100% !important;}
        }
        @media(max-width:600px){
          .plan-grid{grid-template-columns:1fr !important;}
          .catalog-grid{grid-template-columns:1fr !important;}
          .stat-grid{grid-template-columns:1fr 1fr !important;}
          .grad-grid{grid-template-columns:1fr !important;}
          nav{gap:0 !important;padding:0 10px !important;}
          .nav-logo{font-size:16px !important;margin-right:6px !important;}
          .nav-link{padding:6px 8px !important;font-size:11px !important;}
          .modal{border-radius:14px !important;margin:8px !important;padding:0 !important;}
          h1{font-size:24px !important;}
          .hero-btns{flex-direction:column !important;align-items:center !important;}
          .grade-btn-row{flex-wrap:wrap !important;}
          /* delete button always visible on touch */
          .delete-reveal{opacity:1 !important;transform:translateX(0) !important;}
          .planner-hint{display:none;}
        }
        @media(hover:hover){
          /* restore hover-only delete on non-touch devices */
          .delete-reveal{opacity:0;transform:translateX(12px);}
          .card-hover-group:hover .delete-reveal{opacity:1;transform:translateX(0);}
          .planner-hint{display:block;}
        }
      `}</style>

      <div style={{ minHeight:"100vh" }}>

        {/* NAV */}
        <nav style={{ background:`linear-gradient(90deg,var(--red-deep),var(--red-dark) 50%,var(--red))`,
          padding:"0 24px", display:"flex", alignItems:"center", gap:"2px", height:"58px",
          position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 20px rgba(107,5,3,0.4)" }}>
          <div onClick={()=>navigate("home")}
            className="nav-logo" style={{ fontFamily:"'Playfair Display',serif", color:"white", fontSize:"20px", fontWeight:700,
              marginRight:"20px", cursor:"pointer", textShadow:"0 1px 4px rgba(0,0,0,0.3)" }}>
            🦅 Kalani Compass
          </div>
          {[["home","Home"],["catalog","Courses"],["match","Course Match"],["planner","4-Year Planner"]].map(([id,label])=>(
            <div key={id} onClick={()=>navigate(id)}
              style={{ position:"relative", cursor:"pointer", padding:"8px 15px", borderRadius:"8px" }}>
              {page===id ? (
                <motion.div layoutId="nav-pill"
                  style={{ position:"absolute", inset:0, borderRadius:"8px",
                    background:"rgba(255,255,255,0.22)", boxShadow:"0 2px 8px rgba(0,0,0,0.15) inset" }}
                  transition={{ type:"spring", stiffness:400, damping:25 }}/>
              ) : null}
              <span style={{ position:"relative", zIndex:1, fontWeight:600, fontSize:"14px",
                color:page===id?"white":"rgba(255,255,255,0.65)", transition:"color 0.2s", whiteSpace:"nowrap" }}>
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

        <AnimatePresence mode="wait">

        {/* ── HOME ── */}
        {renderPage(page==="home","home",
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
        {renderPage(page==="catalog","catalog",
          <div className="fade-in" style={{ maxWidth:"1200px", margin:"0 auto", padding:"32px 24px" }}>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"30px", color:"var(--red-dark)",
              marginBottom:"22px" }}>Course Catalog</h1>
            <div className="catalog-search-row" style={{ display:"flex", gap:"12px", marginBottom:"20px", flexWrap:"wrap", alignItems:"center" }}>
              <input className="si" placeholder="🔍 Search courses…" value={searchQuery}
                onChange={e=>setSearchQuery(e.target.value)}
                style={{ flex:"1", minWidth:"200px", maxWidth:"320px" }} />
              <div style={{ display:"flex", flexWrap:"wrap", gap:"5px" }}>
                {DEPTS.map(d=>(
                  <button key={d}
                    className={"dept-btn"+(filterDept===d?" active":"")}
                    onClick={()=>{ setFilterDept(d); setFilterCtePath("All CTE"); setFilterFineArts("All Fine Arts"); setFilterMisc("All Miscellaneous"); setGridKey(k=>k+1); }}>
                    <span>{d}</span>
                  </button>
                  ))}
              </div>
            </div>
            {filterDept === "CTE" && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:"5px", marginBottom:"12px" }}>
                {CTE_PATHS.map(p=>(
                  <motion.div key={p}
                    whileTap={{ scale:0.90 }}
                    whileHover={{ scale:filterCtePath===p?1:1.06 }}
                    transition={{ type:"spring", stiffness:400, damping:20 }}
                    onClick={()=>{ setFilterCtePath(p); setGridKey(k=>k+1); }}
                    style={{ padding:"5px 11px", borderRadius:"7px", cursor:"pointer", fontSize:"11px",
                      fontWeight:700, transition:"background 0.15s, color 0.15s, border-color 0.15s",
                      background:filterCtePath===p?"var(--red)":"white",
                      color:filterCtePath===p?"white":"var(--muted)",
                      border:`1.5px solid ${filterCtePath===p?"var(--red)":"var(--border)"}` }}>
                    {p}
                  </motion.div>
                  ))}
              </div>
              )}
            {filterDept === "Fine Arts" && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:"5px", marginBottom:"12px" }}>
                {FINE_ARTS_TYPES.map(t=>(
                  <motion.div key={t}
                    whileTap={{ scale:0.90 }}
                    whileHover={{ scale:filterFineArts===t?1:1.06 }}
                    transition={{ type:"spring", stiffness:400, damping:20 }}
                    onClick={()=>{ setFilterFineArts(t); setGridKey(k=>k+1); }}
                    style={{ padding:"5px 11px", borderRadius:"7px", cursor:"pointer", fontSize:"11px",
                      fontWeight:700, transition:"background 0.15s, color 0.15s, border-color 0.15s",
                      background:filterFineArts===t?"#DB2777":"white",
                      color:filterFineArts===t?"white":"var(--muted)",
                      border:`1.5px solid ${filterFineArts===t?"#DB2777":"var(--border)"}` }}>
                    {t}
                  </motion.div>
                  ))}
              </div>
              )}
            {filterDept === "Miscellaneous" && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:"5px", marginBottom:"12px" }}>
                {MISC_TYPES.map(t=>(
                  <motion.div key={t}
                    whileTap={{ scale:0.90 }}
                    whileHover={{ scale:filterMisc===t?1:1.06 }}
                    transition={{ type:"spring", stiffness:400, damping:20 }}
                    onClick={()=>{ setFilterMisc(t); setGridKey(k=>k+1); }}
                    style={{ padding:"5px 11px", borderRadius:"7px", cursor:"pointer", fontSize:"11px",
                      fontWeight:700, transition:"background 0.15s, color 0.15s, border-color 0.15s",
                      background:filterMisc===t?"#6B7280":"white",
                      color:filterMisc===t?"white":"var(--muted)",
                      border:`1.5px solid ${filterMisc===t?"#6B7280":"var(--border)"}` }}>
                    {t}
                  </motion.div>
                  ))}
              </div>
              )}
            <p style={{ fontSize:"13px", color:"var(--muted)", marginBottom:"18px" }}>
              Showing {filteredCourses.length} course{filteredCourses.length!==1?"s":""}
            </p>
            <div key={gridKey} className="catalog-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(295px,1fr))", gap:"14px" }}>
              {filteredCourses.map((c, index)=>(
                <div key={c.id} className="c-card"
                  style={{ animation:"cardIn 0.5s cubic-bezier(0.34,1.56,0.64,1) "+(index*0.045)+"s both" }}
                  onClick={()=>setSelectedCourse(c)}>
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
                    display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden",
                     }}>{c.desc}</p>
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
                  <div style={{ flex:1 }}/>
                  <div style={{ marginTop:"8px", paddingTop:"8px", fontSize:"11px", color:"var(--muted)",
                    display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span>Grade {c.gradeLevel.join("/")} · {c.credits===0.5?"Semester":"Year"}</span>
                    <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                      {Object.values(plan).flat().includes(c.id) && (
                        <span style={{ fontSize:"11px", background:"#F0FDF4",
                          color:"#166534", border:"1px solid #BBF7D0",
                          borderRadius:"5px", padding:"2px 8px", fontWeight:700 }}>
                          ✓ In plan
                        </span>
                      )}
                    </div>
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
        {renderPage(page==="planner","planner",
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
                <p className="planner-hint" style={{ fontSize:"13px", color:"var(--muted)", marginBottom:"12px" }}>
                  Click a course name to view details · ⚠️ = missing prereq · Click × to remove
                </p>

                {/* ── Middle-school ALG1 toggle ── */}
                {(()=>{
                  const alg1Active = priorCredits.includes("ALG1");
                  function toggleAlg1() {
                    if (alg1Anim !== "idle") return;
                    setAlg1Anim("toggling");
                    setTimeout(() => {
                      setPriorCredits(prev =>
                        prev.includes("ALG1") ? prev.filter(x => x !== "ALG1") : [...prev, "ALG1"]
                      );
                      setAlg1Anim("idle");
                    }, 280);
                  }
                  const isDone = alg1Active;
                  const isLeaving = alg1Anim === "toggling";
                  const borderCol = isDone ? "#059669" : "var(--border)";
                  const bgCol     = isDone ? "#F0FDF4" : "white";
                  const textCol   = isDone ? "#166634" : "var(--muted)";
                  return (
                    <div style={{ marginBottom:"18px" }}>
                      <button onClick={toggleAlg1}
                        style={{
                          fontSize:"12px", fontWeight:700, cursor:"pointer", touchAction:"manipulation",
                          borderRadius:"8px", overflow:"hidden", position:"relative",
                          border:"1.5px solid "+borderCol, background:bgCol, color:textCol,
                          fontFamily:"inherit", height:"36px", minWidth:"260px",
                          display:"inline-flex", alignItems:"center", justifyContent:"center",
                          transform: isLeaving ? "scale(0.94)" : "scale(1)",
                          transition:"transform 0.2s cubic-bezier(0.34,1.56,0.64,1), background 0.25s, border-color 0.25s, color 0.25s",
                        }}
                        onMouseEnter={e=>{ if(!isDone){e.currentTarget.style.background="#B00804";e.currentTarget.style.color="white";e.currentTarget.style.borderColor="#B00804";} else {e.currentTarget.style.background="#FFF0F0";e.currentTarget.style.color="var(--red)";e.currentTarget.style.borderColor="var(--red)";} }}
                        onMouseLeave={e=>{ e.currentTarget.style.background=bgCol;e.currentTarget.style.color=textCol;e.currentTarget.style.borderColor=borderCol; }}>
                        {/* Idle label */}
                        <span style={{
                          position:"absolute", left:0, right:0,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          transition:"transform 0.28s cubic-bezier(0.19,1,0.22,1), opacity 0.22s",
                          transform: (isLeaving||isDone) ? "translateY(-110%)" : "translateY(0)",
                          opacity:   (isLeaving||isDone) ? 0 : 1, pointerEvents:"none",
                        }}>📚 I completed Algebra 1 in middle school</span>
                        {/* Done label */}
                        <span style={{
                          position:"absolute", left:0, right:0,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          transition:"transform 0.32s cubic-bezier(0.19,1,0.22,1), opacity 0.28s",
                          transform: isDone ? "translateY(0)" : "translateY(110%)",
                          opacity:   isDone ? 1 : 0, pointerEvents:"none",
                        }}>✓ Algebra 1 counted — warnings cleared</span>
                      </button>
                      {isDone && (
                        <p style={{ fontSize:"11px", color:"#15803D", marginTop:"5px", fontWeight:500 }}>
                          Prerequisite checks now treat Algebra 1 as completed before 9th grade.
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* ── Custom Course button ── */}
                <div style={{ marginBottom:"18px", display:"flex", alignItems:"center", gap:"10px" }}>
                  <button onClick={()=>setShowCustomModal(true)}
                    style={{ padding:"8px 16px", borderRadius:"8px", border:"1.5px dashed #B00804",
                      background:"#FFF8F8", color:"var(--red)", fontSize:"12px", fontWeight:700,
                      cursor:"pointer", fontFamily:"inherit", touchAction:"manipulation",
                      display:"flex", alignItems:"center", gap:"6px" }}>
                    ＋ Add HOC / Summer / Custom Course
                  </button>
                  {customCourses.length > 0 && (
                    <span style={{ fontSize:"11px", color:"var(--muted)" }}>
                      {customCourses.length} custom course{customCourses.length>1?"s":""} in plan
                    </span>
                  )}
                </div>

                <div className="plan-grid" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gridAutoRows:"1fr", gap:"16px", marginBottom:"8px", alignItems:"stretch" }}>
                {[9,10,11,12].map(grade=>{
                  const gradeCredits = plan[grade].reduce((s,cid)=>{ const c=getCourse(cid); return s+(c?.credits||0); },0);
                  const usedSlots = gradeSlots(plan, grade);
                  const atCap = usedSlots >= GRADE_MAX;
                  return (
                    <motion.div key={grade} animate={shakeGrade===grade ? shakeAnim : {}} style={{ height:"100%" }}>
                      <div style={{ background:"white", borderRadius:"20px", border:"1px solid #E2E8F0",
                        boxShadow:"0 1px 4px rgba(0,0,0,0.05)", overflow:"hidden",
                        display:"flex", flexDirection:"column", height:"100%" }}>
                        <div style={{ padding:"16px 18px 12px", borderBottom:"1px solid #F1F5F9",
                          display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                          <h2 style={{ fontSize:"20px", fontWeight:900, color:"#0F172A",
                            letterSpacing:"-0.04em", lineHeight:1 }}>Grade {grade}</h2>
                          <span style={{ fontSize:"11px", fontWeight:700,
                            color:atCap?"#F59E0B":"#94A3B8", background:atCap?"#FEF9C3":"#F8FAFC",
                            padding:"3px 8px", borderRadius:"999px",
                            border:"1px solid "+(atCap?"#FDE68A":"#E2E8F0") }}>
                            {usedSlots.toFixed(1)}/{GRADE_MAX}
                          </span>
                        </div>
                        <div style={{ padding:"12px 14px 0", display:"flex", flexDirection:"column", flex:1 }}>
                        <AnimatePresence initial={false}>
                          {plan[grade].map((cid,idx)=>{
                            const c=getCourse(cid);
                            if(!c) return null;
                            const col=deptColor(c.dept);
                            const isOffCampus = cid==="OFF_CAMPUS";
                            const before = [...getCoursesBeforeGrade(plan, grade), ...priorCredits];
                            const upTo = [...getAllCoursesUpTo(plan, grade), ...priorCredits];
                            const unmet = isOffCampus ? [] : getUnmetPrereqs(cid, before, upTo);
                            return (
                              <motion.div key={ensureUids(grade)[idx] || cid+"-"+idx}
                                layout
                                variants={cardVariants}
                                initial="hidden" animate="show" exit="exit"
                                style={{ overflow:"hidden" }}>
                                <motion.div
                                  variants={contentVariants}
                                  className="card-hover-group"
                                  style={{ display:"flex", alignItems:"center",
                                    background:isOffCampus?"#F8FAFC":"white",
                                    border:"1px solid "+(isOffCampus?"#CBD5E1":col+"28"),
                                    borderRadius:"12px", overflow:"hidden", position:"relative" }}>
                                  {/* Left color bar */}
                                  <div style={{ width:"4px", alignSelf:"stretch",
                                    background:isOffCampus?"#475569":col, flexShrink:0 }}/>
                                  {/* Shimmer — exact from planner-demo.jsx */}
                                  <motion.div
                                    initial={{ x:"-150%", skewX:-12 }}
                                    animate={{ x:"250%",  skewX:-12 }}
                                    transition={{ duration:0.9, ease:"easeInOut", delay:0.12 }}
                                    style={{
                                      position:"absolute", top:"-30%", bottom:"-30%", left:0, width:"55%",
                                      background:"linear-gradient(to right,transparent,"+(isOffCampus?"rgba(71,85,105,0.25)":col+"60")+","+(isOffCampus?"rgba(71,85,105,0.1)":col+"35")+",transparent)",
                                      pointerEvents:"none", zIndex:20,
                                    }}/>
                                  {/* Content */}
                                  <div style={{ flex:1, padding:"9px 10px", minWidth:0, position:"relative", zIndex:1 }}>
                                    <div style={{ display:"flex", alignItems:"center", gap:"4px", marginBottom:"2px" }}>
                                      <span style={{ fontSize:"9px", fontWeight:900, letterSpacing:"0.07em",
                                        textTransform:"uppercase", background:isOffCampus?"#E2E8F0":col+"18",
                                        color:isOffCampus?"#475569":col, padding:"2px 6px", borderRadius:"4px", flexShrink:0 }}>
                                        {isOffCampus?"Off Campus":c.dept}
                                      </span>
                                      <span style={{ fontSize:"9px", fontWeight:800, color:"#94A3B8",
                                        background:"#F1F5F9", padding:"2px 5px", borderRadius:"4px", flexShrink:0 }}>{c.credits}cr</span>
                                      {c.isAP ? <span className="tag-ap" style={{fontSize:"9px"}}>AP</span> : null}
                                      {unmet.length>0 ? (
                                        <span title={"Missing prereqs: "+unmet.map(getPrereqDisplay).join(", ")}
                                          style={{ fontSize:"11px", cursor:"help", flexShrink:0 }}>⚠️</span>
                                      ) : null}
                                    </div>
                                    <span style={{ fontSize:"13px", fontWeight:700,
                                      color:isOffCampus?"#475569":"#0F172A", letterSpacing:"-0.01em",
                                      cursor:"pointer", overflow:"hidden", textOverflow:"ellipsis",
                                      display:"flex", alignItems:"center", gap:"5px", whiteSpace:"nowrap" }}
                                      onClick={()=>setSelectedCourse(c)}>
                                      <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                        {isOffCampus?"🚗 Off Campus":c.name}
                                      </span>
                                      {c?.isCustom && (
                                        <span style={{ fontSize:"9px", fontWeight:800, flexShrink:0,
                                          background:"#EFF6FF", color:"#1D4ED8",
                                          border:"1px solid #BFDBFE", borderRadius:"4px",
                                          padding:"1px 5px" }}>Custom</span>
                                      )}
                                    </span>
                                  </div>
                                  {/* Delete button — hover reveal */}
                                  <div className="delete-reveal" style={{ padding:"0 10px", flexShrink:0, zIndex:1 }}>
                                    <motion.div
                                      whileHover={{ backgroundColor:"#EF4444", scale:1.1, boxShadow:"0 4px 12px rgba(239,68,68,0.4)" }}
                                      whileTap={{ scale:0.92 }}
                                      onClick={()=>removeCourse(grade,idx)}
                                      style={{ width:"30px", height:"30px", borderRadius:"50%",
                                        background:"#FEF2F2", display:"flex", alignItems:"center",
                                        justifyContent:"center", cursor:"pointer" }}>
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                        stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                        {/* ── INLINE SEARCH — with open/close animation ── */}
                        <AnimatePresence initial={false}>
                          {addTarget===grade && (
                            <motion.div
                              key="search-panel"
                              initial={{ opacity:0, height:0, marginTop:0 }}
                              animate={{ opacity:1, height:"auto", marginTop:"auto",
                                transition:{ height:{ type:"spring", stiffness:400, damping:30 },
                                  opacity:{ duration:0.15, delay:0.05 } } }}
                              exit={{ opacity:0, height:0, marginTop:0,
                                transition:{ height:{ type:"spring", stiffness:400, damping:30 },
                                  opacity:{ duration:0.1 } } }}
                              style={{ overflow:"hidden", paddingTop:"8px", paddingBottom:"14px" }}>
                              <div style={{ display:"flex", alignItems:"center", gap:"8px",
                                background:"#F8FAFC", border:"1.5px solid var(--red)", borderRadius:"10px",
                                padding:"8px 12px", marginBottom:"6px" }}>
                                <span style={{ fontSize:"13px", color:"#94A3B8" }}>🔍</span>
                                <input autoFocus value={addSearch}
                                  onChange={e=>setAddSearch(e.target.value)}
                                  placeholder="Search courses…"
                                  style={{ flex:1, border:"none", background:"transparent", outline:"none",
                                    fontSize:"13px", fontWeight:500, color:"#0F172A", fontFamily:"inherit" }}
                                  onKeyDown={e=>{ if(e.key==="Escape"){ setAddTarget(null); setAddSearch(""); setPrereqWarn(null); } }}/>
                                <button onClick={()=>{ setAddTarget(null); setAddSearch(""); setPrereqWarn(null); }}
                                  style={{ background:"none", border:"none", cursor:"pointer",
                                    color:"#94A3B8", fontSize:"16px", lineHeight:1, padding:"0 2px" }}>×</button>
                              </div>
                              {/* Prereq warning inline */}
                              {prereqWarn && prereqWarn.grade===grade && (
                                <div style={{ background:"#FEF9C3", border:"1.5px solid #EAB308", borderRadius:"8px",
                                  padding:"10px 12px", marginBottom:"6px" }}>
                                  <div style={{ fontWeight:700, fontSize:"12px", color:"#78350F", marginBottom:"5px" }}>
                                    {prereqWarn.coreConflict ? "⚠️ Subject Conflict" : "⚠️ Missing Prerequisites"}
                                  </div>
                                  <div style={{ fontSize:"11px", color:"#78350F", marginBottom:"8px" }}>
                                    {prereqWarn.coreConflict ? (
                                      <span>Conflicts with <strong>{prereqWarn.coreConflict}</strong> already in this grade.</span>
                                    ) : (
                                      <span><strong>{getCourse(prereqWarn.courseId)?.name}</strong> needs: {prereqWarn.unmet.map(getPrereqDisplay).join(", ")}</span>
                                    )}
                                  </div>
                                  <div style={{ display:"flex", gap:"6px" }}>
                                    <button onClick={()=>forceAddCourse(prereqWarn.courseId)}
                                      style={{ flex:1, background:"#B45309", color:"white", border:"none", borderRadius:"6px",
                                        padding:"6px", fontSize:"11px", fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                                      Add Anyway
                                    </button>
                                    <button onClick={()=>setPrereqWarn(null)}
                                      style={{ flex:1, background:"white", color:"#374151", border:"1px solid #D1D5DB",
                                        borderRadius:"6px", padding:"6px", fontSize:"11px", fontWeight:600,
                                        cursor:"pointer", fontFamily:"inherit" }}>
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                              {/* Results list */}
                              <div style={{ maxHeight:"200px", overflowY:"auto", borderRadius:"10px",
                                border:"1px solid #E2E8F0", background:"white",
                                boxShadow:"0 4px 16px rgba(0,0,0,0.08)" }}>
                                {addSearchResults.map(c=>{
                                  const already = !c.repeatable && Object.values(plan).flat().includes(c.id);
                                  const courseSlots = c.id==="OFF_CAMPUS"?1:(c.credits||0);
                                  const wouldExceed = gradeSlots(plan, grade) + courseSlots > GRADE_MAX;
                                  const blocked = already || wouldExceed;
                                  const completedBefore = [...getCoursesBeforeGrade(plan, grade), ...priorCredits];
                                  const completedUpTo = [...getAllCoursesUpTo(plan, grade), ...priorCredits];
                                  const unmet = c.id==="OFF_CAMPUS" ? [] : getUnmetPrereqs(c.id, completedBefore, completedUpTo);
                                  const hasWarn = unmet.length > 0;
                                  return (
                                    <div key={c.id}
                                      onClick={()=>{ if(!blocked) addCourseToPlan(c.id); }}
                                      style={{ display:"flex", alignItems:"center", gap:"9px",
                                        padding:"9px 12px", cursor:blocked?"default":"pointer",
                                        borderBottom:"1px solid #F3F4F6", opacity:blocked?0.45:1,
                                        transition:"background 0.1s" }}
                                      onMouseEnter={e=>{ if(!blocked) e.currentTarget.style.background="#FFF1F0"; }}
                                      onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; }}>
                                      <div style={{ width:"8px", height:"8px", borderRadius:"50%",
                                        background:deptColor(c.dept), flexShrink:0 }}/>
                                      <div style={{ flex:1, minWidth:0 }}>
                                        <div style={{ fontSize:"13px", fontWeight:700, color:"var(--text)",
                                          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                                          {c.name}{c.isAP?" ⭐":""}
                                        </div>
                                        <div style={{ fontSize:"11px", color:hasWarn?"#D97706":"var(--muted)" }}>
                                          {c.dept} · {c.credits}cr{hasWarn?" · ⚠️ needs: "+unmet.map(getPrereqDisplay).join(", "):""}
                                        </div>
                                      </div>
                                      {already
                                        ? <span style={{ fontSize:"11px", color:"var(--red)", fontWeight:700, flexShrink:0 }}>Added</span>
                                        : <span style={{ fontSize:"18px", color:hasWarn?"#D97706":"var(--red)", flexShrink:0 }}>{hasWarn?"⚠️":"+"}</span>
                                      }
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                          {addTarget!==grade && (
                            <motion.div
                              key="add-btn"
                              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                              transition={{ duration:0.15 }}
                              style={{ display:"flex", gap:"8px", marginTop:"auto", paddingBottom:"14px", paddingTop:"8px" }}>
                              <div className="add-btn" style={{ flex:1, opacity:atCap?0.4:1,
                                cursor:atCap?"not-allowed":"pointer", pointerEvents:atCap?"none":"auto" }}
                                onClick={()=>{ if(!atCap) setAddTarget(grade); }}>
                                {atCap ? "✋ Full ("+GRADE_MAX+" slots used)" : "+ Add a Course"}
                              </div>
                              {grade===12 ? (
                                <div className="add-btn"
                                  style={{ flex:"0 0 auto", borderColor:"#64748B", color:"#64748B",
                                    opacity:atCap?0.4:1, cursor:atCap?"not-allowed":"pointer",
                                    pointerEvents:atCap?"none":"auto" }}
                                  onClick={()=>{ if(gradeSlots(plan,12)<GRADE_MAX){ planUids.current[12].push(Math.random().toString(36).slice(2)); setPlan(p=>{ const n=JSON.parse(JSON.stringify(p)); n[12].push("OFF_CAMPUS"); return n; }); } }}>
                                  🚗 Off Campus
                                </div>
                              ) : null}
                            </motion.div>
                          )}
                        </AnimatePresence>
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
                      animate={{ width:Math.min(100,(total/24)*100)+"%" }}
                      transition={{ type:"spring", stiffness:200, damping:15 }}
                      style={{ height:"100%", borderRadius:"5px", background:"linear-gradient(90deg,var(--red),#E53E3E)" }}/>
                  </div>
                  {GRAD_REQUIREMENTS.map(r=>{
                    const earned=cats[r.id]||0;
                    const done=earned>=r.required;
                    return (
                      <AnimatedProgressBar key={r.id}
                        label={r.label} req={r.required}
                        earned={Math.min(earned,r.required)}
                        color={r.color} done={done}/>
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
        </AnimatePresence>

      {/* ── COURSE MATCH PAGE ── */}
      {renderPage(page==="match","match",
        <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"32px 24px 60px" }}>
          {/* Header */}
          <div style={{ marginBottom:"28px" }}>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"30px", fontWeight:700,
              color:"#0F172A", marginBottom:"6px" }}>Course Match</h1>
            <p style={{ fontSize:"14px", color:"var(--muted)", maxWidth:"560px" }}>
              Browse curated 4-year plans built for different goals and interests.
              Find one that fits you and apply it to your planner with one click.
            </p>
          </div>

          {/* Pinned templates */}
          <p style={{ fontSize:"11px", fontWeight:700, letterSpacing:"0.07em",
            textTransform:"uppercase", color:"var(--muted)", marginBottom:"12px" }}>
            📌 Featured Plans
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",
            gap:"14px", marginBottom:"32px" }}>
            {COURSE_MATCH_TEMPLATES.filter(t=>t.pinned).map(t=>(
              <motion.div key={t.id}
                whileHover={{ y:-3, boxShadow:"0 10px 28px rgba(0,0,0,0.10)" }}
                transition={{ type:"spring", stiffness:350, damping:22 }}
                onClick={()=>{ setMatchSelected(t); setApplyConfirm(false); }}
                style={{ background:"white", borderRadius:"14px", padding:"18px",
                  border:"1px solid var(--border)", cursor:"pointer",
                  boxShadow:"0 2px 6px rgba(0,0,0,0.05)", display:"flex",
                  flexDirection:"column", gap:"8px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <span style={{ fontSize:"26px" }}>{t.emoji}</span>
                  <span style={{ fontSize:"10px", fontWeight:800, padding:"3px 9px",
                    borderRadius:"999px", background:t.tagBg, color:t.tagColor,
                    border:`1px solid ${t.tagColor}30` }}>{t.tag}</span>
                </div>
                <div style={{ fontWeight:800, fontSize:"15px", color:"#0F172A" }}>{t.title}</div>
                <p style={{ fontSize:"12px", color:"var(--muted)", lineHeight:1.5,
                  display:"-webkit-box", WebkitLineClamp:3,
                  WebkitBoxOrient:"vertical", overflow:"hidden" }}>{t.desc}</p>
                <div style={{ marginTop:"auto", paddingTop:"8px", fontSize:"11px",
                  color:"var(--red)", fontWeight:700 }}>View details →</div>
              </motion.div>
            ))}
          </div>

          {/* Other templates */}
          <p style={{ fontSize:"11px", fontWeight:700, letterSpacing:"0.07em",
            textTransform:"uppercase", color:"var(--muted)", marginBottom:"12px" }}>
            More Plans
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",
            gap:"14px" }}>
            {COURSE_MATCH_TEMPLATES.filter(t=>!t.pinned).map(t=>(
              <motion.div key={t.id}
                whileHover={{ y:-3, boxShadow:"0 10px 28px rgba(0,0,0,0.10)" }}
                transition={{ type:"spring", stiffness:350, damping:22 }}
                onClick={()=>{ setMatchSelected(t); setApplyConfirm(false); }}
                style={{ background:"white", borderRadius:"14px", padding:"18px",
                  border:"1px solid var(--border)", cursor:"pointer",
                  boxShadow:"0 2px 6px rgba(0,0,0,0.05)", display:"flex",
                  flexDirection:"column", gap:"8px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <span style={{ fontSize:"26px" }}>{t.emoji}</span>
                  <span style={{ fontSize:"10px", fontWeight:800, padding:"3px 9px",
                    borderRadius:"999px", background:t.tagBg, color:t.tagColor,
                    border:`1px solid ${t.tagColor}30` }}>{t.tag}</span>
                </div>
                <div style={{ fontWeight:800, fontSize:"15px", color:"#0F172A" }}>{t.title}</div>
                <p style={{ fontSize:"12px", color:"var(--muted)", lineHeight:1.5,
                  display:"-webkit-box", WebkitLineClamp:3,
                  WebkitBoxOrient:"vertical", overflow:"hidden" }}>{t.desc}</p>
                <div style={{ marginTop:"auto", paddingTop:"8px", fontSize:"11px",
                  color:"var(--red)", fontWeight:700 }}>View details →</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── COURSE MATCH DETAIL MODAL ── */}
      <AnimatePresence mode="wait">
        {matchSelected ? (
          <div className="overlay" onClick={()=>setMatchSelected(null)}>
            <motion.div className="modal" onClick={e=>e.stopPropagation()}
              key={matchSelected.id}
              initial={{ opacity:0, scale:0.88, y:24 }}
              animate={{ opacity:1, scale:1, y:0, transition:{ type:"spring", stiffness:350, damping:22 } }}
              exit={{ opacity:0, scale:0.92, y:16, transition:{ duration:0.18, ease:"easeIn" } }}
              style={{ maxWidth:"560px" }}>
              {/* Header */}
              <div style={{ padding:"22px 24px 16px", borderBottom:"1px solid var(--border)",
                display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"4px" }}>
                    <span style={{ fontSize:"28px" }}>{matchSelected.emoji}</span>
                    <span style={{ fontSize:"10px", fontWeight:800, padding:"3px 9px",
                      borderRadius:"999px", background:matchSelected.tagBg,
                      color:matchSelected.tagColor }}>{matchSelected.tag}</span>
                  </div>
                  <h2 style={{ fontSize:"20px", fontWeight:800, color:"#0F172A",
                    fontFamily:"'Playfair Display',serif" }}>{matchSelected.title}</h2>
                </div>
                <button onClick={()=>setMatchSelected(null)}
                  style={{ background:"#FFF1F0", border:"none", borderRadius:"50%",
                    width:"32px", height:"32px", cursor:"pointer",
                    fontSize:"16px", color:"#B00804", flexShrink:0, touchAction:"manipulation" }}>✕</button>
              </div>

              <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:"16px",
                maxHeight:"60vh", overflowY:"auto" }}>
                {/* Description */}
                <p style={{ fontSize:"13px", color:"var(--muted)", lineHeight:1.6 }}>{matchSelected.desc}</p>

                {/* Best for */}
                <div>
                  <div style={{ fontSize:"11px", fontWeight:700, textTransform:"uppercase",
                    letterSpacing:"0.07em", color:"var(--muted)", marginBottom:"6px" }}>Best for</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                    {matchSelected.suited.map(s=>(
                      <span key={s} style={{ fontSize:"11px", background:"#F8FAFC",
                        border:"1px solid var(--border)", borderRadius:"6px",
                        padding:"3px 9px", color:"var(--text)" }}>{s}</span>
                    ))}
                  </div>
                </div>

                {/* Highlights */}
                <div>
                  <div style={{ fontSize:"11px", fontWeight:700, textTransform:"uppercase",
                    letterSpacing:"0.07em", color:"var(--muted)", marginBottom:"6px" }}>Highlights</div>
                  {matchSelected.highlights.map(h=>(
                    <div key={h} style={{ display:"flex", alignItems:"center", gap:"8px",
                      fontSize:"13px", color:"var(--text)", marginBottom:"4px" }}>
                      <span style={{ color:"#059669", fontWeight:700 }}>✓</span> {h}
                    </div>
                  ))}
                </div>

                {/* 4-year preview */}
                <div>
                  <div style={{ fontSize:"11px", fontWeight:700, textTransform:"uppercase",
                    letterSpacing:"0.07em", color:"var(--muted)", marginBottom:"8px" }}>4-Year Preview</div>
                  {[9,10,11,12].map(g=>(
                    <div key={g} style={{ marginBottom:"8px" }}>
                      <div style={{ fontSize:"11px", fontWeight:700, color:"var(--red)",
                        marginBottom:"4px" }}>Grade {g}</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:"4px" }}>
                        {(matchSelected.plan[g]||[]).map(cid=>{
                          const c = getCourse(cid);
                          return (
                            <span key={cid} style={{ fontSize:"11px", background:"#F1F5F9",
                              borderRadius:"5px", padding:"2px 8px", color:"#334155" }}>
                              {c ? c.name : cid}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Apply section */}
              <div style={{ padding:"16px 24px", borderTop:"1px solid var(--border)" }}>
                {!applyConfirm ? (
                  <button onClick={()=>setApplyConfirm(true)}
                    style={{ width:"100%", background:"var(--red)", color:"white", border:"none",
                      borderRadius:"10px", padding:"13px", fontSize:"14px", fontWeight:800,
                      cursor:"pointer", fontFamily:"inherit", touchAction:"manipulation" }}>
                    Apply This Plan to My Planner →
                  </button>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                    <p style={{ fontSize:"13px", color:"#92400E", background:"#FFFBEB",
                      border:"1px solid #FDE68A", borderRadius:"8px", padding:"10px 12px",
                      margin:0 }}>
                      ⚠️ This will replace your current 4-year plan. Make sure you've saved a screenshot if you want to keep it.
                    </p>
                    <div style={{ display:"flex", gap:"8px" }}>
                      <button onClick={()=>{
                        const newPlan = { 9:[], 10:[], 11:[], 12:[] };
                        [9,10,11,12].forEach(g=>{
                          newPlan[g] = [...(matchSelected.plan[g]||[])];
                        });
                        // Reset planUids
                        Object.keys(planUids.current).forEach(g=>{
                          planUids.current[g] = [];
                        });
                        setPlan(newPlan);
                        setMatchSelected(null);
                        setApplyConfirm(false);
                        navigate("planner");
                        showToast("Applied \"" + matchSelected.title + "\" to your planner");
                      }}
                        style={{ flex:1, background:"var(--red)", color:"white", border:"none",
                          borderRadius:"8px", padding:"11px", fontSize:"13px", fontWeight:800,
                          cursor:"pointer", fontFamily:"inherit", touchAction:"manipulation" }}>
                        Yes, apply it
                      </button>
                      <button onClick={()=>setApplyConfirm(false)}
                        style={{ background:"white", color:"var(--muted)",
                          border:"1.5px solid var(--border)", borderRadius:"8px",
                          padding:"11px 16px", fontSize:"13px", fontWeight:600,
                          cursor:"pointer", fontFamily:"inherit", touchAction:"manipulation" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      {/* ── CUSTOM COURSE MODAL ── */}
      <AnimatePresence>
        {showCustomModal && (
          <div className="overlay" onClick={()=>setShowCustomModal(false)}>
            <motion.div className="modal" onClick={e=>e.stopPropagation()}
              initial={{ opacity:0, scale:0.88, y:24 }}
              animate={{ opacity:1, scale:1, y:0, transition:{ type:"spring", stiffness:350, damping:22 } }}
              exit={{ opacity:0, scale:0.92, y:16, transition:{ duration:0.18, ease:"easeIn" } }}
              style={{ maxWidth:"420px" }}>
              <div style={{ padding:"20px 22px 16px", borderBottom:"1px solid var(--border)",
                display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <h2 style={{ fontSize:"17px", fontWeight:800, color:"#0F172A",
                  fontFamily:"'Playfair Display',serif" }}>Add Custom Course</h2>
                <button onClick={()=>setShowCustomModal(false)}
                  style={{ background:"#FFF1F0", border:"none", borderRadius:"50%",
                    width:"32px", height:"32px", cursor:"pointer",
                    fontSize:"16px", color:"#B00804", touchAction:"manipulation" }}>✕</button>
              </div>
              <div style={{ padding:"20px 22px", display:"flex", flexDirection:"column", gap:"16px" }}>
                <p style={{ fontSize:"12px", color:"var(--muted)", margin:0 }}>
                  For HOC, dual credit, summer school, or any course not in the Kalani catalog.
                </p>

                {/* Course name */}
                <div>
                  <label style={{ fontSize:"12px", fontWeight:700, color:"var(--text)",
                    display:"block", marginBottom:"6px" }}>Course name</label>
                  <input className="si" placeholder="e.g. HOC — Marine Science, Running Start Math 141…"
                    value={customForm.name}
                    onChange={e=>setCustomForm(f=>({...f, name:e.target.value}))}
                    style={{ width:"100%" }} maxLength={60} />
                </div>

                {/* Department */}
                <div>
                  <label style={{ fontSize:"12px", fontWeight:700, color:"var(--text)",
                    display:"block", marginBottom:"8px" }}>Category</label>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                    {["English","Mathematics","Science","Social Studies","World Language",
                      "Fine Arts","CTE","Health & PE","Elective"].map(d=>(
                      <motion.button key={d}
                        whileTap={{ scale:0.92 }}
                        onClick={()=>setCustomForm(f=>({...f, dept:d}))}
                        style={{ padding:"5px 11px", borderRadius:"7px", fontSize:"11px",
                          fontWeight:700, cursor:"pointer", border:"1.5px solid",
                          fontFamily:"inherit", touchAction:"manipulation",
                          background:customForm.dept===d?"var(--red)":"white",
                          color:customForm.dept===d?"white":"var(--muted)",
                          borderColor:customForm.dept===d?"var(--red)":"var(--border)" }}>
                        {d}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Credits */}
                <div>
                  <label style={{ fontSize:"12px", fontWeight:700, color:"var(--text)",
                    display:"block", marginBottom:"8px" }}>Credits</label>
                  <div style={{ display:"flex", gap:"8px" }}>
                    {[0.5, 1.0].map(cr=>(
                      <motion.button key={cr}
                        whileTap={{ scale:0.92 }}
                        onClick={()=>setCustomForm(f=>({...f, credits:cr}))}
                        style={{ flex:1, padding:"9px", borderRadius:"8px", fontSize:"13px",
                          fontWeight:700, cursor:"pointer", border:"1.5px solid",
                          fontFamily:"inherit", touchAction:"manipulation",
                          background:customForm.credits===cr?"var(--red)":"white",
                          color:customForm.credits===cr?"white":"var(--muted)",
                          borderColor:customForm.credits===cr?"var(--red)":"var(--border)" }}>
                        {cr} cr — {cr===0.5?"Semester":"Year"}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Grade */}
                <div>
                  <label style={{ fontSize:"12px", fontWeight:700, color:"var(--text)",
                    display:"block", marginBottom:"8px" }}>Add to grade</label>
                  <div style={{ display:"flex", gap:"8px" }}>
                    {[9,10,11,12].map(g=>(
                      <motion.button key={g}
                        whileTap={{ scale:0.92 }}
                        onClick={()=>setCustomGradeTarget(g)}
                        style={{ flex:1, padding:"9px", borderRadius:"8px", fontSize:"13px",
                          fontWeight:700, cursor:"pointer", border:"1.5px solid",
                          fontFamily:"inherit", touchAction:"manipulation",
                          background:customGradeTarget===g?"var(--red)":"white",
                          color:customGradeTarget===g?"white":"var(--muted)",
                          borderColor:customGradeTarget===g?"var(--red)":"var(--border)" }}>
                        Gr {g}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Add button */}
              <div style={{ padding:"0 22px 20px" }}>
                <button
                  disabled={!customForm.name.trim()}
                  onClick={()=>{
                    if (!customForm.name.trim()) return;
                    const uid = "CUSTOM_" + Date.now();
                    const newCourse = {
                      id: uid,
                      name: customForm.name.trim(),
                      dept: customForm.dept,
                      credits: customForm.credits,
                      gradeLevel: [9,10,11,12],
                      prereqs: [],
                      repeatable: false,
                      isCustom: true,
                      gradCategory: "elective",
                      gradCredits: customForm.credits,
                      desc: "Custom course added by student.",
                      code: "CUSTOM",
                    };
                    setCustomCourses(prev => [...prev, newCourse]);
                    planUids.current[customGradeTarget].push(Math.random().toString(36).slice(2));
                    setPlan(p=>{
                      const n = JSON.parse(JSON.stringify(p));
                      n[customGradeTarget].push(uid);
                      return n;
                    });
                    setShowCustomModal(false);
                    setCustomForm({ name:"", dept:"Mathematics", credits:0.5 });
                    showToast("Added \"" + customForm.name.trim() + "\" to Grade " + customGradeTarget);
                  }}
                  style={{ width:"100%", background:"var(--red)", color:"white", border:"none",
                    borderRadius:"10px", padding:"13px", fontSize:"14px", fontWeight:800,
                    cursor:customForm.name.trim()?"pointer":"not-allowed",
                    opacity:customForm.name.trim()?1:0.5,
                    fontFamily:"inherit", touchAction:"manipulation" }}>
                  Add to Grade {customGradeTarget} →
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── COURSE DETAIL MODAL — lives outside renderPage so catalog page can open it too ── */}
      <AnimatePresence mode="wait">
        {selectedCourse ? (
          <div className="overlay" onClick={()=>setSelectedCourse(null)}>
            <motion.div key={selectedCourse.id} className="modal" onClick={e=>e.stopPropagation()}
              initial={{ opacity:0, scale:0.88, y:24 }}
              animate={{ opacity:1, scale:1, y:0, transition:{ type:"spring", stiffness:350, damping:22 } }}
              exit={{ opacity:0, scale:0.92, y:16, transition:{ duration:0.18, ease:"easeIn" } }}>
              <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                transition={{ type:"spring", stiffness:300, damping:24, delay:0.06 }}
                style={{ padding:"24px 26px", borderBottom:"1px solid var(--border)" }}>
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
              </motion.div>
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                transition={{ type:"spring", stiffness:300, damping:24, delay:0.14 }}
                style={{ padding:"22px 26px" }}>
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
                {!selectedCourse.isOffCampus && (
                  <div style={{ borderTop:"1px solid var(--border)", paddingTop:"16px" }}>
                    <p style={{ fontSize:"12px",color:"var(--muted)",marginBottom:"9px",fontWeight:600 }}>
                      Add to 4-Year Plan:
                    </p>
                    <div className="grade-btn-row" style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                      {[9,10,11,12].map(g=>(
                        <GradeBtn key={g} grade={g}
                          plan={plan}
                          selectedCourse={selectedCourse}
                          GRADE_MAX={GRADE_MAX}
                          gradeSlots={gradeSlots}
                          getCoursesBeforeGrade={(p,g)=>[...getCoursesBeforeGrade(p,g),...priorCredits]}
                          getAllCoursesUpTo={(p,g)=>[...getAllCoursesUpTo(p,g),...priorCredits]}
                          getUnmetPrereqs={getUnmetPrereqs}
                          getCoreConflict={getCoreConflict}
                          planUids={planUids}
                          setPlan={setPlan}
                          showToast={showToast}
                          modalWarn={modalWarn}
                          setModalWarn={setModalWarn}
                        />
                      ))}
                      {/* Inline warning — appears below grade buttons, stays in modal */}
                      {modalWarn && (
                        <div style={{ width:"100%", marginTop:"10px",
                          background:"#FEF9C3", border:"1.5px solid #EAB308",
                          borderRadius:"10px", padding:"12px 14px" }}>
                          <div style={{ fontWeight:700, fontSize:"12px",
                            color:"#78350F", marginBottom:"6px" }}>
                            {modalWarn.coreConflict ? "⚠️ Subject Conflict" : "⚠️ Missing Prerequisites"}
                          </div>
                          <div style={{ fontSize:"12px", color:"#78350F", marginBottom:"10px",
                            lineHeight:1.5 }}>
                            {modalWarn.coreConflict ? (
                              <span>You already have <strong>{modalWarn.coreConflict}</strong> in Grade {modalWarn.grade}. Only one course from this subject is allowed per year.</span>
                            ) : (
                              <span><strong>{selectedCourse?.name}</strong> requires: {modalWarn.unmet.map(getPrereqDisplay).join(", ")}</span>
                            )}
                          </div>
                          <div style={{ display:"flex", gap:"8px" }}>
                            <button
                              onClick={()=>{
                                planUids.current[modalWarn.grade].push(Math.random().toString(36).slice(2));
                                setPlan(p=>{const n=JSON.parse(JSON.stringify(p));if(!selectedCourse.repeatable&&Object.values(n).flat().includes(selectedCourse.id))return p;n[modalWarn.grade].push(selectedCourse.id);return n;});
                                showToast("Added \""+selectedCourse.name+"\" to Grade "+modalWarn.grade);
                                setModalWarn(null);
                              }}
                              style={{ flex:1, background:"#B45309", color:"white",
                                border:"none", borderRadius:"7px", padding:"8px",
                                fontSize:"12px", fontWeight:700, cursor:"pointer",
                                fontFamily:"inherit" }}>
                              Add Anyway
                            </button>
                            <button onClick={()=>setModalWarn(null)}
                              style={{ flex:1, background:"white", color:"#374151",
                                border:"1.5px solid #D1D5DB", borderRadius:"7px",
                                padding:"8px", fontSize:"12px", fontWeight:600,
                                cursor:"pointer", fontFamily:"inherit" }}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* RATING SECTION */}
                {!selectedCourse.isOffCampus && (
                  <div style={{ borderTop:"1px solid var(--border)", paddingTop:"16px", marginTop:"8px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between",
                      alignItems:"center", marginBottom:"12px" }}>
                      <p style={{ fontSize:"11px", color:"var(--muted)", fontWeight:700,
                        textTransform:"uppercase", letterSpacing:"0.06em" }}>Rate this course</p>
                      {/* Rating avg hidden — data still collected via Supabase */}
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
                        <div ref={starContainerRef} style={{ display:"flex", gap:"5px", flexShrink:0, position:"relative" }}
                          id={`stars-${selectedCourse.id}`}>
                          {[1,2,3,4,5].map(star => (
                            <span
                              key={star}
                              id={`star-${selectedCourse.id}-${star}`}
                              onClick={()=>{
                                if(ratingAnimating) return;
                                setPendingRating({ courseId:selectedCourse.id, stars:star });
                                setClickKey(k=>k+1);
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
                                  ? (burstKey>0 && star<=(pendingRating?.courseId===selectedCourse.id ? pendingRating.stars : 0)
                                      ? `starBurst 0.9s cubic-bezier(0.34,1.56,0.64,1) ${(star-1)*0.09}s both`
                                      : clickKey>0 && star<=(pendingRating?.courseId===selectedCourse.id ? pendingRating.stars : 0)
                                        ? `starElastic 1.2s cubic-bezier(0.34,1.56,0.64,1) ${(star-1)*0.09}s both`
                                        : `starPop 0.4s cubic-bezier(.34,1.56,.64,1) ${(star-1)*0.09}s both`)
                                  : "none",
                                color: star <= (pendingRating?.courseId===selectedCourse.id ? pendingRating.stars : 0)
                                  ? "#F59E0B" : "#D1D5DB",
                                willChange:"transform",
                              }}>★</span>
                          ))}

                          {/* Floating particles */}
                          {ratingParticles.map(p=>(
                            <span key={p.id} style={{
                              position:"absolute",
                              left:`${((pendingRating?.stars||1)-0.5)*39}px`,
                              top:"50%",
                              width:`${p.size}px`,height:`${p.size}px`,
                              borderRadius:"50%",background:p.color,
                              pointerEvents:"none",
                              animation:`particle 0.75s cubic-bezier(0.19,1,0.22,1) forwards`,
                              "--tx":`${Math.cos(p.angle)*p.dist}px`,
                              "--ty":`${Math.sin(p.angle)*p.dist}px`,
                            }}/>
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
                                spawnRatingParticles();
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
            </motion.div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      </div>

      {/* ── DATA CITATION FOOTER ── */}
      <DataCitationFooter />

      {/* ── TOAST ── */}
      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity:0, y:10, x:"-50%" }}
            animate={{ opacity:1, y:0, x:"-50%" }}
            exit={{ opacity:0, y:10, x:"-50%" }}
            style={{ position:"fixed", bottom:"28px", left:"50%",
              background:"#1C2B3A", color:"white", padding:"11px 22px", borderRadius:"10px",
              fontSize:"13px", fontWeight:600, boxShadow:"0 4px 20px rgba(0,0,0,0.3)",
              zIndex:2000, pointerEvents:"none",
              display:"flex", alignItems:"center", gap:"8px" }}>
            ✅ {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
