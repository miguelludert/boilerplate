import lambdaExpress from 'lambda-express';
import { app } from './app';
export const handler = lambdaExpress.appHandler(app);
