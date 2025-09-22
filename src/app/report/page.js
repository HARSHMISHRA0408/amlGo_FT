"use client";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expenseRes, categoryRes] = await Promise.all([
        fetch("/api/expenses"), // your GET for expenses
        fetch("/api/category"), // your GET for categories
      ]);

      const expenseData = await expenseRes.json();
      const categoryData = await categoryRes.json();

      setExpenses(expenseData);
      setCategories(categoryData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate category spending
  const getCategoryStats = () => {
    return categories.map((cat) => {
      const spent = expenses
        .filter((exp) => exp.category === cat.category) // match by category name
        .reduce((sum, exp) => sum + exp.amount, 0);

      const percentage = (spent / cat.amountLimit) * 100;

      return {
        ...cat,
        spent,
        percentage: Math.min(percentage, 100), // avoid >100
      };
    });
  };

  const stats = getCategoryStats();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Expense Dashboard</h1>

      {loading ? (
        <p>Loading...</p>
      ) : stats.length === 0 ? (
        <p>No categories or expenses found.</p>
      ) : (
        <div className="space-y-4">
          {stats.map((cat) => (
            <div
              key={cat._id}
              className="border rounded-lg p-4 shadow-sm bg-white"
            >
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-lg">{cat.category}</h2>
                <p className="text-gray-600 text-sm">
                  Limit: ₹{cat.amountLimit}
                </p>
              </div>

              <div className="mt-2">
                <div className="h-4 bg-gray-200 rounded overflow-hidden">
                  <div
                    className={`h-4 ${
                      cat.percentage >= 100
                        ? "bg-red-600"
                        : cat.percentage >= 80
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
                <p className="text-sm mt-1">
                  Spent: ₹{cat.spent} ({cat.percentage.toFixed(1)}%)
                </p>

                {cat.percentage >= 100 ? (
                  <p className="text-red-600 text-sm font-bold mt-1">
                    ⚠️ Limit exceeded!
                  </p>
                ) : cat.percentage >= 80 ? (
                  <p className="text-yellow-600 text-sm font-bold mt-1">
                    ⚠️ Nearing limit!
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
