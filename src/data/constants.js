// Static data split by responsibility for easier maintenance.

export const DEPT_ORDER = [
  "English","Social Studies","Mathematics","Science",
  "Health & PE","CTE","World Language","Fine Arts","Miscellaneous","Off Campus"
];

export const GRAD_REQUIREMENTS = [
  { id:"english",  label:"English",           required:4.0, color:"#C84B31",
    breakdown:["ELA 1 (1.0)","ELA 2 (1.0)","ELA 3 or AP English 3 (1.0)","ELA 4 or AP English 4 (1.0)"] },
  { id:"ss",       label:"Social Studies",    required:4.0, color:"#7C3AED",
    breakdown:["Participation in Democracy (0.5)","Modern History of Hawaiʻi (0.5)","US History/Gov (1.0)","World History (1.0)","Grade 12 SS elective (1.0)"] },
  { id:"math",     label:"Mathematics",       required:3.0, color:"#059669",
    breakdown:["Geometry (1.0)","Algebra 1 (1.0)","Algebra 2 or other math elective (1.0)"] },
  { id:"science",  label:"Science",           required:3.0, color:"#D97706",
    breakdown:["Biology 1 (1.0)","Science electives (2.0)"] },
  { id:"wlfa",     label:"World Lang / Fine Arts / CTE", required:2.0, color:"#0891B2",
    breakdown:["2 credits in the same world language, Fine Arts, or one CTE pathway sequence"] },
  { id:"pe",       label:"Physical Education",required:1.0, color:"#10B981",
    breakdown:["PE Lifetime Fitness (0.5) — required","PE Lifetime Activities (0.5) — required"] },
  { id:"health",   label:"Health",            required:0.5, color:"#EC4899",
    breakdown:["Health Today & Tomorrow (0.5)"] },
  { id:"ptp",      label:"Personal Transition Plan",required:0.5, color:"#84CC16",
    breakdown:["Personal Transition Plan (0.5)"] },
  { id:"electives",label:"Electives",         required:6.0, color:"#F97316",
    breakdown:["Any subject area — overflow from subject buckets also counts (6.0 credits)"] },
];

export const DEPTS = [
  "All","English","Social Studies","Mathematics","Science",
  "Health & PE","CTE","World Language","Fine Arts","Miscellaneous","Off Campus"
];

export const CTE_PATHS = ["All CTE","AFNR","Business","Arts & Media","Engineering","Health Services","Culinary Arts","Computer Science","JROTC"];

export const FINE_ARTS_TYPES = ["All Fine Arts","Performing","Visual"];

export const MISC_TYPES = ["All Miscellaneous","General","Journalism","ESOL"];

export const DEPT_COLORS = {
  "English":"#C84B31","Social Studies":"#7C3AED","Mathematics":"#059669",
  "Science":"#D97706","Health & PE":"#0891B2","CTE":"#B00804",
  "World Language":"#0284C7","Fine Arts":"#DB2777",
  "Miscellaneous":"#6B7280","Off Campus":"#475569",
};
