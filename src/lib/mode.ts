/**
 * Frontend-only (demo) mode: no database, no payments. Products come from src/data, the bag
 * lives in the browser and checkout shows a demo confirmation.
 *
 * Set at build time by next.config.ts: on when NEXT_PUBLIC_FRONTEND_ONLY=1, or automatically
 * when DATABASE_URL is missing. Add DATABASE_URL (and Stripe keys) to switch the real backend on.
 */
export const FRONTEND_ONLY = process.env.NEXT_PUBLIC_FRONTEND_ONLY === "1";
