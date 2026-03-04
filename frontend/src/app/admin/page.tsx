"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { AdminUser, AdminStory } from "@/lib/types";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stories, setStories] = useState<AdminStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/dashboard");
      return;
    }
    if (user?.role === "admin") {
      Promise.all([api.getUsers(), api.getAdminStories()])
        .then(([u, s]) => {
          setUsers(u);
          setStories(s);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Delete this user and all their stories?")) return;
    try {
      await api.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="section-title" style={{ marginBottom: "2rem" }}>Admin Panel</h1>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
        <div className="glass-card" style={{ textAlign: "center" }}>
          <p style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--color-accent-light)" }}>{users.length}</p>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>Total Users</p>
        </div>
        <div className="glass-card" style={{ textAlign: "center" }}>
          <p style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--color-gold)" }}>{stories.length}</p>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>Total Stories</p>
        </div>
        <div className="glass-card" style={{ textAlign: "center" }}>
          <p style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--color-success)" }}>
            {stories.reduce((sum, s) => sum + s.chapter_count, 0)}
          </p>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>Total Chapters</p>
        </div>
      </div>

      {/* Users Table */}
      <div style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>👥 Users</h2>
        <div className="card" style={{ overflow: "auto", padding: 0 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                <th style={{ textAlign: "left", padding: "1rem", color: "var(--color-text-secondary)", fontWeight: 600 }}>ID</th>
                <th style={{ textAlign: "left", padding: "1rem", color: "var(--color-text-secondary)", fontWeight: 600 }}>Email</th>
                <th style={{ textAlign: "left", padding: "1rem", color: "var(--color-text-secondary)", fontWeight: 600 }}>Role</th>
                <th style={{ textAlign: "left", padding: "1rem", color: "var(--color-text-secondary)", fontWeight: 600 }}>Stories</th>
                <th style={{ textAlign: "left", padding: "1rem", color: "var(--color-text-secondary)", fontWeight: 600 }}>Created</th>
                <th style={{ textAlign: "right", padding: "1rem", color: "var(--color-text-secondary)", fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "0.75rem 1rem" }}>{u.id}</td>
                  <td style={{ padding: "0.75rem 1rem" }}>{u.email}</td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span className={`badge ${u.role === "admin" ? "badge-danger" : "badge-accent"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>{u.story_count}</td>
                  <td style={{ padding: "0.75rem 1rem", color: "var(--color-text-muted)" }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                    {u.id !== user?.id && (
                      <button className="btn-danger" onClick={() => handleDeleteUser(u.id)}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stories Table */}
      <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>📚 All Stories</h2>
        <div className="card" style={{ overflow: "auto", padding: 0 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                <th style={{ textAlign: "left", padding: "1rem", color: "var(--color-text-secondary)", fontWeight: 600 }}>ID</th>
                <th style={{ textAlign: "left", padding: "1rem", color: "var(--color-text-secondary)", fontWeight: 600 }}>Title</th>
                <th style={{ textAlign: "left", padding: "1rem", color: "var(--color-text-secondary)", fontWeight: 600 }}>Author</th>
                <th style={{ textAlign: "left", padding: "1rem", color: "var(--color-text-secondary)", fontWeight: 600 }}>Status</th>
                <th style={{ textAlign: "left", padding: "1rem", color: "var(--color-text-secondary)", fontWeight: 600 }}>Chapters</th>
                <th style={{ textAlign: "left", padding: "1rem", color: "var(--color-text-secondary)", fontWeight: 600 }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {stories.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "0.75rem 1rem" }}>{s.id}</td>
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>{s.title}</td>
                  <td style={{ padding: "0.75rem 1rem", color: "var(--color-text-secondary)" }}>{s.author_email}</td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span className={`badge ${s.status === "completed" ? "badge-success" : "badge-warning"}`}>
                      {s.status.replace("_", " ")}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>{s.chapter_count}</td>
                  <td style={{ padding: "0.75rem 1rem", color: "var(--color-text-muted)" }}>
                    {s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
