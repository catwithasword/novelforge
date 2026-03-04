"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(10, 10, 15, 0.8)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          maxWidth: "80rem",
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "4rem",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
            color: "var(--color-text-primary)",
          }}
        >
          <span style={{ fontSize: "1.5rem" }}>✦</span>
          <span
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              background:
                "linear-gradient(135deg, var(--color-accent-light), var(--color-gold))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            NovelForge AI
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          {!loading && user ? (
            <>
              <Link
                href="/dashboard"
                style={{
                  textDecoration: "none",
                  color: isActive("/dashboard")
                    ? "var(--color-accent-light)"
                    : "var(--color-text-secondary)",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  transition: "color 0.2s",
                }}
              >
                Dashboard
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  style={{
                    textDecoration: "none",
                    color: isActive("/admin")
                      ? "var(--color-accent-light)"
                      : "var(--color-text-secondary)",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                    transition: "color 0.2s",
                  }}
                >
                  Admin
                </Link>
              )}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <span
                  className="badge badge-accent"
                  style={{ textTransform: "capitalize" }}
                >
                  {user.role}
                </span>
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {user.email}
                </span>
                <button
                  onClick={logout}
                  style={{
                    background: "transparent",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-secondary)",
                    padding: "0.375rem 0.75rem",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--color-danger)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--color-border)")
                  }
                >
                  Logout
                </button>
              </div>
            </>
          ) : !loading ? (
            <>
              <Link
                href="/login"
                style={{
                  textDecoration: "none",
                  color: "var(--color-text-secondary)",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                }}
              >
                Login
              </Link>
              <Link href="/register" className="btn-primary" style={{ textDecoration: "none" }}>
                Get Started
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
