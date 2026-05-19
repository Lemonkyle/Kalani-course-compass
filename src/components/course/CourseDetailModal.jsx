import { AnimatePresence, motion } from "framer-motion";
import { GradeBtn } from "../shared/GradeBtn.jsx";
import { PREREQ_EQUIV } from "../../data/requirements.js";
import { getAllCoursesUpTo, getCoursesBeforeGrade } from "../../lib/plannerRules.js";

export function CourseDetailModal({ context }) {
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
  return (
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
                  /* Off-campus structured card */
                  <div>
                    <div style={{ background:"#F8FAFC", border:"1.5px solid #CBD5E1", borderRadius:"12px",
                      padding:"16px", marginBottom:"14px" }}>
                      <div style={{ fontSize:"11px", fontWeight:800, textTransform:"uppercase",
                        letterSpacing:"0.09em", color:"#64748B", marginBottom:"10px" }}>Eligibility (all 3 required)</div>
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
                  /* Regular course body */
                  <div>
                    <div className="course-meta-grid">
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
                          gradeSlots={gradeSlots}
                          getCoursesBeforeGrade={(p,g)=>[...getCoursesBeforeGrade(p,g),...priorCredits]}
                          getAllCoursesUpTo={(p,g)=>[...getAllCoursesUpTo(p,g),...priorCredits]}
                          getUnmetPrereqs={getUnmetPrereqsForCurrentCourses}
                          getCoreConflict={getCoreConflict}
                          planUids={planUids}
                          setPlan={setPlan}
                          showToast={showToast}
                          setModalWarn={setModalWarn}
                        />
                      ))}
                      {/* Inline warning - appears below grade buttons, stays in modal */}
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
                                if (!canFitCourse(modalWarn.grade, selectedCourse)) {
                                  setShakeGrade(modalWarn.grade);
                                  showToast(`Grade ${modalWarn.grade} does not have enough room for this course`);
                                  return;
                                }
                                addCourseEntry(modalWarn.grade, selectedCourse.id, selectedCourse);
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

            </motion.div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
  );
}
