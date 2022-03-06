import dotenv from 'dotenv';
import express from 'express';
import expressWs from 'express-ws';
import { router as apiRouter } from './api/index.js';
import { router as registerRouter } from './auth/api.js';
import passport from './auth/passport.js';
import { assertContentTypeForPostAndPatch } from './lib/assertContentTypeForPostAndPatch.js';
import { logger } from './lib/logger.js';
import { cors } from './utils/cors.js';

dotenv.config();

const { PORT: port = 3000 } = process.env;

const app = express();

// Accepts WS connections
expressWs(app);

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});

app.use(express.json());
app.use(passport.initialize());

app.use(assertContentTypeForPostAndPatch);
app.use(cors);

app.use(registerRouter);
app.use(apiRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid json' });
  }

  logger.error('Error handling route', err);

  return res.status(500).json({ error: 'Internal server error' });
});
