"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function DashboardPage() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // New state variables for analytics
  const [totalSpent, setTotalSpent] = useState(0);
  const [topCategory, setTopCategory] = useState({ name: "N/A", amount: 0 });
  const [topPaymentMethods, setTopPaymentMethods] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (expenses.length > 0) {
      calculateAnalytics();
    }
  }, [expenses]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expenseRes, categoryRes] = await Promise.all([
        fetch("/api/expenses"),
        fetch("/api/category"),
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

  // New function to calculate all analytics
  const calculateAnalytics = () => {
    const now = new Date();
    const currentMonthExpenses = expenses.filter(exp => {
      const expenseDate = new Date(exp.date);
      return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
    });

    // Total spent
    const total = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    setTotalSpent(total);

    // Top Category
    const categorySpending = currentMonthExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});
    const sortedCategories = Object.entries(categorySpending).sort(([, a], [, b]) => b - a);
    if (sortedCategories.length > 0) {
      setTopCategory({ name: sortedCategories[0][0], amount: sortedCategories[0][1] });
    }

    // Top Payment Methods
    const paymentMethodCount = currentMonthExpenses.reduce((acc, exp) => {
      acc[exp.paymentMethod] = (acc[exp.paymentMethod] || 0) + 1;
      return acc;
    }, {});
    const sortedPayments = Object.entries(paymentMethodCount).sort(([, a], [, b]) => b - a);
    setTopPaymentMethods(sortedPayments.slice(0, 3).map(([method]) => method));
  };

  const getCategoryStats = () => {
    return categories.map((cat) => {
      const spent = expenses
        .filter((exp) => exp.category === cat.category)
        .reduce((sum, exp) => sum + exp.amount, 0);

      const percentage = (spent / cat.amountLimit) * 100;

      return {
        ...cat,
        spent,
        percentage: Math.min(percentage, 100),
      };
    });
  };

  // Data for Pie Chart
  const pieChartData = Object.entries(
    expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f'];

  // Data for Line Graph
  const lineChartData = expenses.reduce((acc, exp) => {
    const date = new Date(exp.date).toLocaleDateString();
    const existingEntry = acc.find(entry => entry.name === date);
    if (existingEntry) {
      existingEntry.amount += exp.amount;
    } else {
      acc.push({ name: date, amount: exp.amount });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.name) - new Date(b.name));

  const stats = getCategoryStats();

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="container mx-auto max-w-6xl">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Expense Dashboard</h1>
          <Link
            href="/dashboard"
            className="bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-300 transition"
          >
            Go to Expenses
          </Link>
        </header>

        <main className="bg-white rounded-xl shadow-lg p-8">
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : (
            <>
              {/* Key Financial Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-500 text-white rounded-lg p-6 shadow-md">
                  <h3 className="text-lg font-semibold">Total Spent This Month</h3>
                  <p className="text-3xl font-bold">₹{totalSpent}</p>
                </div>
                <div className="bg-green-500 text-white rounded-lg p-6 shadow-md">
                  <h3 className="text-lg font-semibold">Top Spending Category</h3>
                  <p className="text-3xl font-bold">{topCategory.name}</p>
                </div>
                <div className="bg-purple-500 text-white rounded-lg p-6 shadow-md">
                  <h3 className="text-lg font-semibold">Top 3 Payment Methods</h3>
                  <ul className="list-disc list-inside mt-2 text-xl font-bold">
                    {topPaymentMethods.map((method, index) => (
                      <li key={index}>{method}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Pie Chart */}
                <div className="bg-gray-50 rounded-lg p-6 shadow-md">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Category-wise Spending</h2>
                  {pieChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          label
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-gray-500">No data for pie chart.</p>
                  )}
                </div>

                {/* Line Graph */}
                <div className="bg-gray-50 rounded-lg p-6 shadow-md">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Daily Spending Trend</h2>
                  {lineChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={lineChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="amount" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-gray-500">No data for line graph.</p>
                  )}
                </div>
              </div>

              {/* Existing Category Stats */}
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Spending by Category</h2>
              {stats.length === 0 ? (
                <p className="text-center text-gray-500">No categories found.</p>
              ) : (
                <div className="space-y-6">
                  {stats.map((cat) => (
                    <div
                      key={cat._id}
                      className="bg-white rounded-lg p-6 shadow-md border border-gray-200"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h2 className="font-bold text-lg text-gray-800">{cat.category}</h2>
                        <p className="text-sm text-gray-600">
                          Limit: ₹{cat.amountLimit}
                        </p>
                      </div>

                      <div className="mb-2">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              cat.percentage >= 100
                                ? "bg-red-600"
                                : cat.percentage >= 80
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${cat.percentage}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-800 font-semibold">
                          Spent: ₹{cat.spent}
                        </p>
                        <p className="text-sm text-gray-600">
                          ({cat.percentage.toFixed(1)}%)
                        </p>
                      </div>

                      {cat.percentage >= 100 && (
                        <div className="flex items-center mt-2 text-red-600 font-bold">
                          <span className="mr-2">⚠️</span>
                          <p>Limit exceeded!</p>
                        </div>
                      )}
                      {cat.percentage >= 80 && cat.percentage < 100 && (
                        <div className="flex items-center mt-2 text-yellow-600 font-bold">
                          <span className="mr-2">⚠️</span>
                          <p>Nearing limit!</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}