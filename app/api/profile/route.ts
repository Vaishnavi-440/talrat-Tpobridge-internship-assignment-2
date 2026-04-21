import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";
import { nanoid } from "nanoid";

export async function GET() {
  try {
    const session = await auth();
    console.log("GET /api/profile - session:", session?.user?.id ?? "no session");

    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ profile: null }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    return new NextResponse(
      JSON.stringify({ profile: profile ?? null }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("GET /api/profile error:", err);
    return new NextResponse(
      JSON.stringify({ profile: null }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    console.log("PUT /api/profile - session:", session?.user?.id ?? "no session");

    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: "You must be logged in" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.json();
    const {
      title,
      bio,
      avatarUrl,
      skills,
      hourlyRate,
      availability,
      socialLinks,
      slug: rawSlug,
    } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    let slug = rawSlug?.trim()
      ? slugify(rawSlug.trim(), { lower: true, strict: true })
      : slugify(user?.name ?? "user", { lower: true, strict: true }) + "-" + nanoid(5);

    const existing = await prisma.profile.findUnique({ where: { slug } });
    if (existing && existing.userId !== session.user.id) {
      slug = slug + "-" + nanoid(4);
    }

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        title: title || null,
        bio: bio || null,
        avatarUrl: avatarUrl || null,
        skills: skills ?? [],
        hourlyRate: hourlyRate ? parseInt(hourlyRate) : null,
        availability: availability ?? "available",
        socialLinks: socialLinks ?? {},
        slug,
      },
      create: {
        userId: session.user.id,
        slug,
        title: title || null,
        bio: bio || null,
        avatarUrl: avatarUrl || null,
        skills: skills ?? [],
        hourlyRate: hourlyRate ? parseInt(hourlyRate) : null,
        availability: availability ?? "available",
        socialLinks: socialLinks ?? {},
      },
    });

    return new NextResponse(
      JSON.stringify({ profile }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("PUT /api/profile error:", err);
    return new NextResponse(
      JSON.stringify({ error: String(err) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}