import type { MediaAsset, VideoAsset } from "@/types";

/**
 * Every image and video used on the site lives here.
 * Swap these placeholders (Unsplash / Mixkit, free licenses) for the florist's own photography.
 * Images are served through next/image, so any remote host must be listed in next.config.ts.
 */
const u = (id: string, alt: string): MediaAsset => ({
  src: `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=2000&q=80`,
  alt,
  credit: "Unsplash",
});

export const videos = {
  heroFlorist: {
    src: "/videos/hero-florist.mp4",
    poster: "/videos/hero-florist.jpg",
    label: "A florist arranging a fresh bouquet in the studio",
  },
  behindTheScenes: {
    src: "/videos/bts-hands.mp4",
    poster: "/videos/bts-hands.jpg",
    label: "Hands selecting fresh lisianthus and roses in the cooler",
  },
  brideBouquet: {
    src: "/videos/bride-bouquet.mp4",
    poster: "/videos/bride-bouquet.jpg",
    label: "A smiling bride walking with her bouquet",
  },
  weddingTable: {
    src: "/videos/wedding-table.mp4",
    poster: "/videos/wedding-table.jpg",
    label: "Candlelit wedding table with garden roses",
  },
  handoff: {
    src: "/videos/handoff.mp4",
    poster: "/videos/handoff.jpg",
    label: "A florist handing a finished bouquet to a customer",
  },
  bridePortrait: {
    src: "/videos/bride-portrait.mp4",
    poster: "/videos/bride-portrait.jpg",
    label: "A bride in a garden conservatory with her flowers",
  },
} satisfies Record<string, VideoAsset>;

export const images = {
  // Brand & studio
  studioFlorist: u("1531058240690-006c446962d8", "Florist working at the counter of a plant-filled studio"),
  floristArranging: u("1554196259-e3c00b41a421", "Florist arranging a colorful mix of fresh flowers"),
  floristWindow: u("1673897969233-e706f4b522ed", "Woman arranging a bouquet beside a sunlit window"),
  floristHands: u("1716452807811-3af576499c97", "Close-up of hands arranging flowers in a vase"),
  floristMoody: u("1612526031469-396a0c000b6e", "Florist holding pink and white blooms in a dark studio"),
  floristRose: u("1612526031536-43f6dd7abc4a", "Florist holding a bouquet of pink roses"),
  floristSenior: u("1567505599350-70d90e03a41b", "Senior florist tending to a potted arrangement"),
  floristMarket: u("1667940108200-6579cf5da7ea", "Florist preparing sunflowers and stock at a market stall"),
  floristOveralls: u("1762212404690-4212e5df48ea", "Smiling florist in denim overalls holding spring flowers"),
  moodyVase: u("1608656218680-e8be81ce71d7", "Lush arrangement in a black ceramic vase, moody light"),
  moodyGift: u("1608656600560-c99b9e7a0de5", "Arrangement beside wrapped gifts in a moody studio"),
  storefront: u("1593343352582-20b62e004a0f", "Flower shop storefront with buckets of fresh stems"),
  shopInterior: u("1639696194673-67b86204b885", "Warmly lit flower shop interior full of blooms"),
  shopBuckets: u("1589244159943-460088ed5c92", "Buckets of roses and carnations at a flower shop"),
  shopDoor: u("1558861122-40aa75d3a841", "Flower shop entrance overflowing with potted plants"),
  kraftGifts: u("1608825154649-2e9bb4cd4211", "Wrapped bouquet in kraft paper with gift bags"),
  thankYouCard: u("1620843437920-ead942b3abd3", "Handwritten thank-you card with a satin ribbon"),

  // People receiving flowers
  receivingFlowers: u("1455819413567-ef04b7e1fe3d", "Woman smiling as she receives a bouquet"),
  surpriseRoses: u("1758874089898-bf6881ca3b28", "Man surprising a woman with a bouquet of pink roses"),
  giftingRoses: u("1758874089944-32dca2ce5d55", "Man giving a woman a bouquet of pink roses"),
  celebrationGifts: u("1767694934233-a277dc685f38", "Woman surrounded by bouquets and birthday gifts"),
  redRosesHands: u("1765916504176-f511dad65c14", "Hands exchanging a bouquet of red and cream roses"),
  heldRedRoses: u("1589095181425-c038b3871b6a", "Person holding a bouquet of deep red roses"),

  // Weddings
  brideSmelling: u("1481066717861-4775e000c88a", "Bride smelling her white garden bouquet"),
  bridePastel: u("1495610015663-83e7e5246070", "Bride holding a pastel rose and wax flower bouquet"),
  brideRed: u("1521543832500-49e69fb2bea2", "Bride holding a rich red and blush bouquet"),
  brideRoses: u("1525258946800-98cfd641d0de", "Bride with a peach and ivory rose bouquet"),
  brideField: u("1552222661-467bd51aa1f4", "Bride in a meadow holding a trailing greenery bouquet"),
  brideHair: u("1574871786514-46e1680ea587", "Bride with long hair cradling a romantic bouquet"),
  brideIvory: u("1595467959554-9ffcbf37f10f", "Bride holding an ivory and greenery bouquet"),
  brideVeil: u("1595467959776-8acfb0dc313f", "Bride in a veil holding a white and sage bouquet"),
  brideBlush: u("1594149596808-e3b6174968b3", "Blush garden rose bridal bouquet"),
  brideGroomBouquet: u("1550005809-91ad75fb315f", "Bride and groom with a peach garden bouquet"),
  coupleGarden: u("1606216794074-735e91aa2c92", "Laughing newlyweds walking through a garden"),
  coupleKiss: u("1583939003579-730e3918a45a", "Newlyweds kissing as guests throw petals"),
  coupleBeach: u("1537633552985-df8429e8048b", "Bride and groom embracing on the coast"),
  aisle: u("1469371670807-013ccf25f16a", "Ceremony aisle lined with rose arrangements"),
  gazebo: u("1523438885200-e635ba2c371e", "Garden gazebo ceremony with floral details"),
  receptionTable: u("1519225421980-715cb0215aed", "Long reception table with low floral centerpieces"),
  chairs: u("1522673607200-164d1b6ce486", "Mr and Mrs chairs decorated with fresh flowers"),
  rings: u("1606800052052-a08af7148866", "Gold wedding rings resting among petals"),
  weddingCake: u("1522057384400-681b421cfebc", "Naked wedding cake decorated with fresh flowers"),

  // Events & celebrations
  corporateTable: u("1511795409834-ef04bbd61622", "Corporate dinner table with vibrant centerpieces"),
  corporateLobby: u("1752718071652-c3139c51c22b", "Designer placing a statement arrangement in a lobby"),
  officeTeam: u("1556761175-5973dc0f32e7", "Team meeting in a bright, modern office"),
  toast: u("1527529482837-4698179dc6ce", "Friends raising glasses at a candlelit celebration"),
  balloons: u("1530103862676-de8c9debad1d", "Pastel balloons at a birthday party"),
  heartFlowers: u("1526047932273-341f2a7631f9", "Hands holding a heart made of fresh flowers"),
  babyShower: u("1610841803453-1b30e19d2354", "Soft pink and white flowers in a wooden keepsake box"),
  graduation: u("1531120364508-a6b656c3e78d", "Bright celebratory bouquet on a wooden table"),
  holiday: u("1512056495345-913a0c261dc8", "Festive bouquet of red roses and berries"),

  // Sympathy
  whiteLily: u("1567428051128-5f09a0200655", "White lilies against dark green foliage"),
  whiteLiliesVase: u("1610739658361-c4c0c69c40fa", "White lilies in a clear glass vase"),
  lilyPink: u("1631407779166-86952be9dbd7", "White lilies against a soft pink wall"),

  // Subscriptions
  singleRose: u("1518895949257-7621c3c786d7", "A single pink rose in a glass bud vase"),
  redRose: u("1562690868-60bbe7293e94", "A single dew-covered red rose"),
  windowVase: u("1608982216701-a9ab65b4a3a2", "Seasonal arrangement in a vase by the window"),
  mantelArrangement: u("1591966801718-48eb8ba0f8f3", "Sculptural arrangement on a rustic mantel"),

  // Add-ons
  vase: u("1612196808214-b8e1d6145a8c", "Ivory ceramic vase"),
  chocolates: u("1558636508-e0db3814bd1d", "Handmade chocolates and truffles"),
  candle: u("1563170351-be82bc888aa4", "Luxury fragrance bottle with leaves"),
} as const;

/** Product photography, keyed by product slug. First image is the cover. */
export const productImages: Record<string, MediaAsset[]> = {
  "blush-peony-cloud": [
    u("1482715091246-822e47d61e1c", "Blush peony bouquet with soft greenery"),
    u("1616148037989-4c3a9946a514", "Pink peonies in a clear glass vase"),
    u("1579664872746-55e2a805d705", "Three pink peonies on white"),
  ],
  "midnight-peony": [
    u("1511201173873-c327e63eb6c4", "Lavender and blush peonies on a black background"),
    u("1560583035-79c3e11ae176", "Peonies tucked into a gift box"),
  ],
  "garden-rose-romance": [
    u("1497276236755-0f85ba99a126", "Pink garden roses and cornflowers in a glass vase"),
    u("1591886960571-74d43a9d4166", "Peach and pink garden roses in a vase"),
  ],
  "crimson-devotion": [
    u("1512056495345-913a0c261dc8", "Deep red roses with berries"),
    u("1589095181425-c038b3871b6a", "Red rose bouquet held in hand"),
  ],
  "the-dozen-red": [
    u("1581264692636-3cf6f29655c2", "Dozen red roses presented in an ivory gift box"),
    u("1559563362-c667ba5f5480", "Close-up of a velvet red rose"),
  ],
  "white-tulip-wrap": [
    u("1476293889456-abfb7492a29f", "White tulips wrapped in kraft paper on wood"),
    u("1586554978186-deffc54a0a5c", "White tulips in a white paper wrap"),
  ],
  "spring-tulip-market": [
    u("1518943701174-17e4aff936d4", "Market bunch of pink, orange and yellow tulips"),
    u("1619962992057-be492a5816f6", "Mixed tulips in a bouquet"),
  ],
  "ruby-tulip-kraft": [
    u("1519218470957-62c7c83c36b4", "Red tulips wrapped in kraft paper with shears"),
  ],
  "pastel-tulip-vase": [
    u("1561181226-e8a7edd504c6", "Pink tulips in a glass vase"),
    u("1561181286-d3fee7d55364", "Pink tulip centerpiece in a glass vase"),
  ],
  "blush-tulip-bundle": [
    u("1554355202-88fbb5fe8f8b", "Blush tulips wrapped in paper, held close"),
    u("1617176756162-447320192d98", "Pink tulips on a white surface"),
  ],
  "rose-blush-hand-tied": [
    u("1523693916903-027d144a2b7d", "Hand-tied bouquet of pink and white roses"),
    u("1612526031467-2b6bf1f49961", "Pink roses with baby's breath"),
  ],
  "ivory-kraft-posy": [
    u("1523694576729-dc99e9c0f9b4", "Ivory roses and hydrangea in kraft paper"),
  ],
  "wildflower-meadow": [
    u("1531120364508-a6b656c3e78d", "Colorful wildflower bouquet on wood"),
  ],
  "painterly-still-life": [
    u("1558879787-4c4aea1fbb83", "Painterly mixed arrangement in a white jug"),
    u("1558879860-45f24b366ea1", "Mixed seasonal arrangement in a white jug"),
  ],
  "white-poppy-amber": [
    u("1587317996237-eddd7e834d84", "White poppies in an amber glass vase"),
  ],
  "phalaenopsis-ivory": [
    u("1548014251-6c4f4b6055d3", "White phalaenopsis orchid in a ceramic pot"),
  ],
  "blush-orchid": [
    u("1611850916723-9a5f14e9e20e", "Blush phalaenopsis orchid plant"),
    u("1611850917434-1d08a0e3fc07", "Pink orchids in a brown ceramic pot"),
  ],
  "magenta-orchid": [
    u("1634508602826-33794634587d", "Magenta orchid in a white enamel pot"),
  ],
  "midnight-orchid": [
    u("1618080578815-335456280012", "Purple and white orchid on a dark background"),
  ],
  "serenity-lilies": [
    u("1610739658361-c4c0c69c40fa", "White lilies in a clear glass vase"),
    u("1567428051128-5f09a0200655", "White lily blooms close-up"),
  ],
  "lily-grace": [
    u("1631407779166-86952be9dbd7", "White lilies against a blush wall"),
  ],
  "rose-and-bubbly-box": [
    u("1707944145479-12755f0434d8", "Mint gift box tied with twine beside a vase of roses"),
  ],
  "golden-ribbon-box": [
    u("1641970963562-912cf0ace893", "Garden rose arrangement with a gold ribbon gift box"),
  ],
  "peach-garden-rose": [
    u("1563241527-3004b7be0ffd", "Peach and beige garden roses"),
    u("1591886960571-74d43a9d4166", "Peach garden roses in a glass vase"),
  ],
  "everlasting-dried": [
    u("1622658641558-235f26dd270b", "Dried flower bouquet in peach paper"),
    u("1626322751456-777779e0c4ae", "Dried flower arrangement in a ceramic vessel"),
  ],
  "coral-dahlia": [
    u("1628456676381-cf822e3c3f9f", "Coral dahlias with lilies and roses"),
  ],
  "blue-hydrangea-cloud": [
    u("1547098842-dcdd773e3390", "Soft blue hydrangea bloom"),
  ],
  "peony-market-bunch": [
    u("1560582591-f6939a30b5f2", "Peonies wrapped in kraft paper"),
    u("1560256608-43f0b6f7588e", "Pink peonies in a glass vase"),
  ],
  "amethyst-grande": [
    u("1606101083393-bded314215cd", "Purple and pink grand bouquet"),
  ],
  "ivory-peony-vase": [
    u("1652164055648-102e8719ae05", "Ivory peonies in a clear vase"),
  ],
  "succulent-trio": [
    u("1485955900006-10f4d324d411", "Succulent in a mint ceramic planter"),
  ],
};
