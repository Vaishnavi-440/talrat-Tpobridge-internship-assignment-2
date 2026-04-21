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
        JSON.stringify({
          totalViews: 0, totalLeads: 0,
          viewsOverTime: [], recentLeads: [],
          sourceBreakdown: [],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const slug = profile.slug;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Total views
    const [totalViews, views7d, totalLeads, allViews, sourceData] =
      await Promise.all([
        prisma.profileView.count({ where: { profileSlug: slug } }),
        prisma.profileView.count({
          where: { profileSlug: slug, viewedAt: { gte: sevenDaysAgo } },
        }),
        prisma.lead.count({ where: { slug } }),
        prisma.profileView.findMany({
          where: { profileSlug: slug, viewedAt: { gte: thirtyDaysAgo } },
          select: { viewedAt: true },
          orderBy: { viewedAt: "asc" },
        }),
        prisma.profileView.groupBy({
          by: ["source"],
          where: { profileSlug: slug },
          _count: { source: true },
        }),
      ]);

    // Build views over time (last 30 days)
    const viewsByDate: Record<string, number> = {};

    // Pre-fill all 30 days with 0
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      viewsByDate[key] = 0;
    }

    // Count actual views
    for (const v of allViews) {
      const key = v.viewedAt.toISOString().slice(0, 10);
      if (key in viewsByDate) {
        viewsByDate[key] = (viewsByDate[key] ?? 0) + 1;
      }
    }

    const viewsOverTime = Object.entries(viewsByDate).map(([date, count]) => ({
      date,
      count,
    }));

    // Source breakdown
    const sourceBreakdown = sourceData.map((s) => ({
      source: s.source ?? "direct",
      count: s._count.source,
    }));

    return new NextResponse(
      JSON.stringify({
        totalViews,
        views7d,
        totalLeads,
        viewsOverTime,
        sourceBreakdown,
        slug,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Stats API error:", err);
    return new NextResponse(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}