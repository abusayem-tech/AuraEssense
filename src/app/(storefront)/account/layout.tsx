import { redirect } from "next/navigation";
import { Container } from "@/components/ui/misc";
import { AccountNav } from "@/components/account/account-nav";
import { getProfile } from "@/lib/auth";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login?redirect=/account");

  return (
    <div className="pt-28 lg:pt-32">
      <Container className="py-8 md:py-12">
        <div className="mb-8 md:mb-10">
          <p className="eyebrow">My Account</p>
          <h1 className="mt-2 break-words font-display text-3xl text-ivory sm:text-4xl">
            Welcome back{profile.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
          </h1>
        </div>
        <div className="grid gap-8 md:gap-10 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <AccountNav isAdmin={profile.role === "admin"} />
          </aside>
          <div className="lg:col-span-9">{children}</div>
        </div>
      </Container>
    </div>
  );
}
