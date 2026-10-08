import type { Testimonial } from "@/types";

const avatar = (id: string, alt: string) => ({
  src: `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=300&h=300&q=80`,
  alt,
});

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote:
      "Our wedding flowers were beyond anything I imagined. Guests are still asking who did them. The team understood our vision from the very first call.",
    name: "Amelia R.",
    context: "Wedding, June",
    avatar: avatar("1494790108377-be9c29b29330", "Portrait of Amelia"),
  },
  {
    id: "t2",
    quote:
      "I've had the Daily Roses subscription for my wife for a year. Every single stem has been perfect, and the little notes make her day.",
    name: "David M.",
    context: "Daily Roses subscriber",
    avatar: avatar("1500648767791-00dcc994a43e", "Portrait of David"),
  },
  {
    id: "t3",
    quote:
      "Ordered at noon for my mom's birthday, delivered by four. The bouquet looked even better than the photo. Truly a luxury experience.",
    name: "Priya S.",
    context: "Same-day birthday order",
    avatar: avatar("1544005313-94ddf0286df2", "Portrait of Priya"),
  },
  {
    id: "t4",
    quote:
      "They handle our lobby florals every week. Always on time, always on brand. Clients comment on them constantly.",
    name: "Jordan K.",
    context: "Corporate client",
    avatar: avatar("1507003211169-0a1dd7228f2d", "Portrait of Jordan"),
  },
];
