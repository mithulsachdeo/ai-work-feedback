"use client";

export default function QuotaBanner({
  remaining,
  byoActive,
  onUnlock,
}: {
  remaining: number;
  byoActive: boolean;
  onUnlock: () => void;
}) {
  if (byoActive) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 14px",
          borderRadius: "var(--radius-pill)",
          background: "rgba(89, 201, 149, 0.15)",
          border: "1px solid rgba(89, 201, 149, 0.4)",
          fontSize: "12px",
          fontWeight: 700,
          color: "#81C784",
        }}
      >
        <span>●</span>
        <span>Using your own key — unlimited checks</span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "8px",
        padding: "6px 14px",
        borderRadius: "var(--radius-pill)",
        background: "var(--theme-card-surface)",
        border: "1px solid var(--theme-card-border)",
        fontSize: "12px",
        color: "var(--theme-card-text)",
      }}
    >
      <span>
        {remaining >= 0 ? (
          <strong>{remaining} free checks left today</strong>
        ) : (
          "Daily quota active"
        )}
      </span>
      <span style={{ opacity: 0.4 }}>•</span>
      <button
        type="button"
        onClick={onUnlock}
        style={{
          background: "none",
          border: "none",
          color: "var(--color-blue)",
          fontWeight: 800,
          cursor: "pointer",
          padding: 0,
          fontSize: "12px",
        }}
      >
        Add your own key for unlimited checks ↗
      </button>
    </div>
  );
}
