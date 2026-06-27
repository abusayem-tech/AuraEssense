import { ProfileForm } from "@/components/account/profile-form";
import { getProfile } from "@/lib/auth";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const profile = await getProfile();

  return (
    <div>
      <h2 className="mb-6 font-display text-2xl text-ivory">Profile Details</h2>
      <ProfileForm
        fullName={profile?.full_name ?? ""}
        phone={profile?.phone ?? ""}
        email={profile?.email ?? ""}
      />
    </div>
  );
}
