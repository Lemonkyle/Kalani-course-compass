import { useState } from "react";

const ADMIN_EMAIL    = "kyleexcalibur58@gmail.com";
const ADMIN_PASSWORD = "May#0414";

export default function AdminLogin({ onLogin }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        sessionStorage.setItem("kalani_admin", "1");
        onLogin();
      } else {
        setError("Invalid email or password.");
      }
      setLoading(false);
    }, 400);
  }

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column",
      background:"#F7F8FA", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>

      {/* Nav */}
      <div style={{ background:"linear-gradient(90deg,#6B0503,#950A07,#B00804)",
        height:"58px", display:"flex", alignItems:"center", padding:"0 28px",
        boxShadow:"0 2px 16px rgba(107,5,3,0.35)" }}>
        <span style={{ fontFamily:"'Playfair Display',serif", color:"white",
          fontSize:"20px", fontWeight:700 }}>🦅 Kalani Compass</span>
        <span style={{ color:"rgba(255,255,255,0.5)", margin:"0 10px" }}>/</span>
        <span style={{ color:"rgba(255,255,255,0.75)", fontSize:"13px", fontWeight:600 }}>Admin</span>
      </div>

      {/* Login card */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px" }}>
        <div style={{ background:"white", borderRadius:"16px", padding:"36px 40px",
          width:"100%", maxWidth:"380px", boxShadow:"0 4px 32px rgba(0,0,0,0.08)",
          border:"1px solid #E5E7EB" }}>

          <div style={{ marginBottom:"28px" }}>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px",
              color:"#111827", marginBottom:"6px" }}>Admin sign in</h1>
            <p style={{ fontSize:"13px", color:"#6B7280" }}>
              Kalani Compass management panel
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:"14px" }}>
              <label style={{ display:"block", fontSize:"12px", fontWeight:700,
                color:"#374151", marginBottom:"5px" }}>Email</label>
              <input
                type="email" value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="admin@example.com" required
                style={{ width:"100%", padding:"10px 13px", borderRadius:"8px",
                  border:"1.5px solid #E5E7EB", fontSize:"14px", outline:"none",
                  fontFamily:"inherit", transition:"border 0.15s",
                  boxSizing:"border-box" }}
                onFocus={e=>e.target.style.borderColor="#B00804"}
                onBlur={e=>e.target.style.borderColor="#E5E7EB"}
              />
            </div>

            <div style={{ marginBottom:"20px" }}>
              <label style={{ display:"block", fontSize:"12px", fontWeight:700,
                color:"#374151", marginBottom:"5px" }}>Password</label>
              <input
                type="password" value={password} onChange={e=>setPassword(e.target.value)}
                placeholder="••••••••" required
                style={{ width:"100%", padding:"10px 13px", borderRadius:"8px",
                  border:"1.5px solid #E5E7EB", fontSize:"14px", outline:"none",
                  fontFamily:"inherit", transition:"border 0.15s",
                  boxSizing:"border-box" }}
                onFocus={e=>e.target.style.borderColor="#B00804"}
                onBlur={e=>e.target.style.borderColor="#E5E7EB"}
              />
            </div>

            {error && (
              <div style={{ background:"#FEF2F2", border:"1.5px solid #FCA5A5",
                borderRadius:"8px", padding:"9px 13px", fontSize:"13px",
                color:"#B91C1C", marginBottom:"16px" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width:"100%", background: loading?"#D1D5DB":"#B00804",
                color:"white", border:"none", borderRadius:"8px", padding:"11px",
                fontSize:"14px", fontWeight:700, cursor: loading?"not-allowed":"pointer",
                fontFamily:"inherit", transition:"background 0.15s" }}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p style={{ fontSize:"11px", color:"#9CA3AF", textAlign:"center", marginTop:"20px" }}>
            This page is not publicly linked. Access via /admin only.
          </p>
        </div>
      </div>
    </div>
  );
}
