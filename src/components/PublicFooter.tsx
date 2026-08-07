"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function PublicFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard") || pathname === "/login") return null;

  return (
    <footer>
      <div
        className="brand"
        style={{
          justifyContent: "center",
          color: "var(--text-on-ink)",
          marginBottom: 20,
        }}
      >
        <span className="mark">و</span>Wijha
      </div>
      <div style={{ marginBottom: 20 }}>
        One destination for every trusted SAT &amp; ACT course.
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 28,
          marginBottom: 24,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <Link
          href="/terms"
          style={{
            color: "var(--text-on-ink-mute)",
            textDecoration: "none",
            fontSize: 13,
            transition: "color 0.2s",
          }}
        >
          Terms &amp; Conditions
        </Link>
        <Link
          href="/privacy"
          style={{
            color: "var(--text-on-ink-mute)",
            textDecoration: "none",
            fontSize: 13,
            transition: "color 0.2s",
          }}
        >
          Privacy Policy
        </Link>
        <Link
          href="/fund"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 20px",
            borderRadius: 8,
            background: "var(--blue)",
            color: "#fff",
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 700,
            transition: "opacity 0.2s",
          }}
        >
          &#9829; Fund Us
        </Link>
      </div>
      <div style={{ fontSize: 12, color: "rgba(237,234,224,0.35)" }}>
        &copy; {new Date().getFullYear()} Wijha. All rights reserved.
      </div>
    </footer>
  );
}
