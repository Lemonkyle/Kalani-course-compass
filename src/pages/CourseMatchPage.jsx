import { motion } from "framer-motion";
import { renderPage } from "../components/shared/index.js";
import { COURSE_MATCH_TEMPLATES } from "../data/index.js";

export function CourseMatchPage({ context }) {
  const {
    page, maintenanceContent, navigate, selectedCourse, setSelectedCourse, searchQuery,
    setSearchQuery, homeSearch, setHomeSearch, homeSearchFocus, setHomeSearchFocus, homeSearchResults,
    filterDept, setFilterDept, filterCtePath, setFilterCtePath, filterFineArts, setFilterFineArts,
    filterMisc, setFilterMisc, gridKey, setGridKey, filteredCourses, canUseHover,
    getCourseName, deptColor, plan, showResetConfirm, setShowResetConfirm, setPlan,
    priorCredits, setPriorCredits, alg1Anim, setAlg1Anim, customCourses, setCustomCourses,
    setShowCustomModal, addTarget, setAddTarget, addSearch, setAddSearch, prereqWarn,
    setPrereqWarn, addSearchResults, getCourse, gradeSlots, getUnmetPrereqsForCurrentCourses, getPrereqDisplay,
    addCourseToPlan, forceAddCourse, removeCourse, ensureUids, canFitCourse, addCourseEntry,
    setShakeGrade, showToast, shakeGrade, cats, total, honorsOpen,
    setHonorsOpen, honorsProgress, planUids, matchSelected, setMatchSelected, applyConfirm,
    setApplyConfirm, showCustomModal, customGradeTarget, setCustomGradeTarget, customForm, setCustomForm,
    modalWarn, setModalWarn, getCoreConflict, liveCourses,
  } = context;
  return renderPage(page==="match","match", maintenanceContent("match",
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
          <div className="match-grid" style={{ marginBottom:"32px" }}>
            {COURSE_MATCH_TEMPLATES.filter(t=>t.pinned).map((t,index)=>(
              <motion.div key={t.id}
                initial={{ opacity:0, y:22, scale:0.96 }}
                animate={{ opacity:1, y:0, scale:1,
                  transition:{ type:"spring", stiffness:350, damping:22, delay:index*0.06 } }}
                whileHover={canUseHover ? { y:-3, boxShadow:"0 10px 28px rgba(0,0,0,0.10)" } : undefined}
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
          <div className="match-grid">
            {COURSE_MATCH_TEMPLATES.filter(t=>!t.pinned).map((t,index)=>(
              <motion.div key={t.id}
                initial={{ opacity:0, y:22, scale:0.96 }}
                animate={{ opacity:1, y:0, scale:1,
                  transition:{ type:"spring", stiffness:350, damping:22, delay:0.12 + index*0.05 } }}
                whileHover={canUseHover ? { y:-3, boxShadow:"0 10px 28px rgba(0,0,0,0.10)" } : undefined}
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
      ));
}
