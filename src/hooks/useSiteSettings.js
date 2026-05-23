import { useEffect, useState } from "react";

import { DEFAULT_SITE_SETTINGS, normalizeSiteSettings } from "../data/siteSettings.js";
import { supabase } from "../supabase.js";

export function useSiteSettings() {
  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    async function fetchSiteSettings() {
      if (!supabase) return;

      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value");

      if (!error && data) {
        setSettings(normalizeSiteSettings(data));
      } else if (error) {
        console.error("[Kalani Compass] fetchSiteSettings error:", error.message);
      }
    }

    fetchSiteSettings();
  }, []);

  return { settings };
}
