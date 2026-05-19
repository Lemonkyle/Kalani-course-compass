// Static data split by responsibility for easier maintenance.

export const DEFAULT_PLAN = {
  9:  ["GEO","ELA1","PID","MHH","ISCI","PE_LF","HEALTH","TRANS_HS"],
  10: ["ALG1","ELA2","USH","BIO1_10","PE_LA","JPN1"],
  11: ["ALG2","ELA3","WH","HCHEM","JPN2","PTP"],
  12: ["TRIG","ELA4","ECON","PSYCH","MARINE"],
};

export const PREREQ_EQUIV = {
  "BIO1_10": ["BIO1_9"],
  "BIO1_9":  ["BIO1_10"],
  "CHEM":    ["HCHEM"],
  "USH":     ["AP_USH"],
  "WH":      ["AP_WH"],
  "ELA3":    ["AP_ENG3"],
  "JPN2":    ["JPN2H"],
  "JPN3":    ["JPN3H"],
};

export const HONORS_DEFS = [
  {
    id: "academic",
    label: "Academic Honors",
    color: "#7C3AED",
    icon: "\ud83c\udf96",
    description: "Cumulative GPA 3.500+ required",
    checks: [
      { id:"math4", label:"4 credits Math (Algebra 2 + one beyond)", desc:"Algebra 2 + one of: Trig/PreCal, Alg3/Stats, Calculus, AP Calculus, AP Stats, AP CS A, AP CS Principles, Intro to College Math" },
      { id:"sci4",  label:"4 credits Science (incl. Biology 1)",     desc:"Biology 1 + 3 other science credits" },
      { id:"ap2",   label:"2+ AP/IB/Running Start credits",          desc:"At least 2 credits from AP, IB, or Running Start courses" },
    ],
  },
  {
    id: "stem",
    label: "STEM Honors",
    color: "#0891B2",
    icon: "\ud83d\udd2c",
    description: "Cumulative GPA 3.500+ required",
    checks: [
      { id:"math4",    label:"4 credits Math (Algebra 2 + one beyond)", desc:"Same math requirement as Academic Honors" },
      { id:"sci4",     label:"4 credits Science (incl. Biology 1)",     desc:"Same science requirement as Academic Honors" },
      { id:"stem_cap", label:"STEM Capstone Project (XAT1000)",         desc:"Successful completion of STEM Capstone. Required for class of 2016 and beyond." },
    ],
  },
  {
    id: "cte",
    label: "CTE Honors",
    color: "#B00804",
    icon: "\ud83d\udee0",
    description: "Cumulative GPA 3.0+ required",
    checks: [
      { id:"cte_seq",  label:"Complete 2–3 course CTE pathway sequence", desc:"2-3 courses in the same approved CTE pathway with B or better in each. \u26a0\ufe0f Computer Science pathway requires BOTH AP CSP AND AP CSA. JROTC courses do NOT count toward CTE Honors." },
      { id:"cte_perf", label:"Meet/exceed proficiency on performance assessment", desc:"Assessed per program of study by teacher — cannot be tracked here." },
    ],
  },
];

export const BEYOND_ALG2_IDS = ["TRIG","ALG3","CALC","AP_CALC","AP_STATS","AP_CSA","AP_CSP","ICMATH"];


// ── Course Match Templates ───────────────────────────────────────────────────
// Fixed curated 4-year plans. Each has a plan object with grade keys 9-12.
