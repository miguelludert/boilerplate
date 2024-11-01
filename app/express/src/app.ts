import express, { Request, Response } from 'express';
import { userRouter } from './routers/users';

const app = express();

app.get('/health', (req: Request, res: Response<any>) => {
  res.send('OK');
});

// add jwt middle ware

app.use('/users', userRouter);

export { app };
