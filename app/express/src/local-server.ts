import { app } from './app';

(async () => {
  const port = 3000;
  await app.listen(port);
  console.info(`Express listening on port ${port}`);
})();
