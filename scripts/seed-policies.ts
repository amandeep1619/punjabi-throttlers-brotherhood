// Seeds the initial club guidelines, pulled verbatim from the reference
// site's own compiled bundle (its "Read guidelines" section on /signup).
//   npm run seed:policies
import { config } from "dotenv";
config({ path: ".env.local" });

const SECTIONS = [
  { heading: "Basic Riding Gear", body: "Join rides with at least basic riding gear, including a full-face helmet, gloves, elbow and knee guards, and appropriate footwear." },
  { heading: "Mandatory Rear View Mirrors", body: "Ensure rear view mirrors are installed on your bike." },
  { heading: "No Stunts", body: "Prohibit any stunts during rides." },
  { heading: "No Unnecessary Overtaking", body: "Avoid overtaking without a valid reason." },
  { heading: "Follow Leaders' Rules", body: "Adhere to all rules explained by the ride leaders; no overspeeding." },
  { heading: "Adherence to Traffic Rules", body: "Emphasize strict adherence to traffic rules and regulations for the safety of all riders." },
  { heading: "Maintain Discipline", body: "Act with discipline at all times; avoid actions that may portray a lack of discipline." },
  { heading: "Respect Every Rider", body: "Refrain from judging others based on their bikes; respect every rider/throttler in the community." },
  { heading: "Respectful Conduct towards Female Riders", body: "Any unnecessary WhatsApp messages or spam directed at female riders will not be tolerated. Offenders will face consequences, including legal action." },
  { heading: "Inclusive Environment", body: "Foster an inclusive atmosphere, welcoming riders of all backgrounds, genders, and experience levels." },
  { heading: "Environmentally Conscious Riding", body: "Encourage riders to be mindful of the environment and avoid actions that harm nature during rides." },
  { heading: "Emergency Preparedness", body: "Stress the importance of being prepared for emergencies, including carrying a basic first aid kit and knowing emergency procedures." },
  { heading: "Communication Protocol", body: "Establish clear communication guidelines during rides to ensure all members can stay informed and connected." },
  { heading: "Ride Fee", body: "A minimal fee of 100 rupees per ride will be charged, which will be adjusted during tea breaks." },
  { heading: "Quality over Quantity", body: "Embrace quality over quantity; prioritize meaningful connections over a large member count." },
  { heading: "Share Bike-Related Content", body: "Avoid posting unrelated content, including greetings, vulgar, political, superstitious, or negative news." },
  { heading: "Activity Participation", body: "If you don't join rides for more than 3 months, you will be removed. Non-participation in community activities or polls, if needed, may result in removal without warning." },
  { heading: "Zero Tolerance for Rule Violations", body: "Breaking any of the above rules will result in immediate removal from the community without warning." },
].map((s, i) => ({ ...s, order: i }));

async function main() {
  const { connectToDatabase } = await import("../lib/db");
  const { Policy, POLICY_DOC_ID } = await import("../models/Policy");

  await connectToDatabase();
  const existing = await Policy.findById(POLICY_DOC_ID);
  if (existing) {
    console.log("Policies already exist — skipping (edit them from /manage-policies instead).");
    process.exit(0);
  }

  await Policy.create({ _id: POLICY_DOC_ID, sections: SECTIONS });
  console.log(`Seeded ${SECTIONS.length} policy sections.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
