import Image from "next/image";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/config/site";
import { images } from "@/data/media";
import { CustomOrderWizard } from "@/components/custom/CustomOrderWizard";
import { Eyebrow, Script } from "@/components/ui/SectionHeading";
import { Sprig } from "@/components/ui/Botanicals";
import { Clock, Heart, Sparkle } from "@/components/ui/Icons";

export const metadata = pageMetadata({
  title: "Custom Orders",
  description: `Describe the flowers you imagine and a ${site.name} florist will design them for you: proposals, memorials, milestones and one-of-a-kind gifts.`,
  path: "/custom-orders",
});

export default function CustomOrdersPage() {
  return (
    <>
      <section className="relative overflow-hidden pb-14 pt-8 md:pb-20 md:pt-12">
        <div className="container-page grid items-end gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Eyebrow className="animate-rise">Custom orders</Eyebrow>
            <h1 className="mt-6 animate-rise text-h1 text-wine [animation-delay:120ms]">
              Tell us what you imagine. <Script>We&rsquo;ll design it.</Script>
            </h1>
            <p className="mt-6 max-w-xl animate-rise text-lead text-muted [animation-delay:240ms]">
              Five short steps. A florist reviews every request personally and replies with a sketch and quote, usually within a few hours.
            </p>
            <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-4 text-sm text-muted">
              <li className="flex items-center gap-2"><Clock size={18} className="text-rose-deep" /> Reply within hours</li>
              <li className="flex items-center gap-2"><Sparkle size={18} className="text-rose-deep" /> One-of-a-kind design</li>
              <li className="flex items-center gap-2"><Heart size={18} className="text-rose-deep" /> No obligation quote</li>
            </ul>
          </div>
          <div className="relative hidden lg:col-span-4 lg:col-start-9 lg:block">
            <div className="relative aspect-[4/5] overflow-hidden arch">
              <Image src={images.floristRose.src} alt={images.floristRose.alt} fill preload sizes="30vw" className="object-cover" />
            </div>
            <Sprig className="absolute -bottom-6 -left-12 w-24 text-sage" />
          </div>
        </div>
      </section>
      <section className="container-page pb-24" aria-label="Custom order form">
        <CustomOrderWizard />
      </section>
    </>
  );
}
