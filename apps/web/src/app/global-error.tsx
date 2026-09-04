"use client";

// Only fires if the root layout itself crashes (vs. error.tsx, which covers
// everything below it) — must render its own <html>/<body> since it replaces
// the layout entirely, so it uses inline styles rather than Tailwind classes
// in case the crash is CSS/build related.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          background: "#090D14",
          color: "#F4F7FB",
          fontFamily: "Arial, Helvetica, sans-serif",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#EDA83D" }}>Something went wrong</p>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>geom3d Playground hit an unexpected error.</h1>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: "0.5rem",
            borderRadius: "0.5rem",
            border: "none",
            background: "rgba(91, 110, 245, 0.2)",
            color: "#F4F7FB",
            fontWeight: 600,
            fontSize: "0.875rem",
            padding: "0.5rem 1rem",
            cursor: "pointer",
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
