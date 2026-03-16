import { useState } from "react";
import AdminLogin from "./AdminLogin.jsx";
import AnnPanel from "./AnnPanel.jsx";
import CoursePanel from "./CoursePanel.jsx";
import RatingsPanel from "./RatingsPanel.jsx";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');`;

const NAV_ITEMS = [
  { id:"announcements", label:"Announcements", icon:"📢" },
  { id:"courses",       label:"Courses",       icon:"📚" },
  { id:"ratings",       label:"Ratings",       icon:"⭐" },
];

export default function AdminApp() {
  const [authed, setAuthed] = useState(
    sessionStorage.getItem("kalani_admin") === "1"
  );
  const [tab, setTab] = useState("announcements");

  if (!authed) return <AdminLogin onLogin={()=>setAuthed(true)} />;

  function signOut() {
    sessionStorage.removeItem("kalani_admin");
    setAuthed(false);
  }

  return (
    <>
      <style>{`
        ${FONTS}
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Plus Jakarta Sans',sans-serif;background:#F7F8FA;}
        input,select,textarea,button{font-family:'Plus Jakarta Sans',sans-serif;}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:3px;}
      `}</style>

      <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh" }}>

        {/* Nav */}
        <nav style={{ background:"linear-gradient(90deg,#6B0503,#950A07,#B00804)",
          height:"58px", display:"flex", alignItems:"center", padding:"0 24px",
          boxShadow:"0 2px 16px rgba(107,5,3,0.35)", position:"sticky",
          top:0, zIndex:100, gap:"10px" }}>
          <span style={{ fontFamily:"'Playfair Display',serif", color:"white",
            fontSize:"20px", fontWeight:700, marginRight:"4px" }}>🦅 Kalani Compass</span>
          <span style={{ color:"rgba(255,255,255,0.4)", fontSize:"14px" }}>/</span>
          <span style={{ color:"rgba(255,255,255,0.75)", fontSize:"13px",
            fontWeight:600, flex:1 }}>Admin Panel</span>
          <a href="/" style={{ color:"rgba(255,255,255,0.6)", fontSize:"12px",
            textDecoration:"none", marginRight:"8px" }}>← Back to site</a>
          <button onClick={signOut}
            style={{ background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.25)",
              color:"white", borderRadius:"7px", padding:"5px 12px", fontSize:"12px",
              cursor:"pointer", fontFamily:"inherit" }}>
            Sign out
          </button>
        </nav>

        <div style={{ display:"flex", flex:1 }}>

          {/* Sidebar */}
          <aside style={{ width:"210px", flexShrink:0, background:"white",
            borderRight:"1px solid #E5E7EB", padding:"16px 10px",
            display:"flex", flexDirection:"column", gap:"3px" }}>

            <div style={{ fontSize:"11px", fontWeight:700, color:"#9CA3AF",
              letterSpacing:"0.06em", padding:"6px 12px 4px" }}>MANAGE</div>

            {NAV_ITEMS.map(item=>(
              <div key={item.id}
                onClick={()=>!item.soon && setTab(item.id)}
                style={{ display:"flex", alignItems:"center", gap:"9px",
                  padding:"9px 12px", borderRadius:"8px", cursor: item.soon?"default":"pointer",
                  background: tab===item.id ? "#FFF1F0" : "transparent",
                  color: item.soon ? "#D1D5DB" : tab===item.id ? "#B00804" : "#6B7280",
                  fontWeight: tab===item.id ? 700 : 400,
                  fontSize:"13px", transition:"all 0.15s",
                  userSelect:"none" }}>
                <span style={{ fontSize:"14px", width:"16px", textAlign:"center" }}>
                  {item.icon}
                </span>
                {item.label}
                {item.soon && (
                  <span style={{ marginLeft:"auto", fontSize:"10px", background:"#F3F4F6",
                    color:"#9CA3AF", borderRadius:"4px", padding:"1px 6px", fontWeight:600 }}>
                    Soon
                  </span>
                )}
              </div>
            ))}

            <div style={{ flex:1 }}/>
            <div style={{ padding:"10px 12px", fontSize:"11px", color:"#9CA3AF",
              borderTop:"1px solid #F3F4F6", marginTop:"8px", lineHeight:1.5 }}>
              <div style={{ fontWeight:600, color:"#6B7280", marginBottom:"2px" }}>
                Connected to Supabase
              </div>
              kalani-course-compass
            </div>
          </aside>

          {/* Main content */}
          <main style={{ flex:1, padding:"28px 32px", maxWidth:"900px" }}>
            {tab === "announcements" && <AnnPanel />}
            {tab === "courses" && <CoursePanel />}
            {tab === "ratings" && <RatingsPanel />}
          </main>
        </div>
      </div>
    </>
  );
}
