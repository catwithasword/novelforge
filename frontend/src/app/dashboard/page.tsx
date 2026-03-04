"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Story } from "@/lib/types";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      api
        .getStories()
        .then(setStories)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this story?")) return;
    try {
      await api.deleteStory(id);
      setStories((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "badge-warning";
      case "prototype_ready":
        return "badge-accent";
      case "in_progress":
        return "badge-accent";
      case "completed":
        return "badge-success";
      default:
        return "badge-warning";
    }
  };

  if (authLoading || loading) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 className="section-title">My Stories</h1>
          <p style={{ color: "var(--color-text-secondary)" }}>
            {stories.length} {stories.length === 1 ? "story" : "stories"} in your library
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="btn-primary"
          style={{ textDecoration: "none" }}
        >
          + New Story
        </Link>
      </div>

      {stories.length === 0 ? (
        <div
          className="glass-card"
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
          }}
        >
          <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>
            ✦
          </span>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            No stories yet
          </h3>
          <p
            style={{
              color: "var(--color-text-secondary)",
              marginBottom: "1.5rem",
            }}
          >
            Start your first novel by clicking the button above.
          </p>
          <Link
            href="/dashboard/new"
            className="btn-primary"
            style={{ textDecoration: "none" }}
          >
            Create Your First Story →
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {stories.map((story, i) => (
            <div
              key={story.id}
              className="card animate-fadeIn"
              style={{
                animationDelay: `${i * 0.05}s`,
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                position: "relative",
              }}
              onClick={() => router.push(`/dashboard/story/${story.id}`)}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "1rem",
                }}
              >
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, flex: 1 }}>
                  {story.title}
                </h3>
                <span className={`badge ${statusColor(story.status)}`}>
                  {story.status.replace("_", " ")}
                </span>
              </div>

              {story.context_json?.genre && (
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--color-accent-light)",
                    marginBottom: "0.5rem",
                  }}
                >
                  {story.context_json.genre}
                </p>
              )}

              <p
                style={{
                  color: "var(--color-text-secondary)",
                  fontSize: "0.85rem",
                  lineHeight: 1.5,
                  flex: 1,
                  marginBottom: "1rem",
                }}
              >
                {story.context_json?.title_idea ||
                  story.prototype_json?.synopsis?.slice(0, 120) + "..." ||
                  "No description yet"}
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid var(--color-border)",
                  paddingTop: "1rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {story.chapter_count} chapter{story.chapter_count !== 1 ? "s" : ""}
                </span>
                <button
                  className="btn-danger"
                  style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(story.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
