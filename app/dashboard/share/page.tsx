import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ShareKit } from "@/components/dashboard/ShareKit";
import Link from "next/link";

export default async function SharePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { name: true } } },
  });

  if (!profile?.slug) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "64px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>
          No profile yet
        </h1>
        <p style={{ color: "#64748b", fontSize: 15, marginBottom: 24 }}>
          You need to create your profile before you can share it.
        </p>
        <Link href="/dashboard/profile" style={{
          display: "inline-block", padding: "11px 24px",
          background: "#f59e0b", color: "#0f172a",
          borderRadius: 9, fontWeight: 600, fontSize: 14,
          textDecoration: "none",
        }}>Create Profile →</Link>
      </div>
    );
  }

  const profileUrl = `https://talrat.com/p/${profile.slug}`;

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
          fontFamily: "var(--font-playfair)", marginBottom: 8 }}>
          Share Your Profile
        </h1>
        <p style={{ color: "#64748b", fontSize: 15 }}>
          Copy and paste these templates to share your profile across platforms.
        </p>
      </div>

      {/* Profile URL card */}
       {/* ── Action Banners ── */}
<div style={{
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginBottom: 24,
}}>
  {/* Edit Profile */}
  <div style={{
    borderRadius: 14,
    border: "1px solid rgba(245,158,11,0.2)",
    background: "rgba(245,158,11,0.05)",
    padding: "20px 22px",
  }}>
    <div style={{ fontSize: 22, marginBottom: 8 }}>✏️</div>
    <div style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9", marginBottom: 4 }}>
      Edit Profile
    </div>
    <div style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>
      Update your skills, rate and bio
    </div>
    <a href="/dashboard/profile" style={{
      display: "inline-block", padding: "8px 16px", borderRadius: 8,
      background: "#f59e0b", color: "#0f172a",
      fontWeight: 600, fontSize: 13, textDecoration: "none",
    }}>Edit →</a>
  </div>

  {/* Share Profile */}
  <div style={{
    borderRadius: 14,
    border: "1px solid rgba(99,102,241,0.2)",
    background: "rgba(99,102,241,0.05)",
    padding: "20px 22px",
  }}>
    <div style={{ fontSize: 22, marginBottom: 8 }}>🔗</div>
    <div style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9", marginBottom: 4 }}>
      Share Profile
    </div>
    <div style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>
      Copy templates for LinkedIn, email & more
    </div>
    <a href="/dashboard/share" style={{
      display: "inline-block", padding: "8px 16px", borderRadius: 8,
      background: "rgba(99,102,241,0.2)", color: "#a5b4fc",
      border: "1px solid rgba(99,102,241,0.3)",
      fontWeight: 600, fontSize: 13, textDecoration: "none",
    }}>Share →</a>
  </div>
</div>
      {/* Templates */}
      <ShareKit
        name={profile.user.name ?? "Your Name"}
        title={profile.title ?? "Professional"}
        slug={profile.slug}
      />
    </div>
  );
}