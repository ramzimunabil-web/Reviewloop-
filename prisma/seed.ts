import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAILS || "demo@reviewloop.app").split(",")[0].trim().toLowerCase();
  const passwordHash = await bcrypt.hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: "Demo Owner", passwordHash, isAdmin: true },
  });

  let org = await prisma.organization.findUnique({ where: { slug: "maple-auto" } });
  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: "Maple Auto Repair",
        slug: "maple-auto",
        googleReviewUrl: "https://g.page/r/example/review",
        messageTemplate: "Hi {{name}}, thanks for choosing {{business}}! Mind sharing how we did?",
        plan: "PRO",
        subscriptionStatus: "TRIALING",
        trialEndsAt: new Date(Date.now() + 10 * 86400000),
        onboardingComplete: true,
        memberships: { create: { userId: user.id, role: "OWNER" } },
      },
    });
  }

  const names = ["Jane Cooper", "Marcus Lee", "Aisha Khan", "Tom Becker", "Sofia Ramos", "Liam O'Neil"];
  for (const [i, name] of names.entries()) {
    const customer = await prisma.customer.create({
      data: { orgId: org.id, name, email: `${name.split(" ")[0].toLowerCase()}@example.com` },
    });
    const statuses = ["REVIEWED", "REVIEWED", "OPENED", "SENT", "FEEDBACK", "REVIEWED"] as const;
    const status = statuses[i];
    const rating = status === "REVIEWED" ? 5 : status === "FEEDBACK" ? 2 : null;
    const req = await prisma.reviewRequest.create({
      data: {
        orgId: org.id,
        customerId: customer.id,
        status,
        rating,
        sentAt: new Date(Date.now() - i * 86400000),
        openedAt: status === "SENT" ? null : new Date(),
      },
    });
    if (status === "FEEDBACK") {
      await prisma.feedback.create({
        data: { orgId: org.id, requestId: req.id, rating: 2, message: "Waited too long for my car. Otherwise friendly staff." },
      });
    }
  }

  console.log(`Seeded. Login: ${email} / password123`);
}

main().finally(() => prisma.$disconnect());
