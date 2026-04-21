import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SubscribeButton } from "@/components/dashboard/SubscribeButton";
import Link from "next/link";

function formatINR(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  trialing:   { label: "Trial Active",  color: "#22c55e", bg: "rgba(34,197,94,0.1)",    border: "rgba(34,197,94,0.3)" },
  active:     { label: "Active",        color: "#22c55e", bg: "rgba(34,197,94,0.1)",    border: "rgba(34,197,94,0.3)" },
  cancelled:  { label: "Cancelled",     color: "#f87171", bg: "rgba(248,113,113,0.1)",  border: "rgba(248,113,113,0.3)" },
  past_due:   { label: "Past Due",      color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   border: "rgba(245,158,11,0.3)" },
  incomplete: { label: "Expired",       color: "#f87171", bg: "rgba(248,113,113,0.1)",  border: "rgba(248,113,113,0.3)" },
};

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const [subscription, payments] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
    prisma.payment.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const now = new Date();
  const trialDaysLeft = subscription?.trialEnd
    ? Math.max(0, Math.ceil((new Date(subscription.trialEnd).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const isActive = subscription?.status === "active";
  const isTrialing = subscription?.status === "trialing" && trialDaysLeft > 0;
  const hasAccess = isActive || isTrialing;
  const statusConfig = STATUS_CONFIG[subscription?.status ?? ""] ?? null;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 80px" }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Link href="/dashboard" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          color: "#64748b", fontSize: 13, textDecoration: "none",
          padding: "7px 14px", borderRadius: 8, border: "1px solid #1e293b",
          background: "rgba(15,23,42,0.5)", marginBottom: 20,
        }}>← Dashboard</Link>

        <h1 style={{ fontSize: 30, fontWeight: 800, color: "#f1f5f9",
          fontFamily: "var(--font-playfair)", marginBottom: 6 }}>
          Billing
        </h1>
        <p style={{ color: "#64748b", fontSize: 14 }}>
          Manage your subscription and payment history
        </p>
      </div>

      {/* Current Plan Card */}
      <div style={{
        borderRadius: 16, border: "1px solid #1e293b",
        background: "rgba(15,23,42,0.7)", padding: 28, marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>
              {process.env.NEXT_PUBLIC_PLAN_NAME ?? "Pro"} Plan
            </h2>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#f59e0b" }}>
              ₹{process.env.NEXT_PUBLIC_PLAN_PRICE ?? "499"}
              <span style={{ fontSize: 14, color: "#64748b", fontWeight: 400 }}>/month</span>
            </div>
          </div>

          {statusConfig && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 500,
              background: statusConfig.bg, border: `1px solid ${statusConfig.border}`,
              color: statusConfig.color,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusConfig.color }} />
              {statusConfig.label}
            </span>
          )}
        </div>

        {/* Trial banner */}
        {isTrialing && (
          <div style={{
            borderRadius: 10, padding: "14px 18px", marginBottom: 20,
            background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 10,
          }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#4ade80", marginBottom: 2 }}>
                🎉 Free trial active
              </p>
              <p style={{ fontSize: 13, color: "#64748b" }}>
                {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} remaining —
                trial ends {formatDate(subscription!.trialEnd!)}
              </p>
            </div>
          </div>
        )}

        {/* Subscription details */}
        {subscription && (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { label: "Status", value: statusConfig?.label ?? subscription.status },
              subscription.trialEnd
                ? { label: "Trial ends", value: formatDate(subscription.trialEnd) }
                : null,
              { label: "Current period", value: `${formatDate(subscription.currentPeriodStart)} → ${formatDate(subscription.currentPeriodEnd)}` },
              subscription.cancelAtPeriodEnd
                ? { label: "Cancellation", value: `Cancels on ${formatDate(subscription.currentPeriodEnd)}` }
                : null,
            ]
              .filter(Boolean)
              .map((item) => (
                <div key={item!.label} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "12px 0", borderTop: "1px solid #1e293b",
                }}>
                  <span style={{ fontSize: 13, color: "#64748b" }}>{item!.label}</span>
                  <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>{item!.value}</span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Subscribe / Cancel actions */}
      {!hasAccess && (
        <div style={{
          borderRadius: 16, border: "1px solid rgba(245,158,11,0.2)",
          background: "rgba(245,158,11,0.04)", padding: 28, marginBottom: 20,
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>
            Start your free trial
          </h3>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20, lineHeight: 1.6 }}>
            Get 30 days free, then ₹499/month. Cancel anytime. Includes public profile,
            analytics, lead management, share kit and more.
          </p>
          <SubscribeButton />
        </div>
      )}

      {isActive && !subscription?.cancelAtPeriodEnd && (
        <div style={{
          borderRadius: 16, border: "1px solid #1e293b",
          background: "rgba(15,23,42,0.5)", padding: 24, marginBottom: 20,
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9", marginBottom: 6 }}>
            Cancel Subscription
          </h3>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16, lineHeight: 1.6 }}>
            Your subscription will remain active until the end of the current billing period.
          </p>
          <CancelButton />
        </div>
      )}

      {subscription?.cancelAtPeriodEnd && (
        <div style={{
          borderRadius: 12, padding: "14px 18px", marginBottom: 20,
          background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)",
        }}>
          <p style={{ fontSize: 14, color: "#f87171" }}>
            ⚠ Your subscription will cancel on {formatDate(subscription.currentPeriodEnd)}.
            You'll retain access until then.
          </p>
        </div>
      )}

      {/* Payment History */}
      <div style={{
        borderRadius: 16, border: "1px solid #1e293b",
        background: "rgba(15,23,42,0.7)", padding: 28,
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#f1f5f9", marginBottom: 4 }}>
          Payment History
        </h2>
        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
          Your recent transactions
        </p>

        {payments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#334155" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>💳</div>
            <p style={{ fontSize: 14 }}>No payments yet</p>
          </div>
        ) : (
          <div>
            {payments.map((p, i) => (
              <div key={p.id} style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between", flexWrap: "wrap", gap: 12,
                padding: "14px 0",
                borderBottom: i < payments.length - 1 ? "1px solid #1e293b" : "none",
              }}>
                <div>
                  <div style={{ fontSize: 14, color: "#f1f5f9", fontWeight: 500, marginBottom: 2 }}>
                    {p.description ?? "Subscription payment"}
                  </div>
                  <div style={{ fontSize: 12, color: "#475569" }}>
                    {formatDate(p.createdAt)} · {p.razorpayPaymentId}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>
                    {formatINR(p.amount)}
                  </span>
                  <span style={{
                    fontSize: 11, padding: "2px 8px", borderRadius: 6,
                    background: p.status === "captured"
                      ? "rgba(34,197,94,0.1)" : "rgba(248,113,113,0.1)",
                    border: p.status === "captured"
                      ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(248,113,113,0.2)",
                    color: p.status === "captured" ? "#4ade80" : "#f87171",
                    textTransform: "capitalize",
                  }}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CancelButton() {
  async function cancelSubscription() {
    "use server";
    const { auth } = await import("@/lib/auth");
    const { prisma } = await import("@/lib/prisma");

    const session = await auth();
    if (!session?.user?.id) return;

    const sub = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!sub) return;

    if (sub.razorpaySubscriptionId) {
      try {
        const { razorpay } = await import("@/lib/razorpay");
        await razorpay.subscriptions.cancel(sub.razorpaySubscriptionId, false);
      } catch (e) {
        console.error("Razorpay cancel error:", e);
      }
    }

    await prisma.subscription.update({
      where: { userId: session.user.id },
      data: { cancelAtPeriodEnd: true },
    });
  }

  return (
    <form action={cancelSubscription}>
      <button
        type="submit"
        style={{
          padding: "10px 22px", borderRadius: 8,
          border: "1px solid rgba(248,113,113,0.3)",
          background: "rgba(248,113,113,0.08)",
          color: "#f87171", fontSize: 13,
          fontWeight: 500, cursor: "pointer",
        }}
      >
        Cancel Subscription
      </button>
    </form>
  );
}