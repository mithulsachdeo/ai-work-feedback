"use client";

const OPTIONS = [
  {
    id: "work_product",
    badge: "Finished Work",
    q: "Is this ready to send?",
    hint: "Anything you're about to send or publish.",
    note: "",
  },
  {
    id: "implementation_logic",
    badge: "Automation & Logic",
    q: "Is the logic behind what I built sound?",
    hint: "Something you built with AI's help — an automation, workflow, or script.",
    note: "Needs a chat-based AI that can explain what it built.",
  },
  {
    id: "concept_articulation",
    badge: "Understanding",
    q: "Do I actually understand this?",
    hint: "What you'd say if someone asked you to explain it.",
    note: "",
  },
] as const;

export default function PurposePicker({ onPick }: { onPick: (t: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <span
          style={{
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            fontSize: "11px",
            fontWeight: 800,
            color: "var(--color-blue)",
            display: "inline-block",
            marginBottom: "8px",
          }}
        >
          Step 1: Choose Intent
        </span>
        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 40px)",
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            color: "var(--theme-card-text)",
          }}
        >
          What do you want to check?
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "16px",
        }}
      >
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            onClick={() => onPick(o.id)}
            style={{
              textAlign: "left",
              padding: "24px",
              borderRadius: "var(--radius-card)",
              background: "var(--theme-card-surface)",
              border: "1px solid var(--theme-card-border)",
              color: "var(--theme-card-text)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "24px",
              minHeight: "180px",
              cursor: "pointer",
              transition: "transform var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.borderColor = "var(--color-lime)";
              e.currentTarget.style.boxShadow = "0 12px 26px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "var(--theme-card-border)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--theme-card-surface-hover)",
                  color: "var(--theme-card-text)",
                  border: "1px solid var(--theme-card-border)",
                }}
              >
                {o.badge}
              </span>
              <span style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-lime)" }}>↗</span>
            </div>

            <div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  lineHeight: 1.25,
                  letterSpacing: "-0.02em",
                  color: "var(--theme-card-text)",
                  marginBottom: "8px",
                }}
              >
                {o.q}
              </div>
              <div style={{ fontSize: "14px", lineHeight: 1.5, color: "var(--theme-card-text-muted)", fontWeight: 400 }}>
                {o.hint}
              </div>
              {o.note && (
                <div style={{ fontSize: "12px", lineHeight: 1.5, color: "var(--theme-card-text-muted)", fontWeight: 400, fontStyle: "italic", marginTop: "8px" }}>
                  {o.note}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
