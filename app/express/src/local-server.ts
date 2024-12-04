import { app } from './app';

const port = process.env.EXPRESS_PORT || 3000;
app
  .on('error', (error) => {
    console.error(error);
    throw error;
  })
  .listen(port, () => {
    console.info(`Express listening on port ${port}`);
  });
