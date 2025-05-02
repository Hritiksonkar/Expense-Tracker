import React, { useState, useEffect } from 'react';
import { setBudget, getBudgets, checkBudgetStatus } from '../services/budgetService';

const BudgetManager = ({ expenses, onBudgetUpdate }) => {
    const [budgets, setBudgets] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [newLimit, setNewLimit] = useState('');
    const [budgetStatus, setBudgetStatus] = useState({});

    useEffect(() => {
        loadBudgets();
    }, []);

    useEffect(() => {
        if (budgets.length > 0 && expenses.length > 0) {
            const status = checkBudgetStatus(expenses, budgets);
            setBudgetStatus(status);
        }
    }, [expenses, budgets]);

    const loadBudgets = async () => {
        try {
            const data = await getBudgets();
            setBudgets(data);
        } catch (error) {
            console.error('Failed to load budgets:', error);
        }
    };

    const handleAddBudget = async (e) => {
        e.preventDefault();
        try {
            const newBudget = await setBudget(newCategory, Number(newLimit));
            setBudgets([...budgets, newBudget]);
            setNewCategory('');
            setNewLimit('');
            onBudgetUpdate(budgets);
        } catch (error) {
            console.error('Failed to add budget:', error);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Budget Manager</h2>

            {/* Add New Budget Form */}
            <form onSubmit={handleAddBudget} className="mb-6">
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Category"
                        className="p-2 border rounded flex-1"
                    />
                    <input
                        type="number"
                        value={newLimit}
                        onChange={(e) => setNewLimit(e.target.value)}
                        placeholder="Limit"
                        className="p-2 border rounded w-32"
                    />
                    <button
                        type="submit"
                        className="bg-[#af8978] text-white px-4 py-2 rounded hover:bg-[#97756b]"
                    >
                        Add Budget
                    </button>
                </div>
            </form>

            {/* Budget Status List */}
            <div className="space-y-4">
                {Object.entries(budgetStatus).map(([category, status]) => (
                    <div key={category} className="border p-4 rounded">
                        <div className="flex justify-between mb-2">
                            <h3 className="font-semibold">{category}</h3>
                            <span className={`font-medium ${status.isOverBudget ? 'text-red-500' : 'text-green-500'}`}>
                                ${status.spent} / ${status.limit}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className={`h-2.5 rounded-full ${status.warningLevel === 'high' ? 'bg-red-500' :
                                        status.warningLevel === 'medium' ? 'bg-yellow-500' :
                                            'bg-green-500'
                                    }`}
                                style={{ width: `${Math.min(100, status.percentage)}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BudgetManager;
