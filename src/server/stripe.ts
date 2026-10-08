import "server-only";
import Stripe from "stripe";
import { env } from "@/server/env";

const globalForStripe = globalThis as unknown as { __pbStripe?: Stripe };

/** Stripe client. The API version is pinned by the installed SDK, so upgrades are explicit. */
export function stripe(): Stripe {
  globalForStripe.__pbStripe ??= new Stripe(env().STRIPE_SECRET_KEY, {
    maxNetworkRetries: 2,
    timeout: 20_000,
    appInfo: { name: "flowers-and-tulips" },
  });
  return globalForStripe.__pbStripe;
}
