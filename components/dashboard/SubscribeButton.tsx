"use client";

import { useState } from "react";

interface SubscribeButtonProps {
  onSuccess?: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function SubscribeButton({ onSuccess }: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function handleSubscribe() {
    setLoading(true);
    setError("");

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load Razorpay");

      const res = await fetch("/api/subscription/create", { method: "POST" });
      const text = await res.text();
      const data = JSON.parse(text);

      if (!res.ok) throw new Error(data.error ?? "Failed to create subscription");

      // If Razorpay returns a short_url, redirect to it
      if (data.shortUrl) {
        window.location.href = data.shortUrl;
        return;
      }

      // Otherwise open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: data.subscriptionId,
        name: "Talrat",
        description: "Pro Plan — ₹499/month",
        image: "/favicon.ico",
        handler: function () {
          onSuccess?.();
          window.location.href = "/dashboard/billing?success=true";
        },
        theme: { color: "#f59e0b" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setError(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleSubscribe}
        disabled={loading}
        style={{
          padding: "13px 32px", borderRadius: 10, border: "none",
          background: loading ? "#78350f" : "#f59e0b",
          color: "#0f172a", fontWeight: 700, fontSize: 15,
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background 0.2s",
          boxShadow: "0 4px 20px rgba(245,158,11,0.25)",
          width: "100%",
        }}
      >
        {loading ? "Setting up..." : "🚀 Start Free Trial — ₹499/month after 30 days"}
      </button>
      {error && (
        <p style={{ color: "#f87171", fontSize: 13, marginTop: 8 }}>⚠ {error}</p>
      )}
    </div>
  );
}