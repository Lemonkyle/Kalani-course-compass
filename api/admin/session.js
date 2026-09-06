import { createHmac } from "node:crypto";
import { readAdminConfig, readSession, requireSameOrigin, verifyPassword, equal, createSession, sessionCookie } from "../../server/auth.js";
import { getDatabase } from "../../server/db.js";
import { readJson, respond } from "../../server/http.js";

export default async function handler(req,res) {
  try {
    const config=readAdminConfig();
    if(req.method==="GET") return respond(res,200,{user:readSession(req,config)?config.username:null});
    if(!["POST","DELETE"].includes(req.method)) return respond(res,405,{error:"Method not allowed"});
    requireSameOrigin(req);
    if(req.method==="DELETE") {res.setHeader("Set-Cookie",sessionCookie(req,"",0));return respond(res,200,{ok:true});}
    const body=await readJson(req);
    const ip=String(req.headers["x-vercel-forwarded-for"] || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
    const bucket=createHmac("sha256",config.sessionSecret).update(ip).digest("hex");
    const {data:allowed,error}=await getDatabase().rpc("consume_admin_login_attempt",{bucket_key:bucket});
    if(error) return respond(res,503,{error:"Login is temporarily unavailable. Please try again later."});
    if(!allowed) return respond(res,429,{error:"Too many login attempts. Please try again in 15 minutes."});
    const passwordValid=verifyPassword(body?.password,config.passwordHash);
    if(!passwordValid || !equal(body?.username || "",config.username)) return respond(res,401,{error:"Incorrect username or password."});
    res.setHeader("Set-Cookie",sessionCookie(req,createSession(config)));
    return respond(res,200,{user:config.username});
  } catch(error) {return respond(res,error.status || 503,{error:error.status?error.message:"Login is temporarily unavailable."});}
}
