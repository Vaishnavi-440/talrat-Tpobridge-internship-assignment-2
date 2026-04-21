import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET ?? "dev-cron-secret";

  if (authHeader !== `Bearer ${cronSecret}`) {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const now = new Date();

    const expiredTrials = await prisma.subscription.findMany({
      where: {
        status: "trialing",
        trialEnd: { lt: now },
      },
      include: { user: true },
    });

    console.log(`Found ${expiredTrials.length} expired trials`);

    let updated = 0;
    let emailsSent = 0;

    for (const sub of expiredTrials) {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { status: "incomplete" },
      });
      updated++;

      if (sub.user.email && process.env.RESEND_API_KEY) {
        try {
          await resend.emails.send({
            from: `Talrat <${process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev"}>`,
            to: sub.user.email,
            subject: "Your Talrat trial has expired — Subscribe to continue",
            html: `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
                <h2>Hi ${sub.user.name ?? "there"}, your trial has ended</h2>
                <p>Your 30-day free trial of Talrat Pro has expired.</p>
                <p>Subscribe now to keep your profile active.</p>
                <a href="${process.env.NEXTAUTH_URL}/dashboard/billing"
                  style="display:inline-block;background:#f59e0b;color:#0f172a;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;">
                  Subscribe Now →
                </a>
              </div>
            `,
          });
          emailsSent++;
        } catch (emailErr) {
          console.error("Email failed:", emailErr);
        }
      }
    }

    return new NextResponse(
      JSON.stringify({ success: true, updated, emailsSent }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Cron job error:", err);
    return new NextResponse(
      JSON.stringify({ error: "Cron job failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}