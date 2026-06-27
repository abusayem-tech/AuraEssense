import { Container } from "@/components/ui/misc";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-line pt-28 pb-12 lg:pt-36">
      <Container className="text-center">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-4 font-display text-5xl text-ivory sm:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-4 max-w-xl text-ivory-dim">{description}</p>
        )}
      </Container>
    </div>
  );
}
