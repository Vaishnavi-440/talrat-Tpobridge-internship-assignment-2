import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { auth, signOut } from "@/lib/auth";
import Link from "next/link";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Talrat — Smart Conversations",
  description: "Elevate your communication with Talrat.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable}`}>
      <body>
        {/* ── Navbar ── */}
        <header className="navbar">
          <nav className="navbar-inner">
            {/* Logo */}
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "#f59e0b", display: "flex",
                alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 14px rgba(245,158,11,0.35)",
                fontFamily: "var(--font-playfair)", fontWeight: 700,
                fontSize: 18, color: "#0f172a", flexShrink: 0,
              }}>T</div>
              <span style={{ fontSize: 18, fontWeight: 600, color: "#f1f5f9", letterSpacing: "-0.01em" }}>
                talrat
              </span>
            </Link>

            {/* Nav actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {session?.user ? (
                <>
                  <Link href="/dashboard" className="btn btn-ghost">Dashboard</Link>
                  <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
                    <button type="submit" className="btn btn-outline-sm">Sign out</button>
                  </form>
                </>
              ) : (
                <Link href="/auth/login" className="btn btn-primary" style={{ padding: "8px 20px", fontSize: "0.85rem" }}>
                  Sign in
                </Link>
              )}
            </div>
          </nav>
        </header>

        {/* ── Page content ── */}
        <main className="page-content">{children}</main>
      </body>
    </html>
  );
}