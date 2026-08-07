import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 48, margin: 0 }}>404</h1>
        <p style={{ fontSize: 16, color: "#666", marginTop: 8 }}>
          This page could not be found.
        </p>
        <Link
          href="/"
          style={{
            marginTop: 24,
            display: "inline-block",
            color: "#065f46",
            textDecoration: "underline",
          }}
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
