import type { FaqItem, SubscriptionPlan } from "@/types";
import { images } from "./media";

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "daily-roses",
    name: "Daily Roses",
    frequency: "A fresh rose, every day",
    price: 149,
    priceUnit: "per month",
    summary: "A single perfect long-stem rose delivered each morning, with a bud vase on day one.",
    includes: [
      "One premium long-stem rose daily (Mon–Sat)",
      "Choice of red, blush, ivory or florist's pick",
      "Keepsake crystal bud vase with first delivery",
      "Weekly handwritten note card",
      "Pause or skip anytime",
    ],
    image: images.singleRose,
    highlighted: true,
  },
  {
    id: "weekly-fresh",
    name: "Weekly Fresh",
    frequency: "A seasonal bouquet, every week",
    price: 65,
    priceUnit: "per delivery",
    summary: "A florist-designed seasonal bouquet each week, ready to drop into a vase.",
    includes: [
      "Designer's-choice seasonal bouquet",
      "Delivered the same day each week",
      "Flower food & care card",
      "Free delivery within our zone",
      "Skip, pause or gift a week",
    ],
    image: images.windowVase,
  },
  {
    id: "monthly-signature",
    name: "Monthly Signature",
    frequency: "A statement arrangement, monthly",
    price: 125,
    priceUnit: "per delivery",
    summary: "A lavish, vased signature arrangement each month, designed around the season.",
    includes: [
      "Showpiece arrangement in a vessel",
      "Exclusive seasonal designs",
      "Vessel swap service available",
      "Priority holiday delivery",
      "10% off all shop orders",
    ],
    image: images.mantelArrangement,
  },
];

export const comparisonRows: { label: string; values: Record<SubscriptionPlan["id"], string | boolean> }[] = [
  { label: "Delivery frequency", values: { "daily-roses": "Daily (Mon–Sat)", "weekly-fresh": "Weekly", "monthly-signature": "Monthly" } },
  { label: "Arrangement style", values: { "daily-roses": "Single long-stem rose", "weekly-fresh": "Hand-tied bouquet", "monthly-signature": "Vased showpiece" } },
  { label: "Vase included", values: { "daily-roses": "Crystal bud vase", "weekly-fresh": false, "monthly-signature": true } },
  { label: "Handwritten notes", values: { "daily-roses": "Weekly", "weekly-fresh": "On request", "monthly-signature": "Every delivery" } },
  { label: "Free delivery", values: { "daily-roses": true, "weekly-fresh": true, "monthly-signature": true } },
  { label: "Shop discount", values: { "daily-roses": "5%", "weekly-fresh": "5%", "monthly-signature": "10%" } },
  { label: "Pause or skip anytime", values: { "daily-roses": true, "weekly-fresh": true, "monthly-signature": true } },
];

export const subscriptionFaqs: FaqItem[] = [
  { q: "When do deliveries arrive?", a: "Daily Roses arrive between 8 and 11 am. Weekly and monthly deliveries arrive on your chosen day between 9 am and 5 pm." },
  { q: "Can I send a subscription as a gift?", a: "Yes. Choose a 1, 3, 6 or 12-month gift term at checkout and we'll include a welcome card with your message in the first delivery." },
  { q: "How do I pause or cancel?", a: "Contact us at least 48 hours before your next delivery and we'll pause, skip or cancel. No fees, no fuss." },
  { q: "What if nobody is home?", a: "Our drivers leave flowers in a shaded, secure spot with a hydration pack, or with a neighbor or front desk if you prefer." },
  { q: "Do you deliver outside the city?", a: "Subscriptions currently deliver within our local delivery zone. Contact us and we'll confirm your address." },
];

export const generalFaqs: FaqItem[] = [
  { q: "Do you offer same-day delivery?", a: "Yes. Order before the same-day cutoff and we'll hand-deliver locally that afternoon." },
  { q: "How fresh are your flowers?", a: "We buy fresh from growers and markets several times a week and design every order on the day it ships. If a stem disappoints, we'll replace it." },
];
