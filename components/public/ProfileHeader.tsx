interface ProfileHeaderProps {
  name: string;
  title?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  image?: string | null;
  availability: string;
}

const availabilityConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  available: { label: "Available for work", color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)" },
  limited: { label: "Limited availability", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" },
  unavailable: { label: "Not available", color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.3)" },
};

export function ProfileHeader({ name, title, bio, avatarUrl, image, availability }: ProfileHeaderProps) {
  const photo = avatarUrl || image;
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const avail = availabilityConfig[availability] ?? availabilityConfig.available;

  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
        {/* Avatar */}
        <div style={{ flexShrink: 0 }}>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={name} style={{
              width: 96, height: 96, borderRadius: "50%",
              objectFit: "cover", border: "3px solid rgba(245,158,11,0.3)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }} />
          ) : (
            <div style={{
              width: 96, height: 96, borderRadius: "50%",
              background: "linear-gradient(135deg, #f59e0b, #f97316)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, fontWeight: 700, color: "#0f172a",
              border: "3px solid rgba(245,158,11,0.3)",
              boxShadow: "0 8px 32px rgba(245,158,11,0.2)",
            }}>{initials}</div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
            <h1 style={{
              fontSize: 28, fontWeight: 800, color: "#f1f5f9",
              margin: 0, fontFamily: "var(--font-playfair)",
            }}>{name}</h1>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500,
              background: avail.bg, border: `1px solid ${avail.border}`, color: avail.color,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: avail.color }} />
              {avail.label}
            </span>
          </div>

          {title && (
            <p style={{ fontSize: 17, color: "#f59e0b", fontWeight: 500, margin: "0 0 12px" }}>
              {title}
            </p>
          )}

          {bio && (
            <p style={{
              fontSize: 15, color: "#94a3b8", lineHeight: 1.75,
              margin: 0, maxWidth: 600,
            }}>{bio}</p>
          )}
        </div>
      </div>
    </div>
  );
}