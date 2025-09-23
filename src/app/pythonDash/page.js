"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PythonDashboardPage() {

    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExpensesAndSuggestions = async () => {
            setLoading(true);
            try {
               
                const expensesRes = await fetch("/api/expenses");
                if (!expensesRes.ok) {
                    throw new Error("Failed to fetch expenses from Next.js API.");
                }
                const expensesData = await expensesRes.json();

                const suggestionsRes = await fetch("http://localhost:5000/api/suggestions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ expenses: expensesData }),
                });

                if (!suggestionsRes.ok) {
                    throw new Error("Failed to fetch suggestions from Python API.");
                }

                const suggestionsData = await suggestionsRes.json();
                setSuggestions(suggestionsData.suggestions);
            } catch (err) {
                console.error(err);
                setSuggestions(["Failed to get suggestions. Please try again later."]);
            } finally {
                setLoading(false);
            }
        };

        fetchExpensesAndSuggestions();
    }, []); 

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans">
            <div className="container mx-auto max-w-4xl">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">Smart Suggestions</h1>
                    <Link
                        href="/dashboard"
                        className="bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-300 transition"
                    >
                        Back to Dashboard
                    </Link>
                </header>

                <main className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Insights for your account
                    </h2>
                    {loading ? (
                        <p className="text-center text-gray-500">Generating suggestions...</p>
                    ) : (
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            {suggestions.length > 0 ? (
                                suggestions.map((suggestion, index) => <li key={index}>{suggestion}</li>)
                            ) : (
                                <p>No suggestions available at this time.</p>
                            )}
                        </ul>
                    )}
                </main>
            </div>
        </div>
    );
}
