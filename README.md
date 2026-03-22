# Kalani-course-compass

## Supabase configuration

Copy `.env.example` to `.env` before running the app:

```bash
cp .env.example .env
```

Then fill in:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

If these variables are missing, the planner will log a warning and fall back to the built-in local catalog data.
