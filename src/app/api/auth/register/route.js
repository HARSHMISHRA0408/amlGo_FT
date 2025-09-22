import { connectDB } from "@/lib/mongo";
import User from "@/models/user";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await connectDB();

    // get data from request body
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password required" }), { status: 400 });
    }

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new Response(JSON.stringify({ error: "User already exists" }), { status: 400 });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new user
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    return new Response(JSON.stringify({ message: "User registered successfully" }), { status: 201 });
  } catch (err) {
    console.error("Register API error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
