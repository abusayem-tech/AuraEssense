import { Container } from "@/components/ui/misc";
import { PageHeader } from "@/components/ui/page-header";
import { getContentPage } from "@/lib/queries";

const FALLBACKS: Record<string, { title: string; body: string }> = {
  about: {
    title: "Our Story",
    body: "AuraEssence was born from a singular belief: that a fragrance is not an accessory, but a signature.",
  },
  faq: { title: "Frequently Asked Questions", body: "Answers to our most common questions will appear here." },
  "shipping-returns": { title: "Shipping & Returns", body: "Delivery and returns information will appear here." },
  privacy: { title: "Privacy Policy", body: "Our privacy commitments will appear here." },
  terms: { title: "Terms of Service", body: "Our terms of service will appear here." },
};

export async function ContentPageView({ slug }: { slug: string }) {
  const page = (await getContentPage(slug)) ?? FALLBACKS[slug] ?? {
    title: "Page",
    body: "",
  };

  return (
    <>
      <PageHeader eyebrow="AuraEssence" title={page.title} />
      <Container className="my-10 max-w-2xl md:my-16">
        <div className="space-y-6 leading-relaxed text-ivory-dim">
          {page.body.split("\n\n").map((para, i) => (
            <p key={i} className="whitespace-pre-line">
              {para}
            </p>
          ))}
        </div>
      </Container>
    </>
  );
}
