"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Something went wrong");
      } else {
        setMessage(data.message);

        // redirect after login
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setMessage("Internal server error");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h1>Login Page</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "10px 20px", width: "100%" }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      {message && <p style={{ marginTop: "10px", color: "red" }}>{message}</p>}
    </div>
  );
}
