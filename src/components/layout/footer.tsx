import Link from "next/link";
import { Container } from "@/components/ui/misc";
import { NewsletterForm } from "@/components/layout/newsletter";
import { FOOTER_NAV, SITE } from "@/lib/constants";

function InstagramIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-line bg-onyx-soft">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand + newsletter */}
          <div className="lg:col-span-4">
            <p className="font-display text-3xl tracking-[0.12em] text-ivory">
              {SITE.name.toUpperCase()}
            </p>
            <p className="mt-1 text-[0.6rem] uppercase tracking-[0.4em] text-gold">
              The Last Note
            </p>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
              A curated house of the world&apos;s finest fragrances, delivered
              across Bangladesh.
            </p>
            <div className="mt-7 max-w-xs">
              <p className="eyebrow !mb-3">Join the House</p>
              <NewsletterForm />
            </div>
          </div>

          {/* Nav columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            {Object.entries(FOOTER_NAV).map(([heading, links]) => (
              <div key={heading}>
                <p className="eyebrow !mb-4">{heading}</p>
                <ul className="space-y-3">
                  {links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-sm text-ivory-dim transition-colors hover:text-gold"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 sm:flex-row">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link
              href={SITE.socials.instagram}
              className="text-muted hover:text-gold"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </Link>
            <Link
              href={SITE.socials.facebook}
              className="text-muted hover:text-gold"
              aria-label="Facebook"
            >
              <FacebookIcon />
            </Link>
          </div>
          <p className="text-xs text-muted">
            Prices in BDT (৳) · Secure payments
          </p>
        </div>
      </Container>
    </footer>
  );
}
