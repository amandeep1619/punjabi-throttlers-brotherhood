import { requireAdmin } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";
import AdminSubNav from "@/components/layout/AdminSubNav";
import Footer from "@/components/layout/Footer";

export default async function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin(); // defense-in-depth behind proxy.ts

  return (
    <>
      <Navbar />
      <AdminSubNav />
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-10">{children}</main>
      <Footer />
    </>
  );
}
