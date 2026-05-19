import { BEYOND_ALG2_IDS } from "../data/requirements.js";

import { getCourse } from "./courseRules.js";



// Honors certificate progress calculations.

export function computeHonorsProgress(plan, getCourseForId = getCourse) {
  const allIds = Object.values(plan).flat();
  const allCourses = allIds.map(getCourseForId).filter(Boolean);

  const mathCredits = allCourses.filter(c=>c.dept==="Mathematics").reduce((s,c)=>s+c.credits,0);
  const sciCredits  = allCourses.filter(c=>c.dept==="Science").reduce((s,c)=>s+c.credits,0);
  const hasAlg2     = allIds.some(id=>id==="ALG2");
  const hasBeyondAlg2 = allIds.some(id=>BEYOND_ALG2_IDS.includes(id));
  const hasBio1     = allIds.some(id=>["BIO1_9","BIO1_10"].includes(id));
  const apCredits   = allCourses.filter(c=>c.isAP).reduce((s,c)=>s+c.credits,0);
  const hasStemCap  = allIds.includes("STEM_CAP");

  const CTE_PATHWAYS = {
    "AFNR":           ["AFNR1","SAS","LAS","WBL_ANIMAL","AGRI_BIZ1","AGRI_PROD","AGRI_PROD2"],
    "Business":       ["BIZ1","ENT1","ENT2"],
    "Arts & Media":   ["DIGPHOTO1","DIGDESIGN1","DIGDESIGN2","FILM_FOUND","FILM1"],
    "Engineering":    ["ENG_FOUND","ENG1","ENG2","ENG3"],
    "Health Services":["HLTH_FOUND","ADV_HLTH","THERAPEUTIC"],
    "Culinary Arts":  ["CULINARY1","CULINARY2","CULINARY3"],
    "Computer Science":["CS_FOUND","AP_CSA","AP_CSP"],
    "JROTC":          [],  // JROTC explicitly does NOT count for CTE Honors
  };
  const ctePathwayCounts = {};
  Object.entries(CTE_PATHWAYS).forEach(([pathway, ids]) => {
    const credits = ids.filter(id => allIds.includes(id))
      .reduce((s, id) => { const c = getCourseForId(id); return s + (c?.credits||0); }, 0);
    if (credits > 0) ctePathwayCounts[pathway] = credits;
  });
  // CS Honors requires BOTH AP_CSA AND AP_CSP
  const hasCSHonors = allIds.includes("AP_CSA") && allIds.includes("AP_CSP");
  const hasCTESeq = hasCSHonors ||
    Object.entries(ctePathwayCounts)
      .filter(([k]) => k !== "Computer Science")
      .some(([,v]) => v >= 2);

  const math4Met = mathCredits >= 4 && hasAlg2 && hasBeyondAlg2;
  const sci4Met  = sciCredits >= 4 && hasBio1;

  return {
    academic: {
      math4: { met: math4Met, detail: `${mathCredits.toFixed(1)}/4.0 math credits${hasAlg2?"":", needs Algebra 2"}${hasBeyondAlg2?"":", needs one course beyond Algebra 2"}` },
      sci4:   { met: sci4Met,  detail: `${sciCredits.toFixed(1)}/4.0 science credits${hasBio1?"":", needs Biology 1"}` },
      ap2:    { met: apCredits>=2, detail: `${apCredits.toFixed(1)}/2.0 AP credits` },
    },
    stem: {
      math4:    { met: math4Met,   detail: `${mathCredits.toFixed(1)}/4.0 math credits${hasAlg2?"":", needs Algebra 2"}${hasBeyondAlg2?"":", needs one course beyond Algebra 2"}` },
      sci4:     { met: sci4Met,    detail: `${sciCredits.toFixed(1)}/4.0 science credits${hasBio1?"":", needs Biology 1"}` },
      stem_cap: { met: hasStemCap, detail: hasStemCap ? "STEM Capstone added \u2713" : "Add STEM Capstone (XAT1000) to your plan" },
    },
    cte: {
      cte_seq:  { met: hasCTESeq, detail: hasCTESeq ? "2+ credits in one CTE pathway \u2713" : "Add 2+ courses in the same CTE pathway (CS requires both AP CSP + AP CSA)" },
      cte_perf: { met: false,      detail: "Assessed by teacher \u2014 cannot be tracked here" },
    },
  };
}
