import type { TeamMember } from "@/types";

const portrait = (id: string, alt: string) => ({
  src: `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&h=1100&q=80`,
  alt,
});

export const team: TeamMember[] = [
  { name: "Isabelle Laurent", role: "Founder & Creative Director", bio: "Trained in Paris and London, Isabelle opened the studio to bring a painterly, garden-gathered style to the city.", photo: portrait("1580489944761-15a19d654956", "Isabelle, founder, smiling in the studio") },
  { name: "Maya Chen", role: "Lead Event Designer", bio: "Maya has designed more than 300 weddings and loves an ambitious ceremony arch.", photo: portrait("1534528741775-53994a69daeb", "Maya, lead event designer") },
  { name: "Grace Adeyemi", role: "Senior Florist", bio: "Grace runs the morning design bench and has an eye for unexpected color pairings.", photo: portrait("1531123897727-8f129e1688ce", "Grace, senior florist") },
  { name: "Lucía Romero", role: "Studio & Delivery Manager", bio: "Lucía makes sure every bouquet arrives on time, hydrated and perfect.", photo: portrait("1573496359142-b8d87734a5a2", "Lucía, studio and delivery manager") },
];
