import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import { Container } from "@/components/ui/misc";
import { PageHeader } from "@/components/ui/page-header";
import { ContactForm } from "@/components/contact-form";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach the AuraEssence concierge.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Concierge"
        title="Get in Touch"
        description="Our fragrance concierge is here to help you discover and care for your collection."
      />
      <Container className="my-10 grid gap-10 md:my-16 md:gap-12 lg:grid-cols-2">
        <div className="space-y-8">
          {[
            { icon: Mail, label: "Email", value: SITE.email },
            { icon: Phone, label: "Phone", value: SITE.phone },
            { icon: MapPin, label: "Boutique", value: SITE.address },
          ].map((c) => (
            <div key={c.label} className="flex items-start gap-4">
              <c.icon size={20} className="mt-1 text-gold" />
              <div className="min-w-0">
                <p className="eyebrow !mb-1">{c.label}</p>
                <p className="break-words text-ivory-dim">{c.value}</p>
              </div>
            </div>
          ))}
        </div>
        <ContactForm />
      </Container>
    </>
  );
}
