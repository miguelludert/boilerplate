import express, { Request, Response } from 'express';
import { userRouter } from './routers/users';

const app = express();

app.get('/', (req: Request, res: Response<any>) => {
  res.send('OK');
});
app.get('/health', (req: Request, res: Response<any>) => {
  res.send('OK');
});

// error handling
// add jwt middle ware

app.use('/users', userRouter);

app.use((req: Request, res: Response<any>) => {
  console.info(req);
});

export { app };
