import Link from "next/link";
import { SITE } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <div className="flex items-center justify-center py-8">
        <Link href="/" className="text-center">
          <span className="font-display text-2xl tracking-[0.15em] text-ivory">
            {SITE.name.toUpperCase()}
          </span>
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center px-5 pb-16">
        {children}
      </div>
    </div>
  );
}
