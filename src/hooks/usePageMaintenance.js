import { usePublicQuery } from "./usePublicQuery.js";
const DEFAULT = {home:false,catalog:false,match:true,planner:false};
async function fetchMaintenance(db) {
  const {data,error}=await db.from("page_maintenance").select("page_id,enabled");
  if (error) throw error;
  const next={...DEFAULT};
  data.forEach(row=>{if(Object.hasOwn(next,row.page_id)) next[row.page_id]=row.enabled===true;});
  return next;
}
export function usePageMaintenance(){const {data,status}=usePublicQuery(fetchMaintenance,DEFAULT);return {maintenance:status==="ready"?data:{...data,match:true}};}
