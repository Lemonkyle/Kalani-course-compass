import sessionHandler from "../api/admin/session.js";
import dataHandler from "../api/admin/data.js";

export function adminDevPlugin() {
  return {name:"kalani-admin-api",apply:"serve",configureServer(server) {
    server.middlewares.use((req,res,next)=>{
      const path=(req.url || "").split("?")[0];
      const handler=path==="/api/admin/session"?sessionHandler:path==="/api/admin/data"?dataHandler:null;
      if(handler) void handler(req,res);
      else if(path.startsWith("/api/")){res.statusCode=404;res.end("Not found");}
      else next();
    });
  }};
}
