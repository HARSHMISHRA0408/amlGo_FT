import { cookies } from "next/headers";
import mongoose from "mongoose";
import Expense from "@/models/expense";
import { getDb } from "@/lib/sqlite";
import { NextResponse } from "next/server";

async function connectMongo() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
    }
}

// GET → fetch last 3 monthly reports from SQLite
export async function GET() {
    const cookieStore = cookies();
    const userCookie = cookieStore.get("user");
    const user = userCookie ? JSON.parse(decodeURIComponent(userCookie.value)) : null;

    if (!user || !user.email) {
        return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }

    try {
        const db = await getDb();
        const reports = await db.all(
            "SELECT * FROM monthly_reports WHERE userId = ? ORDER BY id DESC LIMIT 3",
            [user.email]
        );
        return NextResponse.json(reports);
    } catch (error) {
        console.error("Error fetching reports:", error);
        return NextResponse.json({ message: "Failed to fetch reports." }, { status: 500 });
    }
}

// POST → generate current month report from MongoDB + store into SQLite
export async function POST() {
    const cookieStore = cookies();
    const userCookie = cookieStore.get("user");
    const user = userCookie ? JSON.parse(decodeURIComponent(userCookie.value)) : null;

    if (!user || !user.email) {
        return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }

    try {
        await connectMongo();
        const db = await getDb();

        const now = new Date();
        const monthString = `${now.getFullYear()}-${now.getMonth() + 1}`;
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);


        const expenses = await Expense.find({
            userEmail: user.email,
            date: { $gte: startOfMonth, $lte: endOfMonth },
        });

        const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        const categorySpending = expenses.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
            return acc;
        }, {});
        const sortedCategories = Object.entries(categorySpending).sort(([, a], [, b]) => b - a);
        const topCategory = sortedCategories.length > 0 ? sortedCategories[0][0] : null;

        const overbudgetCategories = "N/A"; // placeholder

  
        const existing = await db.get(
            "SELECT * FROM monthly_reports WHERE userId = ? AND month = ?",
            [user.email, monthString]
        );

        if (existing) {
            await db.run(
                "UPDATE monthly_reports SET totalSpent = ?, topCategory = ?, overbudgetCategories = ? WHERE userId = ? AND month = ?",
                [totalSpent, topCategory, overbudgetCategories, user._id, monthString]
            );
        } else {
            await db.run(
                "INSERT INTO monthly_reports (userId, month, totalSpent, topCategory, overbudgetCategories) VALUES (?, ?, ?, ?, ?)",
                [user.email, monthString, totalSpent, topCategory, overbudgetCategories]
            );
        }

        return NextResponse.json({ message: "Monthly report generated successfully" });
    } catch (error) {
        console.error("Error generating report:", error);
        return NextResponse.json({ message: "Failed to generate report." }, { status: 500 });
    }
}
