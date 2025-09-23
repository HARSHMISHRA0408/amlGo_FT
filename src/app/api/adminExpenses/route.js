import { connectDB } from "@/lib/mongo";

import Expense from "@/models/expense";

export async function GET() {
    await connectDB();
    // Fetch expenses only for this user
    const expenses = await Expense.find();
    return new Response(JSON.stringify(expenses), { status: 200 });
}