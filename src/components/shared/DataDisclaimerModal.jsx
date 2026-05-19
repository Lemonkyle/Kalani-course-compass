import { motion } from "framer-motion";

import { DEFAULT_DISCLAIMER_ITEMS } from "../../data/disclaimerItems.js";



export function DataDisclaimerModal({ onClose, items = DEFAULT_DISCLAIMER_ITEMS.filter(item => item.visible), showNeverAgain = false, neverAgain = false, onNeverAgainChange }) {
  return (
    <div className="overlay" onClick={onClose}>
      <motion.div className="modal" onClick={e=>e.stopPropagation()}
        initial={{ opacity:0, scale:0.88, y:24 }}
        animate={{ opacity:1, scale:1, y:0, transition:{ type:"spring", stiffness:350, damping:22 } }}
        exit={{ opacity:0, scale:0.92, y:16, transition:{ duration:0.18, ease:"easeIn" } }}
        style={{ maxWidth:"540px", width:"92vw", display:"flex", flexDirection:"column",
          overflow:"hidden" }}>
        <div style={{ padding:"24px 26px", borderBottom:"1px solid #E5E7EB",
          display:"flex", justifyContent:"space-between", alignItems:"center", gap:"16px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", minWidth:0 }}>
            <motion.span initial={{ scale:0.75, rotate:-8 }} animate={{ scale:1, rotate:0 }}
              transition={{ type:"spring", stiffness:380, damping:16, delay:0.08 }}
              style={{ fontSize:"24px", flexShrink:0 }}>📋</motion.span>
            <h2 style={{ fontSize:"17px", fontWeight:700, color:"#1C2B3A",
              fontFamily:"'Playfair Display',serif", margin:0 }}>Data Sources & Disclaimer</h2>
          </div>
          <button onClick={onClose}
            aria-label="Close disclaimer"
            style={{ background:"#FFF1F0", border:"none", borderRadius:"50%", width:"32px",
              height:"32px", cursor:"pointer", fontSize:"16px", color:"#B00804",
              flexShrink:0, touchAction:"manipulation" }}>×</button>
        </div>
        <div style={{ padding:"22px 26px", display:"flex", flexDirection:"column", gap:"16px",
          overflowY:"auto", flex:"1 1 auto", minHeight:0 }}>
          {items.map(({icon,label,text}, i)=>(
            <motion.div key={label}
              initial={{ opacity:0, y:12 }}
              animate={{ opacity:1, y:0 }}
              transition={{ type:"spring", stiffness:320, damping:24, delay:0.08 + i*0.04 }}
              style={{ display:"flex", gap:"13px", alignItems:"flex-start" }}>
              <span style={{ fontSize:"20px", flexShrink:0, marginTop:"2px" }}>{icon}</span>
              <div>
                <div style={{ fontSize:"12px", fontWeight:700, color:"#475569",
                  textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:"4px" }}>{label}</div>
                <div style={{ fontSize:"13px", color:"#374151", lineHeight:1.6 }}>{text}</div>
              </div>
            </motion.div>
          ))}
        </div>
        {showNeverAgain ? (
          <div style={{ padding:"16px 26px 22px", borderTop:"1px solid #E5E7EB",
            display:"flex", flexDirection:"column", gap:"14px", flex:"0 0 auto",
            background:"white", boxShadow:"0 -8px 18px rgba(15,23,42,0.04)" }}>
            <label style={{ display:"flex", alignItems:"center", gap:"9px",
              fontSize:"12px", color:"#475569", fontWeight:700, cursor:"pointer",
              userSelect:"none" }}>
              <input type="checkbox" checked={neverAgain}
                onChange={e=>onNeverAgainChange?.(e.target.checked)}
                style={{ width:"15px", height:"15px", accentColor:"#B00804", cursor:"pointer" }} />
              Don&apos;t show this again
            </label>
            <button onClick={onClose}
              style={{ width:"100%", background:"var(--red)", color:"white", border:"none",
                borderRadius:"10px", padding:"12px 16px", fontSize:"14px", fontWeight:800,
                cursor:"pointer", fontFamily:"inherit", touchAction:"manipulation",
                boxShadow:"0 4px 14px rgba(176,8,4,0.25)" }}>
              I understand
            </button>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}
