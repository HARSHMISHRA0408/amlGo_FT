"use client";
import { useState, useEffect } from "react";
import Link from "next/link"; // Assuming Next.js for the Link component

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
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId || !categoryName || !amountLimit) return;

    try {
      await fetch("/api/category", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, categoryName, amountLimit }),
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
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="container mx-auto max-w-3xl">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Manage Categories</h1>
          <Link
            href="/dashboard"
            className="bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-300 transition"
          >
            Go to Expenses
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Add / Edit Form Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              {editingId ? "Edit Category" : "Add New Category"}
            </h2>
            <form onSubmit={editingId ? handleUpdate : handleAdd} className="space-y-4">
              <input
                type="text"
                placeholder="Category Name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <input
                type="number"
                placeholder="Amount Limit (₹)"
                value={amountLimit}
                onChange={(e) => setAmountLimit(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200"
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
                    className="flex-1 bg-gray-500 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-gray-600 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Category List Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Categories List</h2>
            {loading ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : categories.length === 0 ? (
              <p className="text-center text-gray-500">No categories found.</p>
            ) : (
              <ul className="space-y-4">
                {categories.map((cat) => (
                  <li
                    key={cat._id}
                    className="flex justify-between items-center bg-gray-50 rounded-lg p-4 shadow-sm"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{cat.category}</p>
                      <p className="text-sm text-gray-600">Limit: ₹{cat.amountLimit}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(cat._id);
                          setCategoryName(cat.category || cat.categoryName);
                          setAmountLimit(cat.amountLimit);
                        }}
                        className="bg-yellow-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="bg-red-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}