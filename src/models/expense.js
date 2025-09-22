import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
    paymentMethod: { type: String, required: true },
    notes: { type: String },
    userEmail: { type: String, required: true }
});

const Expense = mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);

export default Expense;
