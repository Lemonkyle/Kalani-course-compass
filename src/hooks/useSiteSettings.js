import { DEFAULT_SITE_SETTINGS,normalizeSiteSettings } from "../data/siteSettings.js";
import { usePublicQuery } from "./usePublicQuery.js";
async function fetchSettings(db){const {data,error}=await db.from("site_settings").select("key,value");if(error)throw error;return normalizeSiteSettings(data);}
export function useSiteSettings(){const {data:settings}=usePublicQuery(fetchSettings,DEFAULT_SITE_SETTINGS);return {settings};}
