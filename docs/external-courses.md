# External course planning

Courses has three source-level views: Kalani on-campus, HOC, and Dual Credit.
HOC and Dual Credit are program introductions, not course catalogs or registration services.
Sources reviewed 2026-09-30:
- https://sites.google.com/k12.hi.us/hoc
- https://sites.google.com/k12.hi.us/kalanicounselorscorner/dual-credit

Program introductions are maintained in src/components/course/ExternalPrograms.jsx.
No external program placeholder is added to the Supabase courses table.

Student entries retain the existing kalani-custom-courses localStorage key and CUSTOM_ IDs.
They remain local; no backend write or student authentication is introduced.
Unverified records retain optional draft information separately from zero counted credit and no graduation category.
Explicit student confirmation requires a category and positive high-school credit amount.
Confirmed records contribute to the selected graduation category (normal overflow rules apply),
including same-language / same-CTE-pathway grouping. This is a student record, not school-issued approval.
No automatic college-to-high-school conversion, prerequisite equivalency, or Honors recognition is inferred.
Pending entries do not reserve schedule capacity. The existing 14-credit guard applies on confirmation.
Editing a form field clears confirmation so changed academic details must be reconfirmed.

Legacy custom courses retain their IDs and original record under legacyOriginal and become unverified.
This can lower displayed progress until the student reviews and confirms the saved draft values.
Students can edit or revoke confirmation without deleting the entry.

Validation: npm test; npm run build; browser flow for program navigation, pending add,
confirmation, reload persistence, revocation, and credit total changes.

## Interface refinement

Each external source has one overview card and a list of the student's saved courses.
The form shows only name, source, grade (on creation), and credit confirmation fields.
Existing optional metadata is retained for compatibility but is not shown in the form.
Pending credit warnings expand from a triangle on card hover, keyboard focus, or tap.
Courses-page edits update the same record used by the planner. Deletion there removes
both the saved record and all planner references after an inline confirmation.
Removing a course only from the planner retains its saved course record.
