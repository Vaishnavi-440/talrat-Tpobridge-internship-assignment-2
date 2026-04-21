interface SkillsListProps {
  skills: string[];
}

export function SkillsList({ skills }: SkillsListProps) {
  if (!skills?.length) return null;

  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{
        fontSize: 13,
        fontWeight: 600,
        color: "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: 14,
      }}>
        Skills
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {skills.map((skill) => (
          <span key={skill} style={{
            padding: "6px 14px",
            borderRadius: 20,
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.2)",
            color: "#fbbf24",
            fontSize: 13,
            fontWeight: 500,
          }}>
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}