// Sample data for local development/demo — 10 members + 10 rides, all images
// as external links (picsum.photos avatars/banners, one public-domain sample
// video) so nothing depends on local disk storage. Safe to re-run; skips
// anything whose email/title already exists. Delete this data yourself with
// a DB client (or drop the collections) once you're ready for real content —
// there's deliberately no "clear sample data" command, this is dev-only.
//   npm run seed:sample
import { config } from "dotenv";
config({ path: ".env.local" });

const SAMPLE_VIDEO = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const MEMBERS = [
  { fullName: "Gagandeep Singh", email: "gagandeep.singh@example.com", dob: "1992-03-14", gender: "Male", bloodGroup: "B+", primaryMobile: "9876500101", country: "India", location: "Ludhiana, Punjab", emergency: { fullName: "Harjeet Singh", relationship: "Father", phone: "9876500102" }, bike: { make: "Royal Enfield", model: "Meteor 350", year: 2022, licensePlate: "PB10AB1234" }, exp: 6 },
  { fullName: "Harpreet Kaur", email: "harpreet.kaur@example.com", dob: "1995-07-22", gender: "Female", bloodGroup: "O+", primaryMobile: "9876500103", country: "India", location: "Amritsar, Punjab", emergency: { fullName: "Simran Kaur", relationship: "Sister", phone: "9876500104" }, bike: { make: "Royal Enfield", model: "Hunter 350", year: 2023, licensePlate: "PB02CD5678" }, exp: 3 },
  { fullName: "Simranjit Singh", email: "simranjit.singh@example.com", dob: "1990-11-02", gender: "Male", bloodGroup: "A+", primaryMobile: "9876500105", country: "India", location: "Jalandhar, Punjab", emergency: { fullName: "Balwinder Singh", relationship: "Father", phone: "9876500106" }, bike: { make: "Royal Enfield", model: "Classic 350", year: 2021, licensePlate: "PB08EF9012" }, exp: 8 },
  { fullName: "Manpreet Singh", email: "manpreet.singh@example.com", dob: "1988-01-19", gender: "Male", bloodGroup: "AB+", primaryMobile: "9876500107", country: "India", location: "Patiala, Punjab", emergency: { fullName: "Kulwant Kaur", relationship: "Mother", phone: "9876500108" }, bike: { make: "Royal Enfield", model: "Himalayan", year: 2020, licensePlate: "PB11GH3456" }, exp: 12 },
  { fullName: "Jaspreet Kaur", email: "jaspreet.kaur@example.com", dob: "1997-05-30", gender: "Female", bloodGroup: "B-", primaryMobile: "9876500109", country: "India", location: "Bathinda, Punjab", emergency: { fullName: "Navdeep Kaur", relationship: "Sister", phone: "9876500110" }, bike: { make: "Royal Enfield", model: "Interceptor 650", year: 2023, licensePlate: "PB03IJ7890" }, exp: 4 },
  { fullName: "Amandeep Singh", email: "amandeep.sample@example.com", dob: "1993-09-08", gender: "Male", bloodGroup: "O-", primaryMobile: "9876500111", country: "India", location: "Mohali, Punjab", emergency: { fullName: "Rupinder Singh", relationship: "Brother", phone: "9876500112" }, bike: { make: "Royal Enfield", model: "Meteor 350", year: 2022, licensePlate: "PB65KL2345" }, exp: 5 },
  { fullName: "Rajwinder Singh", email: "rajwinder.singh@example.com", dob: "1991-12-25", gender: "Male", bloodGroup: "A-", primaryMobile: "9876500113", country: "India", location: "Chandigarh", emergency: { fullName: "Manjeet Kaur", relationship: "Mother", phone: "9876500114" }, bike: { make: "KTM", model: "Duke 390", year: 2023, licensePlate: "CH01MN6789" }, exp: 4 },
  { fullName: "Navjot Kaur", email: "navjot.kaur@example.com", dob: "1996-04-17", gender: "Female", bloodGroup: "B+", primaryMobile: "9876500115", country: "India", location: "Ferozepur, Punjab", emergency: { fullName: "Amrit Kaur", relationship: "Mother", phone: "9876500116" }, bike: { make: "Royal Enfield", model: "Classic 350", year: 2021, licensePlate: "PB04OP0123" }, exp: 3 },
  { fullName: "Karanveer Singh", email: "karanveer.singh@example.com", dob: "1989-08-11", gender: "Male", bloodGroup: "AB-", primaryMobile: "9876500117", country: "India", location: "Moga, Punjab", emergency: { fullName: "Jaswinder Singh", relationship: "Father", phone: "9876500118" }, bike: { make: "Royal Enfield", model: "Continental GT 650", year: 2022, licensePlate: "PB29QR4567" }, exp: 9 },
  { fullName: "Gurpreet Singh", email: "gurpreet.singh@example.com", dob: "1994-02-28", gender: "Male", bloodGroup: "O+", primaryMobile: "9876500119", country: "India", location: "Hoshiarpur, Punjab", emergency: { fullName: "Baljeet Kaur", relationship: "Mother", phone: "9876500120" }, bike: { make: "Royal Enfield", model: "Thunderbird 350X", year: 2019, licensePlate: "PB09ST8901" }, exp: 10 },
];

const RIDES = [
  { title: "Chandigarh Sunrise Loop", description: "An easy early-morning highway run around Chandigarh with a breakfast stop at Sukhna Lake.", distanceKm: 180, startDate: "2025-11-02", status: "completed", tags: ["one-day"], featured: false, enroll: [0, 1, 2, 5] },
  { title: "Himalayan Meteor Expedition — Spiti Valley", description: "Our biggest ride of the year — 6 days through Kinnaur and Spiti, crossing some of the highest motorable passes in the world.", distanceKm: 950, startDate: "2025-08-05", endDate: "2025-08-10", status: "completed", tags: ["night-stay", "multi-day"], featured: false, enroll: [0, 3, 4, 8, 9] },
  { title: "Golden Temple Midnight Ride", description: "A quiet midnight run to Amritsar to pay respects at the Golden Temple before sunrise.", distanceKm: 65, startDate: "2025-09-20", status: "completed", tags: ["one-day", "night-ride"], featured: false, enroll: [1, 2, 6, 7] },
  { title: "Wagah Border Flag Ceremony Ride", description: "Ride out to the Wagah Border to watch the retreat ceremony, back before dark.", distanceKm: 70, startDate: "2025-10-12", status: "completed", tags: ["one-day"], featured: false, enroll: [1, 7] },
  { title: "Anandpur Sahib Heritage Ride", description: "A heritage trail ride to Anandpur Sahib, with a stop at the Virasat-e-Khalsa museum.", distanceKm: 210, startDate: "2025-06-15", status: "completed", tags: ["one-day"], featured: false, enroll: [2, 3, 4, 5, 8] },
  { title: "Republic Day Tricolor Rally", description: "Our annual Republic Day rally through the city, flags flying, ending with a community breakfast.", distanceKm: 40, startDate: "2025-01-26", status: "completed", tags: ["one-day", "rally"], featured: false, enroll: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
  { title: "Chandigarh to Manali Highway Run", description: "Our next big highway run — Chandigarh to Manali via Bilaspur and Kullu, with two nights at a riverside camp.", distanceKm: 310, startDate: "2026-03-14", endDate: "2026-03-16", status: "upcoming", tags: ["night-stay", "weekend"], featured: true, enroll: [] },
  { title: "Kasol Weekend Getaway", description: "A relaxed weekend ride to Kasol along the Parvati Valley, bonfire and live music included.", distanceKm: 280, startDate: "2026-04-04", endDate: "2026-04-05", status: "upcoming", tags: ["weekend", "night-stay"], featured: false, enroll: [] },
  { title: "New Year Eve Bonfire Ride to Barog", description: "Ring in the new year with the brotherhood — a scenic ride up to Barog followed by a bonfire night.", distanceKm: 130, startDate: "2026-12-31", status: "upcoming", tags: ["night-stay", "one-day"], featured: false, enroll: [] },
  { title: "Dalhousie Monsoon Ride", description: "A monsoon-season ride to Dalhousie — called off this year due to landslide warnings on the route.", distanceKm: 260, startDate: "2025-07-27", status: "cancelled", tags: ["weekend", "night-stay"], featured: false, enroll: [] },
];

async function main() {
  const { connectToDatabase } = await import("../lib/db");
  const { hashPassword } = await import("../lib/password");
  const { getNextMemberId } = await import("../lib/counters");
  const { Member } = await import("../models/Member");
  const { Ride } = await import("../models/Ride");

  await connectToDatabase();

  const memberIds: string[] = [];
  for (const [i, m] of MEMBERS.entries()) {
    const existing = await Member.findOne({ email: m.email });
    if (existing) {
      memberIds.push(String(existing._id));
      continue;
    }
    const memberId = await getNextMemberId();
    const passwordHash = await hashPassword("Password123!");
    const created = await Member.create({
      memberId,
      fullName: m.fullName,
      email: m.email,
      passwordHash,
      role: "member",
      status: "active",
      photoUrl: `https://i.pravatar.cc/300?img=${i + 11}`,
      dob: new Date(m.dob),
      gender: m.gender,
      bloodGroup: m.bloodGroup,
      primaryMobile: m.primaryMobile,
      country: m.country,
      location: m.location,
      emergencyContact: m.emergency,
      motorcycle: m.bike,
      ridingExperienceYears: m.exp,
      inAnotherRidingGroup: false,
      totalKmWithClub: 0,
    });
    memberIds.push(String(created._id));
    console.log(`Created member ${memberId} — ${m.fullName}`);
  }

  const kmByMember = new Map<string, number>();

  for (const [i, r] of RIDES.entries()) {
    const existing = await Ride.findOne({ title: r.title });
    if (existing) continue;

    const enrolledMembers = r.enroll.map((idx) => memberIds[idx]);
    const kmAwarded = r.status === "completed";
    if (kmAwarded) {
      for (const id of enrolledMembers) kmByMember.set(id, (kmByMember.get(id) ?? 0) + r.distanceKm);
    }

    await Ride.create({
      title: r.title,
      description: r.description,
      distanceKm: r.distanceKm,
      startDate: new Date(r.startDate),
      endDate: "endDate" in r ? new Date(r.endDate as string) : undefined,
      status: r.status as "upcoming" | "completed" | "cancelled",
      tags: r.tags,
      featured: r.featured,
      kmAwarded,
      banner: { url: `https://picsum.photos/seed/pt-ride-${i + 1}/1000/560`, source: "external" },
      gallery: [
        { url: `https://picsum.photos/seed/pt-ride-${i + 1}-a/700/700`, type: "photo", source: "external" },
        { url: `https://picsum.photos/seed/pt-ride-${i + 1}-b/700/700`, type: "photo", source: "external" },
        ...(i % 3 === 0 ? [{ url: SAMPLE_VIDEO, type: "video" as const, source: "external" as const }] : []),
      ],
      itinerary:
        r.status !== "cancelled"
          ? [
              { day: "Day 1", title: "Assembly & Departure", description: "Meet at the usual assembly point, safety briefing, then roll out." },
              { day: "Day 1", title: "Arrival", description: "Reach the destination, group photo, ride debrief." },
            ]
          : [],
      enrolledMembers,
    });
    console.log(`Created ride — ${r.title} (${r.status})`);
  }

  for (const [id, km] of kmByMember.entries()) {
    await Member.updateOne({ _id: id }, { $set: { totalKmWithClub: km } });
  }
  console.log(`Updated totalKmWithClub for ${kmByMember.size} members.`);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
