import test from 'node:test';
import assert from 'node:assert/strict';
import { checkSupabase } from '../scripts/check-supabase.mjs';

const env = { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_PUBLIC_KEY: 'sb_publishable_test' };
test('keep-alive queries an actual public course with a read-only GET', async () => {
  assert.match(await checkSupabase(env, async (url, options) => {
    assert.equal(url.pathname, '/rest/v1/courses');
    assert.equal(url.searchParams.get('limit'), '1');
    assert.equal(url.searchParams.get('select'), 'id');
    assert.equal(options.method ?? 'GET', 'GET');
    assert.equal(options.headers.apikey, env.SUPABASE_PUBLIC_KEY);
    return new Response(JSON.stringify([{ id: 'ELA1' }]));
  }), /succeeded/);
});
test('HTTP errors cannot report a successful keep-alive', async () => {
  await assert.rejects(checkSupabase(env, async () => new Response('{}', { status: 404 })), /HTTP 404/);
});
test('empty or invalid data cannot report a healthy public catalog', async () => {
  for (const body of ['[]', '{}', '[{}]', '<html>error</html>']) {
    await assert.rejects(checkSupabase(env, async () => new Response(body)));
  }
});
test('missing configuration and privileged keys fail before any request', async () => {
  const request = () => { throw new Error('Must not request'); };
  await assert.rejects(checkSupabase({}, request), /Configure/);
  const jwt = `header.${Buffer.from(JSON.stringify({role:'service_role'})).toString('base64url')}.signature`;
  await assert.rejects(checkSupabase({...env, SUPABASE_PUBLIC_KEY:jwt}, request), /not a privileged key/);
});
