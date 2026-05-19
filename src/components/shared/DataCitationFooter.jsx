import { useState } from "react";

import { AnimatePresence } from "framer-motion";

import { DEFAULT_DISCLAIMER_ITEMS } from "../../data/disclaimerItems.js";

import { DataDisclaimerModal } from "./DataDisclaimerModal.jsx";



export function DataCitationFooter({ items = DEFAULT_DISCLAIMER_ITEMS.filter(item => item.visible) } = {}) {
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
          Data Sources & Disclaimer ›
        </button>
      </footer>
      <AnimatePresence>
        {open ? <DataDisclaimerModal onClose={()=>setOpen(false)} items={items} /> : null}
      </AnimatePresence>
    </>
  );
}
