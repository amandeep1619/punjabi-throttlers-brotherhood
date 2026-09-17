import Image from "next/image";

// Shown by each route group's loading.tsx while its page's Server Component
// data is still resolving. Sits alongside that group's layout.tsx (not above
// it), so the navbar/footer stay mounted and only this content area swaps in
// — no full-page flash on every navigation.
export default function LoadingScreen() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-2 border-pt-border" />
        <div className="absolute inset-0 rounded-full border-2 border-t-pt-gold border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        <div className="absolute inset-2 rounded-full overflow-hidden opacity-80">
          <Image src="/brand/logo.png" alt="" fill className="object-cover" />
        </div>
      </div>
      <p className="text-xs uppercase tracking-[0.3em] text-pt-muted">Loading</p>
    </div>
  );
}
