import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

function createNoopQueryBuilder(table) {
  let operation = 'read';

  const getMessage = () => {
    if (operation === 'read') return `[Kalani Compass] Supabase is not configured, cannot read from "${table}".`;
    if (operation === 'write') return `[Kalani Compass] Supabase is not configured, cannot write to "${table}".`;
    return `[Kalani Compass] Supabase is not configured, cannot delete from "${table}".`;
  };

  const result = () => ({
    data: null,
    error: new Error(getMessage()),
  });

  const builder = new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === 'then') return (resolve, reject) => Promise.resolve(result()).then(resolve, reject);
        if (prop === 'catch') return (reject) => Promise.resolve(result()).catch(reject);
        if (prop === 'finally') return (handler) => Promise.resolve(result()).finally(handler);

        return (..._args) => {
          if (prop === 'insert' || prop === 'update' || prop === 'upsert') operation = 'write';
          if (prop === 'delete') operation = 'delete';
          return builder;
        };
      },
    }
  );

  return builder;
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      from(table) {
        if (typeof window !== 'undefined') {
          console.warn(
            '[Kalani Compass] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY; falling back to local data where available.'
          );
        }
        return createNoopQueryBuilder(table);
      },
    };
