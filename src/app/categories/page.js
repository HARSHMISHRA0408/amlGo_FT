"use client";
import { useState, useEffect } from "react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [amountLimit, setAmountLimit] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch categories on load
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/category", { method: "GET" });
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Add new category
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!categoryName || !amountLimit) return;

    try {
      await fetch("/api/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: categoryName, amountLimit }),
      });
      setCategoryName("");
      setAmountLimit("");
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  // Update category
  const handleUpdate = async (id) => {
    try {
      await fetch("/api/category", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, categoryName, amountLimit }),
      });
      setEditingId(null);
      setCategoryName("");
      setAmountLimit("");
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    try {
      await fetch("/api/category", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Categories</h1>

      {/* Add / Edit Form */}
      <form
        onSubmit={editingId ? () => handleUpdate(editingId) : handleAdd}
        className="flex flex-col sm:flex-row gap-3 mb-6"
      >
        <input
          type="text"
          placeholder="Category Name"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          className="border rounded p-2 flex-1"
        />
        <input
          type="number"
          placeholder="Amount Limit"
          value={amountLimit}
          onChange={(e) => setAmountLimit(e.target.value)}
          className="border rounded p-2 flex-1"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {editingId ? "Update" : "Add"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setCategoryName("");
              setAmountLimit("");
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Category List */}
      {loading ? (
        <p>Loading...</p>
      ) : categories.length === 0 ? (
        <p>No categories found.</p>
      ) : (
        <ul className="space-y-3">
          {categories.map((cat) => (
            <li
              key={cat._id}
              className="flex justify-between items-center border rounded p-3 shadow-sm"
            >
              <div>
                <p className="font-semibold">{cat.category}</p>
                <p className="text-gray-600">Limit: ₹{cat.amountLimit}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingId(cat._id);
                    setCategoryName(cat.category || cat.categoryName);
                    setAmountLimit(cat.amountLimit);
                  }}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
