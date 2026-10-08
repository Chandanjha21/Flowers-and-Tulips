/**
 * Single source of truth for the business identity.
 * Change these values to rebrand the whole site for a different florist.
 */
export const site = {
  name: "Flowers and Tulips",
  shortName: "Flowers and Tulips",
  tagline: "Floral Studio & Event Design",
  description:
    "Hand-tied bouquets, luxury arrangements, wedding and event florals, custom designs and daily rose subscriptions, delivered same day across Placeholder City.",
  url: "https://flowersandtulips.example.com",
  established: 2014,
  phone: "(555) 012-3456",
  phoneHref: "tel:+15550123456",
  email: "hello@flowersandtulips.example.com",
  address: {
    street: "123 Blossom Avenue",
    city: "Placeholder City",
    region: "CA",
    postalCode: "90000",
    country: "US",
  },
  geo: { lat: 40.777876, lng: -74.0230236 },
  /** Google Maps listing for the studio. */
  mapsUrl: "https://www.google.com/maps/place/Flowers+and+Tulips/@40.777876,-74.0230236,17z/data=!3m1!4b1!4m6!3m5!1s0x89c25823cb87aaab:0x51e9601ff9e53ede!8m2!3d40.777876!4d-74.0230236!16s%2Fg%2F11fk0s7kgd",
  hours: [
    { days: "Monday – Friday", time: "8:00 am – 7:00 pm", schema: "Mo-Fr 08:00-19:00" },
    { days: "Saturday", time: "9:00 am – 6:00 pm", schema: "Sa 09:00-18:00" },
    { days: "Sunday", time: "10:00 am – 4:00 pm", schema: "Su 10:00-16:00" },
  ],
  sameDayCutoff: "2:00 pm",
  /** Business rules enforced by the server (see src/server/services/delivery.ts). */
  timeZone: "America/New_York",
  sameDayCutoffHour: 14,
  maxDaysAhead: 90,
  currency: "usd",
  /** Dollars, for display. The server converts to cents. */
  freeDeliveryOver: 100,
  deliveryFee: 15,
  social: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    pinterest: "https://pinterest.com/",
  },
} as const;

export type Site = typeof site;
