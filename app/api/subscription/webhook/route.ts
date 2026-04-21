import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature") ?? "";
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";

    // Verify signature
    if (secret && !verifyWebhookSignature(body, signature, secret)) {
      console.error("Invalid webhook signature");
      return new NextResponse(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const event = JSON.parse(body);
    const eventType: string = event.event;
    const payload = event.payload;

    console.log("Razorpay webhook:", eventType);

    switch (eventType) {
      case "subscription.activated": {
        const sub = payload.subscription?.entity;
        if (sub?.id) {
          await prisma.subscription.updateMany({
            where: { razorpaySubscriptionId: sub.id },
            data: {
              status: "active",
              currentPeriodStart: new Date(sub.current_start * 1000),
              currentPeriodEnd: new Date(sub.current_end * 1000),
            },
          });
        }
        break;
      }

      case "subscription.charged": {
        const sub = payload.subscription?.entity;
        const payment = payload.payment?.entity;

        if (sub?.id) {
          await prisma.subscription.updateMany({
            where: { razorpaySubscriptionId: sub.id },
            data: {
              status: "active",
              currentPeriodStart: new Date(sub.current_start * 1000),
              currentPeriodEnd: new Date(sub.current_end * 1000),
            },
          });
        }

        if (payment?.id) {
          const dbSub = await prisma.subscription.findFirst({
            where: { razorpaySubscriptionId: sub?.id },
          });

          if (dbSub) {
            await prisma.payment.upsert({
              where: { razorpayPaymentId: payment.id },
              update: { status: "captured" },
              create: {
                userId: dbSub.userId,
                subscriptionId: dbSub.id,
                razorpayPaymentId: payment.id,
                razorpayOrderId: payment.order_id ?? null,
                amount: payment.amount,
                currency: payment.currency ?? "INR",
                status: "captured",
                description: "Monthly subscription payment",
              },
            });
          }
        }
        break;
      }

      case "subscription.cancelled": {
        const sub = payload.subscription?.entity;
        if (sub?.id) {
          await prisma.subscription.updateMany({
            where: { razorpaySubscriptionId: sub.id },
            data: { status: "cancelled", cancelAtPeriodEnd: true },
          });
        }
        break;
      }

      case "subscription.completed": {
        const sub = payload.subscription?.entity;
        if (sub?.id) {
          await prisma.subscription.updateMany({
            where: { razorpaySubscriptionId: sub.id },
            data: { status: "cancelled" },
          });
        }
        break;
      }

      case "payment.failed": {
        const payment = payload.payment?.entity;
        if (payment?.id) {
          const dbSub = await prisma.subscription.findFirst({
            where: { razorpaySubscriptionId: payment.subscription_id },
          });

          if (dbSub) {
            await prisma.payment.upsert({
              where: { razorpayPaymentId: payment.id },
              update: { status: "failed" },
              create: {
                userId: dbSub.userId,
                subscriptionId: dbSub.id,
                razorpayPaymentId: payment.id,
                amount: payment.amount ?? 0,
                currency: "INR",
                status: "failed",
                description: "Failed payment",
              },
            });

            await prisma.subscription.update({
              where: { id: dbSub.id },
              data: { status: "past_due" },
            });
          }
        }
        break;
      }

      default:
        console.log("Unhandled webhook event:", eventType);
    }

    return new NextResponse(
      JSON.stringify({ received: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Webhook error:", err);
    return new NextResponse(
      JSON.stringify({ error: "Webhook processing failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}