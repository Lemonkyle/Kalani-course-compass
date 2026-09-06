import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { adminDevPlugin } from "./server/devPlugin.js";

export default defineConfig(({mode,command}) => {
  if (command === "serve") {
    const env=loadEnv(mode,process.cwd(),"");
    for(const key of ["ADMIN_USERNAME","ADMIN_PASSWORD_HASH","ADMIN_SESSION_SECRET","SUPABASE_SERVICE_ROLE_KEY","SUPABASE_URL","VITE_SUPABASE_URL"]) {
      if(env[key])process.env[key]=env[key];
    }
  }
  return {
  plugins: [react(), adminDevPlugin()],
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("react")) return "react-vendor";
        },
      },
    },
  },
  };
});
