import { connectDB } from "@/lib/mongo";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { serialize } from "cookie";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password required" }), { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });

    // Create a cookie with email and role
    const cookie = serialize(
      "user",
      JSON.stringify({ email: user.email, role: user.role || "user" }),
      {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day
      }
    );

    return new Response(JSON.stringify({ message: "Login successful" }), {
      status: 200,
      headers: { "Set-Cookie": cookie },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
