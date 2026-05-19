export function MaintenanceNotice({ onBackHome, showBackHome = true }) {
  return (
    <div style={{ minHeight:"calc(100vh - 58px)", display:"flex", alignItems:"center",
      justifyContent:"center", padding:"48px 24px" }}>
      <div style={{ width:"min(560px,100%)", background:"white",
        border:"1px solid var(--border)", borderRadius:"16px", padding:"34px 30px",
        textAlign:"center", boxShadow:"0 10px 32px rgba(15,23,42,0.08)" }}>
        <div style={{ width:"52px", height:"52px", borderRadius:"50%", margin:"0 auto 18px",
          display:"flex", alignItems:"center", justifyContent:"center",
          background:"#FFF1F0", color:"var(--red)", fontSize:"24px", fontWeight:800 }}>
          !
        </div>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"28px",
          color:"#0F172A", marginBottom:"10px" }}>
          This page is under maintenance
        </h1>
        <p style={{ fontSize:"14px", color:"var(--muted)", lineHeight:1.7,
          maxWidth:"420px", margin:"0 auto" }}>
          We're updating this section of Kalani Compass. Please check back later.
        </p>
        {showBackHome && (
          <button onClick={onBackHome}
            style={{ marginTop:"22px", background:"var(--red)", color:"white",
              border:"none", borderRadius:"10px", padding:"11px 18px",
              fontSize:"13px", fontWeight:800, cursor:"pointer",
              fontFamily:"inherit" }}>
            Back to Home
          </button>
        )}
      </div>
    </div>
  );
}
