import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import { join } from "path";

const suffix = process.env.SUFFIX ?? "";

function assertEnvVar(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(
      `Environment variable ${name} is required but missing or empty.`
    );
  }
  return value;
}

dotenv.config({ path: join(__dirname, `../../.env${suffix}`) });
assertEnvVar("STAGE");
console.info("STAGE", process.env.STAGE);
assertEnvVar("API_ENDPOINT");
console.info("API_ENDPOINT", process.env.API_ENDPOINT);

const { LOCAL_FRONTEND_PORT, API_ENDPOINT } = process.env;

export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(LOCAL_FRONTEND_PORT!),
  },
  define: {
    "import.meta.env.VITE_API_ENDPOINT": JSON.stringify(API_ENDPOINT),
  },
});
