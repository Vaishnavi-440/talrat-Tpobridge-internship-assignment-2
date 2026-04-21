import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return new NextResponse(
        JSON.stringify({ leads: [] }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const leads = await prisma.lead.findMany({
      where: { slug: profile.slug },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return new NextResponse(
      JSON.stringify({ leads }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Recent leads API error:", err);
    return new NextResponse(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}