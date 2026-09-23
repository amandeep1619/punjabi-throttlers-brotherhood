import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Member } from "@/models/Member";
import ClientProviders from "@/components/ClientProviders";
import ToastViewport from "@/components/ui/ToastViewport";
import PwaRegister from "@/components/PwaRegister";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Punjabi Throttlers Brotherhood",
    template: "%s | Punjabi Throttlers Brotherhood",
  },
  description:
    "A brotherhood of riders united by the road. Group rides, real camaraderie, and a community of responsible riders.",
  openGraph: {
    title: "Punjabi Throttlers Brotherhood",
    description: "A brotherhood of riders united by the road.",
    siteName: "Punjabi Throttlers Brotherhood",
    type: "website",
    images: ["/brand/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Punjabi Throttlers Brotherhood",
    description: "A brotherhood of riders united by the road.",
    images: ["/brand/logo.png"],
  },
  appleWebApp: {
    capable: true,
    title: "PT Brotherhood",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0908",
  colorScheme: "dark",
};

async function getInitialUser() {
  const session = await getSession();
  if (!session) return null;
  await connectToDatabase();
  const member = await Member.findById(session.userId).select("memberId fullName role photoUrl").lean();
  if (!member) return null;
  return {
    id: String(member._id),
    memberId: member.memberId,
    name: member.fullName,
    role: member.role,
    photoUrl: member.photoUrl ?? null,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialUser = await getInitialUser();

  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-pt-black text-pt-cream">
        <ClientProviders initialUser={initialUser}>
          {children}
          <ToastViewport />
        </ClientProviders>
        <PwaRegister />
      </body>
    </html>
  );
}
