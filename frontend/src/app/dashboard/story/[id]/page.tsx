"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Story, Chapter, QualityReport, Prototype } from "@/lib/types";

export default function StoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const storyId = parseInt(resolvedParams.id);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "prototype" | "chapters" | "export">("overview");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user && storyId) {
      loadData();
    }
  }, [user, authLoading, storyId]);

  const loadData = async () => {
    try {
      const [storyData, chaptersData] = await Promise.all([
        api.getStory(storyId),
        api.getChapters(storyId),
      ]);
      setStory(storyData);
      setChapters(chaptersData);
    } catch (err) {
      setError("Failed to load story");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePrototype = async () => {
    setGenerating("prototype");
    setError("");
    try {
      const result = await api.generatePrototype(storyId);
      setStory((prev) =>
        prev ? { ...prev, prototype_json: result.prototype, status: "prototype_ready" } : prev
      );
      setActiveTab("prototype");
    } catch (err: any) {
      setError(err.message || "Failed to generate prototype");
    } finally {
      setGenerating(null);
    }
  };

  const handleGenerateChapter = async () => {
    const nextChapterNum = chapters.length > 0 ? Math.max(...chapters.map((c) => c.chapter_num)) + 1 : 1;
    setGenerating(`chapter-${nextChapterNum}`);
    setError("");
    try {
      const chapter = await api.generateChapter(storyId, nextChapterNum);
      setChapters((prev) => [...prev, chapter]);
      setActiveTab("chapters");
    } catch (err: any) {
      setError(err.message || "Failed to generate chapter");
    } finally {
      setGenerating(null);
    }
  };

  const handleExport = async () => {
    try {
      const markdown = await api.exportStory(storyId);
      const blob = new Blob([markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${story?.title || "story"}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || "Export failed");
    }
  };

  const parseQualityReport = (report: string): QualityReport | null => {
    try {
      return JSON.parse(report);
    } catch {
      return null;
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 8) return "var(--color-success)";
    if (score >= 6) return "var(--color-warning)";
    return "var(--color-danger)";
  };

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="page-container" style={{ textAlign: "center", paddingTop: "4rem" }}>
        <h2>Story not found</h2>
        <button className="btn-primary" onClick={() => router.push("/dashboard")} style={{ marginTop: "1rem" }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const proto = story.prototype_json as Prototype | null;
  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "prototype", label: "Story Bible" },
    { key: "chapters", label: `Chapters (${chapters.length})` },
    { key: "export", label: "Export" },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            background: "none",
            border: "none",
            color: "var(--color-text-secondary)",
            cursor: "pointer",
            fontSize: "0.85rem",
            marginBottom: "0.75rem",
            padding: 0,
          }}
        >
          ← Back to Dashboard
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 className="section-title" style={{ fontSize: "2rem" }}>{story.title}</h1>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.5rem" }}>
              <span className={`badge ${story.status === "completed" ? "badge-success" : "badge-accent"}`}>
                {story.status.replace("_", " ")}
              </span>
              {story.context_json?.genre && (
                <span className="badge badge-warning">{story.context_json.genre}</span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            {!proto && (
              <button className="btn-primary" onClick={handleGeneratePrototype} disabled={!!generating}>
                {generating === "prototype" ? (
                  <>
                    <span className="loading-spinner" style={{ width: "1rem", height: "1rem" }} /> Generating...
                  </>
                ) : (
                  "Generate Story Bible ✦"
                )}
              </button>
            )}
            {proto && (
              <button className="btn-primary" onClick={handleGenerateChapter} disabled={!!generating}>
                {generating?.startsWith("chapter") ? (
                  <>
                    <span className="loading-spinner" style={{ width: "1rem", height: "1rem" }} /> Generating...
                  </>
                ) : (
                  "+ Generate Chapter"
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "0.5rem",
            padding: "0.75rem",
            marginBottom: "1.5rem",
            color: "var(--color-danger)",
            fontSize: "0.85rem",
          }}
        >
          {error}
        </div>
      )}

      {/* Generating overlay */}
      {generating && (
        <div
          className="glass-card animate-glow"
          style={{
            textAlign: "center",
            padding: "2rem",
            marginBottom: "1.5rem",
            border: "1px solid rgba(124, 58, 237, 0.3)",
          }}
        >
          <div className="loading-spinner" style={{ margin: "0 auto 1rem" }} />
          <p style={{ fontWeight: 600 }}>
            {generating === "prototype"
              ? "🧠 AI is building your story bible..."
              : "⚔️ Writer, Critic & Arbiter are debating your chapter..."}
          </p>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
            This may take 30-60 seconds
          </p>
        </div>
      )}

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.25rem",
          borderBottom: "1px solid var(--color-border)",
          marginBottom: "2rem",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              background: "none",
              border: "none",
              padding: "0.75rem 1.25rem",
              color: activeTab === tab.key ? "var(--color-accent-light)" : "var(--color-text-secondary)",
              fontWeight: activeTab === tab.key ? 700 : 400,
              fontSize: "0.9rem",
              cursor: "pointer",
              borderBottom: activeTab === tab.key ? "2px solid var(--color-accent)" : "2px solid transparent",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="animate-fadeIn" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          <div className="card">
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--color-text-secondary)" }}>
              Story Context
            </h3>
            {story.context_json ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {Object.entries(story.context_json).map(([key, value]) => (
                  <div key={key}>
                    <span style={{ fontSize: "0.8rem", color: "var(--color-accent-light)", textTransform: "capitalize" }}>
                      {key.replace("_", " ")}
                    </span>
                    <p style={{ fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
                      {String(value) || "—"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>No context set</p>
            )}
          </div>
          <div className="card">
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--color-text-secondary)" }}>
              Writing Settings
            </h3>
            {story.settings_json ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {Object.entries(story.settings_json).map(([key, value]) => (
                  <div key={key} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", textTransform: "capitalize" }}>
                      {key.replace("_", " ")}
                    </span>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{String(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Default settings</p>
            )}
          </div>
          <div className="card" style={{ gridColumn: "1 / -1" }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--color-text-secondary)" }}>
              Progress
            </h3>
            <div style={{ display: "flex", gap: "2rem" }}>
              <div>
                <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-accent-light)" }}>
                  {chapters.length}
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>Chapters</p>
              </div>
              <div>
                <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-gold)" }}>
                  {chapters.length > 0
                    ? (chapters.reduce((sum, c) => sum + c.critic_score, 0) / chapters.length).toFixed(1)
                    : "—"}
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>Avg Score</p>
              </div>
              <div>
                <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-success)" }}>
                  {proto ? "✓" : "—"}
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>Story Bible</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "prototype" && (
        <div className="animate-fadeIn">
          {proto ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {proto.synopsis && (
                <div className="card">
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>📖 Synopsis</h3>
                  <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.7, fontSize: "0.9rem" }}>
                    {proto.synopsis}
                  </p>
                </div>
              )}
              {proto.characters && proto.characters.length > 0 && (
                <div className="card">
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>🎭 Characters</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
                    {proto.characters.map((char, i) => (
                      <div key={i} className="glass-card" style={{ padding: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                          <h4 style={{ fontWeight: 700, fontSize: "0.95rem" }}>{char.name}</h4>
                          <span className="badge badge-accent">{char.role}</span>
                        </div>
                        <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "0.25rem" }}>
                          {char.description}
                        </p>
                        {char.arc && (
                          <p style={{ fontSize: "0.8rem", color: "var(--color-accent-light)" }}>
                            Arc: {char.arc}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {proto.world && (
                <div className="card">
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>🌍 World</h3>
                  <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.7, fontSize: "0.9rem" }}>
                    {proto.world}
                  </p>
                </div>
              )}
              {proto.chapter_outline && proto.chapter_outline.length > 0 && (
                <div className="card">
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>📑 Chapter Outline</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {proto.chapter_outline.map((ch, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: "1rem",
                          padding: "0.75rem",
                          borderRadius: "0.5rem",
                          background: "var(--color-bg-primary)",
                        }}
                      >
                        <span
                          style={{
                            width: "2rem",
                            height: "2rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "0.5rem",
                            background: "rgba(124, 58, 237, 0.15)",
                            color: "var(--color-accent-light)",
                            fontWeight: 700,
                            fontSize: "0.85rem",
                            flexShrink: 0,
                          }}
                        >
                          {ch.chapter}
                        </span>
                        <div>
                          <h4 style={{ fontWeight: 600, fontSize: "0.9rem" }}>{ch.title}</h4>
                          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                            {ch.summary}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {proto.raw && !proto.synopsis && (
                <div className="card">
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>Story Bible</h3>
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      fontSize: "0.85rem",
                      color: "var(--color-text-secondary)",
                      lineHeight: 1.6,
                    }}
                  >
                    {proto.raw}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card" style={{ textAlign: "center", padding: "3rem" }}>
              <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>📜</span>
              <h3 style={{ marginBottom: "0.5rem" }}>No Story Bible Yet</h3>
              <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
                Generate your story bible to create character profiles, world details, and chapter outlines.
              </p>
              <button className="btn-primary" onClick={handleGeneratePrototype} disabled={!!generating}>
                Generate Story Bible ✦
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === "chapters" && (
        <div className="animate-fadeIn" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {chapters.length === 0 ? (
            <div className="glass-card" style={{ textAlign: "center", padding: "3rem" }}>
              <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>✍️</span>
              <h3 style={{ marginBottom: "0.5rem" }}>No Chapters Yet</h3>
              <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
                {proto
                  ? "Start generating chapters using the debate engine."
                  : "Generate a story bible first, then create chapters."}
              </p>
              {proto && (
                <button className="btn-primary" onClick={handleGenerateChapter} disabled={!!generating}>
                  Generate Chapter 1 ✦
                </button>
              )}
            </div>
          ) : (
            chapters.map((chapter) => {
              const qr = parseQualityReport(chapter.quality_report);
              return (
                <div key={chapter.id} className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Chapter {chapter.chapter_num}</h3>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <span className={`badge ${chapter.critic_score >= 7 ? "badge-success" : "badge-warning"}`}>
                        Score: {chapter.critic_score}/10
                      </span>
                      <span className="badge badge-accent">
                        {chapter.debate_rounds} round{chapter.debate_rounds !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {/* Quality Report Card */}
                  {qr && (
                    <div
                      className="glass-card"
                      style={{
                        marginBottom: "1rem",
                        padding: "1rem",
                        border: `1px solid ${scoreColor(qr.final_score)}22`,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <h4 style={{ fontSize: "0.85rem", fontWeight: 700 }}>📊 Quality Report</h4>
                        <span style={{ color: scoreColor(qr.final_score), fontWeight: 700 }}>
                          {qr.final_score}/10
                        </span>
                      </div>
                      <div className="score-bar" style={{ marginBottom: "0.75rem" }}>
                        <div
                          className="score-bar-fill"
                          style={{
                            width: `${qr.final_score * 10}%`,
                            background: scoreColor(qr.final_score),
                          }}
                        />
                      </div>
                      <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
                        <span>Rounds: {qr.rounds}</span>
                        <span>Verdict: {qr.verdict.replace("_", " ")}</span>
                      </div>
                      {qr.objections.length > 0 && (
                        <div style={{ marginTop: "0.75rem" }}>
                          <p style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                            Debate Points:
                          </p>
                          <ul style={{ paddingLeft: "1.25rem", margin: 0 }}>
                            {qr.objections.map((obj, i) => (
                              <li
                                key={i}
                                style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "0.25rem" }}
                              >
                                {obj}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Chapter content */}
                  <div
                    style={{
                      whiteSpace: "pre-wrap",
                      fontSize: "0.9rem",
                      lineHeight: 1.8,
                      color: "var(--color-text-secondary)",
                      maxHeight: "400px",
                      overflow: "auto",
                      padding: "1rem",
                      background: "var(--color-bg-primary)",
                      borderRadius: "0.5rem",
                    }}
                  >
                    {chapter.content}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === "export" && (
        <div className="animate-fadeIn">
          <div className="glass-card" style={{ textAlign: "center", padding: "3rem" }}>
            <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>📦</span>
            <h3 style={{ marginBottom: "0.5rem" }}>Export Your Novel</h3>
            <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
              Download your story with all chapters as a Markdown file.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button className="btn-primary" onClick={handleExport} disabled={chapters.length === 0}>
                Download as Markdown
              </button>
            </div>
            {chapters.length === 0 && (
              <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "1rem" }}>
                Generate at least one chapter before exporting.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
