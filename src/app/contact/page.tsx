import { pageMetadata } from "@/lib/seo";
import { site } from "@/config/site";
import { getGeneralFaqs } from "@/lib/data";
import { ContactForm } from "@/components/forms/ContactForm";
import { MapPlaceholder } from "@/components/ui/MapPlaceholder";
import { Eyebrow, Script } from "@/components/ui/SectionHeading";
import { Sprig } from "@/components/ui/Botanicals";
import { Clock, Mail, Phone, Pin } from "@/components/ui/Icons";

export const metadata = pageMetadata({
  title: "Contact",
  description: `Call, email or visit ${site.name} at ${site.address.street}, ${site.address.city}. Open seven days a week.`,
  path: "/contact",
});

export default async function ContactPage() {
  const faqs = await getGeneralFaqs();
  const { address } = site;
  return (
    <>
      <section className="relative overflow-hidden pb-14 pt-8 md:pt-12">
        <Sprig className="pointer-events-none absolute right-4 top-0 w-24 text-sage/70 md:right-20 md:w-32" />
        <div className="container-page">
          <Eyebrow className="animate-rise">Contact</Eyebrow>
          <h1 className="mt-6 max-w-3xl animate-rise text-h1 text-wine [animation-delay:120ms]">
            We&rsquo;d love to <Script>hear from you</Script>
          </h1>
          <p className="mt-6 max-w-xl animate-rise text-lead text-muted [animation-delay:240ms]">
            Questions about an order, a wedding or a standing arrangement? Send a note or call the studio. A real florist will answer.
          </p>
        </div>
      </section>

      <section className="container-page grid gap-12 pb-24 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ContactForm />
        </div>
        <aside className="space-y-8 lg:col-span-4 lg:col-start-9">
          <ul className="space-y-6">
            <li className="flex gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-cream text-rose-deep ring-1 ring-gold/40"><Phone size={20} /></span>
              <div><p className="eyebrow text-muted">Call</p><a href={site.phoneHref} className="link-underline mt-1 inline-block font-display text-2xl text-wine">{site.phone}</a></div>
            </li>
            <li className="flex gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-cream text-rose-deep ring-1 ring-gold/40"><Mail size={20} /></span>
              <div className="min-w-0"><p className="eyebrow text-muted">Email</p><a href={`mailto:${site.email}`} className="link-underline mt-1 inline-block break-all text-wine">{site.email}</a></div>
            </li>
            <li className="flex gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-cream text-rose-deep ring-1 ring-gold/40"><Pin size={20} /></span>
              <div><p className="eyebrow text-muted">Studio</p><address className="mt-1 not-italic text-ink">{address.street}<br />{address.city}, {address.region} {address.postalCode}</address></div>
            </li>
            <li className="flex gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-cream text-rose-deep ring-1 ring-gold/40"><Clock size={20} /></span>
              <div>
                <p className="eyebrow text-muted">Hours</p>
                <dl className="mt-1 space-y-1">
                  {site.hours.map((h) => (
                    <div key={h.days} className="flex gap-2"><dt className="text-ink">{h.days}:</dt><dd className="text-muted">{h.time}</dd></div>
                  ))}
                </dl>
              </div>
            </li>
          </ul>
          <MapPlaceholder className="aspect-[4/3] w-full" />
          <div className="rounded-[var(--radius-card)] bg-cream/60 p-6 ring-1 ring-linen">
            {faqs.map((f) => (
              <div key={f.q} className="py-2">
                <p className="font-display text-xl text-wine">{f.q}</p>
                <p className="mt-1 text-sm text-muted">{f.a}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </>
  );
}
