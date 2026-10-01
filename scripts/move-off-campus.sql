-- Idempotent catalog data update. Course identity, credit and eligibility stay unchanged.
UPDATE public.courses
SET dept = 'Miscellaneous', misc_type = 'Off Campus'
WHERE id = 'OFF_CAMPUS' AND dept IN ('Off Campus', 'Miscellaneous');
