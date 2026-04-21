"use client";

import { useState } from "react";

interface ContactFormProps {
  slug: string;
  ownerName: string;
}

export function ContactForm({ slug, ownerName }: ContactFormProps) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  function set(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError("All fields are required");
      return;
    }
    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, slug }),
      });
      const text = await res.text();
      const data = JSON.parse(text);
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch (err: unknown) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div style={{
      borderRadius: 16, border: "1px solid #1e293b",
      background: "rgba(15,23,42,0.7)", padding: 28,
    }}>
      <style>{`
        .cf-input { width:100%; padding:11px 14px; border-radius:9px; border:1px solid #1e293b;
          background:rgba(255,255,255,0.04); color:#f1f5f9; font-size:14px; outline:none;
          transition:border-color 0.2s; box-sizing:border-box; font-family:inherit; }
        .cf-input:focus { border-color:rgba(245,158,11,0.5); box-shadow:0 0 0 3px rgba(245,158,11,0.08); }
        .cf-input::placeholder { color:#334155; }
      `}</style>

      <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9",
        fontFamily: "var(--font-playfair)", marginBottom: 6 }}>
        Get in touch
      </h3>
      <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>
        Send {ownerName} a message directly through their Talrat profile.
      </p>

      {status === "sent" ? (
        <div style={{
          textAlign: "center", padding: "32px 16px",
          border: "1px solid rgba(34,197,94,0.3)",
          borderRadius: 12, background: "rgba(34,197,94,0.05)",
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✉️</div>
          <h4 style={{ color: "#4ade80", fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
            Message sent!
          </h4>
          <p style={{ color: "#64748b", fontSize: 14 }}>
            {ownerName} will get back to you soon.
          </p>
          <button onClick={() => setStatus("idle")} style={{
            marginTop: 16, padding: "8px 20px", borderRadius: 8,
            border: "1px solid #1e293b", background: "transparent",
            color: "#94a3b8", fontSize: 13, cursor: "pointer",
          }}>Send another</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#94a3b8",
                fontWeight: 500, marginBottom: 6 }}>Your Name *</label>
              <input className="cf-input" placeholder="Jane Smith"
                value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#94a3b8",
                fontWeight: 500, marginBottom: 6 }}>Email *</label>
              <input className="cf-input" type="email" placeholder="jane@company.com"
                value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, color: "#94a3b8",
              fontWeight: 500, marginBottom: 6 }}>Message *</label>
            <textarea className="cf-input" rows={5}
              placeholder={`Hi ${ownerName}, I'd like to discuss a project with you...`}
              value={form.message} onChange={(e) => set("message", e.target.value)}
              style={{ resize: "vertical", minHeight: 120 }} />
          </div>

          {error && (
            <p style={{ color: "#f87171", fontSize: 13 }}>⚠ {error}</p>
          )}

          <button type="submit" disabled={status === "sending"} style={{
            padding: "13px", borderRadius: 10, border: "none",
            background: status === "sending" ? "#78350f" : "#f59e0b",
            color: "#0f172a", fontWeight: 700, fontSize: 14,
            cursor: status === "sending" ? "not-allowed" : "pointer",
            transition: "background 0.2s",
            boxShadow: "0 4px 16px rgba(245,158,11,0.2)",
          }}>
            {status === "sending" ? "Sending..." : "Send Message"}
          </button>
        </form>
      )}
    </div>
  );
}