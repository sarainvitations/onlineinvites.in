import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { securityHeaders } from "./server/security.ts";
export default defineConfig({
  plugins: [react()],
  preview: { headers: securityHeaders },
});
