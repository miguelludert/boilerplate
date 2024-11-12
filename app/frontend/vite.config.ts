import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../../.env') });

const {
  HOSTNAME,
  FRONTEND_PORT,
  EXPRESS_PORT,
  COGNITO_USER_POOL_ID,
  COGNITO_CLIENT_ID,
  COGNITO_CLIENT_SECRET,
} = process.env;

export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(FRONTEND_PORT!),
  },
  define: {
    'import.meta.env.VITE_API_ENDPOINT': JSON.stringify(
      `http://${HOSTNAME}:${EXPRESS_PORT}/api`
    ),
    'import.meta.env.VITE_COGNITO_USER_POOL_ID':
      JSON.stringify(COGNITO_USER_POOL_ID),
    'import.meta.env.VITE_COGNITO_CLIENT_ID': JSON.stringify(COGNITO_CLIENT_ID),
    'import.meta.env.VITE_COGNITO_CLIENT_SECRET': JSON.stringify(
      COGNITO_CLIENT_SECRET
    ),
  },
});
