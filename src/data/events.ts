import type { EventService, GalleryItem } from "@/types";
import { images } from "./media";

export const eventServices: EventService[] = [
  {
    id: "weddings",
    eyebrow: "Weddings & Engagements",
    title: "Florals for the day you will always remember",
    description:
      "From the first consultation to the last petal on the dance floor, we design bridal bouquets, ceremony arches, aisle florals and reception tablescapes that feel entirely yours.",
    bullets: ["Bridal & bridesmaid bouquets", "Ceremony arches and aisle design", "Reception centerpieces & cake flowers", "Boutonnieres, corsages & flower crowns"],
    images: [images.bridePastel, images.aisle, images.receptionTable],
  },
  {
    id: "corporate",
    eyebrow: "Corporate & Hospitality",
    title: "Refined florals that represent your brand",
    description:
      "Weekly lobby installations, gala centerpieces, product launches and client gifting, delivered on time and designed to your brand palette.",
    bullets: ["Weekly lobby & reception florals", "Gala and conference centerpieces", "Branded client gift programs", "Restaurant & hotel contracts"],
    images: [images.corporateLobby, images.corporateTable, images.officeTeam],
  },
  {
    id: "celebrations",
    eyebrow: "Celebrations",
    title: "Birthdays, showers, graduations & every milestone",
    description:
      "Statement installations, flower walls, balloon-and-bloom moments and table florals for parties large and small.",
    bullets: ["Baby & bridal showers", "Milestone birthdays", "Graduation parties", "Holiday dinners and seasonal décor"],
    images: [images.toast, images.balloons, images.weddingCake],
  },
  {
    id: "sympathy",
    eyebrow: "Sympathy & Remembrance",
    title: "Gentle tributes, arranged with care",
    description:
      "Standing sprays, casket pieces, service arrangements and home deliveries, designed thoughtfully and handled with discretion.",
    bullets: ["Service & standing sprays", "Casket & urn florals", "Sympathy deliveries to the home", "Coordination directly with funeral homes"],
    images: [images.whiteLily, images.whiteLiliesVase, images.lilyPink],
  },
];

export const weddingGallery: GalleryItem[] = [
  { id: "g1", ...images.brideSmelling, caption: "Ivory garden bouquet", tall: true },
  { id: "g2", ...images.coupleKiss, caption: "Petal toss send-off" },
  { id: "g3", ...images.brideRed, caption: "Burgundy & blush bridal", tall: true },
  { id: "g4", ...images.receptionTable, caption: "Long-table reception" },
  { id: "g5", ...images.brideVeil, caption: "Sage & white cascade", tall: true },
  { id: "g6", ...images.gazebo, caption: "Garden gazebo ceremony" },
  { id: "g7", ...images.coupleGarden, caption: "Garden portraits" },
  { id: "g8", ...images.brideRoses, caption: "Peach rose bouquet", tall: true },
  { id: "g9", ...images.chairs, caption: "Sweetheart chairs" },
  { id: "g10", ...images.brideField, caption: "Meadow greenery bouquet", tall: true },
  { id: "g11", ...images.coupleBeach, caption: "Coastal elopement" },
  { id: "g12", ...images.brideHair, caption: "Romantic hand-tied" },
];
