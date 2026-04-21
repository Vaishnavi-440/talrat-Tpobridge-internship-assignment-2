"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SocialLinks {
  twitter: string;
  linkedin: string;
  github: string;
}

interface ProfileData {
  title: string;
  bio: string;
  avatarUrl: string;
  skills: string[];
  hourlyRate: string;
  availability: string;
  slug: string;
  socialLinks: SocialLinks;
}

interface ValidationErrors {
  slug?: string;
  title?: string;
  bio?: string;
  skills?: string;
  hourlyRate?: string;
}

const defaultProfile: ProfileData = {
  title: "",
  bio: "",
  avatarUrl: "",
  skills: [],
  hourlyRate: "",
  availability: "available",
  slug: "",
  socialLinks: { twitter: "", linkedin: "", github: "" },
};

const availabilityOptions = [
  { value: "available", label: "Available", color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)" },
  { value: "limited", label: "Limited", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" },
  { value: "unavailable", label: "Unavailable", color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.3)" },
];

export default function ProfilePage() {
  const [form, setForm] = useState<ProfileData>(defaultProfile);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [activeSection, setActiveSection] = useState(0);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => {
        if (!r.ok) throw new Error("Not ok");
        return r.json();
      })
      .then((data) => {
        if (data.profile) {
          setForm({
            title: data.profile.title ?? "",
            bio: data.profile.bio ?? "",
            avatarUrl: data.profile.avatarUrl ?? "",
            skills: data.profile.skills ?? [],
            hourlyRate: data.profile.hourlyRate?.toString() ?? "",
            availability: data.profile.availability ?? "available",
            slug: data.profile.slug ?? "",
            socialLinks: {
              twitter: data.profile.socialLinks?.twitter ?? "",
              linkedin: data.profile.socialLinks?.linkedin ?? "",
              github: data.profile.socialLinks?.github ?? "",
            },
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function set(field: keyof ProfileData, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
    // Clear validation error when user types
    if (field in validationErrors) {
      setValidationErrors((e) => ({ ...e, [field]: undefined }));
    }
  }

  function setSocial(key: string, value: string) {
    setForm((p) => ({ ...p, socialLinks: { ...p.socialLinks, [key]: value } }));
  }

  function addSkill() {
    const s = skillInput.trim();
    if (!s) return;
    if (form.skills.includes(s)) {
      setValidationErrors((e) => ({ ...e, skills: "Skill already added" }));
      return;
    }
    if (form.skills.length >= 15) {
      setValidationErrors((e) => ({ ...e, skills: "Maximum 15 skills allowed" }));
      return;
    }
    setForm((p) => ({ ...p, skills: [...p.skills, s] }));
    setSkillInput("");
    setValidationErrors((e) => ({ ...e, skills: undefined }));
  }

  function removeSkill(s: string) {
    setForm((p) => ({ ...p, skills: p.skills.filter((x) => x !== s) }));
  }

  // ── Validation per section ──
  function validateSection(index: number): ValidationErrors {
    const errors: ValidationErrors = {};

    if (index === 0) {
      if (!form.slug.trim()) errors.slug = "Profile slug is required";
      else if (!/^[a-z0-9-]+$/.test(form.slug.trim()))
        errors.slug = "Slug can only contain lowercase letters, numbers and hyphens";
      if (!form.title.trim()) errors.title = "Professional title is required";
      if (!form.bio.trim()) errors.bio = "Bio is required";
      else if (form.bio.trim().length < 20)
        errors.bio = "Bio must be at least 20 characters";
    }

    if (index === 1) {
      if (form.skills.length === 0)
        errors.skills = "Add at least one skill";
    }

    if (index === 2) {
      if (!form.hourlyRate) errors.hourlyRate = "Hourly rate is required";
      else if (parseInt(form.hourlyRate) <= 0)
        errors.hourlyRate = "Enter a valid rate";
    }

    return errors;
  }

  function handleNext(nextIndex: number) {
    const errors = validateSection(activeSection);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});
    setActiveSection(nextIndex);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    setSaved(false);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Non-JSON response:", text.slice(0, 200));
        throw new Error("Server returned an unexpected response. Please try again.");
      }

      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const sections = ["Basic Info", "Skills", "Rate & Availability", "Social Links"];
  const selectedAvailability = availabilityOptions.find(o => o.value === form.availability) ?? availabilityOptions[0];

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            border: "3px solid #1e293b", borderTopColor: "#f59e0b",
            animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
          }} />
          <p style={{ color: "#64748b", fontSize: 14 }}>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#020617" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .pi { width:100%; padding:11px 14px; border-radius:9px; border:1px solid #1e293b;
          background:rgba(15,23,42,0.8); color:#f1f5f9; font-size:14px; outline:none;
          transition:border-color 0.2s,box-shadow 0.2s; box-sizing:border-box; font-family:inherit; }
        .pi:focus { border-color:rgba(245,158,11,0.5); box-shadow:0 0 0 3px rgba(245,158,11,0.08); }
        .pi::placeholder { color:#334155; }
        .pi-err { border-color:rgba(248,113,113,0.5) !important; }
        .pi-err:focus { box-shadow:0 0 0 3px rgba(248,113,113,0.08) !important; }
        .pta { width:100%; padding:11px 14px; border-radius:9px; border:1px solid #1e293b;
          background:rgba(15,23,42,0.8); color:#f1f5f9; font-size:14px; outline:none;
          resize:vertical; min-height:120px; box-sizing:border-box; font-family:inherit; line-height:1.6;
          transition:border-color 0.2s; }
        .pta:focus { border-color:rgba(245,158,11,0.5); box-shadow:0 0 0 3px rgba(245,158,11,0.08); }
        .pta::placeholder { color:#334155; }
        .pta-err { border-color:rgba(248,113,113,0.5) !important; }
        .nav-tab { padding:8px 16px; border-radius:8px; border:none; background:transparent;
          font-size:13px; font-weight:500; cursor:pointer; transition:all 0.15s; white-space:nowrap; }
        .avail-btn { padding:10px 16px; border-radius:10px; border:1px solid #1e293b;
          background:transparent; cursor:pointer; transition:all 0.2s; flex:1;
          display:flex; align-items:center; justify-content:center; gap:8px; font-size:13px; font-weight:500; }
        .skill-chip { display:inline-flex; align-items:center; gap:6px; padding:5px 12px;
          border-radius:20px; background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.2);
          color:#fbbf24; font-size:13px; animation:fadeIn 0.2s ease; }
        .social-row { display:flex; align-items:center; gap:10px; }
        .social-icon { width:40px; height:40px; border-radius:9px; background:#0f172a;
          border:1px solid #1e293b; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .step-dot { width:8px; height:8px; border-radius:50%; transition:all 0.2s; }
      `}</style>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <Link href="/dashboard" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            color: "#64748b", fontSize: 13, textDecoration: "none",
            padding: "7px 14px", borderRadius: 8, border: "1px solid #1e293b",
            background: "rgba(15,23,42,0.5)",
          }}>← Dashboard</Link>

          {saved && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 16px", borderRadius: 8,
              background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)",
              color: "#4ade80", fontSize: 13, fontWeight: 500,
              animation: "fadeIn 0.3s ease",
            }}>✓ Saved!</div>
          )}
        </div>

        {/* Title */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: "#f1f5f9", fontFamily: "var(--font-playfair)", marginBottom: 6 }}>
            Edit Profile
          </h1>
          <p style={{ color: "#64748b", fontSize: 14 }}>
            Complete all sections to publish your public profile.
          </p>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          {sections.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2,
              background: i <= activeSection ? "#f59e0b" : "#1e293b",
              transition: "background 0.3s",
            }} />
          ))}
        </div>
        <p style={{ fontSize: 12, color: "#475569", marginBottom: 24 }}>
          Step {activeSection + 1} of {sections.length} — {sections[activeSection]}
        </p>

        {/* Section Tabs */}
        <div style={{
          display: "flex", gap: 4, marginBottom: 24,
          background: "rgba(15,23,42,0.6)", padding: 4,
          borderRadius: 12, border: "1px solid #1e293b", overflowX: "auto",
        }}>
          {sections.map((s, i) => (
            <button key={s} type="button" className="nav-tab"
              onClick={() => setActiveSection(i)}
              style={{
                color: activeSection === i ? "#0f172a" : "#64748b",
                background: activeSection === i ? "#f59e0b" : "transparent",
                fontWeight: activeSection === i ? 600 : 400,
              }}>{s}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>

          {/* ── Section 0: Basic Info ── */}
          {activeSection === 0 && (
            <div style={{ animation: "fadeIn 0.2s ease" }}>
              <SCard title="Basic Information" desc="Your public-facing identity on Talrat">

                {/* Avatar */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22,
                  padding: 16, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid #1e293b" }}>
                  <div style={{ width: 68, height: 68, borderRadius: "50%", flexShrink: 0,
                    background: "#0f172a", border: "2px solid #334155", overflow: "hidden",
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {form.avatarUrl
                      ? <img src={form.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontSize: 26 }}>👤</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <FL>Avatar URL</FL>
                    <input className="pi" placeholder="https://your-photo-url.com/photo.jpg"
                      value={form.avatarUrl} onChange={(e) => set("avatarUrl", e.target.value)} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <FL required>Profile Slug</FL>
                    <input className={`pi${validationErrors.slug ? " pi-err" : ""}`}
                      placeholder="vaishnavi-pardeshi"
                      value={form.slug} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))} />
                    {validationErrors.slug
                      ? <ErrMsg>{validationErrors.slug}</ErrMsg>
                      : <HintMsg>talrat.com/p/<span style={{ color: "#f59e0b" }}>{form.slug || "your-slug"}</span></HintMsg>}
                  </div>
                  <div>
                    <FL required>Professional Title</FL>
                    <input className={`pi${validationErrors.title ? " pi-err" : ""}`}
                      placeholder="e.g. Full Stack Developer"
                      value={form.title} onChange={(e) => set("title", e.target.value)} />
                    {validationErrors.title && <ErrMsg>{validationErrors.title}</ErrMsg>}
                  </div>
                </div>

                <div>
                  <FL required>Bio</FL>
                  <textarea className={`pta${validationErrors.bio ? " pta-err" : ""}`}
                    placeholder="Tell clients about your experience and what makes you unique..."
                    value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={5} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    {validationErrors.bio ? <ErrMsg>{validationErrors.bio}</ErrMsg> : <span />}
                    <span style={{ fontSize: 11, color: form.bio.length < 20 ? "#f87171" : "#475569" }}>
                      {form.bio.length}/20 min
                    </span>
                  </div>
                </div>
              </SCard>
              <NavBtns onNext={() => handleNext(1)} showPrev={false} />
            </div>
          )}

          {/* ── Section 1: Skills ── */}
          {activeSection === 1 && (
            <div style={{ animation: "fadeIn 0.2s ease" }}>
              <SCard title="Skills" desc="Add up to 15 skills to help clients find you">
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <input className="pi" style={{ flex: 1 }}
                    placeholder="Type a skill and press Enter..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} />
                  <button type="button" onClick={addSkill} style={{
                    padding: "11px 20px", borderRadius: 9, border: "none",
                    background: "#f59e0b", color: "#0f172a",
                    fontWeight: 600, fontSize: 13, cursor: "pointer", flexShrink: 0,
                  }}>+ Add</button>
                </div>

                {validationErrors.skills && <ErrMsg>{validationErrors.skills}</ErrMsg>}

                {form.skills.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px", border: "1px dashed #1e293b",
                    borderRadius: 10, color: "#334155", marginTop: 8 }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🛠️</div>
                    <p style={{ fontSize: 13 }}>No skills added yet</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                    {form.skills.map((skill) => (
                      <span key={skill} className="skill-chip">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} style={{
                          background: "none", border: "none", color: "#fbbf24",
                          cursor: "pointer", padding: "0 2px", fontSize: 16, lineHeight: 1, opacity: 0.7,
                        }}>×</button>
                      </span>
                    ))}
                  </div>
                )}
                <p style={{ fontSize: 12, color: "#334155", marginTop: 12 }}>{form.skills.length}/15 skills</p>
              </SCard>
              <NavBtns onPrev={() => setActiveSection(0)} onNext={() => handleNext(2)} />
            </div>
          )}

          {/* ── Section 2: Rate & Availability ── */}
          {activeSection === 2 && (
            <div style={{ animation: "fadeIn 0.2s ease" }}>
              <SCard title="Rate & Availability" desc="Let clients know your pricing and current status">
                <div style={{ marginBottom: 28 }}>
                  <FL required>Hourly Rate (₹)</FL>
                  <div style={{ position: "relative", maxWidth: 220 }}>
                    <span style={{ position: "absolute", left: 14, top: "50%",
                      transform: "translateY(-50%)", color: "#64748b", fontSize: 15 }}>₹</span>
                    <input className={`pi${validationErrors.hourlyRate ? " pi-err" : ""}`}
                      type="number" min="1" placeholder="2500"
                      value={form.hourlyRate} onChange={(e) => set("hourlyRate", e.target.value)}
                      style={{ paddingLeft: 32 }} />
                  </div>
                  {validationErrors.hourlyRate
                    ? <ErrMsg>{validationErrors.hourlyRate}</ErrMsg>
                    : form.hourlyRate
                      ? <HintMsg>≈ ₹{(parseInt(form.hourlyRate) * 8).toLocaleString()}/day</HintMsg>
                      : <HintMsg>Enter your hourly rate in INR</HintMsg>}
                </div>

                <div>
                  <FL>Availability Status</FL>
                  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    {availabilityOptions.map((opt) => (
                      <button key={opt.value} type="button" className="avail-btn"
                        onClick={() => set("availability", opt.value)}
                        style={{
                          color: form.availability === opt.value ? opt.color : "#475569",
                          borderColor: form.availability === opt.value ? opt.border : "#1e293b",
                          background: form.availability === opt.value ? opt.bg : "transparent",
                        }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: opt.color, flexShrink: 0 }} />
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div style={{ marginTop: 20 }}>
                    <p style={{ fontSize: 12, color: "#475569", marginBottom: 8 }}>Badge preview:</p>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "5px 14px", borderRadius: 20,
                      background: selectedAvailability.bg,
                      border: `1px solid ${selectedAvailability.border}`,
                      color: selectedAvailability.color, fontSize: 13, fontWeight: 500,
                    }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: selectedAvailability.color }} />
                      {selectedAvailability.label} for work
                    </span>
                  </div>
                </div>
              </SCard>
              <NavBtns onPrev={() => setActiveSection(1)} onNext={() => handleNext(3)} />
            </div>
          )}

          {/* ── Section 3: Social Links ── */}
          {activeSection === 3 && (
            <div style={{ animation: "fadeIn 0.2s ease" }}>
              <SCard title="Social Links" desc="Connect your online presence (all optional)">
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {[
                    { key: "twitter", icon: "𝕏", label: "Twitter / X", placeholder: "https://twitter.com/username" },
                    { key: "linkedin", icon: "in", label: "LinkedIn", placeholder: "https://linkedin.com/in/username" },
                    { key: "github", icon: "</>", label: "GitHub", placeholder: "https://github.com/username" },
                  ].map(({ key, icon, label, placeholder }) => (
                    <div key={key}>
                      <FL>{label} <span style={{ color: "#334155", fontSize: 11 }}>(optional)</span></FL>
                      <div className="social-row">
                        <div className="social-icon">
                          <span style={{ color: "#64748b", fontSize: 11, fontWeight: 700 }}>{icon}</span>
                        </div>
                        <input className="pi" placeholder={placeholder}
                          value={form.socialLinks[key as keyof SocialLinks]}
                          onChange={(e) => setSocial(key, e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>
              </SCard>

              {saveError && (
                <div style={{
                  padding: "12px 16px", borderRadius: 9, marginBottom: 16,
                  background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)",
                  color: "#f87171", fontSize: 14,
                }}>{saveError}</div>
              )}

              <button type="submit" disabled={saving} style={{
                width: "100%", padding: "15px", borderRadius: 11, border: "none",
                background: saving ? "#78350f" : "#f59e0b",
                color: "#0f172a", fontWeight: 700, fontSize: 15,
                cursor: saving ? "not-allowed" : "pointer",
                transition: "background 0.2s",
                boxShadow: "0 4px 20px rgba(245,158,11,0.2)",
              }}>
                {saving ? "Saving..." : "💾 Save Profile"}
              </button>

              <button type="button" onClick={() => setActiveSection(2)} style={{
                width: "100%", marginTop: 10, padding: "12px", borderRadius: 11,
                border: "1px solid #1e293b", background: "transparent",
                color: "#64748b", fontSize: 14, cursor: "pointer",
              }}>← Back</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

/* ── Tiny helper components ── */
function SCard({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div style={{ borderRadius: 16, border: "1px solid #1e293b",
      background: "rgba(15,23,42,0.7)", padding: 28, marginBottom: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>{title}</h2>
      <p style={{ fontSize: 13, color: "#475569", marginBottom: 22 }}>{desc}</p>
      {children}
    </div>
  );
}

function FL({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{ display: "block", fontSize: 13, fontWeight: 500,
      color: "#94a3b8", marginBottom: 7 }}>
      {children}{required && <span style={{ color: "#f87171", marginLeft: 3 }}>*</span>}
    </label>
  );
}

function ErrMsg({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 12, color: "#f87171", marginTop: 5 }}>⚠ {children as string}</p>;
}

function HintMsg({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 11, color: "#334155", marginTop: 5 }}>{children}</p>;
}

function NavBtns({ onPrev, onNext, showPrev = true }: {
  onPrev?: () => void; onNext?: () => void; showPrev?: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
      {showPrev && onPrev && (
        <button type="button" onClick={onPrev} style={{
          padding: "11px 24px", borderRadius: 9, border: "1px solid #1e293b",
          background: "transparent", color: "#94a3b8", fontSize: 14, cursor: "pointer",
        }}>← Back</button>
      )}
      {onNext && (
        <button type="button" onClick={onNext} style={{
          padding: "11px 28px", borderRadius: 9, border: "none",
          background: "#f59e0b", color: "#0f172a",
          fontWeight: 600, fontSize: 14, cursor: "pointer",
        }}>Next →</button>
      )}
    </div>
  );
}