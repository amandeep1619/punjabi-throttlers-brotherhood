import { SectionHeading } from "@/components/ui/Card";
import { SmartImage } from "@/components/ui/SmartImage";

type Birthday = { memberId: string; fullName: string; photoUrl?: string };

export default function BirthdaySection({ birthdays }: { birthdays: Birthday[] }) {
  if (birthdays.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 border-t border-pt-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Today's Birthday" title="Celebrating our riders" />
        <div className="mt-10 flex flex-wrap justify-center gap-8">
          {birthdays.map((member) => (
            <div key={member.memberId} className="flex flex-col items-center gap-3 text-center">
              <div className="relative h-24 w-24 rounded-full ring-2 ring-pt-gold ring-offset-4 ring-offset-pt-black overflow-hidden bg-pt-black-card">
                {member.photoUrl ? (
                  <SmartImage src={member.photoUrl} alt={member.fullName} fill className="object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-2xl font-semibold text-pt-gold">
                    {member.fullName.charAt(0)}
                  </div>
                )}
                <div className="absolute -bottom-1 left-0 right-0 text-center text-[10px] font-bold bg-pt-gold text-pt-black py-0.5">
                  🎂
                </div>
              </div>
              <p className="text-sm font-medium text-pt-cream">{member.fullName}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
