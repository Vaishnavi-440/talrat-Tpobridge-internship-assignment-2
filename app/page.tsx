import Link from "next/link";

const features = [
  { icon: "⚡", title: "Blazing Fast Auth", description: "Google OAuth integrated with NextAuth v5 — sign in securely in one click, no passwords to remember." },
  { icon: "🔒", title: "Route Protection", description: "Middleware-based guards protect every dashboard route. Unauthenticated users are redirected automatically." },
  { icon: "🗄️", title: "Prisma + Supabase", description: "Full Postgres persistence via Prisma ORM with connection pooling optimized for serverless deployments." },
  { icon: "📬", title: "Email & WhatsApp", description: "Resend for transactional emails, Twilio for WhatsApp notifications — built in from day one." },
  { icon: "📊", title: "Analytics Ready", description: "Vercel Analytics and Speed Insights pre-wired. Monitor performance and user behavior out of the box." },
  { icon: "🚦", title: "Rate Limiting", description: "Upstash Redis-powered rate limiting protects your API endpoints from abuse with minimal overhead." },
];

export default function HomePage() {
  return (
    <div className="hero-glow" style={{ minHeight: "100vh" }}>

      {/* ── Hero ── */}
      <section className="hero-section">

        {/* Badge */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <div className="badge">
            <span className="badge-dot" />
            Phase 1 — Now Live
          </div>
        </div>

        {/* Heading */}
        <h1 className="hero-h1">
          Smart conversations,{" "}
          <span className="gradient-text">beautifully simple</span>
        </h1>

        {/* Subheading */}
        <p className="hero-sub">
          Talrat gives your team the tools to communicate, connect, and convert
          — all from one elegant dashboard.
        </p>

        {/* CTA Buttons */}
        <div className="btn-group">
          <Link href="/auth/login" className="btn btn-primary">
            Get started free
          </Link>
          <Link href="#features" className="btn btn-outline">
            See features
          </Link>
        </div>

        {/* Divider */}
        <div className="hero-divider">
          <div className="divider-line-l" />
          <div className="divider-dot" />
          <div className="divider-line-r" />
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="features-section">
        <div className="features-header">
          <h2 className="features-h2">Everything you need</h2>
          <p className="features-sub">
            Built on a production-grade stack so you can ship fast and scale confidently.
          </p>
        </div>

        <div className="features-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <span className="feature-icon">{f.icon}</span>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.description}</div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}