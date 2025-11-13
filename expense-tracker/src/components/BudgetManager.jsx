import React, { useState, useEffect } from 'react';
import { setBudget, getBudgets, checkBudgetStatus } from '../services/budgetService';
import { formatCurrency } from '../utils/currencyFormat';

const BudgetManager = ({ expenses = [], onBudgetUpdate }) => {
    const [budgets, setBudgets] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [newLimit, setNewLimit] = useState('');
    const [budgetStatus, setBudgetStatus] = useState({});

    useEffect(() => { loadBudgets(); }, []);

    useEffect(() => {
        if (Array.isArray(budgets) && budgets.length > 0 && Array.isArray(expenses) && expenses.length > 0) {
            const status = checkBudgetStatus(expenses, budgets);
            setBudgetStatus(status);
        }
    }, [expenses, budgets]);

    const loadBudgets = async () => {
        try { const data = await getBudgets(); setBudgets(Array.isArray(data) ? data : []); } catch (error) { console.error('Failed to load budgets:', error); }
    };

    const handleAddBudget = async (e) => {
        e.preventDefault();
        try {
            const newB = await setBudget(newCategory, Number(newLimit));
            setBudgets(prev => [...prev, newB]);
            setNewCategory(''); setNewLimit('');
            if (typeof onBudgetUpdate === 'function') onBudgetUpdate(budgets);
        } catch (error) {
            console.error('Failed to add budget:', error);
        }
    };

    return (
        <div className="card">
            <h2 className="text-2xl font-bold mb-4">Budget Manager</h2>
            <form onSubmit={handleAddBudget} className="mb-6">
                <div className="flex gap-4 flex-col sm:flex-row">
                    <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Category" className="p-2 border rounded flex-1" aria-label="New category" />
                    <input type="number" value={newLimit} onChange={(e) => setNewLimit(e.target.value)} placeholder="Limit" className="p-2 border rounded w-32" aria-label="New limit" />
                    <button type="submit" className="bg-[var(--accent)] text-black px-4 py-2 rounded">Add Budget</button>
                </div>
            </form>

            <div className="space-y-4">
                {Object.keys(budgetStatus).length === 0 ? <div className="text-sm text-gray-400">No budget status available</div> : Object.entries(budgetStatus).map(([category, status]) => (
                    <div key={category} className="border p-4 rounded bg-[var(--card-bg)]">
                        <div className="flex justify-between mb-2">
                            <h3 className="font-semibold">{category}</h3>
                            <span className={`font-medium ${status.isOverBudget ? 'text-red-500' : 'text-green-500'}`}>{formatCurrency(status.spent)} / {formatCurrency(status.limit)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div className={`h-2.5 rounded-full ${status.warningLevel === 'high' ? 'bg-red-500' : status.warningLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, status.percentage)}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BudgetManager;
