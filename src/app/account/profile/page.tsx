import { ProfileForm } from "@/features/account/profile-form";
import { getAuthenticatedProfile } from "@/lib/supabase/auth-guards";

export default async function AccountProfilePage() {
  const profile = await getAuthenticatedProfile();
  if (!profile) return null;

  return (
    <div className="rounded-[var(--radius-xl)] border border-border bg-surface-secondary p-6 sm:p-8 space-y-6">
      <div>
        <p className="text-label-meta text-muted-olive">Personal Details</p>
        <h1 className="text-section-heading mt-1 text-deep-earth-olive">
          Your Profile
        </h1>
      </div>
      <ProfileForm profile={profile} />
    </div>
  );
}
