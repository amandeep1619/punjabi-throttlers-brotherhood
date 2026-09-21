import Image from "next/image";
import { partners } from "@/lib/partners";
import { SectionHeading } from "@/components/ui/Card";

export default function PartnersMarquee() {
  const track = [...partners, ...partners]; // duplicated for a seamless CSS loop

  return (
    <section className="py-16 sm:py-20 border-t border-pt-border/60 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Our Trusted Partners" title="Riding gear brands we trust" />
      </div>

      <div className="relative mt-10 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="pt-marquee-track flex w-max gap-8 items-center">
          {track.map((partner, i) => (
            <div
              key={`${partner.name}-${i}`}
              className="h-32 w-56 sm:h-36 sm:w-64 shrink-0 rounded-2xl border border-pt-border bg-pt-black-card/60 p-6 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
            >
              <div className="relative h-full w-full">
                <Image src={partner.logo} alt={partner.name} fill className="object-contain" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
