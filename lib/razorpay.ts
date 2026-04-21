import Razorpay from "razorpay";
import crypto from "crypto";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn("⚠️ Razorpay keys not configured");
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID ?? "",
  key_secret: process.env.RAZORPAY_KEY_SECRET ?? "",
});

export const PLAN_AMOUNT = 49900;
export const TRIAL_DAYS = parseInt(process.env.NEXT_PUBLIC_TRIAL_DAYS ?? "30");

export async function getOrCreatePlan(): Promise<string> {
  try {
    const plans = await razorpay.plans.all({ count: 10 });
    const existing = (plans.items as any[]).find(
      (p: any) => p.item?.name === "Talrat Pro"
    );
    if (existing) return existing.id as string;

    const plan = await razorpay.plans.create({
      period: "monthly",
      interval: 1,
      item: {
        name: "Talrat Pro",
        amount: PLAN_AMOUNT,
        currency: "INR",
        description: "Talrat Pro Plan — ₹499/month",
      },
    } as any);

    return (plan as any).id as string;
  } catch (err) {
    console.error("Failed to get/create Razorpay plan:", err);
    throw err;
  }
}

export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
}