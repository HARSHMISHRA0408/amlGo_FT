"use client";

import { useState, useEffect } from "react";




export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [user, setUser] = useState({ email: "", role: "" });
  const [CurrentEmail, setCurrentEmail] = useState("");

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    if (data) setUser(data);
  };

  const fetchExpenses = async () => {
    const res = await fetch("/api/adminExpenses");
    const data = await res.json();
    setExpenses(data);
  };

  useEffect(() => {
    fetchUsers();

  }, []);

  useEffect(() => {

    fetchExpenses();
  }, [CurrentEmail]);




  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };


  console.log("User Role:", user); // Debugging line
  console.log("Expenses:", expenses); // Debugging line


  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="container mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-red-600 transition-colors duration-200"
          >
            Logout
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">All Users</h2>
            {user.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {user.map((u) => (
                      <tr
                        key={u._id}
                        onClick={() => setCurrentEmail(u.email)}
                        className="cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No users found.</p>
            )}
          </div>

          {/* Expenses Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Expenses {CurrentEmail ? `for ${CurrentEmail}` : ''}
            </h2>
            {CurrentEmail ? (
              expenses.filter((exp) => exp.userEmail === CurrentEmail).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                       
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {expenses
                        .filter((exp) => exp.userEmail === CurrentEmail)
                        .map((exp) => (
                          <tr key={exp._id}>
                      
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rs. {exp.amount}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exp.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(exp.date).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No expenses found for {CurrentEmail}.</p>
              )
            ) : (
              <p className="text-gray-500">Select a user to view their expenses.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}