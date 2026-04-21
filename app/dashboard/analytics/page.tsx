"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";

interface Stats {
  totalViews: number;
  views7d: number;
  totalLeads: number;
  viewsOverTime: { date: string; count: number }[];
  sourceBreakdown: { source: string; count: number }[];
  slug: string;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  source: string;
}

const SOURCE_COLORS: Record<string, string> = {
  direct: "#f59e0b",
  linkedin: "#0A66C2",
  twitter: "#1DA1F2",
  google: "#34A853",
  whatsapp: "#25D366",
  other: "#64748b",
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics/stats").then((r) => r.json()),
      fetch("/api/analytics/recent-leads").then((r) => r.json()),
    ])
      .then(([statsData, leadsData]) => {
        setStats(statsData);
        setLeads(leadsData.leads ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load analytics");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            border: "3px solid #1e293b", borderTopColor: "#f59e0b",
            animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
          }} />
          <p style={{ color: "#64748b", fontSize: 14 }}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 600, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
        <p style={{ color: "#f87171" }}>{error}</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const formatFullDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  const statCards = [
    { label: "Total Profile Views", value: stats?.totalViews ?? 0, icon: "👁️", color: "#f59e0b" },
    { label: "Views (Last 7 Days)", value: stats?.views7d ?? 0, icon: "📈", color: "#22c55e" },
    { label: "Total Leads", value: stats?.totalLeads ?? 0, icon: "✉️", color: "#a5b4fc" },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .a-card { border-radius:14px; border:1px solid #1e293b; background:rgba(15,23,42,0.7); padding:24px; animation:fadeIn 0.3s ease; }
        .recharts-cartesian-grid-horizontal line,
        .recharts-cartesian-grid-vertical line { stroke: #1e293b; }
        .recharts-text { fill: #64748b; font-size: 12px; }
        .recharts-tooltip-wrapper { outline: none; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Link href="/dashboard" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          color: "#64748b", fontSize: 13, textDecoration: "none",
          padding: "7px 14px", borderRadius: 8, border: "1px solid #1e293b",
          background: "rgba(15,23,42,0.5)", marginBottom: 20,
        }}>← Dashboard</Link>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: "#f1f5f9",
              fontFamily: "var(--font-playfair)", marginBottom: 6 }}>
              Analytics
            </h1>
            <p style={{ color: "#64748b", fontSize: 14 }}>
              Track your profile views and leads
            </p>
          </div>
          {stats?.slug && (
            <a href={`/p/${stats.slug}`} target="_blank" rel="noopener noreferrer" style={{
              padding: "8px 16px", borderRadius: 8,
              border: "1px solid rgba(245,158,11,0.3)",
              background: "rgba(245,158,11,0.06)",
              color: "#fbbf24", fontSize: 13, textDecoration: "none", fontWeight: 500,
            }}>View Public Profile ↗</a>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
        {statCards.map((s) => (
          <div key={s.label} className="a-card">
            <div style={{ fontSize: 24, marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: s.color, marginBottom: 4 }}>
              {s.value.toLocaleString()}
            </div>
            <div style={{ fontSize: 13, color: "#64748b" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Views Over Time Chart */}
      <div className="a-card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#f1f5f9", marginBottom: 4 }}>
          Profile Views — Last 30 Days
        </h2>
        <p style={{ fontSize: 13, color: "#475569", marginBottom: 24 }}>
          Daily view count for your public profile
        </p>

        {(stats?.totalViews ?? 0) === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#334155" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
            <p style={{ fontSize: 14 }}>No views yet. Share your profile to get started!</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats?.viewsOverTime ?? []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                interval={4}
                tick={{ fill: "#64748b", fontSize: 11 }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  background: "#0f172a", border: "1px solid #1e293b",
                  borderRadius: 8, color: "#f1f5f9", fontSize: 13,
                }}
                labelFormatter={(label) => `Date: ${label}`}
                formatter={(value) => [value, "Views"]}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: "#f59e0b" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Source Breakdown */}
      {(stats?.sourceBreakdown?.length ?? 0) > 0 && (
        <div className="a-card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#f1f5f9", marginBottom: 4 }}>
            Traffic Sources
          </h2>
          <p style={{ fontSize: 13, color: "#475569", marginBottom: 24 }}>
            Where your profile visitors are coming from
          </p>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={stats?.sourceBreakdown ?? []}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="source" tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "#0f172a", border: "1px solid #1e293b",
                  borderRadius: 8, color: "#f1f5f9", fontSize: 13,
                }}
                formatter={(value) => [value, "Views"]}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {(stats?.sourceBreakdown ?? []).map((entry) => (
                  <Cell
                    key={entry.source}
                    fill={SOURCE_COLORS[entry.source] ?? "#64748b"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 16 }}>
            {(stats?.sourceBreakdown ?? []).map((s) => (
              <div key={s.source} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  width: 10, height: 10, borderRadius: 3, flexShrink: 0,
                  background: SOURCE_COLORS[s.source] ?? "#64748b",
                }} />
                <span style={{ fontSize: 12, color: "#94a3b8", textTransform: "capitalize" }}>
                  {s.source} ({s.count})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Leads */}
      <div className="a-card">
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#f1f5f9", marginBottom: 4 }}>
          Recent Leads
        </h2>
        <p style={{ fontSize: 13, color: "#475569", marginBottom: 20 }}>
          Last 10 people who contacted you through your profile
        </p>

        {leads.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#334155" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
            <p style={{ fontSize: 14 }}>No leads yet. Share your profile to start getting contacts!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {leads.map((lead, i) => (
              <div key={lead.id} style={{
                padding: "16px 0",
                borderBottom: i < leads.length - 1 ? "1px solid #1e293b" : "none",
                display: "flex", alignItems: "flex-start",
                justifyContent: "space-between", gap: 16, flexWrap: "wrap",
              }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: "rgba(245,158,11,0.15)",
                      border: "1px solid rgba(245,158,11,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700, color: "#f59e0b", flexShrink: 0,
                    }}>
                      {lead.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>
                        {lead.name}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{lead.email}</div>
                    </div>
                  </div>
                  <p style={{
                    fontSize: 13, color: "#94a3b8", lineHeight: 1.5,
                    margin: "8px 0 0 42px",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}>
                    {lead.message}
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 12, color: "#475569", marginBottom: 4 }}>
                    {formatFullDate(lead.createdAt)}
                  </div>
                  <span style={{
                    fontSize: 11, padding: "2px 8px", borderRadius: 6,
                    background: "rgba(245,158,11,0.1)",
                    border: "1px solid rgba(245,158,11,0.2)",
                    color: "#fbbf24",
                  }}>
                    {lead.source}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}