import { connectDB } from "@/lib/mongo";
import Users from "@/models/user";
import Expense from "@/models/expense";



export async function GET() {
    await connectDB();

    const users = await Users.find().sort({
        date: -1,
    });
    return new Response(JSON.stringify(users), { status: 200 });
}


export async function GETExpenses() {
    await connectDB();

    const expenses = await Expense.find();
    return new Response(JSON.stringify(expenses), { status: 200 });
}