import fs from "fs";
import path from "path";
import { marked } from "marked";
import "./guide.css";

export const dynamic = "force-static";

export const metadata = {
  title: "Guide — Whetstone",
};

export default function GuidePage() {
  // Single source of truth: render docs/product-overview.md, read at build time.
  // Content is a trusted repo file (never user input), so dangerouslySetInnerHTML is safe here.
  const md = fs.readFileSync(path.join(process.cwd(), "docs/product-overview.md"), "utf8");
  const html = marked.parse(md, { gfm: true, async: false }) as string;

  return (
    <main
      style={{
        width: "min(calc(100% - 32px), 900px)",
        margin: "24px auto 72px auto",
      }}
    >
      <a
        href="/app"
        style={{
          display: "inline-block",
          marginBottom: "16px",
          fontSize: "14px",
          fontWeight: 700,
          color: "var(--color-blue)",
        }}
      >
        ← Back to app
      </a>
      <article
        className="guide"
        style={{
          background: "var(--theme-card-bg)",
          color: "var(--theme-card-text)",
          border: "1px solid var(--theme-card-border)",
          borderRadius: "var(--radius-section)",
          padding: "clamp(24px, 4vw, 56px)",
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </main>
  );
}
