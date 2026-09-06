import { useEffect, useState } from "react";
import { supabase } from "../supabase.js";

// Empty results are valid. Keep the last successful value only when a request fails.
export function usePublicQuery(fetchValue, initialValue) {
  const [data, setData] = useState(initialValue);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    let alive = true, busy = false;
    async function refresh() {
      if (!supabase) { if (alive) setStatus("offline"); return; }
      if (busy) return;
      busy = true;
      try {
        const value = await fetchValue(supabase);
        if (alive) { setData(value); setStatus("ready"); }
      } catch { if (alive) setStatus("offline"); }
      finally { busy = false; }
    }
    refresh();
    const timer = setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    return () => { alive = false; clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, [fetchValue]);
  return { data, status };
}
