"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError("Fel e-post eller lösenord.");
      return;
    }
    router.replace("/admin");
    router.refresh();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F7F6F2",
        padding: 24,
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#fff",
          borderRadius: 12,
          padding: 40,
          boxShadow: "0 20px 60px rgba(17,17,17,0.12)",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div>
          <div className="serif ital" style={{ fontSize: 22, marginBottom: 4 }}>
            Galleri <span className="accent">86</span>
          </div>
          <h1 style={{ fontSize: 15, fontWeight: 600, margin: 0, opacity: 0.7 }}>Logga in i redigeringsläget</h1>
        </div>

        <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 600 }}>
          E-post
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              minHeight: 48,
              padding: "0 14px",
              fontSize: 15,
              border: "1px solid #cabfaf",
              borderRadius: 8,
              fontFamily: "inherit",
            }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 600 }}>
          Lösenord
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              minHeight: 48,
              padding: "0 14px",
              fontSize: 15,
              border: "1px solid #cabfaf",
              borderRadius: 8,
              fontFamily: "inherit",
            }}
          />
        </label>

        {error && (
          <p role="alert" style={{ color: "#a13e3e", fontSize: 13, margin: 0 }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn--primary"
          style={{ minHeight: 52, fontSize: 16, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Loggar in …" : "Logga in"}
        </button>
      </form>
    </div>
  );
}
