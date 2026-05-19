// Default disclaimer content shown when Supabase is unavailable.

export const DEFAULT_DISCLAIMER_ITEMS = [
  { id:"primary-source", icon:"📚", label:"Primary Source", text:"Kalani High School 2026-2027 Registration Guide & Course Catalog. All course names, codes, credit values, grade levels, and prerequisite chains are derived from this document.", sortOrder:10, visible:true },
  { id:"graduation-requirements", icon:"🎓", label:"Graduation Requirements", text:"Hawaii Department of Education Graduation Requirements, effective July 2023. Credit minimums and subject-area breakdowns follow this policy document.", sortOrder:20, visible:true },
  { id:"planning-reference", icon:"⚠️", label:"Planning Reference Only", text:"Kalani Compass is an unofficial planning tool. It is not affiliated with Kalani High School or the Hawaii DOE. Always confirm your 4-year plan with your school counselor before submitting your registration card.", sortOrder:30, visible:true },
  { id:"plan-privacy", icon:"💾", label:"Your Plan & Privacy", text:"Your 4-year plan is saved in your browser's local storage and is never uploaded to any server or shared with anyone. However, your plan is tied to this specific browser and device — switching to a different device will reset your plan. We recommend using your private device.", sortOrder:40, visible:true },
  { id:"last-data-update", icon:"🔄", label:"Last Data Update", text:"Course catalog last reviewed: March 2026. Based on the 2026-2027 Kalani High School Course Catalog.", sortOrder:50, visible:true },
];
