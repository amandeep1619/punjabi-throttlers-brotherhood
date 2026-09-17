import { requireAuth } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default async function ProtectedGroupLayout({ children }: { children: React.ReactNode }) {
  await requireAuth(); // defense-in-depth behind proxy.ts

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
