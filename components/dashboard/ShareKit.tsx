"use client";

import { useState } from "react";

interface ShareKitProps {
  name: string;
  title: string;
  slug: string;
}

export function ShareKit({ name, title, slug }: ShareKitProps) {
  const profileUrl = `https://talrat.com/p/${slug}`;
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function copy(id: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  const templates = [
    {
      id: "linkedin",
      platform: "LinkedIn Bio",
      icon: "in",
      color: "#0A66C2",
      text: `${name} | ${title}

I help businesses and teams through clear, strategic communication and execution.

📌 View my full profile and rates: ${profileUrl}

Open to new opportunities. Let's connect!`,
    },
    {
      id: "whatsapp",
      platform: "WhatsApp",
      icon: "💬",
      color: "#25D366",
      text: `Hi! I'm ${name}, a ${title}. You can check out my profile, skills and rates here: ${profileUrl}`,
    },
    {
      id: "email",
      platform: "Cold Email",
      icon: "✉️",
      color: "#94a3b8",
      text: `Subject: ${title} available for your project

Hi [Name],

I came across your work and thought I could add value to your team.

I'm ${name}, a ${title} with experience in [your top skills]. I'd love to explore how we can work together.

You can find my full profile, skills, and engagement rates here:
${profileUrl}

Happy to jump on a quick call if you'd like to know more.

Best,
${name}`,
    },
    {
      id: "twitter",
      platform: "Twitter / X",
      icon: "𝕏",
      color: "#1DA1F2",
      text: `Just updated my freelance profile on @talrat 🚀

✅ ${title}
✅ Available for projects
✅ Check rates & skills

👉 ${profileUrl}

#Freelance #OpenToWork #${title.replace(/\s+/g, "")}`,
    },
  ];

  return (
    <div>
      <style>{`
        .sk-card { border-radius:14px; border:1px solid #1e293b; background:rgba(15,23,42,0.7); padding:22px; margin-bottom:14px; }
        .sk-pre { background:rgba(0,0,0,0.3); border:1px solid #1e293b; border-radius:9px; padding:14px 16px;
          font-family:monospace; font-size:13px; color:#94a3b8; line-height:1.7; white-space:pre-wrap;
          word-break:break-word; margin:12px 0; }
        .sk-copy-btn { padding:8px 18px; border-radius:8px; border:1px solid #1e293b; background:transparent;
          font-size:13px; font-weight:500; cursor:pointer; transition:all 0.2s; }
      `}</style>

      {templates.map((t) => (
        <div key={t.id} className="sk-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: "rgba(255,255,255,0.04)", border: "1px solid #1e293b",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, color: t.color, flexShrink: 0,
              }}>{t.icon}</div>
              <span style={{ fontWeight: 600, color: "#f1f5f9", fontSize: 15 }}>{t.platform}</span>
            </div>
            <button
              className="sk-copy-btn"
              onClick={() => copy(t.id, t.text)}
              style={{
                color: copiedId === t.id ? "#4ade80" : "#94a3b8",
                borderColor: copiedId === t.id ? "rgba(34,197,94,0.3)" : "#1e293b",
                background: copiedId === t.id ? "rgba(34,197,94,0.08)" : "transparent",
              }}
            >
              {copiedId === t.id ? "✓ Copied!" : "Copy"}
            </button>
          </div>
          <pre className="sk-pre">{t.text}</pre>
        </div>
      ))}
    </div>
  );
}