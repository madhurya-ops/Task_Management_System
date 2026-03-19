import { env } from './config/env';
import { app } from './app';

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API running on port ${env.PORT}`);
});
