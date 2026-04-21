import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!subscription) {
      return new NextResponse(
        JSON.stringify({ error: "No subscription found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!["active", "trialing"].includes(subscription.status)) {
      return new NextResponse(
        JSON.stringify({ error: "Subscription is not active" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Cancel on Razorpay at period end
    if (subscription.razorpaySubscriptionId) {
      try {
        await razorpay.subscriptions.cancel(
          subscription.razorpaySubscriptionId,
          false // false = cancel at period end, not immediately
        );
      } catch (err) {
        console.error("Razorpay cancel error:", err);
      }
    }

    // Update DB
    const updated = await prisma.subscription.update({
      where: { userId: session.user.id },
      data: { cancelAtPeriodEnd: true },
    });

    return new NextResponse(
      JSON.stringify({ success: true, subscription: updated }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Cancel subscription error:", err);
    return new NextResponse(
      JSON.stringify({ error: "Failed to cancel subscription" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}