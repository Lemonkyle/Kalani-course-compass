import { useState, useEffect } from "react";
import { supabase } from "../supabase.js";

const DEPT_COLORS = {
  "English":"#C84B31","Mathematics":"#059669","Social Studies":"#7C3AED",
  "Science":"#D97706","Health & PE":"#0891B2","CTE":"#B00804",
  "World Language":"#0284C7","Fine Arts":"#DB2777",
  "Miscellaneous":"#6B7280","Off Campus":"#475569",
};

function Stars({ avg, size = 14 }) {
  return (
    <span style={{ display:"inline-flex", gap:"1px" }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ fontSize:`${size}px`,
          color: s <= Math.round(avg) ? "#F59E0B" : "#E5E7EB" }}>★</span>
      ))}
    </span>
  );
}

export default function RatingsPanel() {
  const [ratings, setRatings]   = useState([]);
  const [courses, setCourses]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [sortBy, setSortBy]     = useState("avg_desc");
  const [filterSem, setFilterSem] = useState("All");
  const [search, setSearch]     = useState("");

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [{ data: rData }, { data: cData }] = await Promise.all([
      supabase.from("ratings").select("course_id, rating, fingerprint, semester, created_at"),
      supabase.from("courses").select("id, name, dept, cte_path, fine_arts_type").eq("archived", false),
    ]);
    if (rData) setRatings(rData);
    if (cData) setCourses(cData);
    setLoading(false);
  }

  // Build aggregated stats per course
  const courseMap = Object.fromEntries(courses.map(c => [c.id, c]));

  const semesters = ["All", ...Array.from(new Set(ratings.map(r=>r.semester))).sort().reverse()];

  const filteredRatings = filterSem === "All"
    ? ratings
    : ratings.filter(r => r.semester === filterSem);

  const grouped = {};
  filteredRatings.forEach(r => {
    if (!grouped[r.course_id]) grouped[r.course_id] = { total:0, count:0, ratings:[] };
    grouped[r.course_id].total += r.rating;
    grouped[r.course_id].count += 1;
    grouped[r.course_id].ratings.push(r.rating);
  });

  let rows = Object.entries(grouped).map(([id, g]) => ({
    id,
    course: courseMap[id],
    avg: g.total / g.count,
    count: g.count,
    dist: [1,2,3,4,5].map(s => g.ratings.filter(r=>r===s).length),
  })).filter(r => r.course);

  // Apply search
  if (search.trim()) {
    const q = search.toLowerCase();
    rows = rows.filter(r =>
      r.course.name.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q)
    );
  }

  // Sort
  rows.sort((a,b) => {
    if (sortBy === "avg_desc") return b.avg - a.avg;
    if (sortBy === "avg_asc")  return a.avg - b.avg;
    if (sortBy === "count_desc") return b.count - a.count;
    return a.course.name.localeCompare(b.course.name);
  });

  const totalRatings   = filteredRatings.length;
  const overallAvg     = totalRatings > 0
    ? filteredRatings.reduce((s,r)=>s+r.rating,0) / totalRatings : 0;
  const coursesRated   = Object.keys(grouped).length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:"20px" }}>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px",
          color:"#111827", marginBottom:"4px" }}>Ratings overview</h2>
        <p style={{ fontSize:"13px", color:"#6B7280" }}>
          Anonymous student course ratings
        </p>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
        gap:"10px", marginBottom:"20px" }}>
        {[
          ["Total ratings",   totalRatings, "#B00804"],
          ["Overall average", overallAvg > 0 ? overallAvg.toFixed(2) : "—", "#F59E0B"],
          ["Courses rated",   coursesRated, "#7C3AED"],
          ["Academic years",  semesters.length - 1, "#059669"],
        ].map(([lbl,val,color])=>(
          <div key={lbl} style={{ background:"white", border:"1px solid #E5E7EB",
            borderRadius:"10px", padding:"12px 14px" }}>
            <div style={{ fontSize:"24px", fontWeight:700, color }}>{val}</div>
            <div style={{ fontSize:"12px", color:"#6B7280", marginTop:"2px" }}>{lbl}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:"10px", marginBottom:"16px", flexWrap:"wrap" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="🔍 Search course name or ID…"
          style={{ flex:"1 1 200px", padding:"9px 13px", borderRadius:"8px",
            border:"1.5px solid #E5E7EB", fontSize:"13px", outline:"none",
            fontFamily:"inherit" }}
          onFocus={e=>e.target.style.borderColor="#B00804"}
          onBlur={e=>e.target.style.borderColor="#E5E7EB"}
        />
        <select value={filterSem} onChange={e=>setFilterSem(e.target.value)}
          style={{ padding:"9px 13px", borderRadius:"8px", border:"1.5px solid #E5E7EB",
            fontSize:"13px", outline:"none", fontFamily:"inherit",
            background:"white", cursor:"pointer" }}>
          {semesters.map(s=><option key={s} value={s}>{s==="All"?"All academic years":s}</option>)}
        </select>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
          style={{ padding:"9px 13px", borderRadius:"8px", border:"1.5px solid #E5E7EB",
            fontSize:"13px", outline:"none", fontFamily:"inherit",
            background:"white", cursor:"pointer" }}>
          <option value="avg_desc">Highest rated first</option>
          <option value="avg_asc">Lowest rated first</option>
          <option value="count_desc">Most rated first</option>
          <option value="name">Alphabetical</option>
        </select>
      </div>

      {/* Ratings table */}
      <div style={{ background:"white", border:"1px solid #E5E7EB",
        borderRadius:"12px", overflow:"hidden" }}>
        {loading ? (
          <div style={{ padding:"40px", textAlign:"center", color:"#9CA3AF" }}>Loading…</div>
        ) : rows.length === 0 ? (
          <div style={{ padding:"48px", textAlign:"center", color:"#9CA3AF" }}>
            <div style={{ fontSize:"32px", marginBottom:"10px" }}>⭐</div>
            No ratings yet
          </div>
        ) : (
          <>
            <div style={{ display:"grid",
              gridTemplateColumns:"3fr 1.5fr 100px 80px 160px",
              padding:"10px 16px", background:"#F9FAFB",
              borderBottom:"1px solid #E5E7EB", fontSize:"11px",
              fontWeight:700, color:"#6B7280", letterSpacing:"0.04em" }}>
              <span>COURSE</span><span>DEPT</span>
              <span>AVERAGE</span><span>RATINGS</span><span>DISTRIBUTION</span>
            </div>

            {rows.map(row => {
              const col = DEPT_COLORS[row.course.dept] || "#6B7280";
              const subLabel = row.course.cte_path ||
                row.course.fine_arts_type || row.course.dept;
              const maxDist = Math.max(...row.dist, 1);

              return (
                <div key={row.id}
                  style={{ display:"grid",
                    gridTemplateColumns:"3fr 1.5fr 100px 80px 160px",
                    padding:"12px 16px", borderBottom:"1px solid #F3F4F6",
                    alignItems:"center" }}
                  onMouseEnter={e=>e.currentTarget.style.background="#FAFAFA"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>

                  <div>
                    <div style={{ fontSize:"13px", fontWeight:600, color:"#111827" }}>
                      {row.course.name}
                    </div>
                    <div style={{ fontSize:"11px", color:"#9CA3AF", marginTop:"1px" }}>
                      {row.id}
                    </div>
                  </div>

                  <span style={{ background:col+"18", color:col,
                    borderRadius:"5px", padding:"2px 8px",
                    fontSize:"11px", fontWeight:700 }}>{subLabel}</span>

                  <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                    <span style={{ fontSize:"15px", fontWeight:700, color:"#111827" }}>
                      {row.avg.toFixed(1)}
                    </span>
                    <Stars avg={row.avg} size={12} />
                  </div>

                  <span style={{ fontSize:"13px", color:"#6B7280" }}>
                    {row.count}
                  </span>

                  {/* Distribution bar */}
                  <div style={{ display:"flex", flexDirection:"column", gap:"2px" }}>
                    {[5,4,3,2,1].map(s => (
                      <div key={s} style={{ display:"flex", alignItems:"center", gap:"4px" }}>
                        <span style={{ fontSize:"10px", color:"#9CA3AF",
                          width:"8px", flexShrink:0 }}>{s}</span>
                        <div style={{ flex:1, height:"5px", borderRadius:"3px",
                          background:"#F3F4F6", overflow:"hidden" }}>
                          <div style={{
                            height:"100%", borderRadius:"3px",
                            background: s>=4?"#22C55E":s===3?"#F59E0B":"#EF4444",
                            width:`${(row.dist[s-1]/maxDist)*100}%`,
                            transition:"width 0.4s ease",
                          }}/>
                        </div>
                        <span style={{ fontSize:"10px", color:"#9CA3AF",
                          width:"16px", textAlign:"right", flexShrink:0 }}>
                          {row.dist[s-1]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div style={{ padding:"12px 16px", fontSize:"12px", color:"#9CA3AF",
              textAlign:"center", borderTop:"1px solid #F3F4F6" }}>
              {rows.length} course{rows.length!==1?"s":""} with ratings
              {filterSem !== "All" && ` · ${filterSem} academic year`}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
