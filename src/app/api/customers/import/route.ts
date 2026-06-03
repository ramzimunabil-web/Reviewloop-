import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/session";

export async function POST(req: Request) {
  const { org } = await requireOrg();
  const { csv } = await req.json();
  if (typeof csv !== "string" || !csv.trim()) {
    return NextResponse.json({ error: "Empty file." }, { status: 400 });
  }
  let rows: Record<string, string>[];
  try {
    rows = parse(csv, { columns: (h: string[]) => h.map((c) => c.trim().toLowerCase()), skip_empty_lines: true, trim: true });
  } catch {
    return NextResponse.json({ error: "Could not read CSV. Use columns: name, email, phone." }, { status: 400 });
  }
  const data = rows
    .map((r) => ({
      orgId: org.id,
      name: r.name || r["full name"] || "Customer",
      email: r.email || null,
      phone: r.phone || r.mobile || null,
    }))
    .filter((r) => r.email || r.phone);

  if (!data.length) return NextResponse.json({ error: "No rows with an email or phone found." }, { status: 400 });
  await prisma.customer.createMany({ data });
  return NextResponse.json({ ok: true, imported: data.length });
}
