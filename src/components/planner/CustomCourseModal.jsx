import { AnimatePresence, motion } from "framer-motion";
import { GRADE_MAX } from "../../lib/plannerRules.js";
import { WORLD_LANGUAGES } from "../../lib/worldLanguage.js";

export function CustomCourseModal({ context }) {
  const {
    plan, setCustomCourses, setShowCustomModal, gradeSlots, addCourseEntry, setShakeGrade, showToast, showCustomModal, customGradeTarget, setCustomGradeTarget, customForm, setCustomForm
  } = context;
  const needsLanguage = customForm.dept === "World Language" && !customForm.language?.trim();
  const canAdd = Boolean(customForm.name.trim()) && !needsLanguage;
  return (
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
                    fontSize:"16px", color:"#B00804", touchAction:"manipulation" }}>X</button>
              </div>
              <div style={{ padding:"20px 22px", display:"flex", flexDirection:"column", gap:"16px" }}>
                <p style={{ fontSize:"12px", color:"var(--muted)", margin:0 }}>
                  This planner focuses on Kalani courses. Record other courses here as custom entries;
                  external program eligibility and credit equivalencies are not evaluated.
                </p>

                {/* Course name */}
                <div>
                  <label style={{ fontSize:"12px", fontWeight:700, color:"var(--text)",
                    display:"block", marginBottom:"6px" }}>Course name</label>
                  <input className="si" placeholder="e.g. Summer Marine Science"
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

                {customForm.dept === "World Language" && (
                  <div>
                    <label htmlFor="custom-language" style={{ fontSize:"12px", fontWeight:700,
                      color:"var(--text)", display:"block", marginBottom:"6px" }}>Language</label>
                    <input id="custom-language" className="si" list="custom-language-options"
                      placeholder="e.g. Japanese" value={customForm.language || ""}
                      onChange={e=>setCustomForm(f=>({...f, language:e.target.value}))}
                      style={{ width:"100%" }} maxLength={60} required />
                    <datalist id="custom-language-options">
                      {WORLD_LANGUAGES.map(language=><option key={language} value={language} />)}
                    </datalist>
                    <p style={{ fontSize:"11px", color:"var(--muted)", marginTop:"5px" }}>
                      The requirement needs 2 credits in the same language.
                    </p>
                  </div>
                )}

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

                {/* AP toggle */}
                <div>
                  <label style={{ fontSize:"12px", fontWeight:700, color:"var(--text)",
                    display:"block", marginBottom:"8px" }}>
                    Is this an AP course?
                  </label>
                  <div style={{ display:"flex", gap:"8px" }}>
                    {[{label:"Yes — AP course", val:true}, {label:"No", val:false}].map(({label,val})=>(
                      <motion.button key={String(val)}
                        whileTap={{ scale:0.92 }}
                        onClick={()=>setCustomForm(f=>({...f, isAP:val}))}
                        style={{ flex:1, padding:"9px", borderRadius:"8px", fontSize:"12px",
                          fontWeight:700, cursor:"pointer", border:"1.5px solid",
                          fontFamily:"inherit", touchAction:"manipulation",
                          background:(customForm.isAP===true)===val?"var(--red)":"white",
                          color:(customForm.isAP===true)===val?"white":"var(--muted)",
                          borderColor:(customForm.isAP===true)===val?"var(--red)":"var(--border)" }}>
                        {label}
                      </motion.button>
                    ))}
                  </div>
                  {customForm.isAP && (
                    <p style={{ fontSize:"11px", color:"#7C3AED", marginTop:"5px" }}>
                      This course will count toward the AP credits requirement for Honors Recognition.
                    </p>
                  )}
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
                  disabled={!canAdd}
                  onClick={()=>{
                    if (!canAdd) return;
                    if (gradeSlots(plan, customGradeTarget) + customForm.credits > GRADE_MAX) {
                      setShakeGrade(customGradeTarget);
                      showToast(`Grade ${customGradeTarget} does not have enough room for this course`);
                      return;
                    }
                    const uid = "CUSTOM_" + crypto.randomUUID();
                    const newCourse = {
                      id: uid,
                      name: customForm.name.trim(),
                      dept: customForm.dept,
                      language: customForm.dept === "World Language" ? customForm.language.trim() : "",
                      credits: customForm.credits,
                      gradeLevel: [9,10,11,12],
                      prereqs: [],
                      repeatable: false,
                      isCustom: true,
                      isAP: customForm.isAP || false,
                      gradCategory: customForm.dept === "World Language" ? "wlfa" :
                                    customForm.dept === "Fine Arts" ? "wlfa" :
                                    customForm.dept === "CTE" ? "wlfa" : "electives",
                      gradCredits: customForm.credits,
                      desc: "Custom course added by student.",
                      code: "CUSTOM",
                    };
                    if (!addCourseEntry(customGradeTarget, uid, newCourse)) return;
                    setCustomCourses(prev => [...prev, newCourse]);
                    setShowCustomModal(false);
                    setCustomForm({ name:"", dept:"Mathematics", credits:0.5, isAP:false, language:"" });
                    showToast("Added \"" + customForm.name.trim() + "\" to Grade " + customGradeTarget);
                  }}
                  style={{ width:"100%", background:"var(--red)", color:"white", border:"none",
                    borderRadius:"10px", padding:"13px", fontSize:"14px", fontWeight:800,
                    cursor:canAdd?"pointer":"not-allowed",
                    opacity:canAdd?1:0.5,
                    fontFamily:"inherit", touchAction:"manipulation" }}>
                  Add to Grade {customGradeTarget} →
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
  );
}
