import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendContactEmail } from "@/lib/email";
import { createContactRateLimiter, getIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    // Rate limiting
    const ip = getIp(req);
    const limiter = createContactRateLimiter();
    if (limiter) {
      const { success } = await limiter.limit(`contact:${ip}`);
      if (!success) {
        return new NextResponse(
          JSON.stringify({ error: "Too many requests. Please wait a few minutes." }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return new NextResponse(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { slug, name, email, message } = body;

    if (!slug || !name || !email || !message) {
      return new NextResponse(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (message.trim().length < 10) {
      return new NextResponse(
        JSON.stringify({ error: "Message is too short" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const profile = await prisma.profile.findUnique({
      where: { slug },
      include: { user: true },
    });

    if (!profile) {
      return new NextResponse(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    await prisma.lead.create({
      data: {
        slug,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        message: message.trim(),
        source: "contact_form",
      },
    });

    if (profile.user.email && process.env.RESEND_API_KEY) {
      try {
        await sendContactEmail({
          toEmail: profile.user.email,
          toName: profile.user.name ?? "there",
          fromName: name.trim(),
          fromEmail: email.trim(),
          message: message.trim(),
          profileSlug: slug,
        });
      } catch (emailErr) {
        console.error("Email failed (lead still saved):", emailErr);
      }
    }

    return new NextResponse(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Contact API error:", err);
    return new NextResponse(
      JSON.stringify({ error: "Failed to send message. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}