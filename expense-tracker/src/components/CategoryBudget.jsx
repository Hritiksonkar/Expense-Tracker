import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getCategoryBudgets, setCategoryBudget } from '../services/budgetService';
import { formatCurrency } from '../utils/currencyFormat';

const CategoryBudget = ({ expenses = [] }) => {
    const [budgets, setBudgets] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newBudget, setNewBudget] = useState({ category: 'food', amount: '' });
    const user = JSON.parse(localStorage.getItem('user')) || {};

    const categories = ['food', 'transport', 'utilities', 'entertainment', 'other'];

    const loadCategoryBudgets = async () => {
        try {
            setLoading(true);
            setError(null);
            if (!user?.id) throw new Error("User not found");
            const data = await getCategoryBudgets(user.id);
            setBudgets(data || {});
        } catch (err) {
            setError(err.message || 'Failed to load budgets');
            toast.error('Failed to load category budgets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let retryCount = 0;
        const maxRetries = 3;
        const tryLoadBudgets = async () => {
            try {
                await loadCategoryBudgets();
            } catch (err) {
                if (retryCount < maxRetries) {
                    retryCount++;
                    setTimeout(tryLoadBudgets, 2000 * retryCount);
                }
            }
        };
        if (user?.id) tryLoadBudgets();
        else { setLoading(false); setBudgets({}); }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const amount = Number(newBudget.amount);
            if (!amount || amount <= 0) { toast.error('Please enter a valid amount'); return; }
            if (!user?.id) { toast.error('Please login to set budget'); return; }
            const response = await setCategoryBudget(newBudget.category, amount, user.id);
            if (response) {
                setBudgets(prev => ({ ...prev, [newBudget.category]: amount }));
                toast.success(`Budget set for ${newBudget.category}`);
                setNewBudget({ ...newBudget, amount: '' });
            }
        } catch (err) {
            console.error('Failed to set budget:', err);
            toast.error(err.message || 'Failed to set budget');
        }
    };

    const getCategorySpending = (category) => {
        if (!Array.isArray(expenses)) return 0;
        return expenses.filter(exp => exp && exp.category === category).reduce((s, e) => s + (Number(e.value) || 0), 0);
    };

    if (loading) return <div className="text-center p-4">Loading budgets...</div>;
    if (error) return <div className="text-center p-4 text-red-500">Error: {error} <button onClick={loadCategoryBudgets} className="ml-4 text-blue-500 underline">Retry</button></div>;

    return (
        <div className="card">
            <h2 className="text-xl font-bold mb-4">Category Budgets</h2>

            <form onSubmit={handleSubmit} className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <select value={newBudget.category} onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })} className="p-2 border rounded" aria-label="Select category">
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <input type="number" value={newBudget.amount} onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })} placeholder="Budget amount" className="p-2 border rounded" aria-label="Budget amount" />
                    <button type="submit" className="px-4 py-2 rounded bg-[var(--accent)] text-black font-semibold">Set Budget</button>
                </div>
            </form>

            <div className="space-y-4">
                {categories.map(category => {
                    const budget = Number(budgets[category] || 0);
                    const spent = getCategorySpending(category);
                    const percentage = budget ? (spent / budget) * 100 : 0;
                    return (
                        <div key={category} className="border p-4 rounded bg-[var(--card-bg)]">
                            <div className="flex justify-between mb-2">
                                <h3 className="font-semibold capitalize">{category}</h3>
                                <span className={spent > budget ? 'text-red-500' : 'text-green-500'}>{formatCurrency(spent)} / {formatCurrency(budget)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                <div className={`h-2.5 rounded-full ${percentage > 100 ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }} role="progressbar" aria-valuenow={Math.round(Math.min(100, Math.max(0, percentage)))} aria-valuemin="0" aria-valuemax="100" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryBudget;
