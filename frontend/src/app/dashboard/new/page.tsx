"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function NewStoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [titleIdea, setTitleIdea] = useState("");
  const [characters, setCharacters] = useState("");
  const [world, setWorld] = useState("");
  const [themes, setThemes] = useState("");
  const [tone, setTone] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Settings
  const [pov, setPov] = useState("third-person");
  const [storyTone, setStoryTone] = useState("dramatic");
  const [chapterLength, setChapterLength] = useState("medium");

  if (authLoading) return null;
  if (!user) {
    router.push("/login");
    return null;
  }

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const story = await api.createStory(
        title,
        {
          genre,
          title_idea: titleIdea,
          characters,
          world,
          themes,
          tone,
          additional_notes: additionalNotes,
        },
        {
          pov,
          tone: storyTone,
          chapter_length: chapterLength,
        }
      );
      router.push(`/dashboard/story/${story.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create story");
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = ["Story Basics", "World & Characters", "Writing Settings"];

  return (
    <div className="page-container" style={{ maxWidth: "48rem" }}>
      <h1 className="section-title" style={{ marginBottom: "0.5rem" }}>
        Create New Story
      </h1>
      <p
        style={{
          color: "var(--color-text-secondary)",
          marginBottom: "2rem",
        }}
      >
        Fill in your story concept and let AI build your story bible.
      </p>

      {/* Step Indicator */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "2rem",
        }}
      >
        {stepTitles.map((s, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <div
              style={{
                height: "4px",
                borderRadius: "2px",
                background:
                  i + 1 <= step
                    ? "linear-gradient(90deg, var(--color-accent), var(--color-accent-light))"
                    : "var(--color-border)",
                transition: "background 0.3s",
              }}
            />
            <span
              style={{
                fontSize: "0.75rem",
                color:
                  i + 1 <= step
                    ? "var(--color-accent-light)"
                    : "var(--color-text-muted)",
                fontWeight: i + 1 === step ? 600 : 400,
              }}
            >
              {s}
            </span>
          </div>
        ))}
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

      <div className="card animate-fadeIn">
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                Story Title *
              </label>
              <input
                className="input-field"
                placeholder="e.g., The Last Starkeeper"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                Genre
              </label>
              <select
                className="select-field"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              >
                <option value="">Select a genre</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Romance">Romance</option>
                <option value="Mystery">Mystery</option>
                <option value="Thriller">Thriller</option>
                <option value="Horror">Horror</option>
                <option value="Literary Fiction">Literary Fiction</option>
                <option value="Historical Fiction">Historical Fiction</option>
                <option value="Adventure">Adventure</option>
              </select>
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                Story Idea / Premise
              </label>
              <textarea
                className="textarea-field"
                placeholder="Describe your story concept in a few sentences..."
                value={titleIdea}
                onChange={(e) => setTitleIdea(e.target.value)}
                rows={4}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                Characters
              </label>
              <textarea
                className="textarea-field"
                placeholder="Describe your main characters (names, roles, motivations)..."
                value={characters}
                onChange={(e) => setCharacters(e.target.value)}
                rows={4}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                World / Setting
              </label>
              <textarea
                className="textarea-field"
                placeholder="Describe the world, time period, or setting..."
                value={world}
                onChange={(e) => setWorld(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                Themes
              </label>
              <input
                className="input-field"
                placeholder="e.g., redemption, sacrifice, coming-of-age"
                value={themes}
                onChange={(e) => setThemes(e.target.value)}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                Tone
              </label>
              <input
                className="input-field"
                placeholder="e.g., dark, humorous, hopeful, epic"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                Additional Notes
              </label>
              <textarea
                className="textarea-field"
                placeholder="Any other details, inspirations, or constraints..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                Point of View
              </label>
              <select
                className="select-field"
                value={pov}
                onChange={(e) => setPov(e.target.value)}
              >
                <option value="first-person">First Person</option>
                <option value="third-person">Third Person Limited</option>
                <option value="third-person-omniscient">Third Person Omniscient</option>
                <option value="second-person">Second Person</option>
              </select>
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                Writing Tone
              </label>
              <select
                className="select-field"
                value={storyTone}
                onChange={(e) => setStoryTone(e.target.value)}
              >
                <option value="dramatic">Dramatic</option>
                <option value="humorous">Humorous</option>
                <option value="dark">Dark</option>
                <option value="lighthearted">Lighthearted</option>
                <option value="suspenseful">Suspenseful</option>
                <option value="poetic">Poetic</option>
                <option value="action-packed">Action-Packed</option>
              </select>
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                Chapter Length
              </label>
              <select
                className="select-field"
                value={chapterLength}
                onChange={(e) => setChapterLength(e.target.value)}
              >
                <option value="short">Short (~1000 words)</option>
                <option value="medium">Medium (~2000 words)</option>
                <option value="long">Long (~3000+ words)</option>
              </select>
            </div>

            <div
              className="glass-card"
              style={{
                marginTop: "0.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <h4 style={{ fontWeight: 600, fontSize: "0.9rem" }}>Story Summary</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                <strong>Title:</strong> {title || "—"}
              </p>
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                <strong>Genre:</strong> {genre || "—"}
              </p>
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                <strong>POV:</strong> {pov} · <strong>Tone:</strong> {storyTone} · <strong>Length:</strong> {chapterLength}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "1.5rem",
        }}
      >
        {step > 1 ? (
          <button className="btn-secondary" onClick={() => setStep(step - 1)}>
            ← Back
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            className="btn-primary"
            onClick={() => setStep(step + 1)}
            disabled={step === 1 && !title}
          >
            Next →
          </button>
        ) : (
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading || !title}
          >
            {loading ? (
              <span className="loading-spinner" style={{ width: "1.25rem", height: "1.25rem" }} />
            ) : (
              "Create Story ✦"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
