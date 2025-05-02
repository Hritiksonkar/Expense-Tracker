import React from 'react';
import { FaWallet, FaArrowUp, FaArrowDown, FaChartPie } from 'react-icons/fa';

const ExpenseSummary = ({ expenses, totalIncome = 10000 }) => {
    const calculateSummary = () => {
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.value, 0);
        const remainingBalance = totalIncome - totalExpenses;

        // Calculate highest spending category
        const categoryTotals = expenses.reduce((acc, exp) => {
            const category = exp.category || 'other';
            acc[category] = (acc[category] || 0) + exp.value;
            return acc;
        }, {});

        const highestCategory = Object.entries(categoryTotals).reduce(
            (max, [category, amount]) =>
                amount > (max.amount || 0) ? { category, amount } : max,
            { category: '', amount: 0 }
        );

        return {
            totalExpenses,
            remainingBalance,
            highestCategory
        };
    };

    const summary = calculateSummary();

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Expense Summary</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <FaWallet className="text-blue-600" />
                        <h3 className="font-semibold text-gray-700">Total Income</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">₹{totalIncome.toFixed(2)}</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <FaArrowDown className="text-red-600" />
                        <h3 className="font-semibold text-gray-700">Total Expenses</h3>
                    </div>
                    <p className="text-2xl font-bold text-red-600">₹{summary.totalExpenses.toFixed(2)}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <FaArrowUp className="text-green-600" />
                        <h3 className="font-semibold text-gray-700">Balance Remaining</h3>
                    </div>
                    <p className={`text-2xl font-bold ${summary.remainingBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{summary.remainingBalance.toFixed(2)}
                    </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <FaChartPie className="text-purple-600" />
                        <h3 className="font-semibold text-gray-700">Highest Spending</h3>
                    </div>
                    <p className="text-lg font-bold text-purple-600 capitalize">
                        {summary.highestCategory.category}
                    </p>
                    <p className="text-sm text-purple-500">
                        ₹{summary.highestCategory.amount.toFixed(2)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ExpenseSummary;
