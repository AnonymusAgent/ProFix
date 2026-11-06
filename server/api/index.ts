/**
 * Vercel serverless entry point.
 * All /api/* traffic in the server/ project is rewritten here
 * (see server/vercel.json); the Express app handles the rest.
 */
import app from '../src/index.js';

export default app;
