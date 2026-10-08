import Link from "next/link";
import { site } from "@/config/site";
import { CurveEdge, Sprig } from "@/components/ui/Botanicals";
import { Facebook, Instagram, Mail, Phone, Pin, Pinterest } from "@/components/ui/Icons";
import { MapPlaceholder } from "@/components/ui/MapPlaceholder";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { Logo } from "./Logo";
import { primaryNav } from "./nav";

export function Footer() {
  const { address } = site;
  return (
    <footer className="on-dark relative mt-8 text-ivory">
      <CurveEdge className="text-wine" />
      <div className="relative overflow-hidden bg-wine">
        <Sprig className="pointer-events-none absolute -left-10 top-10 hidden w-48 text-ivory/10 lg:block" />
        <Sprig className="pointer-events-none absolute -right-8 bottom-0 w-40 -scale-x-100 text-ivory/10" />
        <div className="container-page relative grid gap-14 pb-12 pt-12 md:pt-16 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <Logo tone="light" className="items-start" />
            <p className="mt-6 max-w-sm text-ivory/75">
              Locally designed florals for every chapter of life, hand-delivered across {address.city} since {site.established}.
            </p>
            <div className="mt-8">
              <p className="eyebrow text-blush">Letters from the studio</p>
              <NewsletterForm />
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-5">
            <div>
              <p className="eyebrow text-blush">Explore</p>
              <ul className="mt-5 space-y-3">
                {primaryNav.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="link-underline text-ivory/85 hover:text-ivory">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow text-blush">Visit</p>
              <address className="mt-5 space-y-3 not-italic text-ivory/85">
                <p className="flex gap-2"><Pin size={18} className="mt-1 shrink-0" />{address.street}<br />{address.city}, {address.region} {address.postalCode}</p>
                <p><a href={site.phoneHref} className="link-underline flex items-center gap-2"><Phone size={18} />{site.phone}</a></p>
                <p><a href={`mailto:${site.email}`} className="link-underline flex items-center gap-2 break-all"><Mail size={18} className="shrink-0" />Email us</a></p>
              </address>
            </div>
            <div>
              <p className="eyebrow text-blush">Hours</p>
              <dl className="mt-5 space-y-3 text-ivory/85">
                {site.hours.map((h) => (
                  <div key={h.days}>
                    <dt className="text-ivory">{h.days}</dt>
                    <dd className="text-sm">{h.time}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="lg:col-span-3">
            <MapPlaceholder tone="dark" className="aspect-[4/3] w-full ring-1 ring-ivory/15" />
            <div className="mt-6 flex gap-3">
              {[
                { href: site.social.instagram, label: "Instagram", Icon: Instagram },
                { href: site.social.facebook, label: "Facebook", Icon: Facebook },
                { href: site.social.pinterest, label: "Pinterest", Icon: Pinterest },
              ].map(({ href, label, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={`${label} (opens in a new tab)`} className="flex size-11 items-center justify-center rounded-full ring-1 ring-ivory/30 transition-colors duration-500 hover:bg-ivory hover:text-wine">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="container-page relative flex flex-col gap-3 border-t border-ivory/15 py-6 text-sm text-ivory/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p>Designed with care in {address.city}. Same-day delivery before {site.sameDayCutoff}.</p>
        </div>
      </div>
    </footer>
  );
}
