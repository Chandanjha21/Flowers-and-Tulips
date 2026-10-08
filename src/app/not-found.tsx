import { ButtonLink } from "@/components/ui/Button";
import { Sprig } from "@/components/ui/Botanicals";
import { Script } from "@/components/ui/SectionHeading";

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <Sprig className="w-16 text-sage" />
      <p className="eyebrow mt-8 text-rose-deep">Page not found</p>
      <h1 className="mt-4 text-h1 text-wine">This bloom has <Script>wandered</Script></h1>
      <p className="mt-6 max-w-md text-muted">The page you&rsquo;re looking for may have moved. Let&rsquo;s get you back to the flowers.</p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <ButtonLink href="/shop">Shop flowers</ButtonLink>
        <ButtonLink href="/" variant="outline" icon={false}>Home</ButtonLink>
      </div>
    </section>
  );
}
