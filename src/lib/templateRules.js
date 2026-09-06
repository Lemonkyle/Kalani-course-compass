import { GRAD_REQUIREMENTS } from "../data/constants.js";
import { calcPlannerCredits, planAdditionError, planAdditionWarnings } from "./plannerRules.js";

export function assessTemplate(plan, getCourse, priorCredits=[]) {
  const errors=[], warnings=[], checked={9:[],10:[],11:[],12:[]};
  for(const grade of [9,10,11,12]) for(const id of plan[grade] || []) {
    const error=planAdditionError(checked,grade,getCourse(id),getCourse);
    if(error)errors.push(`Grade ${grade}: ${id} — ${error}`);
    // Use the full year for concurrent prerequisites, but exclude this entry
    // when previewing its addition so credits are not counted twice.
    const withoutCourse={...plan,[grade]:(plan[grade] || []).filter((_,index)=>index!==checked[grade].length)};
    for(const warning of planAdditionWarnings(withoutCourse,grade,getCourse(id),getCourse,priorCredits)) {
      if(!warnings.includes(warning.message)) warnings.push(warning.message);
    }
    checked[grade].push(id);
  }
  const credits=calcPlannerCredits(plan,getCourse);
  const missing=GRAD_REQUIREMENTS.filter(r=>credits.cats[r.id]<r.required).map(r=>`${r.label}: ${(r.required-credits.cats[r.id]).toFixed(1)} credits`);
  return {...credits,errors,warnings,missing};
}
