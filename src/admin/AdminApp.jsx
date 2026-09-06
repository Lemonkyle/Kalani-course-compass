import { useEffect, useState } from "react";
import AdminLogin from "./AdminLogin.jsx";
import AnnPanel from "./AnnPanel.jsx";
import CoursePanel from "./CoursePanel.jsx";
import DisclaimerPanel from "./DisclaimerPanel.jsx";
import MaintenancePanel from "./MaintenancePanel.jsx";
import SettingsPanel from "./SettingsPanel.jsx";
import { adminRequest } from "./adminApi.js";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');`;

const NAV_ITEMS = [
  { id:"announcements", label:"Announcements", icon:"A" },
  { id:"courses", label:"Courses", icon:"C" },
  { id:"settings", label:"Settings", icon:"S" },
  { id:"maintenance", label:"Maintenance", icon:"M" },
  { id:"disclaimer", label:"Disclaimer", icon:"D" },
];

export default function AdminApp() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [tab, setTab] = useState("announcements");

  useEffect(() => {
    let alive = true;
    const expire = () => { setAuthed(false); setAdminEmail(""); };
    window.addEventListener("kalani-admin-expired", expire);
    adminRequest("session", undefined, "GET").then(({data}) => {
      if (!alive) return;
      setAuthed(Boolean(data?.user)); setAdminEmail(data?.user || ""); setCheckingAuth(false);
    });
    return () => { alive = false; window.removeEventListener("kalani-admin-expired", expire); };
  }, []);

  async function handleLogin(username) {
    setAuthed(true); setAdminEmail(username); return {ok:true};
  }
  async function signOut() {
    const {error} = await adminRequest("session", {}, "DELETE");
    if (error) { window.alert(error.message); return; }
    setAuthed(false); setAdminEmail("");
  }

  if (checkingAuth) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
        background:"#F7F8FA", color:"#1C2B3A", fontFamily:"'Plus Jakarta Sans',sans-serif",
        fontWeight:700 }}>
        Checking admin access...
      </div>
    );
  }

  if (!authed) return <AdminLogin onLogin={handleLogin} />;

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
        <nav style={{ background:"linear-gradient(90deg,#6B0503,#950A07,#B00804)",
          height:"58px", display:"flex", alignItems:"center", padding:"0 24px",
          boxShadow:"0 2px 16px rgba(107,5,3,0.35)", position:"sticky",
          top:0, zIndex:100, gap:"10px" }}>
          <span style={{ fontFamily:"'Playfair Display',serif", color:"white",
            fontSize:"20px", fontWeight:700, marginRight:"4px" }}>Kalani Compass</span>
          <span style={{ color:"rgba(255,255,255,0.4)", fontSize:"14px" }}>/</span>
          <span style={{ color:"rgba(255,255,255,0.75)", fontSize:"13px",
            fontWeight:600, flex:1 }}>Admin Panel</span>
          {adminEmail && (
            <span style={{ color:"rgba(255,255,255,0.62)", fontSize:"12px",
              marginRight:"8px", maxWidth:"220px", overflow:"hidden", textOverflow:"ellipsis",
              whiteSpace:"nowrap" }}>
              {adminEmail}
            </span>
          )}
          <a href="/" style={{ color:"rgba(255,255,255,0.6)", fontSize:"12px",
            textDecoration:"none", marginRight:"8px" }}>Back to site</a>
          <button onClick={signOut}
            style={{ background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.25)",
              color:"white", borderRadius:"7px", padding:"5px 12px", fontSize:"12px",
              cursor:"pointer", fontFamily:"inherit" }}>
            Sign out
          </button>
        </nav>

        <div style={{ display:"flex", flex:1 }}>
          <aside style={{ width:"210px", flexShrink:0, background:"white",
            borderRight:"1px solid #E5E7EB", padding:"16px 10px",
            display:"flex", flexDirection:"column", gap:"3px" }}>

            <div style={{ fontSize:"11px", fontWeight:700, color:"#9CA3AF",
              letterSpacing:"0.06em", padding:"6px 12px 4px" }}>MANAGE</div>

            {NAV_ITEMS.map(item=>(
              <div key={item.id}
                onClick={()=>setTab(item.id)}
                style={{ display:"flex", alignItems:"center", gap:"9px",
                  padding:"9px 12px", borderRadius:"8px", cursor:"pointer",
                  background: tab===item.id ? "#FFF1F0" : "transparent",
                  color: tab===item.id ? "#B00804" : "#6B7280",
                  fontWeight: tab===item.id ? 700 : 400,
                  fontSize:"13px", transition:"all 0.15s",
                  userSelect:"none" }}>
                <span style={{ fontSize:"11px", width:"16px", textAlign:"center", fontWeight:800 }}>
                  {item.icon}
                </span>
                {item.label}
              </div>
            ))}

            <div style={{ flex:1 }}/>
            <div style={{ padding:"10px 12px", fontSize:"11px", color:"#9CA3AF",
              borderTop:"1px solid #F3F4F6", marginTop:"8px", lineHeight:1.5 }}>
              <div style={{ fontWeight:600, color:"#6B7280", marginBottom:"2px" }}>
                Kalani administrator
              </div>
              Session expires after 8 hours
            </div>
          </aside>

          <main style={{ flex:1, padding:"28px 32px", maxWidth:"900px" }}>
            {tab === "announcements" && <AnnPanel />}
            {tab === "courses" && <CoursePanel />}
            {tab === "settings" && <SettingsPanel />}
            {tab === "maintenance" && <MaintenancePanel />}
            {tab === "disclaimer" && <DisclaimerPanel />}
          </main>
        </div>
      </div>
    </>
  );
}
