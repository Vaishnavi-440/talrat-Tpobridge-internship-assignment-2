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

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id as string },
    });

    if (!subscription) {
      return new NextResponse(
        JSON.stringify({ subscription: null, hasAccess: false }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const now = new Date();

    // Calculate trial days remaining
    let trialDaysLeft = 0;
    if (subscription.trialEnd && subscription.status === "trialing") {
      const diff = subscription.trialEnd.getTime() - now.getTime();
      trialDaysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    // Has access if active or still in trial
    const hasAccess =
      subscription.status === "active" ||
      (subscription.status === "trialing" && trialDaysLeft > 0);

    return new NextResponse(
      JSON.stringify({ subscription, trialDaysLeft, hasAccess }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Subscription status error:", err);
    return new NextResponse(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}