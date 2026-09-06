import { usePublicQuery } from "./usePublicQuery.js";
async function fetchAnnouncements(db) {
  const now=new Date().toISOString();
  const {data,error}=await db.from("announcements").select("*").eq("visible",true).or('starts_at.is.null,starts_at.lte.'+now).or('ends_at.is.null,ends_at.gt.'+now).order("created_at",{ascending:false});
  if(error) throw error; return data;
}
export function useAnnouncements(){const {data,status}=usePublicQuery(fetchAnnouncements,[]);return {announcements:status==="ready"?data.filter(a=>!a.ends_at||Date.parse(a.ends_at)>Date.now()):[]};}
