import { signIn, auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div style={{
      minHeight: "calc(100vh - 64px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(245,158,11,0.1), transparent)",
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "#f59e0b", display: "flex",
              alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(245,158,11,0.35)",
              fontWeight: 700, fontSize: 20, color: "#0f172a",
            }}>T</div>
            <span style={{ fontSize: 20, fontWeight: 600, color: "#f1f5f9" }}>talrat</span>
          </Link>
        </div>

        {/* Card */}
        <div style={{
          borderRadius: 16,
          border: "1px solid #1e293b",
          background: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(12px)",
          padding: 32,
        }}>
          <h1 style={{
            fontSize: 24, fontWeight: 700, color: "#f1f5f9",
            textAlign: "center", marginBottom: 8,
            fontFamily: "var(--font-playfair)",
          }}>Welcome back</h1>

          <p style={{
            textAlign: "center", color: "#94a3b8",
            fontSize: 14, marginBottom: 28,
          }}>Sign in to access your dashboard</p>

          {/* Google Sign In */}
          <form action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}>
            {/* Add hover style via globals.css class */}
            <button type="submit" className="google-signin-btn">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" style={{ flexShrink: 0 }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </form>

          <p style={{
            textAlign: "center", fontSize: 12,
            color: "#475569", marginTop: 24, lineHeight: 1.6,
          }}>
            By signing in, you agree to our{" "}
            <span style={{ color: "#64748b", cursor: "pointer" }}>Terms of Service</span>
            {" "}and{" "}
            <span style={{ color: "#64748b", cursor: "pointer" }}>Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}