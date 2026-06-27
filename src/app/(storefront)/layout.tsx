import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartSheet } from "@/components/cart/cart-sheet";
import { getProfile } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, settings] = await Promise.all([getProfile(), getSettings()]);

  return (
    <>
      <Header isAuthed={!!profile} isAdmin={profile?.role === "admin"} />
      <main className="relative z-10 flex-1">{children}</main>
      <Footer />
      <CartSheet freeShipThreshold={settings.freeShipThreshold} />
    </>
  );
}
