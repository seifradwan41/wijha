"use client";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid username or password");
      setLoading(false);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <div className="login-split">
      <div className="login-brand">
        <Link
          href="/"
          style={{
            fontFamily: "Fraunces, serif",
            fontSize: 28,
            fontWeight: 600,
            color: "#fff",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "1.5px solid rgba(255,255,255,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              color: "rgba(255,255,255,0.9)",
              fontFamily: "IBM Plex Mono, monospace",
            }}
          >
            و
          </span>
          Wijha
        </Link>
        <h2
          style={{
            fontFamily: "Fraunces, serif",
            fontSize: 30,
            fontWeight: 600,
            color: "#fff",
            lineHeight: 1.2,
            margin: "40px 0 16px",
          }}
        >
          Every trusted course,
          <br />
          finally in one place.
        </h2>
        <p
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.6,
            maxWidth: 320,
          }}
        >
          Search SAT and ACT courses, compare teachers, and find the right fit —
          all without the group chat chaos.
        </p>
      </div>

      <div className="login-form-wrap">
        <div style={{ width: "100%", maxWidth: 360 }}>
          <h1
            style={{
              fontFamily: "Fraunces, serif",
              fontSize: 24,
              fontWeight: 600,
              marginBottom: 6,
              color: "var(--text-dark)",
            }}
          >
            Sign in
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "var(--text-mute)",
              marginBottom: 32,
            }}
          >
            Enter your credentials to continue
          </p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  marginBottom: 16,
                  fontSize: 13,
                  color: "#dc2626",
                }}
              >
                {error}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-mute)",
                  marginBottom: 6,
                }}
              >
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid rgba(27,31,42,0.12)",
                  fontSize: 15,
                  fontFamily: "Inter, sans-serif",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                placeholder="your_username"
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label
                style={{
                  display: "block",
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-mute)",
                  marginBottom: 6,
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid rgba(27,31,42,0.12)",
                  fontSize: 15,
                  fontFamily: "Inter, sans-serif",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: "100%",
                textAlign: "center",
                opacity: loading ? 0.7 : 1,
                padding: "14px 30px",
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      <Suspense
        fallback={
          <div style={{ color: "var(--ink-500)", padding: 40 }}>Loading...</div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
