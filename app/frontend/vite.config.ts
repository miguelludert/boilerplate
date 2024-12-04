import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../../.env') });

const {
  FRONTEND_PORT,
  API_ENDPOINT,
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
    'import.meta.env.VITE_API_ENDPOINT': JSON.stringify(API_ENDPOINT),
    'import.meta.env.VITE_COGNITO_USER_POOL_ID':
      JSON.stringify(COGNITO_USER_POOL_ID),
    'import.meta.env.VITE_COGNITO_CLIENT_ID': JSON.stringify(COGNITO_CLIENT_ID),
    'import.meta.env.VITE_COGNITO_CLIENT_SECRET': JSON.stringify(
      COGNITO_CLIENT_SECRET
    ),
  },
});
