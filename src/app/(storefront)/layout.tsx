import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartSheet } from "@/components/cart/cart-sheet";
import { getProfile } from "@/lib/auth";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  return (
    <>
      <Header isAuthed={!!profile} isAdmin={profile?.role === "admin"} />
      <main className="relative z-10 flex-1">{children}</main>
      <Footer />
      <CartSheet />
    </>
  );
}
