import { connectDB } from "@/lib/mongo";
import Expense from "@/models/expense";
import { cookies } from "next/headers";

export async function GET() {
  await connectDB();

  // Get logged-in user from cookie
  const cookieStore = cookies();
  const userCookie = cookieStore.get("user");
  const user = userCookie ? JSON.parse(decodeURIComponent(userCookie.value)) : null;
  if (!user) return new Response(JSON.stringify([]), { status: 200 });

  // Fetch expenses only for this user
  const expenses = await Expense.find({ userEmail: user.email }).sort({ date: -1 });
  return new Response(JSON.stringify(expenses), { status: 200 });
}

export async function POST(req) {
  await connectDB();
  const cookieStore = cookies();
  const userCookie = cookieStore.get("user");
  const user = userCookie ? JSON.parse(decodeURIComponent(userCookie.value)) : null;
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const { title, amount, category, date, paymentMethod, notes } = await req.json();
  const newExpense = await Expense.create({
    title,
    amount,
    category,
    date,
    paymentMethod,
    notes,
    userEmail: user.email // Add user email here
  });

  return new Response(JSON.stringify(newExpense), { status: 201 });
}

export async function PUT(req) {
  await connectDB();
  const cookieStore = cookies();
  const userCookie = cookieStore.get("user");
  const user = userCookie ? JSON.parse(decodeURIComponent(userCookie.value)) : null;
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const { id, title, amount, category, date, paymentMethod, notes } = await req.json();

  // Ensure only the owner can update
  const expense = await Expense.findOneAndUpdate(
    { _id: id, userEmail: user.email },
    { title, amount, category, date, paymentMethod, notes },
    { new: true }
  );

  if (!expense) return new Response(JSON.stringify({ error: "Expense not found or unauthorized" }), { status: 404 });

  return new Response(JSON.stringify(expense), { status: 200 });
}

export async function DELETE(req) {
  await connectDB();
  const cookieStore = cookies();
  const userCookie = cookieStore.get("user");
  const user = userCookie ? JSON.parse(decodeURIComponent(userCookie.value)) : null;
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const { id } = await req.json();

  // Ensure only the owner can delete
  const deleted = await Expense.findOneAndDelete({ _id: id, userEmail: user.email });
  if (!deleted) return new Response(JSON.stringify({ error: "Expense not found or unauthorized" }), { status: 404 });

  return new Response(JSON.stringify({ message: "Deleted" }), { status: 200 });
}
