import { AnimatePresence, motion } from "framer-motion";
import { AnimatedProgressBar, cardVariants, contentVariants, renderPage, shakeAnim } from "../components/shared/index.js";
import { DEFAULT_PLAN, GRAD_REQUIREMENTS, HONORS_DEFS } from "../data/index.js";
import { getCourseSlots } from "../lib/courseRules.js";
import { GRADE_MAX, getAllCoursesUpTo, getCoursesBeforeGrade } from "../lib/plannerRules.js";

export function PlannerPage({ context }) {
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
  return renderPage(page==="planner","planner", maintenanceContent("planner",
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

                {/* Middle-school ALG1 toggle */}
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

                {/* Custom course button */}
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
                            const unmet = isOffCampus ? [] : getUnmetPrereqsForCurrentCourses(cid, before, upTo);
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
                                  {canUseHover ? (
                                    <motion.div
                                      initial={{ x:"-150%", skewX:-12 }}
                                      animate={{ x:"250%",  skewX:-12 }}
                                      transition={{ duration:0.9, ease:"easeInOut", delay:0.12 }}
                                      style={{
                                        position:"absolute", top:"-30%", bottom:"-30%", left:0, width:"55%",
                                        background:"linear-gradient(to right,transparent,"+(isOffCampus?"rgba(71,85,105,0.25)":col+"60")+","+(isOffCampus?"rgba(71,85,105,0.1)":col+"35")+",transparent)",
                                        pointerEvents:"none", zIndex:20,
                                      }}/>
                                  ) : null}
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
                                  {/* Delete button - hover reveal */}
                                  <div className="delete-reveal" style={{ padding:"0 10px", flexShrink:0, zIndex:1 }}>
                                    <motion.div
                                      whileHover={canUseHover ? { backgroundColor:"#EF4444", scale:1.1, boxShadow:"0 4px 12px rgba(239,68,68,0.4)" } : undefined}
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
                        {/* ── INLINE SEARCH - with open/close animation ── */}
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
                                  const courseSlots = getCourseSlots(c);
                                  const wouldExceed = gradeSlots(plan, grade) + courseSlots > GRADE_MAX;
                                  const blocked = already || wouldExceed;
                                  const completedBefore = [...getCoursesBeforeGrade(plan, grade), ...priorCredits];
                                  const completedUpTo = [...getAllCoursesUpTo(plan, grade), ...priorCredits];
                                  const unmet = c.id==="OFF_CAMPUS" ? [] : getUnmetPrereqsForCurrentCourses(c.id, completedBefore, completedUpTo);
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
                                  onClick={()=>{ const course=getCourse("OFF_CAMPUS"); if(canFitCourse(12,course)){ addCourseEntry(12,"OFF_CAMPUS",course); } else { setShakeGrade(12); showToast("Grade 12 does not have enough room for Off Campus"); } }}>
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
          ));
}
