"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        gap: "20px",
      }}
    >
      <h1>Welcome to Amlgo Finance Tracker</h1>
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          style={{ padding: "10px 20px" }}
          onClick={() => router.push("/login")}
        >
          Login
        </button>
        <button
          style={{ padding: "10px 20px" }}
          onClick={() => router.push("/register")}
        >
          Signup
        </button>
      </div>
    </div>
  );
}
