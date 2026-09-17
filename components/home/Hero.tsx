import Image from "next/image";
import { LinkButton } from "@/components/ui/Button";

function formatStat(n: number) {
  return n > 0 ? `${n.toLocaleString("en-IN")}+` : "0";
}

export default function Hero({
  stats,
}: {
  stats: { memberCount: number; totalKm: number; totalRides: number };
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/brand/community.png"
          alt=""
          fill
          priority
          className="object-cover object-center opacity-25"
        />
        <div className="absolute inset-0 bg-linear-to-b from-pt-black via-pt-black/85 to-pt-black" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[820px] rounded-full bg-pt-gold/15 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-24 pb-20 sm:pt-32 sm:pb-28 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-pt-gold/40 bg-pt-black-card/60 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-pt-gold mb-8">
          Ride · Knowledge · Adventure
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold text-pt-cream leading-tight text-balance">
          Welcome to <span className="text-pt-gold">Punjabi Throttlers</span> Brother-Hood
        </h1>

        <p className="mt-6 max-w-2xl mx-auto text-lg text-pt-muted text-balance">
          A brotherhood of riders united by the road — the community of responsible riders, brought
          together by long highways, shared miles, and a love for group rides.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <LinkButton href="/join" size="lg">
            Join Now
          </LinkButton>
          <LinkButton href="/rides" variant="outline" size="lg">
            Explore Rides
          </LinkButton>
        </div>

        <dl className="mt-16 grid grid-cols-3 gap-4 sm:gap-10 max-w-2xl mx-auto">
          {[
            { label: "Members", value: formatStat(stats.memberCount) },
            { label: "Total Kms by the Club", value: formatStat(stats.totalKm) },
            { label: "Completed Rides", value: formatStat(stats.totalRides) },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-pt-border bg-pt-black-card/50 py-5 px-2">
              <dt className="text-xs uppercase tracking-wide text-pt-muted">{stat.label}</dt>
              <dd className="mt-1 text-2xl sm:text-3xl font-bold text-pt-gold">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
