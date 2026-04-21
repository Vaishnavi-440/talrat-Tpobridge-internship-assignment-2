import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCachedProfile, setCachedProfile } from "@/lib/cache";
import { ProfileHeader } from "@/components/public/ProfileHeader";
import { SkillsList } from "@/components/public/SkillsList";
import { RateCard } from "@/components/public/RateCard";
import { ContactForm } from "@/components/public/ContactForm";
import { SocialLinks } from "@/components/public/SocialLinks";
import { ViewTracker } from "@/components/public/ViewTracker";
import type { Metadata } from "next";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ref?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const profile = await getProfile(slug);
    if (!profile) return { title: "Profile not found — Talrat" };
    return {
      title: `${profile.user.name} — ${profile.title ?? "Talrat Profile"}`,
      description: profile.bio?.slice(0, 160) ?? `View ${profile.user.name}'s profile on Talrat`,
    };
  } catch {
    return { title: "Talrat Profile" };
  }
}

async function getProfile(slug: string) {
  // Check cache first
  const cached = await getCachedProfile(slug);
  if (cached) return cached;

  // Fetch from DB
  const profile = await prisma.profile.findUnique({
    where: { slug },
    include: { user: { select: { name: true, image: true, email: true } } },
  });

  if (profile) {
    await setCachedProfile(slug, profile);
  }

  return profile;
}

export default async function PublicProfilePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { ref } = await searchParams;

  let profile;
  try {
    profile = await getProfile(slug);
  } catch (err) {
    console.error("Failed to load profile:", err);
    notFound();
  }

  if (!profile) notFound();

  const skills = Array.isArray(profile.skills) ? (profile.skills as string[]) : [];
  const socialLinks = (profile.socialLinks as {
    twitter?: string; linkedin?: string; github?: string;
  }) ?? {};

  return (
    <div style={{ minHeight: "100vh", background: "#020617" }}>
      {/* Client component for view tracking */}
      <ViewTracker slug={slug} source={ref ?? null} />

      <div style={{
        background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(245,158,11,0.1), transparent)",
        paddingTop: 80,
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 0" }}>
          <ProfileHeader
            name={profile.user.name ?? "Anonymous"}
            title={profile.title}
            bio={profile.bio}
            avatarUrl={profile.avatarUrl}
            image={profile.user.image}
            availability={profile.availability}
          />
          <SocialLinks links={socialLinks} />
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ height: 1, background: "linear-gradient(to right, transparent, #1e293b, transparent)", marginBottom: 32 }} />

        {skills.length > 0 && <SkillsList skills={skills} />}

        {profile.hourlyRate && profile.hourlyRate > 0 && (
          <>
            <div style={{ height: 1, background: "linear-gradient(to right, transparent, #1e293b, transparent)", margin: "0 0 32px" }} />
            <RateCard hourlyRate={profile.hourlyRate} />
          </>
        )}

        <div style={{ height: 1, background: "linear-gradient(to right, transparent, #1e293b, transparent)", margin: "0 0 32px" }} />

        <ContactForm slug={slug} ownerName={profile.user.name?.split(" ")[0] ?? "them"} />

        <p style={{ textAlign: "center", color: "#334155", fontSize: 12, marginTop: 48 }}>
          Powered by{" "}
          <a href="https://talrat.com" style={{ color: "#f59e0b", textDecoration: "none" }}>
            talrat.com
          </a>
        </p>
      </div>
    </div>
  );
}