import { GRAD_REQUIREMENTS } from "../data/constants.js";
import { calcPlannerCredits, getCoursesBeforeGrade, getAllCoursesUpTo, getUnmetPrereqs, planAdditionError } from "./plannerRules.js";

export function assessTemplate(plan, getCourse, priorCredits=[]) {
  const errors=[], warnings=[], checked={9:[],10:[],11:[],12:[]};
  for(const grade of [9,10,11,12]) for(const id of plan[grade] || []) {
    const error=planAdditionError(checked,grade,getCourse(id),getCourse);
    if(error)errors.push(`Grade ${grade}: ${id} — ${error}`);
    checked[grade].push(id);
    const unmet=getUnmetPrereqs(id,[...getCoursesBeforeGrade(plan,grade),...priorCredits],[...getAllCoursesUpTo(plan,grade),...priorCredits],getCourse);
    if(unmet.length)warnings.push(`Grade ${grade}: ${getCourse(id)?.name || id} requires ${unmet.map(pid=>getCourse(pid)?.name || pid).join(", ")}`);
  }
  const credits=calcPlannerCredits(plan,getCourse);
  const missing=GRAD_REQUIREMENTS.filter(r=>credits.cats[r.id]<r.required).map(r=>`${r.label}: ${(r.required-credits.cats[r.id]).toFixed(1)} credits`);
  return {...credits,errors,warnings,missing};
}
