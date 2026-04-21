import { formatINR } from "@/lib/utils";

interface RateCardProps {
  hourlyRate: number;
}

export function RateCard({ hourlyRate }: RateCardProps) {
  const dayRate = hourlyRate * 8;
  const monthlyRate = hourlyRate * 8 * 20;

  const tiers = [
    {
      name: "Basic",
      desc: "Single day engagement",
      price: formatINR(dayRate),
      note: "8 hrs · one-time",
      highlight: false,
    },
    {
      name: "Standard",
      desc: "Monthly retainer",
      price: formatINR(monthlyRate),
      note: "20 days/month",
      highlight: true,
    },
    {
      name: "Premium",
      desc: "Custom scope",
      price: "Custom",
      note: "Contact for quote",
      highlight: false,
    },
  ];

  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8",
        textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
        Engagement Rates
      </h2>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 12, marginBottom: 14,
      }}>
        {tiers.map((tier) => (
          <div key={tier.name} style={{
            borderRadius: 14, padding: "20px 18px",
            border: tier.highlight
              ? "1px solid rgba(245,158,11,0.4)"
              : "1px solid #1e293b",
            background: tier.highlight
              ? "rgba(245,158,11,0.06)"
              : "rgba(15,23,42,0.6)",
            position: "relative",
          }}>
            {tier.highlight && (
              <span style={{
                position: "absolute", top: -10, left: "50%",
                transform: "translateX(-50%)",
                background: "#f59e0b", color: "#0f172a",
                fontSize: 10, fontWeight: 700, padding: "2px 10px",
                borderRadius: 10, whiteSpace: "nowrap",
              }}>POPULAR</span>
            )}
            <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>
              {tier.name}
            </div>
            <div style={{
              fontSize: tier.price === "Custom" ? 22 : 20,
              fontWeight: 800, color: "#f1f5f9", marginBottom: 4,
            }}>{tier.price}</div>
            <div style={{ fontSize: 12, color: "#475569" }}>{tier.desc}</div>
            <div style={{ fontSize: 11, color: "#334155", marginTop: 4 }}>{tier.note}</div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 12, color: "#475569" }}>
        Base rate: {formatINR(hourlyRate)}/hr · All rates are indicative. Contact for exact quote.
      </p>
    </div>
  );
}