"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function DebouncedSearch({
  placeholder,
  paramName = "search",
  delay = 400,
}: {
  placeholder: string;
  paramName?: string;
  delay?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get(paramName) ?? "");
  const isFirstRun = useRef(true);

  useEffect(() => {
    // Skip firing on mount — the URL already reflects the current value.
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) params.set(paramName, value.trim());
      else params.delete(paramName);
      params.delete("page"); // a new search always starts back at page 1
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, delay);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      className="rounded-lg border border-pt-border bg-pt-black-soft px-4 py-2 text-sm text-pt-cream focus:outline-none focus:border-pt-gold"
    />
  );
}
