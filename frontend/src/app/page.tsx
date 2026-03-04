"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  {
    icon: "🧠",
    title: "AI Story Bible",
    desc: "Auto-generate characters, worlds, themes, and chapter outlines from your raw idea.",
  },
  {
    icon: "⚔️",
    title: "Multi-Agent Debate",
    desc: "Writer, Critic, and Arbiter agents debate each chapter for quality assurance.",
  },
  {
    icon: "📊",
    title: "Quality Reports",
    desc: "Every chapter comes with a quality score and detailed debate logs.",
  },
  {
    icon: "📖",
    title: "Full Novel Export",
    desc: "Export your completed novel as a formatted Markdown document.",
  },
  {
    icon: "🎭",
    title: "Customizable Style",
    desc: "Control POV, tone, chapter length, and writing style per story.",
  },
  {
    icon: "🔒",
    title: "Role-Based Access",
    desc: "Guest demo, Author full access, and Admin moderation panel.",
  },
];

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background gradient orbs */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "-10%",
            width: "600px",
            height: "600px",
            background:
              "radial-gradient(circle, rgba(124, 58, 237, 0.15), transparent 70%)",
            borderRadius: "50%",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-20%",
            right: "-10%",
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(circle, rgba(251, 191, 36, 0.1), transparent 70%)",
            borderRadius: "50%",
            filter: "blur(60px)",
          }}
        />

        <div
          style={{
            textAlign: "center",
            maxWidth: "50rem",
            padding: "0 2rem",
            position: "relative",
            zIndex: 1,
          }}
          className="animate-fadeIn"
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(124, 58, 237, 0.1)",
              border: "1px solid rgba(124, 58, 237, 0.25)",
              borderRadius: "9999px",
              padding: "0.5rem 1rem",
              marginBottom: "2rem",
              fontSize: "0.85rem",
              color: "var(--color-accent-light)",
            }}
          >
            ✦ Powered by Multi-Agent AI Debate Engine
          </div>

          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: "1.5rem",
              letterSpacing: "-0.02em",
            }}
          >
            From Raw Idea to{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, var(--color-accent-light), var(--color-gold))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Published Novel
            </span>
          </h1>

          <p
            style={{
              fontSize: "1.2rem",
              color: "var(--color-text-secondary)",
              maxWidth: "36rem",
              margin: "0 auto 2.5rem",
              lineHeight: 1.7,
            }}
          >
            NovelForge AI guides you from raw concept → structured story bible →
            quality-checked chapters. Three AI agents debate every chapter to
            ensure consistency and quality.
          </p>

          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {user ? (
              <Link
                href="/dashboard"
                className="btn-primary"
                style={{
                  textDecoration: "none",
                  padding: "0.875rem 2rem",
                  fontSize: "1rem",
                }}
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="btn-primary"
                  style={{
                    textDecoration: "none",
                    padding: "0.875rem 2rem",
                    fontSize: "1rem",
                  }}
                >
                  Start Writing Free →
                </Link>
                <Link
                  href="/login"
                  className="btn-secondary"
                  style={{
                    textDecoration: "none",
                    padding: "0.875rem 2rem",
                    fontSize: "1rem",
                  }}
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        style={{
          padding: "6rem 1.5rem",
          maxWidth: "80rem",
          margin: "0 auto",
        }}
      >
        <h2
          className="section-title"
          style={{ textAlign: "center", fontSize: "2.25rem", marginBottom: "1rem" }}
        >
          How It Works
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "var(--color-text-secondary)",
            maxWidth: "32rem",
            margin: "0 auto 4rem",
          }}
        >
          Three AI agents collaborate and debate to produce high-quality novel
          chapters.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {[
            {
              step: "01",
              icon: "💡",
              title: "Describe Your Idea",
              desc: "Enter your genre, characters, world, and themes. NovelForge creates a comprehensive story bible.",
            },
            {
              step: "02",
              icon: "📜",
              title: "Generate Prototype",
              desc: "AI builds your story bible with synopsis, characters, world details, and a chapter-by-chapter outline.",
            },
            {
              step: "03",
              icon: "⚔️",
              title: "Debate & Generate",
              desc: "Writer drafts, Critic scores, Arbiter resolves — up to 3 rounds per chapter ensure quality.",
            },
            {
              step: "04",
              icon: "📖",
              title: "Review & Export",
              desc: "Review quality reports, edit chapters, and export your complete novel.",
            },
          ].map((item) => (
            <div key={item.step} className="card" style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  fontSize: "2.5rem",
                  fontWeight: 800,
                  color: "rgba(124, 58, 237, 0.1)",
                }}
              >
                {item.step}
              </span>
              <span style={{ fontSize: "2rem", display: "block", marginBottom: "1rem" }}>
                {item.icon}
              </span>
              <h3
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  marginBottom: "0.5rem",
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section
        style={{
          padding: "6rem 1.5rem",
          maxWidth: "80rem",
          margin: "0 auto",
        }}
      >
        <h2
          className="section-title"
          style={{ textAlign: "center", fontSize: "2.25rem", marginBottom: "3rem" }}
        >
          Features
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {features.map((f, i) => (
            <div
              key={i}
              className="glass-card animate-fadeIn"
              style={{
                animationDelay: `${i * 0.1}s`,
                display: "flex",
                gap: "1rem",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  fontSize: "1.75rem",
                  flexShrink: 0,
                  width: "3rem",
                  height: "3rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(124, 58, 237, 0.1)",
                  borderRadius: "0.75rem",
                }}
              >
                {f.icon}
              </span>
              <div>
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    marginBottom: "0.25rem",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    color: "var(--color-text-secondary)",
                    fontSize: "0.85rem",
                    lineHeight: 1.5,
                  }}
                >
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          padding: "6rem 1.5rem",
          textAlign: "center",
        }}
      >
        <div
          className="glass-card"
          style={{
            maxWidth: "40rem",
            margin: "0 auto",
            padding: "3rem",
            border: "1px solid rgba(124, 58, 237, 0.2)",
          }}
        >
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            Ready to Write Your Novel?
          </h2>
          <p
            style={{
              color: "var(--color-text-secondary)",
              marginBottom: "2rem",
            }}
          >
            Join NovelForge AI and turn your ideas into structured, quality-checked
            fiction.
          </p>
          <Link
            href={user ? "/dashboard" : "/register"}
            className="btn-primary"
            style={{
              textDecoration: "none",
              padding: "0.875rem 2rem",
              fontSize: "1rem",
            }}
          >
            {user ? "Go to Dashboard" : "Start Writing Free"} →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--color-border)",
          padding: "2rem 1.5rem",
          textAlign: "center",
          color: "var(--color-text-muted)",
          fontSize: "0.85rem",
        }}
      >
        <p>
          © 2024 NovelForge AI — Powered by multi-agent LLM debate engine
        </p>
      </footer>
    </div>
  );
}
