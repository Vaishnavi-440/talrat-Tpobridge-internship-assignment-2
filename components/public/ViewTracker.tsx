"use client";

import { useEffect } from "react";

interface ViewTrackerProps {
  slug: string;
  source: string | null;
}

export function ViewTracker({ slug, source }: ViewTrackerProps) {
  useEffect(() => {
    const resolvedSource = source ?? getSourceFromReferrer(document.referrer);

    fetch("/api/analytics/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, source: resolvedSource }),
    }).catch(() => {
      // Silently fail — tracking should never break the page
    });
  }, [slug, source]);

  return null;
}

function getSourceFromReferrer(referrer: string): string {
  if (!referrer) return "direct";
  if (referrer.includes("linkedin.com")) return "linkedin";
  if (referrer.includes("twitter.com") || referrer.includes("x.com")) return "twitter";
  if (referrer.includes("whatsapp.com")) return "whatsapp";
  if (referrer.includes("google.com")) return "google";
  if (referrer.includes("facebook.com")) return "facebook";
  return "other";
}