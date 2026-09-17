import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getRideById } from "@/lib/queries/rides";
import { getSession } from "@/lib/auth";
import { toPlain } from "@/lib/serialize";
import { SmartImage } from "@/components/ui/SmartImage";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card } from "@/components/ui/Card";
import { GalleryFilter } from "@/components/rides/GalleryFilter";
import { EnrollButton } from "@/components/rides/EnrollButton";

type EnrolledMember = { _id: string; memberId: string; fullName: string; photoUrl?: string; location?: string };
type RideDetail = {
  _id: string;
  title: string;
  description: string;
  banner: { url: string; source: string };
  distanceKm: number;
  startDate: string;
  endDate?: string;
  status: "upcoming" | "completed" | "cancelled";
  tags: string[];
  maxSlots?: number;
  itinerary: { day: string; title: string; description: string }[];
  gallery: { _id: string; url: string; type: "photo" | "video"; source: "upload" | "external" }[];
  enrolledMembers: EnrolledMember[];
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const ride = await getRideById(id);
  if (!ride) return { title: "Ride not found" };
  return { title: ride.title, description: ride.description.slice(0, 160) };
}

export default async function RideDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ride, session] = await Promise.all([getRideById(id), getSession()]);
  if (!ride) notFound();

  const data = toPlain<RideDetail>(ride);
  const alreadyEnrolled = session ? data.enrolledMembers.some((m) => m._id === session.userId) : false;
  const isFull = Boolean(data.maxSlots && data.enrolledMembers.length >= data.maxSlots);

  const dateRange = `${new Date(data.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}${
    data.endDate ? ` – ${new Date(data.endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}` : ""
  }`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: data.title,
    startDate: data.startDate,
    endDate: data.endDate ?? data.startDate,
    eventStatus:
      data.status === "cancelled" ? "https://schema.org/EventCancelled" : "https://schema.org/EventScheduled",
    description: data.description,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="relative h-72 sm:h-96">
        <SmartImage src={data.banner.url} alt={data.title} fill className="object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-pt-black via-pt-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-7xl px-4 sm:px-6 pb-8">
          <div className="flex gap-2 mb-3">
            <StatusBadge status={data.status} />
            {data.tags.map((tag) => (
              <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-pt-border/60 text-pt-muted">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-pt-cream text-balance">{data.title}</h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <Card className="p-6">
            <p className="text-pt-muted whitespace-pre-line">{data.description}</p>
            <div className="mt-6 grid sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-pt-muted text-xs uppercase">Dates</p>
                <p className="text-pt-cream mt-1">{dateRange}</p>
              </div>
              <div>
                <p className="text-pt-muted text-xs uppercase">Distance</p>
                <p className="text-pt-gold font-semibold mt-1">{data.distanceKm} km</p>
              </div>
              <div>
                <p className="text-pt-muted text-xs uppercase">Riders</p>
                <p className="text-pt-cream mt-1">
                  {data.enrolledMembers.length}
                  {data.maxSlots ? ` / ${data.maxSlots} slots filled` : " enrolled"}
                </p>
              </div>
            </div>
          </Card>

          {data.itinerary.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-pt-cream mb-4">Itinerary</h2>
              <div className="space-y-3">
                {data.itinerary.map((item, i) => (
                  <Card key={i} className="p-5 flex gap-4">
                    <span className="text-pt-gold font-bold shrink-0">{item.day}</span>
                    <div>
                      <p className="font-medium text-pt-cream">{item.title}</p>
                      {item.description && <p className="text-sm text-pt-muted mt-1">{item.description}</p>}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold text-pt-cream mb-4">Gallery</h2>
            <GalleryFilter items={data.gallery} />
          </div>
        </div>

        <div className="space-y-6">
          {data.status === "upcoming" && (
            <EnrollButton rideId={data._id} alreadyEnrolled={alreadyEnrolled} isFull={isFull} />
          )}

          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-pt-cream">Riders on this ride</h3>
              {data.maxSlots && (
                <span className="text-xs text-pt-muted">
                  {data.enrolledMembers.length} / {data.maxSlots}
                </span>
              )}
            </div>
            {data.enrolledMembers.length === 0 ? (
              <p className="text-sm text-pt-muted">No riders enrolled yet.</p>
            ) : (
              <ul className="space-y-3">
                {data.enrolledMembers.map((member) => (
                  <li key={member._id}>
                    <Link href={`/members/${member._id}`} className="flex items-center gap-3 hover:text-pt-gold">
                      <div className="relative h-9 w-9 rounded-full bg-pt-black-soft flex items-center justify-center text-xs font-semibold text-pt-gold overflow-hidden shrink-0">
                        {member.photoUrl ? (
                          <SmartImage src={member.photoUrl} alt={member.fullName} fill className="object-cover" />
                        ) : (
                          member.fullName.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-pt-cream leading-tight">{member.fullName}</p>
                        <p className="text-xs text-pt-muted leading-tight">{member.memberId}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {session?.role === "admin" && (
              <div className="mt-5 pt-4 border-t border-pt-border/70 flex flex-col gap-2">
                <Link href={`/manage-rides/${data._id}/members`} className="text-sm text-pt-gold hover:underline">
                  Manage Riders →
                </Link>
                <a
                  href={`/api/manage-rides/${data._id}/members/export`}
                  download
                  className="text-sm text-pt-muted hover:text-pt-gold"
                >
                  Export Roster (.txt)
                </a>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
