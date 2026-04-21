import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createViewRateLimiter, getIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, source } = body;

    if (!slug) {
      return new NextResponse(
        JSON.stringify({ error: "slug is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const ip = getIp(req);
    const userAgent = req.headers.get("user-agent") ?? undefined;

    // Rate limit: 1 view per IP per slug per hour
    const limiter = createViewRateLimiter();
    if (limiter) {
      const { success } = await limiter.limit(`view:${ip}:${slug}`);
      if (!success) {
        // Silently ignore — don't tell the client
        return new NextResponse(
          JSON.stringify({ success: true, counted: false }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Resolve source
    const resolvedSource = source ?? "direct";

    await prisma.profileView.create({
      data: {
        profileSlug: slug,
        viewerIp: ip,
        userAgent,
        source: resolvedSource,
      },
    });

    return new NextResponse(
      JSON.stringify({ success: true, counted: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("View tracking error:", err);
    return new NextResponse(
      JSON.stringify({ success: false }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}