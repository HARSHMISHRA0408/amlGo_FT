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
  MenuItem
} from "@mui/material";

const categories = ["Food", "Rent", "Shopping", "Transport", "Other"];
const paymentMethods = ["UPI", "Credit Card", "Cash", "Other"];

export default function ExpensesPage() {
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
    notes: ""
  });

  const fetchUser = async () => {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    if (data.user) setUser(data.user);
  };

  const fetchExpenses = async () => {
    const res = await fetch("/api/expenses");
    const data = await res.json();
    setExpenses(data.map(e => ({ ...e, id: e._id })));
  };

  useEffect(() => {
    fetchUser();
    fetchExpenses();
  }, []);

  const handleOpen = (expense = null) => {
    if (expense) {
      setForm({
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        date: expense.date?.slice(0, 10),
        paymentMethod: expense.paymentMethod,
        notes: expense.notes || ""
      });
    } else {
      setForm({ title: "", amount: "", category: "", date: "", paymentMethod: "", notes: "" });
    }
    setEditingExpense(expense);
    setOpen(true);
  };

  const handleClose = () => { setOpen(false); setEditingExpense(null); };

  const handleSubmit = async () => {
    const method = editingExpense ? "PUT" : "POST";
    const body = editingExpense ? { id: editingExpense.id, ...form } : form;

    await fetch("/api/expenses", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    fetchExpenses();
    handleClose();
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
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      valueFormatter: (params) => {
        return params.value ? new Date(params.value).toLocaleDateString() : "";
      }
    },

    { field: "notes", headerName: "Notes", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <>
          <Button onClick={() => handleOpen(params.row)}>Edit</Button>
          <Button color="error" onClick={() => handleDelete(params.row.id)}>Delete</Button>
        </>
      ),
    }
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h1>Expenses</h1>
      <Button variant="contained" style={{ marginBottom: "10px" }} onClick={() => handleOpen()}>
        Add Expense
      </Button>
      <div style={{ height: 500 }}>
        <DataGrid rows={expenses} columns={columns} pageSize={5} />
      </div>
      <div style={{ marginBottom: "10px" }}>
        Logged in as: <b>{user.email}</b> (Role: <b>{user.role}</b>)
      </div>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingExpense ? "Edit Expense" : "Add Expense"}</DialogTitle>
        <DialogContent style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
          <TextField label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <TextField label="Amount (₹)" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
          <TextField select label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
          <TextField select label="Payment Method" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
            {paymentMethods.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </TextField>
          <TextField label="Date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          <TextField label="Notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>{editingExpense ? "Update" : "Add"}</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
