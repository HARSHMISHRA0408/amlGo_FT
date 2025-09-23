"use client";

import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
} from "@mui/material";
import Link from "next/link";


//const categories = ["Food", "Rent", "Shopping", "Transport", "Other"];
const paymentMethods = ["UPI", "Credit Card", "Cash", "Other"];

export default function ExpensesPage() {

  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState({ email: "", role: "" });
  const [editingExpense, setEditingExpense] = useState(null);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
    paymentMethod: "",
    notes: "",
  });

  const fetchUser = async () => {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    if (data.user) setUser(data.user);
  };

  const fetchCategories = async () => {
    const res = await fetch("/api/category");
    const data = await res.json();
    console.log(data);
    setCategories(data);
  };

  const fetchExpenses = async () => {
    const res = await fetch("/api/expenses");
    const data = await res.json();
    setExpenses(data.map((e) => ({ ...e, id: e._id })));
  };

  useEffect(() => {
    fetchUser();
    fetchExpenses();
    fetchCategories();
  }, []);

  const handleOpen = (expense = null) => {
    if (expense) {
      setForm({
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        date: expense.date?.slice(0, 10),
        paymentMethod: expense.paymentMethod,
        notes: expense.notes || "",
      });
    } else {
      setForm({
        title: "",
        amount: "",
        category: "",
        date: "",
        paymentMethod: "",
        notes: "",
      });
    }
    setEditingExpense(expense);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingExpense(null);
  };

  const handleSubmit = async () => {
    const method = editingExpense ? "PUT" : "POST";
    const body = editingExpense ? { id: editingExpense.id, ...form } : form;

    await fetch("/api/expenses", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    fetchExpenses();
    handleClose();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    await fetch("/api/expenses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchExpenses();
  };

  const columns = [
    { field: "title", headerName: "Title", flex: 1 },
    { field: "amount", headerName: "Amount (₹)", flex: 1 },
    { field: "category", headerName: "Category", flex: 1 },
    { field: "paymentMethod", headerName: "Payment Method", flex: 1 },


    { field: "notes", headerName: "Notes", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <>
          <Button onClick={() => handleOpen(params.row)}>Edit</Button>
          <Button color="error" onClick={() => handleDelete(params.row.id)}>
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="container mx-auto max-w-5xl">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Expenses</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              Logged in as: <b className="text-gray-800">{user.email}</b> (Role: <b className="text-gray-800">{user.role}</b>)
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-red-600 transition-colors duration-200"
            >
              Log Out
            </button>
          </div>
        </header>

        <main className="bg-white rounded-xl shadow-lg p-8">
          {/* Action Buttons and Navigation Links */}
          <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
            <Button
              variant="contained"
              onClick={handleOpen}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-200 w-full md:w-auto"
            >
              Add Expense
            </Button>
            <div className="flex space-x-4 w-full md:w-auto">
              <Link
                href="/categories"
                className="bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-300 transition w-full text-center"
              >
                Go to Categories
              </Link>
              <Link
                href="/report"
                className="bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-300 transition w-full text-center"
              >
                Go to Reports
              </Link>
          
              <Link
                href={{
                  pathname: "/pythonDash",
                  query: { userEmail: user.email },
                }}
                className="bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-300 transition w-full text-center"
              >
                Go to Smart Suggestions
              </Link>
                <Link
                href={{
                  pathname: "/monthlyReport",
                  query: { userEmail: user.email },
                }}
                className="bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-300 transition w-full text-center"
              >
                Go to Monthly Reports
              </Link>
            </div>
          </div>

          {/* DataGrid for Expenses */}
          <div style={{ height: 500 }} className="w-full">
            <DataGrid rows={expenses} columns={columns} pageSize={5} />
          </div>
        </main>
      </div>

      {/* Dialog for Add/Edit Expense */}
      <Dialog open={open} onClose={handleClose} PaperProps={{ className: "rounded-xl" }}>
        <DialogTitle className="bg-gray-50 text-gray-800 font-bold">
          {editingExpense ? "Edit Expense" : "Add Expense"}
        </DialogTitle>
        <DialogContent className="flex flex-col gap-4 mt-4">
          <TextField
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            variant="outlined"
            fullWidth
          />
          <TextField
            label="Amount (₹)"
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            variant="outlined"
            fullWidth
          />
          <TextField
            select
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            variant="outlined"
            fullWidth
          >
            {categories.map((c) => (
              <MenuItem key={c._id} value={c.category}>
                {c.category}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Payment Method"
            value={form.paymentMethod}
            onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            variant="outlined"
            fullWidth
          >
            {paymentMethods.map((p) => (
              <MenuItem key={p} value={p}>
                {p}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            variant="outlined"
            fullWidth
          />
          <TextField
            label="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            variant="outlined"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} className="text-gray-500 hover:bg-gray-100 transition">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold transition"
          >
            {editingExpense ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
