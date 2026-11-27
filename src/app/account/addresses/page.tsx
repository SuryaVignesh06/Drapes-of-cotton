import { AddressBook } from "@/features/account/address-book";
import { getUserAddresses } from "@/lib/services/customer.service";
import { getAuthenticatedProfile } from "@/lib/supabase/auth-guards";

export default async function AccountAddressesPage() {
  const profile = await getAuthenticatedProfile();
  if (!profile) return null;

  const addresses = await getUserAddresses(profile.id);
  return <AddressBook addresses={addresses} />;
}
