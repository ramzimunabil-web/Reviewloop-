import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentOrg } from "@/lib/session";
import OnboardingWizard from "./wizard";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const org = await getCurrentOrg();
  if (org?.onboardingComplete) redirect("/dashboard");
  return <OnboardingWizard defaultName={org?.name ?? ""} />;
}
