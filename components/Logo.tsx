export default function Logo({ height = 28 }: { height?: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "9px" }}>
      <svg
        height={height}
        viewBox="18 14 88 78"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Whetstone"
        style={{ display: "block" }}
      >
        <defs>
          <radialGradient id="wsSparkGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-lime)" stopOpacity="0.5" />
            <stop offset="50%" stopColor="var(--color-lime)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--color-lime)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="54" cy="64" r="26" fill="url(#wsSparkGlow)" />
        <rect x="26" y="78" width="70" height="7" rx="3.5" fill="#8E8A7F" opacity="0.4" />
        <rect x="24" y="60" width="72" height="22" rx="9" fill="#C4C0B5" />
        <rect x="24" y="60" width="72" height="8" rx="9" fill="#DED9CE" />
        <path d="M50,68 L92,19 L95,23 L58,72 Z" fill="var(--theme-card-text)" opacity="0.9" />
        <path d="M50,68 L92,19" fill="none" stroke="var(--color-lime)" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M54,55 L56.2,63.2 L64,65 L56.2,66.8 L54,75 L51.8,66.8 L44,65 L51.8,63.2 Z" fill="var(--color-lime)" />
      </svg>
      <span
        style={{
          fontWeight: 800,
          fontSize: `${Math.round(height * 0.64)}px`,
          letterSpacing: "-0.03em",
          color: "var(--theme-card-text)",
          whiteSpace: "nowrap",
        }}
      >
        Whetstone
      </span>
    </span>
  );
}
