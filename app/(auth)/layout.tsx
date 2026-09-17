import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (session) redirect("/"); // defense-in-depth behind proxy.ts's guest-only redirect

  return (
    <main className="flex-1 min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[420px] w-[680px] rounded-full bg-pt-gold/10 blur-[130px]" />

      <Link href="/" className="relative flex items-center gap-3 mb-10">
        <Image src="/brand/logo.png" alt="Punjabi Throttlers Brotherhood" width={48} height={48} className="rounded-full" priority />
        <span className="font-semibold tracking-wide text-pt-cream">
          Punjabi Throttlers <span className="text-pt-gold">Brotherhood</span>
        </span>
      </Link>

      <div className="relative w-full">{children}</div>
    </main>
  );
}
