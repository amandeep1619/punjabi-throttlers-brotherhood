import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-pt-border/60 bg-pt-black-soft mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid gap-8 sm:grid-cols-3">
        <div className="flex items-center gap-3">
          <Image src="/brand/logo.png" alt="Punjabi Throttlers Brotherhood" width={40} height={40} className="rounded-full" />
          <div>
            <p className="font-semibold text-pt-cream">Punjabi Throttlers Brotherhood</p>
            <p className="text-sm text-pt-muted">The community of responsible riders.</p>
          </div>
        </div>
        <div className="text-sm text-pt-muted space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-pt-muted/70 mb-3">Explore</p>
          <Link href="/rides" className="block hover:text-pt-gold">Rides</Link>
          <Link href="/members" className="block hover:text-pt-gold">Members</Link>
          <Link href="/policies" className="block hover:text-pt-gold">Policies</Link>
        </div>
        <div className="text-sm text-pt-muted space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-pt-muted/70 mb-3">Join the brotherhood</p>
          <Link href="/join" className="block hover:text-pt-gold">Become a member</Link>
          <Link href="/login" className="block hover:text-pt-gold">Member login</Link>
        </div>
      </div>
      <div className="border-t border-pt-border/60 py-4 text-center text-xs text-pt-muted">
        © {new Date().getFullYear()} Punjabi Throttlers Brotherhood. Ride, Knowledge, Adventure.
      </div>
    </footer>
  );
}
