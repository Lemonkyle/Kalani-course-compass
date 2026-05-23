import { useState } from "react";

import { AnimatePresence } from "framer-motion";

import { DEFAULT_DISCLAIMER_ITEMS } from "../../data/disclaimerItems.js";
import { DEFAULT_SITE_SETTINGS } from "../../data/siteSettings.js";

import { DataDisclaimerModal } from "./DataDisclaimerModal.jsx";

export function DataCitationFooter({
  items = DEFAULT_DISCLAIMER_ITEMS.filter(item => item.visible),
  settings = DEFAULT_SITE_SETTINGS,
} = {}) {
  const [open, setOpen] = useState(false);
  const sourceTitle = settings.catalog_source_title || DEFAULT_SITE_SETTINGS.catalog_source_title;
  const sourceUrl = settings.catalog_source_url || DEFAULT_SITE_SETTINGS.catalog_source_url;

  return (
    <>
      <footer style={{ background:"#F1F5F9", borderTop:"1px solid #E2E8F0", padding:"14px 24px",
        display:"flex", alignItems:"center", justifyContent:"center", gap:"16px", flexWrap:"wrap" }}>
        <span style={{ fontSize:"12px", color:"#64748B", lineHeight:1.5 }}>
          Course data sourced from <em>{sourceTitle}</em> and{" "}
          <em>Hawaii DOE Graduation Requirements (July 2023)</em>.
          {" "}For planning reference only.
        </span>
        <a href={sourceUrl}
          target="_blank" rel="noopener noreferrer"
          style={{ fontSize:"11px", color:"#0369A1", background:"#EFF6FF", border:"1px solid #BFDBFE",
            borderRadius:"6px", padding:"4px 10px", textDecoration:"none", whiteSpace:"nowrap", fontWeight:700 }}>
          Official Catalog
        </a>
        <button onClick={()=>setOpen(true)}
          style={{ fontSize:"11px", color:"#475569", background:"white", border:"1px solid #CBD5E1",
            borderRadius:"6px", padding:"4px 10px", cursor:"pointer", whiteSpace:"nowrap",
            fontFamily:"inherit" }}>
          Data Sources & Disclaimer
        </button>
        <a href="/admin"
          style={{ fontSize:"11px", color:"#7F1D1D", background:"#FFF1F0", border:"1px solid #FECACA",
            borderRadius:"6px", padding:"4px 10px", textDecoration:"none", whiteSpace:"nowrap",
            fontWeight:700 }}>
          Admin
        </a>
      </footer>
      <AnimatePresence>
        {open ? <DataDisclaimerModal onClose={()=>setOpen(false)} items={items} /> : null}
      </AnimatePresence>
    </>
  );
}
