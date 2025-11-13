import React from 'react';
import { FaWallet, FaArrowUp, FaArrowDown, FaChartPie } from 'react-icons/fa';
import { formatCurrency } from '../utils/currencyFormat';

const ExpenseSummary = ({ expenses = [], totalIncome = 10000 }) => {
    const list = Array.isArray(expenses) ? expenses : [];
    const totalExpenses = list.reduce((sum, exp) => sum + (Number(exp.value) || 0), 0);
    const remainingBalance = Number(totalIncome || 0) - totalExpenses;

    const categoryTotals = list.reduce((acc, exp) => {
        const category = exp.category || 'other';
        acc[category] = (acc[category] || 0) + (Number(exp.value) || 0);
        return acc;
    }, {});
    const highestCategory = Object.entries(categoryTotals).reduce((max, [category, amount]) => (amount > (max.amount || 0) ? { category, amount } : max), { category: '—', amount: 0 });

    return (
        <div className="card">
            <h2 className="text-2xl font-bold mb-4">Expense Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-4 rounded-lg bg-[var(--card-bg)]">
                    <div className="flex items-center gap-3 mb-2"><FaWallet className="text-blue-400" /><h3 className="font-semibold">Total Income</h3></div>
                    <p className="text-2xl font-bold">{formatCurrency(totalIncome)}</p>
                </div>

                <div className="p-4 rounded-lg bg-[var(--card-bg)]">
                    <div className="flex items-center gap-3 mb-2"><FaArrowDown className="text-red-400" /><h3 className="font-semibold">Total Expenses</h3></div>
                    <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
                </div>

                <div className="p-4 rounded-lg bg-[var(--card-bg)]">
                    <div className="flex items-center gap-3 mb-2"><FaArrowUp className="text-green-400" /><h3 className="font-semibold">Balance Remaining</h3></div>
                    <p className={`text-2xl font-bold ${remainingBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(remainingBalance)}</p>
                </div>

                <div className="p-4 rounded-lg bg-[var(--card-bg)]">
                    <div className="flex items-center gap-3 mb-2"><FaChartPie className="text-purple-400" /><h3 className="font-semibold">Highest Spending</h3></div>
                    <p className="text-lg font-bold capitalize">{highestCategory.category}</p>
                    <p className="text-sm">{formatCurrency(highestCategory.amount)}</p>
                </div>
            </div>
        </div>
    );
};

export default ExpenseSummary;
