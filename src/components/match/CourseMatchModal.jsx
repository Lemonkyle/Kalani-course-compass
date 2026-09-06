import { AnimatePresence, motion } from "framer-motion";

import { assessTemplate } from "../../lib/templateRules.js";

export function CourseMatchModal({ context }) {
  const {
    navigate, setSelectedCourse, deptColor, plan, setPlan, priorCredits, getCourse, showToast, total, matchSelected, setMatchSelected, applyConfirm, setApplyConfirm
  } = context;
  const assessment = matchSelected ? assessTemplate(matchSelected.plan, getCourse, priorCredits) : null;
  return (
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
              <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                transition={{ type:"spring", stiffness:300, damping:24, delay:0.06 }}
                style={{ padding:"22px 24px 16px", borderBottom:"1px solid var(--border)",
                display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"4px" }}>
                    <motion.span initial={{ scale:0.75, rotate:-8 }} animate={{ scale:1, rotate:0 }}
                      transition={{ type:"spring", stiffness:380, damping:16, delay:0.12 }}
                      style={{ fontSize:"28px", display:"inline-block" }}>{matchSelected.emoji}</motion.span>
                    <motion.span initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                      transition={{ type:"spring", stiffness:320, damping:22, delay:0.16 }}
                      style={{ fontSize:"10px", fontWeight:800, padding:"3px 9px",
                      borderRadius:"999px", background:matchSelected.tagBg,
                      color:matchSelected.tagColor }}>{matchSelected.tag}</motion.span>
                  </div>
                  <h2 style={{ fontSize:"20px", fontWeight:800, color:"#0F172A",
                    fontFamily:"'Playfair Display',serif" }}>{matchSelected.title}</h2>
                </div>
                <button onClick={()=>setMatchSelected(null)}
                  style={{ background:"#FFF1F0", border:"none", borderRadius:"50%",
                    width:"32px", height:"32px", cursor:"pointer",
                    fontSize:"16px", color:"#B00804", flexShrink:0, touchAction:"manipulation" }}>X</button>
              </motion.div>

              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                transition={{ type:"spring", stiffness:300, damping:24, delay:0.14 }}
                style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:"16px",
                maxHeight:"60vh", overflowY:"auto" }}>
                {/* Description */}
                <motion.p initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                  transition={{ duration:0.22, ease:"easeOut", delay:0.18 }}
                  style={{ fontSize:"13px", color:"var(--muted)", lineHeight:1.6 }}>{matchSelected.desc}</motion.p>

                {/* Best for */}
                <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                  transition={{ type:"spring", stiffness:300, damping:24, delay:0.22 }}>
                  <div style={{ fontSize:"11px", fontWeight:700, textTransform:"uppercase",
                    letterSpacing:"0.07em", color:"var(--muted)", marginBottom:"6px" }}>Best for</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                    {matchSelected.suited.map((s,i)=>(
                      <motion.span key={s}
                        initial={{ opacity:0, y:8, scale:0.96 }}
                        animate={{ opacity:1, y:0, scale:1 }}
                        transition={{ type:"spring", stiffness:340, damping:22, delay:0.25 + i*0.035 }}
                        style={{ fontSize:"11px", background:"#F8FAFC",
                        border:"1px solid var(--border)", borderRadius:"6px",
                        padding:"3px 9px", color:"var(--text)", display:"inline-block" }}>{s}</motion.span>
                    ))}
                  </div>
                </motion.div>

                {/* Highlights */}
                <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                  transition={{ type:"spring", stiffness:300, damping:24, delay:0.30 }}>
                  <div style={{ fontSize:"11px", fontWeight:700, textTransform:"uppercase",
                    letterSpacing:"0.07em", color:"var(--muted)", marginBottom:"6px" }}>Highlights</div>
                  {matchSelected.highlights.map((h,i)=>(
                    <motion.div key={h}
                      initial={{ opacity:0, x:-12 }}
                      animate={{ opacity:1, x:0 }}
                      transition={{ type:"spring", stiffness:330, damping:24, delay:0.34 + i*0.045 }}
                      style={{ display:"flex", alignItems:"center", gap:"8px",
                      fontSize:"13px", color:"var(--text)", marginBottom:"4px" }}>
                      <span style={{ color:"#059669", fontWeight:700 }}>✅</span> {h}
                    </motion.div>
                  ))}
                </motion.div>

                {/* 4-year preview - mini planner style */}
                <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                  transition={{ type:"spring", stiffness:300, damping:24, delay:0.40 }}>
                  <div style={{ fontSize:"11px", fontWeight:700, textTransform:"uppercase",
                    letterSpacing:"0.07em", color:"var(--muted)", marginBottom:"10px" }}>4-Year Preview</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
                    {[9,10,11,12].map((g,gradeIndex)=>(
                      <motion.div key={g}
                        initial={{ opacity:0, y:18, scale:0.96 }}
                        animate={{ opacity:1, y:0, scale:1 }}
                        transition={{ type:"spring", stiffness:340, damping:24, delay:0.45 + gradeIndex*0.055 }}
                        style={{ borderRadius:"10px", border:"1.5px solid var(--border)",
                        overflow:"hidden" }}>
                        {/* Grade header */}
                        <div style={{ background:"var(--red)", padding:"6px 10px",
                          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                          <span style={{ fontSize:"11px", fontWeight:800, color:"white",
                            letterSpacing:"0.05em" }}>GRADE {g}</span>
                          <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.7)",
                            fontWeight:600 }}>
                            {(matchSelected.plan[g]||[]).length} courses
                          </span>
                        </div>
                        {/* Course list */}
                        <div style={{ padding:"6px", display:"flex", flexDirection:"column", gap:"3px" }}>
                          {(matchSelected.plan[g]||[]).map((cid,courseIndex)=>{
                            const c = getCourse(cid);
                            const col = c ? (deptColor(c.dept)+"18") : "#F1F5F9";
                            const textCol = c ? deptColor(c.dept) : "#64748B";
                            return (
                              <motion.div key={cid}
                                initial={{ opacity:0, x:18, scale:0.96 }}
                                animate={{ opacity:1, x:0, scale:1 }}
                                transition={{ type:"spring", stiffness:360, damping:24, delay:0.52 + gradeIndex*0.055 + courseIndex*0.025 }}
                                onClick={()=>{ if(c){ setMatchSelected(null); setSelectedCourse(c); } }}
                                style={{ fontSize:"10px", fontWeight:600,
                                  background:col, color:textCol,
                                  borderRadius:"5px", padding:"3px 7px",
                                  cursor:c?"pointer":"default",
                                  border:`1px solid ${textCol}22`,
                                  whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                                  display:"flex", alignItems:"center", gap:"4px",
                                  transition:"opacity 0.15s" }}
                                onMouseEnter={e=>{ if(c) e.currentTarget.style.opacity="0.75"; }}
                                onMouseLeave={e=>{ e.currentTarget.style.opacity="1"; }}>
                                {c?.isAP && <span style={{ fontSize:"8px", fontWeight:900,
                                  background:"#FEF3C7", color:"#92400E",
                                  borderRadius:"3px", padding:"0 3px", flexShrink:0 }}>AP</span>}
                                {c ? c.name : cid}
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>

              {/* Apply section */}
              <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
                transition={{ type:"spring", stiffness:300, damping:24, delay:0.52 }}
                style={{ padding:"16px 24px", borderTop:"1px solid var(--border)" }}>
                <div style={{fontSize:12,lineHeight:1.6,marginBottom:12}}>
                  <strong>{assessment?.total.toFixed(1)} planned credits</strong>
                  <p>{assessment?.missing.length ? "Still needed: " + assessment.missing.join("; ") : "All tracked credit categories are covered. GPA, grades and approvals are checked separately."}</p>
                  {assessment?.errors.map(text=><p key={text} style={{color:"#B91C1C"}}>{text}</p>)}
                  {assessment?.warnings.map(text=><p key={text} style={{color:"#92400E"}}>{text}</p>)}
                </div>
                {!applyConfirm ? (
                  <button disabled={assessment.errors.length>0} onClick={()=>setApplyConfirm(true)}
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
                      ⚠️ This will replace your current 4-year plan. A copy of your current plan will be saved on this device.
                    </p>
                    <div style={{ display:"flex", gap:"8px" }}>
                      <button onClick={()=>{
                        const current = assessTemplate(matchSelected.plan, getCourse, priorCredits);
                        if (current.errors.length) { showToast(current.errors[0]); return; }
                        try { localStorage.setItem("kalani-plan-before-template", JSON.stringify(plan)); } catch { showToast("Could not back up your current plan."); return; }
                        const newPlan = { 9:[], 10:[], 11:[], 12:[] };
                        [9,10,11,12].forEach(g=>{
                          newPlan[g] = [...(matchSelected.plan[g]||[])];
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
              </motion.div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
  );
}
