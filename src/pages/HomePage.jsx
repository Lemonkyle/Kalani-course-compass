import { renderPage } from "../components/shared/index.js";
import { DEPTS, GRAD_REQUIREMENTS } from "../data/index.js";

export function HomePage({ context }) {
  const {
    page, maintenanceContent, navigate, setSelectedCourse, setSearchQuery, homeSearch, setHomeSearch, homeSearchFocus, setHomeSearchFocus, homeSearchResults, setFilterDept, setFilterCtePath, setFilterFineArts, setFilterMisc, deptColor, plan, total, liveCourses
  } = context;
  return renderPage(page==="home","home", maintenanceContent("home",
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
                        <span style={{ fontSize:"11px", color:"var(--muted)", flexShrink:0 }}>View</span>
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
              {[{n:"24",l:"Credits to graduate",i:"🎓",c:"#B00804"},{n:String(liveCourses.length),l:"Courses in catalog",i:"📚",c:"#0369A1"},
                {n:String(liveCourses.filter(c=>c.isAP).length),l:"AP courses offered",i:"⭐",c:"#7C3AED"},{n:String(new Set(liveCourses.filter(c=>c.dept==="CTE" && c.ctePath).map(c=>c.ctePath)).size),l:"CTE career pathways",i:"🛠",c:"#0F766E"}].map(s=>(
                <div key={s.l} style={{ background:"white", borderRadius:"14px", padding:"22px",
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
        ));
}
