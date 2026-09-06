import { motion } from "framer-motion";
import { renderPage } from "../components/shared/index.js";
import { CTE_PATHS, DEPTS, FINE_ARTS_TYPES, MISC_TYPES } from "../data/index.js";
import { PREREQ_EQUIV } from "../data/requirements.js";

export function CatalogPage({ context }) {
  const {
    page, maintenanceContent, setSelectedCourse, searchQuery, setSearchQuery, filterGrade, setFilterGrade, filterDept, setFilterDept, filterCtePath, setFilterCtePath, filterFineArts, setFilterFineArts, filterMisc, setFilterMisc, gridKey, setGridKey, filteredCourses, canUseHover, getCourseName, deptColor, plan
  } = context;
  const gradeFilters = ["All Grades", 9, 10, 11, 12];
  return renderPage(page==="catalog","catalog", maintenanceContent("catalog",
          <div className="fade-in" style={{ maxWidth:"1200px", margin:"0 auto", padding:"32px 24px" }}>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"30px", color:"var(--red-dark)",
              marginBottom:"22px" }}>Course Catalog</h1>
            <div className="catalog-search-row" style={{ display:"flex", gap:"12px", marginBottom:"20px", flexWrap:"wrap", alignItems:"center" }}>
              <input className="si" placeholder="🔍 Search courses…" value={searchQuery}
                onChange={e=>setSearchQuery(e.target.value)}
                style={{ flex:"1", minWidth:"200px", maxWidth:"320px" }} />
            </div>
            <div className="catalog-grade-filter-row" style={{ display:"flex", flexWrap:"wrap", gap:"5px", marginBottom:"14px" }}>
              {gradeFilters.map(g=>(
                <button key={g}
                  className={"dept-btn catalog-grade-filter-btn"+(filterGrade===g?" active":"")}
                  onClick={()=>{ setFilterGrade(g); setGridKey(k=>k+1); }}>
                  <span>{g === "All Grades" ? g : `Grade ${g}`}</span>
                </button>
                ))}
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"5px", marginBottom:"20px" }}>
              {DEPTS.map(d=>(
                <button key={d}
                  className={"dept-btn"+(filterDept===d?" active":"")}
                  onClick={()=>{ setFilterDept(d); setFilterCtePath("All CTE"); setFilterFineArts("All Fine Arts"); setFilterMisc("All Miscellaneous"); setGridKey(k=>k+1); }}>
                  <span>{d}</span>
                </button>
                ))}
            </div>
            {filterDept === "CTE" && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:"5px", marginBottom:"12px" }}>
                {CTE_PATHS.map(p=>(
                  <motion.div key={p}
                    whileTap={{ scale:0.90 }}
                    whileHover={canUseHover ? { scale:filterCtePath===p?1:1.06 } : undefined}
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
                    whileHover={canUseHover ? { scale:filterFineArts===t?1:1.06 } : undefined}
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
                    whileHover={canUseHover ? { scale:filterMisc===t?1:1.06 } : undefined}
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
                  style={{ animation:canUseHover ? "cardIn 0.5s cubic-bezier(0.34,1.56,0.64,1) "+(index*0.045)+"s both" : "none" }}
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
        ));
}
