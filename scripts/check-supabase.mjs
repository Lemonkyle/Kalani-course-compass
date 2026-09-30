import { pathToFileURL } from 'node:url';

// Use only the browser's publishable / anon key, never a service-role key.
export async function checkSupabase(env = process.env, request = fetch) {
  const key = env.SUPABASE_PUBLIC_KEY;
  if (!env.SUPABASE_URL || !key) throw new Error('Configure SUPABASE_URL and SUPABASE_PUBLIC_KEY in GitHub Actions repository variables.');
  if (!key.startsWith('sb_publishable_')) {
    let role;
    try { role = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role; } catch {}
    if (role !== 'anon') throw new Error('Use a browser-safe publishable or anon key, not a privileged key.');
  }
  const url = new URL('/rest/v1/courses', env.SUPABASE_URL);
  if (url.protocol !== 'https:') throw new Error('SUPABASE_URL must use HTTPS.');
  url.search = new URLSearchParams({ select: 'id', limit: '1' }).toString();
  const response = await request(url, {
    headers: { apikey: key, Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`Public course query failed (HTTP ${response.status}). Check project status, API key and public read permissions.`);
  const rows = await response.json();
  if (!Array.isArray(rows) || rows.length !== 1 || typeof rows[0]?.id !== 'string' || !rows[0].id) {
    throw new Error('Expected one public course ID. Check course data and public read permissions.');
  }
  return 'Public course database query succeeded.';
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try { console.log(await checkSupabase()); break; }
    catch (error) {
      console.error(`Attempt ${attempt}/3: ${error.message}`);
      if (attempt === 3) process.exitCode = 1;
      else await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}
