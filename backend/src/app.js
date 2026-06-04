import express from 'express';
import apiRouter from './routes/index.js';

const app = express();

// Body Parser Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Decoupled Access-Control (CORS) Configuration
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Register Unified Clinical API router
app.use('/api', apiRouter);

export default app;
