import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import { join } from "path";

dotenv.config({ path: join(__dirname, "../../.env") });

const {
  API_ENDPOINT,
  COGNITO_USER_POOL_ID,
  COGNITO_CLIENT_ID,
  COGNITO_CLIENT_SECRET,
} = process.env;

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      watch: {},
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      watch: {},
    },
  },
  renderer: {
    server: {
      hmr: true,
    },
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src"),
      },
    },
    plugins: [react()],
    define: {
      "import.meta.env.VITE_API_ENDPOINT": JSON.stringify(API_ENDPOINT),
      "import.meta.env.VITE_COGNITO_USER_POOL_ID":
        JSON.stringify(COGNITO_USER_POOL_ID),
      "import.meta.env.VITE_COGNITO_CLIENT_ID":
        JSON.stringify(COGNITO_CLIENT_ID),
      "import.meta.env.VITE_COGNITO_CLIENT_SECRET": JSON.stringify(
        COGNITO_CLIENT_SECRET,
      ),
    },
  },
});
