import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HomePage } from "./pages/HomePage.jsx";
import { CatalogPage } from "./pages/CatalogPage.jsx";
import { PlannerPage } from "./pages/PlannerPage.jsx";
import { CourseMatchPage } from "./pages/CourseMatchPage.jsx";
import { CourseDetailModal } from "./components/course/CourseDetailModal.jsx";
import { CourseMatchModal } from "./components/match/CourseMatchModal.jsx";
import { CustomCourseModal } from "./components/planner/CustomCourseModal.jsx";
import { AppStyles, DataCitationFooter, DataDisclaimerModal, MaintenanceNotice } from "./components/shared/index.js";
import { useAnnouncements } from "./hooks/useAnnouncements.js";
import { useCourseCatalog } from "./hooks/useCourseCatalog.js";
import { useCourseData } from "./hooks/useCourseData.js";
import { useDisclaimerItems } from "./hooks/useDisclaimerItems.js";
import { usePageMaintenance } from "./hooks/usePageMaintenance.js";
import { usePlannerStorage } from "./hooks/usePlannerStorage.js";
import { useSiteSettings } from "./hooks/useSiteSettings.js";
import { useStartupDisclaimer } from "./hooks/useStartupDisclaimer.js";
import { useTransientUi } from "./hooks/useTransientUi.js";
import { deptColor, getCourseSlots } from "./lib/courseRules.js";
import { computeHonorsProgress } from "./lib/honorsRules.js";
import { GRADE_MAX, planAdditionError, calcPlannerCredits, getAllCoursesUpTo, getCoursesBeforeGrade } from "./lib/plannerRules.js";
import { safeExternalUrl } from "./lib/url.js";
export default function App() {
  // V4: courses fetched from Supabase, falls back to local course data if unavailable
  const { courses: liveCourses, status: catalogStatus } = useCourseData();

  const { announcements } = useAnnouncements();
  const { items: disclaimerItems } = useDisclaimerItems();
  const { settings: siteSettings } = useSiteSettings();
  const { maintenance: pageMaintenance } = usePageMaintenance();
  const plannerStorage = usePlannerStorage();
  const {
    plan,
    setPlan,
    priorCredits,
    setPriorCredits,
    alg1Anim,
    setAlg1Anim,
    customCourses,
    setCustomCourses,
    showCustomModal,
    setShowCustomModal,
    customGradeTarget,
    setCustomGradeTarget,
    customForm,
    setCustomForm,
  } = plannerStorage;
  const courseCatalog = useCourseCatalog(liveCourses, customCourses, plan, catalogStatus);
  const {
    searchQuery,
    setSearchQuery,
    homeSearch,
    setHomeSearch,
    homeSearchFocus,
    setHomeSearchFocus,
    filterGrade,
    setFilterGrade,
    filterDept,
    setFilterDept,
    filterCtePath,
    setFilterCtePath,
    filterFineArts,
    setFilterFineArts,
    filterMisc,
    setFilterMisc,
    gridKey,
    setGridKey,
    addSearch,
    setAddSearch,
    filteredCourses,
    homeSearchResults,
    addSearchResults,
    courseById,
    getCourse,
    getCourseName,
    getPrereqDisplay,
    getUnmetPrereqsForCurrentCourses,
  } = courseCatalog;
  const {
    showStartupDisclaimer,
    neverShowDisclaimer,
    setNeverShowDisclaimer,
    closeStartupDisclaimer,
  } = useStartupDisclaimer();
  const { toast, showToast, shakeGrade, setShakeGrade } = useTransientUi();

  const [page, setPage] = useState("home");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [dismissedAnns, setDismissedAnns] = useState([]);
  const [addTarget, setAddTarget] = useState(null);
  const [honorsOpen, setHonorsOpen] = useState({academic:false,stem:false,cte:false});
  const [prereqWarn, setPrereqWarn] = useState(null); // {courseId, grade, unmet:[]}
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [modalWarn, setModalWarn] = useState(null); // { courseId, grade, unmet }
  // Course Match
  const [matchSelected, setMatchSelected] = useState(null); // selected template for detail view
  const [applyConfirm, setApplyConfirm] = useState(false); // show apply confirmation
  const canUseHover = useMemo(() => (
    typeof window !== "undefined" &&
    window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches
  ), []);
  useEffect(() => {
    if (!pageMaintenance.match) return;
    setMatchSelected(null);
    setApplyConfirm(false);
  }, [pageMaintenance.match]);

  useEffect(() => {
    setModalWarn(null);
  }, [selectedCourse?.id]);

  useEffect(() => { setPrereqWarn(null); }, [addTarget, addSearch]);

  function navigate(p) { setPage(p); window.scrollTo({ top:0, behavior:"instant" }); }
  function isPageUnderMaintenance(id) { return Boolean(pageMaintenance[id]); }
  function maintenanceContent(id, content) {
    if (!isPageUnderMaintenance(id)) return content;
    return <MaintenanceNotice onBackHome={()=>navigate("home")} showBackHome={id !== "home"} />;
  }

  const { cats, total } = useMemo(() => calcPlannerCredits(plan, getCourse), [plan, courseById]);
  const honorsProgress = useMemo(() => computeHonorsProgress(plan, getCourse), [plan, courseById]);

  function removeCourse(grade, idx) {
    setPlan(p => { const n = JSON.parse(JSON.stringify(p)); n[grade].splice(idx, 1); return n; });
  }

  function addCourseEntry(grade, courseId, course = getCourse(courseId)) {
    const error = planAdditionError(plan, grade, course, getCourse);
    if (error) { showToast(error); return false; }
    setPlan(p => planAdditionError(p, grade, course, getCourse) ? p : {...p, [grade]: [...p[grade], courseId]});
    return true;
  }
  function addFromDetail(grade, courseId) {
    const course = getCourse(courseId);
    const error = planAdditionError(plan, grade, course, getCourse);
    if (error) { showToast(error); return; }
    const unmet = getUnmetPrereqsForCurrentCourses(courseId, [...getCoursesBeforeGrade(plan, grade), ...priorCredits], [...getAllCoursesUpTo(plan, grade), ...priorCredits]);
    if (unmet.length) { setModalWarn({courseId, grade, unmet}); return; }
    if (addCourseEntry(grade, courseId)) { setModalWarn(null); showToast('Added "' + course.name + '" to Grade ' + grade); }
  }
  function addCourseToPlan(courseId) {
    if (!addTarget) return;
    const course = getCourse(courseId);
    const additionError = planAdditionError(plan, addTarget, course, getCourse);
    if (additionError) {
      setShakeGrade(addTarget);
      showToast(additionError);
      return;
    }
    const completedBefore = [...getCoursesBeforeGrade(plan, addTarget), ...priorCredits];
    const completedUpTo = [...getAllCoursesUpTo(plan, addTarget), ...priorCredits];
    const unmet = getUnmetPrereqsForCurrentCourses(courseId, completedBefore, completedUpTo);
    if (unmet.length > 0) {
      setPrereqWarn({ courseId, grade: addTarget, unmet });
      return;
    }
    addCourseEntry(addTarget, courseId, course);
    setAddTarget(null); setAddSearch("");
  }
  function forceAddCourse(courseId) {
    if (!addTarget || prereqWarn?.courseId !== courseId || prereqWarn.grade !== addTarget) return;
    const course = getCourse(courseId);
    const additionError = planAdditionError(plan, addTarget, course, getCourse);
    if (additionError) {
      setShakeGrade(addTarget);
      showToast(additionError);
      return;
    }
    addCourseEntry(addTarget, courseId, course);
    setAddTarget(null); setAddSearch(""); setPrereqWarn(null);
  }

  // Slot = credits for normal courses, 1 for Off Campus (0-credit)
  function gradeSlots(p, grade) {
    return (p[grade]||[]).reduce((sum, cid) => {
      return sum + getCourseSlots(getCourse(cid));
    }, 0);
  }

  function canFitCourse(grade, course) {
    return gradeSlots(plan, grade) + getCourseSlots(course) <= GRADE_MAX;
  }

  const pageContext = {
    page,
    maintenanceContent,
    navigate,
    selectedCourse,
    setSelectedCourse,
    searchQuery,
    setSearchQuery,
    homeSearch,
    setHomeSearch,
    homeSearchFocus,
    setHomeSearchFocus,
    homeSearchResults,
    filterGrade,
    setFilterGrade,
    filterDept,
    setFilterDept,
    filterCtePath,
    setFilterCtePath,
    filterFineArts,
    setFilterFineArts,
    filterMisc,
    setFilterMisc,
    gridKey,
    setGridKey,
    filteredCourses,
    canUseHover,
    getCourseName,
    deptColor,
    plan,
    showResetConfirm,
    setShowResetConfirm,
    setPlan,
    priorCredits,
    setPriorCredits,
    alg1Anim,
    setAlg1Anim,
    customCourses,
    setCustomCourses,
    setShowCustomModal,
    addTarget,
    setAddTarget,
    addSearch,
    setAddSearch,
    prereqWarn,
    setPrereqWarn,
    addSearchResults,
    getCourse,
    gradeSlots,
    getUnmetPrereqsForCurrentCourses,
    getPrereqDisplay,
    addCourseToPlan,
    forceAddCourse,
    removeCourse,
    canFitCourse,
    addCourseEntry,
    setShakeGrade,
    showToast,
    shakeGrade,
    cats,
    total,
    honorsOpen,
    setHonorsOpen,
    honorsProgress,
    matchSelected,
    setMatchSelected,
    applyConfirm,
    setApplyConfirm,
    showCustomModal,
    customGradeTarget,
    setCustomGradeTarget,
    customForm,
    setCustomForm,
    modalWarn,
    setModalWarn,
    addFromDetail,
    liveCourses,
  };

  return (
    <>
      <AppStyles />

      <div style={{ minHeight:"100vh" }}>

        {/* NAV */}
        <nav className="top-nav" style={{ background:`linear-gradient(90deg,var(--red-deep),var(--red-dark) 50%,var(--red))`,
          padding:"0 24px", display:"flex", alignItems:"center", gap:"2px", height:"58px",
          position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 20px rgba(107,5,3,0.4)" }}>
          <div onClick={()=>navigate("home")}
            className="nav-logo" style={{ fontFamily:"'Playfair Display',serif", color:"white", fontSize:"20px", fontWeight:700,
              marginRight:"20px", cursor:"pointer", textShadow:"0 1px 4px rgba(0,0,0,0.3)" }}>
            🦅 Kalani Compass
          </div>
          {[["home","Home","Home"],["catalog","Courses","Courses"],["match","Course Match","Match"],["planner","4-Year Planner","Planner"]].map(([id,label,shortLabel])=>(
            <div key={id} onClick={()=>navigate(id)}
              className="nav-item">
              {page===id ? (
                <motion.div layoutId="nav-pill"
                  style={{ position:"absolute", inset:0, borderRadius:"8px",
                    background:"rgba(255,255,255,0.22)", boxShadow:"0 2px 8px rgba(0,0,0,0.15) inset" }}
                  transition={{ type:"spring", stiffness:400, damping:25 }}/>
              ) : null}
              <span className="nav-item-label" style={{ color:page===id?"white":"rgba(255,255,255,0.65)" }}>
                <span className="nav-label-full">{label}</span>
                <span className="nav-label-short">{shortLabel}</span>
              </span>
            </div>
            ))}
          <div style={{ marginLeft:"auto" }} />
        </nav>

        {catalogStatus === "offline" && <div role="status" style={{padding:"10px 24px",background:"#FFFBEB",color:"#92400E",fontSize:13}}>Live catalog unavailable. Showing saved course data; check course availability before registration.</div>}
        {/* ANNOUNCEMENT BANNER */}
        {announcements.filter(a=>!dismissedAnns.includes(a.id)).map((a,i) => {
          const palBg  = a.type==="new"?"linear-gradient(90deg,#14532D,#166534)":a.type==="warning"?"linear-gradient(90deg,#78350F,#92400E)":"linear-gradient(90deg,#1E3A5F,#1E40AF)";
          const palBar = a.type==="new"?"#22C55E":a.type==="warning"?"#F59E0B":"#3B82F6";
          const palTxt = a.type==="new"?"#DCFCE7":a.type==="warning"?"#FEF9C3":"#DBEAFE";
          const palSub = a.type==="new"?"rgba(220,252,231,0.75)":a.type==="warning"?"rgba(254,249,195,0.75)":"rgba(219,234,254,0.75)";
          const palBtn = a.type==="new"?"rgba(34,197,94,0.25)":a.type==="warning"?"rgba(245,158,11,0.25)":"rgba(59,130,246,0.25)";
          const linkUrl = safeExternalUrl(a.link_url);
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
              {linkUrl && (
                <a href={linkUrl} target="_blank" rel="noopener noreferrer"
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
                X
              </button>
            </div>
          );
        })}

        <AnimatePresence mode="sync">

        {/* Home page */}
        <HomePage key="home" context={pageContext} />

        {/* Course catalog page */}
        <CatalogPage key="catalog" context={pageContext} />

        {/* Planner page */}
        <PlannerPage key="planner" context={pageContext} />

      {/* Course Match page */}
      <CourseMatchPage key="match" context={pageContext} />
        </AnimatePresence>

      {/* Course Match detail modal */}
      <CourseMatchModal context={pageContext} />

      <CustomCourseModal context={pageContext} />

      <CourseDetailModal context={pageContext} />
      </div>

      {/* Data citation footer */}
      <DataCitationFooter items={disclaimerItems} settings={siteSettings} />

      <AnimatePresence>
        {showStartupDisclaimer ? (
          <DataDisclaimerModal
            onClose={closeStartupDisclaimer}
            items={disclaimerItems}
            showNeverAgain
            neverAgain={neverShowDisclaimer}
            onNeverAgainChange={setNeverShowDisclaimer}
          />
        ) : null}
      </AnimatePresence>

      {/* Toast */}
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
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
