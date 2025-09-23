"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [monthlyReports, setMonthlyReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMonthlyReports();
  }, []);

  const fetchMonthlyReports = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/SOlite", {
        method: "GET",
        credentials: "include", // important for sending cookies
      });
      if (!res.ok) throw new Error("Failed to fetch reports");
      const data = await res.json();
      setMonthlyReports(data);
    } catch (error) {
      console.error("Error fetching monthly reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const res = await fetch("/api/SOlite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // send cookies to backend
      });
      if (res.ok) {
        alert("Monthly report generated successfully!");
        fetchMonthlyReports(); // refresh table
      } else {
        const err = await res.json();
        alert(err.message || "Failed to generate monthly report.");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      alert("An error occurred while generating the report.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Monthly Reports</h1>
          <Link
            href="/dashboard"
            className="bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-300 transition"
          >
            Go to Expenses
          </Link>
        </header>

        {/* Reports Section */}
        <main className="bg-white rounded-xl shadow-lg p-8">
          <div className="bg-gray-50 rounded-lg p-6 shadow-md mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Historical Reports
              </h2>
              <button
                onClick={handleGenerateReport}
                className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition"
              >
                Generate Monthly Report
              </button>
            </div>

            {loading ? (
              <p className="text-center text-gray-500">Loading reports...</p>
            ) : monthlyReports.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Month
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Total Spent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Top Category
                      </th>
                     
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {monthlyReports.map((report) => (
                      <tr key={report.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {report.month}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{Number(report.totalSpent).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.topCategory || "None"}
                        </td>
                        
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500">
                No reports found. Generate a new one!
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
