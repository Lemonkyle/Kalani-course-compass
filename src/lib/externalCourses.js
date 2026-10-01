import { safeExternalUrl } from './url.js';

export const EXTERNAL_CATEGORIES = {
  English: ['English', 'english'], Mathematics: ['Mathematics', 'math'],
  Science: ['Science', 'science'], 'Social Studies': ['Social Studies', 'ss'],
  'World Language': ['World Language', 'wlfa'], 'Fine Arts': ['Fine Arts', 'wlfa'],
  CTE: ['CTE', 'wlfa'], 'Physical Education': ['Health & PE', 'pe'],
  Health: ['Health & PE', 'health'], Electives: ['Miscellaneous', 'electives'],
};
export const isPendingExternal = c => c?.isExternal && c.verification !== 'confirmed';
export const emptyExternalForm = (source = 'HOC', program = '') => ({name:'', source, program, code:'', notes:'', url:'', category:'', credits:'', language:'', ctePath:'', confirmed:false});
export function externalForm(course) {
  return {...emptyExternalForm(), ...course.externalDraft, name:course.name,
    source:course.source || 'Other / Transfer', confirmed:course.verification === 'confirmed'};
}
export function buildExternalCourse(form, id) {
  if (!form.name?.trim()) throw new Error('Enter a course name.');
  if (!['HOC','Dual Credit','Other / Transfer'].includes(form.source)) throw new Error('Choose a program source.');
  if (form.url?.trim() && !safeExternalUrl(form.url)) throw new Error('Use a complete http or https information link.');
  const mapping = EXTERNAL_CATEGORIES[form.category];
  const credits = Number(form.credits);
  if (form.confirmed && (!mapping || form.credits === '' || !Number.isFinite(credits) || credits <= 0 || credits > 14))
    throw new Error('Enter the confirmed high-school category and credits (greater than 0, up to 14).');
  if (form.confirmed && form.category === 'World Language' && !form.language?.trim()) throw new Error('Record the confirmed language.');
  if (form.confirmed && form.category === 'CTE' && !form.ctePath?.trim()) throw new Error('Record the confirmed CTE pathway.');
  return {id, name:form.name.trim(), isCustom:true, isExternal:true, source:form.source,
    verification:form.confirmed ? 'confirmed' : 'unverified', externalDraft:{...form},
    dept:form.confirmed ? mapping[0] : '', credits:form.confirmed ? credits : 0,
    gradCategory:form.confirmed ? mapping[1] : null, gradCredits:form.confirmed ? credits : 0,
    language:form.confirmed ? form.language.trim() : '', ctePath:form.confirmed ? form.ctePath.trim() : '',
    gradeLevel:[9,10,11,12], prereqs:[], concurrentOk:[], repeatable:false, isAP:false,
    code:form.code || '', desc:form.notes || '', url:safeExternalUrl(form.url) || '',
  };
}
// Preserve legacy entries and their original values for review; never infer school approval.
export function migrateExternalCourses(courses) {
  return courses.map(c => c.isExternal ? c : {
    ...buildExternalCourse({...emptyExternalForm('Other / Transfer'), name:c.name.trim() || 'Saved external course',
      credits:c.credits, category:Object.keys(EXTERNAL_CATEGORIES).find(k => EXTERNAL_CATEGORIES[k][0] === c.dept) || '',
      language:c.language || '', ctePath:c.ctePath || '', code:c.code || '', notes:c.desc || ''}, c.id),
    legacyOriginal:c,
  });
}
