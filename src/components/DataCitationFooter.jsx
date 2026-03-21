import { useState } from "react";

export default function DataCitationFooter() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <footer style={{ background:"#F1F5F9", borderTop:"1px solid #E2E8F0", padding:"14px 24px",
        display:"flex", alignItems:"center", justifyContent:"center", gap:"16px", flexWrap:"wrap" }}>
        <span style={{ fontSize:"12px", color:"#64748B", lineHeight:1.5 }}>
          📋 Course data sourced from{" "}
          <em>Kalani High School 2026–27 Registration Guide & Course Catalog</em>{" "}
          and{" "}
          <em>Hawaii DOE Graduation Requirements (July 2023)</em>.
          For planning reference only.
        </span>
        <a href="https://www.kalanihighschool.org/admissions/course-registration-information/"
          target="_blank" rel="noopener noreferrer"
          style={{ fontSize:"11px", color:"#0369A1", background:"#EFF6FF", border:"1px solid #BFDBFE",
            borderRadius:"6px", padding:"4px 10px", textDecoration:"none", whiteSpace:"nowrap", fontWeight:700 }}>
          📋 Official Catalog ↗
        </a>
        <button onClick={()=>setOpen(true)}
          style={{ fontSize:"11px", color:"#475569", background:"white", border:"1px solid #CBD5E1",
            borderRadius:"6px", padding:"4px 10px", cursor:"pointer", whiteSpace:"nowrap",
            fontFamily:"inherit" }}>
          Data Sources &amp; Disclaimer ›
        </button>
      </footer>

      {open && (
        <div className="overlay" onClick={()=>setOpen(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}
            style={{ maxWidth:"520px", width:"92vw" }}>
            <div style={{ padding:"24px 26px", borderBottom:"1px solid #E5E7EB",
              display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <h2 style={{ fontSize:"17px", fontWeight:700, color:"#1C2B3A",
                fontFamily:"'Playfair Display',serif" }}>Data Sources &amp; Disclaimer</h2>
              <button onClick={()=>setOpen(false)}
                style={{ background:"#FFF1F0", border:"none", borderRadius:"50%", width:"32px",
                  height:"32px", cursor:"pointer", fontSize:"16px", color:"#B00804" }}>✕</button>
            </div>
            <div style={{ padding:"22px 26px", display:"flex", flexDirection:"column", gap:"16px" }}>
              {[
                { icon:"📖", label:"Primary Source", text:"Kalani High School 2024–2025 Manual of Studies. All course names, codes, credit values, grade levels, and prerequisite chains are derived from this document." },
                { icon:"🎓", label:"Graduation Requirements", text:"Hawaii Department of Education Graduation Requirements, effective July 2023. Credit minimums and subject-area breakdowns follow this policy document." },
                { icon:"⚠️", label:"Planning Reference Only", text:"Kalani Compass is an unofficial planning tool built by a student volunteer. It is not affiliated with Kalani High School or the Hawaii DOE. Course availability, prerequisites, and requirements may change. Always confirm your 4-year plan with your school counselor before submitting your registration card." },
                { icon:"🔄", label:"Last Data Update", text:"Course catalog last reviewed: March 2026. Based on the 2026–2027 Kalani High School Course Catalog (Manual of Studies)." },
              ].map(({icon,label,text})=>(
                <div key={label} style={{ display:"flex", gap:"13px", alignItems:"flex-start" }}>
                  <span style={{ fontSize:"20px", flexShrink:0, marginTop:"2px" }}>{icon}</span>
                  <div>
                    <div style={{ fontSize:"12px", fontWeight:700, color:"#475569",
                      textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:"4px" }}>{label}</div>
                    <div style={{ fontSize:"13px", color:"#374151", lineHeight:1.6 }}>{text}</div>
                  </div>
                </div>
                ))}
            </div>
          </div>
        </div>
        )}
    </>
  );
}
