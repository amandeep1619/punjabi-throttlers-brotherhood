import "server-only";
import { connectToDatabase } from "@/lib/db";
import { Member } from "@/models/Member";
import { Ride } from "@/models/Ride";

export async function getClubStats() {
  await connectToDatabase();
  const [memberCount, totalRides, kmAgg] = await Promise.all([
    Member.countDocuments({ status: "active" }),
    Ride.countDocuments({ status: "completed" }),
    Ride.aggregate<{ _id: null; total: number }>([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$distanceKm" } } },
    ]),
  ]);

  return {
    memberCount,
    totalRides,
    totalKm: kmAgg[0]?.total ?? 0,
  };
}
