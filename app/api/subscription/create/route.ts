import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { razorpay, getOrCreatePlan, TRIAL_DAYS } from "@/lib/razorpay";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const userId = session.user.id as string;

    // Check existing active subscription
    const existing = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (existing && ["active", "trialing"].includes(existing.status)) {
      return new NextResponse(
        JSON.stringify({
          error: "You already have an active subscription",
          subscription: existing,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get or create Razorpay plan
    let planId: string;
    try {
      planId = await getOrCreatePlan();
    } catch (planErr) {
      console.error("Plan creation failed:", planErr);
      return new NextResponse(
        JSON.stringify({ error: "Failed to create plan. Check Razorpay keys." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create Razorpay subscription
    let rzpSubscription: any;
    try {
      rzpSubscription = await razorpay.subscriptions.create({
        plan_id: planId,
        total_count: 12,
        quantity: 1,
        trial_period: TRIAL_DAYS,
        trial_amount: 0,
        notify_info: {
          notify_phone: "",
          notify_email: session.user.email ?? "",
        },
      } as any);
    } catch (rzpErr: any) {
      console.error("Razorpay subscription creation failed:", rzpErr);
      return new NextResponse(
        JSON.stringify({
          error: rzpErr?.error?.description ?? "Failed to create Razorpay subscription",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const now = new Date();
    const trialEnd = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
    const periodEnd = new Date(now.getTime() + 31 * 24 * 60 * 60 * 1000);

    // Save to DB
    const subscription = await prisma.subscription.upsert({
      where: { userId },
      update: {
        razorpaySubscriptionId: rzpSubscription.id,
        razorpayPlanId: planId,
        status: "trialing",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        trialStart: now,
        trialEnd,
        cancelAtPeriodEnd: false,
      },
      create: {
        userId,
        razorpaySubscriptionId: rzpSubscription.id,
        razorpayPlanId: planId,
        status: "trialing",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        trialStart: now,
        trialEnd,
      },
    });

    return new NextResponse(
      JSON.stringify({
        subscriptionId: rzpSubscription.id,
        shortUrl: rzpSubscription.short_url ?? null,
        subscription,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Subscription create error:", err);
    return new NextResponse(
      JSON.stringify({ error: err?.message ?? "Failed to create subscription" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}