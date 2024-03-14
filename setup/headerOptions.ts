import express from 'express';

/**
 * Request headers
 */
export default async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Accept, Authorization',
  );
  res.header('Content-Type', 'application/json');
  res.header('Connection', 'keep-alive');
  res.header('Keep-Alive', 'timeout=200');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  } else {
    next();
  }
};
