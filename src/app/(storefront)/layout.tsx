import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartSheet } from "@/components/cart/cart-sheet";
import { getProfile } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { getActiveBanners } from "@/lib/queries";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, settings, banners] = await Promise.all([
    getProfile(),
    getSettings(),
    getActiveBanners(),
  ]);

  return (
    <>
      <Header
        isAuthed={!!profile}
        isAdmin={profile?.role === "admin"}
        banners={banners}
      />
      <main className="relative z-10 flex-1">{children}</main>
      <Footer
        storeName={settings.storeName}
        contactEmail={settings.contactEmail}
        contactPhone={settings.contactPhone}
      />
      <CartSheet freeShipThreshold={settings.freeShipThreshold} />
    </>
  );
}
