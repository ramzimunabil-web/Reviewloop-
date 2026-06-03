import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ReviewFlow from "./flow";

export const dynamic = "force-dynamic";

export default async function PublicReviewPage({
  params,
}: {
  params: { slug: string; token: string };
}) {
  const request = await prisma.reviewRequest.findUnique({
    where: { token: params.token },
    include: { organization: true, customer: true },
  });
  if (!request || request.organization.slug !== params.slug) notFound();

  // Mark as opened (first view only)
  if (request.status === "SENT" || request.status === "PENDING") {
    await prisma.reviewRequest.update({
      where: { token: params.token },
      data: { status: "OPENED", openedAt: new Date() },
    });
  }

  const org = request.organization;
  return (
    <ReviewFlow
      token={request.token}
      businessName={org.name}
      customerName={request.customer.name}
      brandColor={org.brandColor}
      hasGoogleUrl={!!org.googleReviewUrl}
      alreadyReviewed={request.status === "REVIEWED"}
    />
  );
}
