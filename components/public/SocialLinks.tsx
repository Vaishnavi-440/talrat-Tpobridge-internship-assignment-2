interface SocialLinksData {
  twitter?: string;
  linkedin?: string;
  github?: string;
}

interface SocialLinksProps {
  links: SocialLinksData;
}

const platforms = [
  { key: "twitter" as const, label: "Twitter / X", icon: "𝕏", color: "#1DA1F2" },
  { key: "linkedin" as const, label: "LinkedIn", icon: "in", color: "#0A66C2" },
  { key: "github" as const, label: "GitHub", icon: "</>", color: "#94a3b8" },
];

export function SocialLinks({ links }: SocialLinksProps) {
  const active = platforms.filter((p) => links?.[p.key]);
  if (!active.length) return null;

  return (
  <div style={{ display: "flex", gap: 10, marginBottom: 32 }}>
    {active.map(({ key, label, icon, color }) => {
      const url = links[key];
      if (!url) return null;

      return (
        <a
          key={key}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          title={label}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 42,
            height: 42,
            borderRadius: 10,
            border: "1px solid #1e293b",
            background: "rgba(15,23,42,0.8)", // ✅ fixed
            color,
            fontSize: 13,
            fontWeight: 700,
            textDecoration: "none",
            transition: "border-color 0.2s, background 0.2s",
          }}
        >
          {icon}
        </a>
      );
    })}
  </div>
);
}