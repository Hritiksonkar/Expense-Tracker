import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getCategoryBudgets, setCategoryBudget } from '../services/budgetService';

const CategoryBudget = ({ expenses }) => {
    const [budgets, setBudgets] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newBudget, setNewBudget] = useState({ category: 'food', amount: 0 });
    const user = JSON.parse(localStorage.getItem('user'));

    const categories = ['food', 'transport', 'utilities', 'entertainment', 'other'];

    const loadCategoryBudgets = async () => {
        try {
            setLoading(true);
            setError(null);
            if (!user?.id) {
                throw new Error("User not found");
            }
            const data = await getCategoryBudgets(user.id);
            setBudgets(data);
        } catch (error) {
            setError(error.message);
            toast.error('Failed to load category budgets');
        } finally {
            setLoading(false);
        }
    };

    // Add retry logic
    useEffect(() => {
        let retryCount = 0;
        const maxRetries = 3;

        const tryLoadBudgets = async () => {
            try {
                await loadCategoryBudgets();
            } catch (error) {
                if (retryCount < maxRetries) {
                    retryCount++;
                    setTimeout(tryLoadBudgets, 2000 * retryCount); // Exponential backoff
                }
            }
        };

        if (user?.id) {
            tryLoadBudgets();
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!newBudget.amount || newBudget.amount <= 0) {
                toast.error('Please enter a valid amount');
                return;
            }

            if (!user?.id) {
                toast.error('Please login to set budget');
                return;
            }

            const response = await setCategoryBudget(newBudget.category, newBudget.amount, user.id);
            if (response) {
                setBudgets(prev => ({ ...prev, [newBudget.category]: newBudget.amount }));
                toast.success(`Budget set for ${newBudget.category}`);

                // Reset form
                setNewBudget({ ...newBudget, amount: 0 });
            }
        } catch (error) {
            console.error('Failed to set budget:', error);
            toast.error(error.message || 'Failed to set budget');
        }
    };

    const getCategorySpending = (category) => {
        return expenses
            .filter(exp => exp.category === category)
            .reduce((sum, exp) => sum + exp.value, 0);
    };

    // Show loading state
    if (loading) {
        return <div className="text-center p-4">Loading budgets...</div>;
    }

    // Show error state
    if (error) {
        return (
            <div className="text-center p-4 text-red-500">
                Error: {error}
                <button
                    onClick={loadCategoryBudgets}
                    className="ml-4 text-blue-500 underline"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-bold mb-4">Category Budgets</h2>

            <form onSubmit={handleSubmit} className="mb-6">
                <div className="flex gap-4">
                    <select
                        value={newBudget.category}
                        onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                        className="p-2 border rounded"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        value={newBudget.amount}
                        onChange={(e) => setNewBudget({ ...newBudget, amount: Number(e.target.value) })}
                        placeholder="Budget amount"
                        className="p-2 border rounded"
                    />
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                        Set Budget
                    </button>
                </div>
            </form>

            <div className="space-y-4">
                {categories.map(category => {
                    const budget = budgets[category] || 0;
                    const spent = getCategorySpending(category);
                    const percentage = budget ? (spent / budget) * 100 : 0;

                    return (
                        <div key={category} className="border p-4 rounded">
                            <div className="flex justify-between mb-2">
                                <h3 className="font-semibold capitalize">{category}</h3>
                                <span className={spent > budget ? 'text-red-500' : 'text-green-500'}>
                                    ${spent} / ${budget}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className={`h-2.5 rounded-full ${percentage > 100 ? 'bg-red-500' :
                                            percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                                        }`}
                                    style={{ width: `${Math.min(100, percentage)}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryBudget;
