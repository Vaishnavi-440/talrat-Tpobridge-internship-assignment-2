import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const { name, email, image } = session.user;

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id as string },
  });

  const initials = name
    ? name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : email?.[0]?.toUpperCase() ?? "U";

  const stats = [
    { label: "Conversations", value: "0", note: "Getting started" },
    { label: "Messages Sent", value: "0", note: "No messages yet" },
    { label: "Plan", value: "Free", note: "30-day trial" },
  ];

  const details = [
    { label: "Full name", value: name ?? "—" },
    { label: "Email address", value: email ?? "—" },
    { label: "Auth provider", value: "Google" },
    { label: "Account status", value: "Active ✓" },
  ];

  const profileUrl = profile?.slug
    ? `https://talrat.com/p/${profile.slug}`
    : null;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>

      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 40, flexWrap: "wrap", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative" }}>
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={name ?? "User"} style={{
                width: 56, height: 56, borderRadius: "50%",
                border: "2px solid rgba(245,158,11,0.4)", objectFit: "cover",
              }} />
            ) : (
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "#f59e0b", display: "flex",
                alignItems: "center", justifyContent: "center",
                border: "2px solid rgba(245,158,11,0.4)",
                fontWeight: 700, fontSize: 20, color: "#0f172a",
              }}>{initials}</div>
            )}
            <span style={{
              position: "absolute", bottom: 2, right: 2,
              width: 12, height: 12, borderRadius: "50%",
              background: "#22c55e", border: "2px solid #020617",
            }} />
          </div>
          <div>
            <h1 style={{
              fontSize: 24, fontWeight: 700, color: "#f1f5f9",
              fontFamily: "var(--font-playfair)", marginBottom: 4,
            }}>
              Welcome back{name ? `, ${name.split(" ")[0]}` : ""}!
            </h1>
            <p style={{ color: "#64748b", fontSize: 14 }}>{email}</p>
          </div>
        </div>

        <form action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}>
          <button type="submit" style={{
            padding: "8px 18px", borderRadius: 8,
            border: "1px solid #334155", background: "transparent",
            color: "#e2e8f0", fontSize: 13, fontWeight: 500, cursor: "pointer",
          }}>Sign out</button>
        </form>
      </div>

      {/* ── THREE ACTION CARDS ── */}
{/* ── FOUR ACTION CARDS (2x2) ── */}
<div style={{
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 14,
  marginBottom: 24,
}}>
  {/* Edit Profile */}
  <div style={{
    borderRadius: 14, border: "1px solid rgba(245,158,11,0.25)",
    background: "rgba(245,158,11,0.06)", padding: "22px",
  }}>
    <div style={{ fontSize: 24, marginBottom: 10 }}>✏️</div>
    <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 5 }}>Edit Profile</div>
    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16, lineHeight: 1.5 }}>Update skills, rate and bio</div>
    <a href="/dashboard/profile" style={{
      display: "inline-block", padding: "8px 16px", borderRadius: 8,
      background: "#f59e0b", color: "#0f172a", fontWeight: 700, fontSize: 12, textDecoration: "none",
    }}>Edit →</a>
  </div>

  {/* Share Profile */}
  <div style={{
    borderRadius: 14, border: "1px solid rgba(99,102,241,0.25)",
    background: "rgba(99,102,241,0.06)", padding: "22px",
  }}>
    <div style={{ fontSize: 24, marginBottom: 10 }}>🔗</div>
    <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 5 }}>Share Profile</div>
    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16, lineHeight: 1.5 }}>LinkedIn, WhatsApp & email templates</div>
    <a href="/dashboard/share" style={{
      display: "inline-block", padding: "8px 16px", borderRadius: 8,
      background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.4)",
      color: "#a5b4fc", fontWeight: 700, fontSize: 12, textDecoration: "none",
    }}>Share →</a>
  </div>

  {/* Analytics */}
  <div style={{
    borderRadius: 14, border: "1px solid rgba(34,197,94,0.25)",
    background: "rgba(34,197,94,0.06)", padding: "22px",
  }}>
    <div style={{ fontSize: 24, marginBottom: 10 }}>📊</div>
    <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 5 }}>Analytics</div>
    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16, lineHeight: 1.5 }}>Views, leads and traffic sources</div>
    <a href="/dashboard/analytics" style={{
      display: "inline-block", padding: "8px 16px", borderRadius: 8,
      background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)",
      color: "#4ade80", fontWeight: 700, fontSize: 12, textDecoration: "none",
    }}>View →</a>
  </div>

  {/* Billing */}
  <div style={{
    borderRadius: 14, border: "1px solid rgba(168,85,247,0.25)",
    background: "rgba(168,85,247,0.06)", padding: "22px",
  }}>
    <div style={{ fontSize: 24, marginBottom: 10 }}>💳</div>
    <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 5 }}>Billing</div>
    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16, lineHeight: 1.5 }}>Subscription, trial & payment history</div>
    <a href="/dashboard/billing" style={{
      display: "inline-block", padding: "8px 16px", borderRadius: 8,
      background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)",
      color: "#c4b5fd", fontWeight: 700, fontSize: 12, textDecoration: "none",
    }}>Manage →</a>
  </div>
</div>

      {profileUrl && (
        <div style={{
          borderRadius: 12,
          border: "1px solid rgba(245,158,11,0.2)",
          background: "rgba(245,158,11,0.04)",
          padding: "14px 20px",
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap", gap: 10, marginBottom: 16,
        }}>
          <div>
            <p style={{ fontSize: 11, color: "#64748b", marginBottom: 3,
              textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Your public profile
            </p>
            <p style={{ fontSize: 14, color: "#fbbf24", fontWeight: 600 }}>
              {profileUrl}
            </p>
          </div>
          <a href={`/p/${profile?.slug}`} target="_blank" rel="noopener noreferrer"
            style={{
              padding: "6px 14px", borderRadius: 7,
              border: "1px solid rgba(245,158,11,0.3)",
              background: "transparent", color: "#fbbf24",
              fontSize: 12, textDecoration: "none", fontWeight: 500,
            }}>
            Preview ↗
          </a>
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        marginBottom: 24,
      }}>
        <div style={{
          borderRadius: 14,
          border: "1px solid rgba(245,158,11,0.25)",
          background: "rgba(245,158,11,0.06)",
          padding: "24px",
        }}>
          <div style={{ fontSize: 26, marginBottom: 12 }}>✏️</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>
            Edit Profile
          </div>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 18, lineHeight: 1.6 }}>
            Update your skills, hourly rate, bio and social links
          </div>
          <a href="/dashboard/profile" style={{
            display: "inline-block", padding: "9px 20px", borderRadius: 8,
            background: "#f59e0b", color: "#0f172a",
            fontWeight: 700, fontSize: 13, textDecoration: "none",
          }}>
            Edit →
          </a>
        </div>

        <div style={{
          borderRadius: 14,
          border: "1px solid rgba(99,102,241,0.25)",
          background: "rgba(99,102,241,0.06)",
          padding: "24px",
        }}>
          <div style={{ fontSize: 26, marginBottom: 12 }}>🔗</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>
            Share Profile
          </div>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 18, lineHeight: 1.6 }}>
            Copy ready-made templates for LinkedIn, WhatsApp, email and Twitter
          </div>
          <a href="/dashboard/share" style={{
            display: "inline-block", padding: "9px 20px", borderRadius: 8,
            background: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.4)",
            color: "#a5b4fc", fontWeight: 700, fontSize: 13, textDecoration: "none",
          }}>
            Share →
          </a>
        </div>
      </div>

      <div style={{
        borderRadius: 14, border: "1px solid #1e293b",
        background: "rgba(15,23,42,0.7)", padding: 28,
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: "#f1f5f9", marginBottom: 4 }}>
          Account Details
        </h2>
        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>
          Your profile information from Google OAuth
        </p>
        {details.map(({ label, value }, i) => (
          <div key={label} style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", padding: "14px 0",
            borderBottom: i < details.length - 1 ? "1px solid #1e293b" : "none",
          }}>
            <span style={{ fontSize: 14, color: "#64748b" }}>{label}</span>
            <span style={{ fontSize: 14, color: "#e2e8f0", fontWeight: 500 }}>{value}</span>
          </div>
        ))}
      </div>

    </div>
  );
}