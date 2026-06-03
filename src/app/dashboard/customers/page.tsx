import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import CustomersClient from "./client";

export default async function CustomersPage() {
  const { org } = await requireOrg();
  const customers = await prisma.customer.findMany({
    where: { orgId: org.id },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { _count: { select: { requests: true } } },
  });
  return <CustomersClient customers={customers} />;
}
