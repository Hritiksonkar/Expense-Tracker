import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaChartBar, FaWallet, FaExclamationTriangle, FaEdit } from 'react-icons/fa';
import BudgetProgressBar from './BudgetProgressBar';
import { checkBudgetThresholds, generateMonthlyReport } from '../services/notificationService';
import { setBudget, getBudgets, checkBudgetStatus } from '../services/budgetService';

const Dashboard = ({ expenses, notifications, onBudgetChange }) => {
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [newBudget, setNewBudget] = useState(10000);
    const [lastNotificationState, setLastNotificationState] = useState({
        wasOverEighty: false,
        wasOverLimit: false
    });

    // Use ref to track previous values
    const prevTotalRef = useRef(0);
    const notificationTimeoutRef = useRef(null);

    const formatCurrency = (amount) => {
        try {
            // Convert amount to number and handle invalid inputs
            const numAmount = Number(amount);
            if (!amount || isNaN(numAmount)) return '₹0';

            // Format number to Indian currency format
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
                minimumFractionDigits: 0
            }).format(Math.abs(numAmount));
        } catch (error) {
            console.error('Error formatting currency:', error);
            return '₹0';
        }
    };

    const calculateStats = useCallback(() => {
        try {
            // Validate expenses array
            if (!Array.isArray(expenses)) {
                console.error('Invalid expenses data');
                return {
                    totalExpenses: 0,
                    remainingBudget: 0,
                    recentExpenses: [],
                    warningCount: 0,
                    percentageUsed: 0
                };
            }

            const totalExpenses = expenses.reduce((sum, exp) => {
                // Ensure value is a valid number
                const value = typeof exp.value === 'number' ? exp.value :
                    typeof exp.value === 'string' ? parseFloat(exp.value) : 0;

                if (isNaN(value)) {
                    console.warn('Invalid expense value:', exp);
                    return sum;
                }
                return sum + value;
            }, 0);

            // Ensure budget is a valid number
            const monthlyLimit = Math.max(0, Number(newBudget) || 0);
            const remainingBudget = monthlyLimit - totalExpenses;

            // Get only valid expenses for recent activity
            const validExpenses = expenses.filter(exp => {
                if (!exp || typeof exp !== 'object') return false;
                const value = Number(exp.value);
                return !isNaN(value) && value > 0;
            });
            const recentExpenses = validExpenses
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5);

            // Only check thresholds if total has changed and monthly limit is valid
            if (totalExpenses !== prevTotalRef.current && monthlyLimit > 0) {
                prevTotalRef.current = totalExpenses;

                const percentageUsed = Math.min((totalExpenses / monthlyLimit) * 100, 100);
                const isOverEighty = percentageUsed >= 80 && percentageUsed < 100;
                const isOverLimit = percentageUsed >= 100;

                // Clear any existing timeout
                if (notificationTimeoutRef.current) {
                    clearTimeout(notificationTimeoutRef.current);
                }

                // Delay notification check to prevent multiple triggers
                notificationTimeoutRef.current = setTimeout(() => {
                    if (isOverLimit && !lastNotificationState.wasOverLimit) {
                        const budgetStatus = checkBudgetThresholds(totalExpenses, monthlyLimit);
                        if (budgetStatus) {
                            window.dispatchEvent(new CustomEvent('budgetWarning', { detail: budgetStatus }));
                        }
                        setLastNotificationState(prev => ({ ...prev, wasOverLimit: true }));
                    } else if (isOverEighty && !lastNotificationState.wasOverEighty && !isOverLimit) {
                        const budgetStatus = checkBudgetThresholds(totalExpenses, monthlyLimit);
                        if (budgetStatus) {
                            window.dispatchEvent(new CustomEvent('budgetWarning', { detail: budgetStatus }));
                        }
                        setLastNotificationState(prev => ({ ...prev, wasOverEighty: true }));
                    }
                }, 300);
            }

            return {
                totalExpenses,
                remainingBudget,
                recentExpenses,
                warningCount: notifications.filter(n =>
                    n.type === 'warning' || n.type === 'alert'
                ).length,
                percentageUsed: monthlyLimit > 0 ? (totalExpenses / monthlyLimit) * 100 : 0
            };
        } catch (error) {
            console.error('Error calculating stats:', error);
            return {
                totalExpenses: 0,
                remainingBudget: 0,
                recentExpenses: [],
                warningCount: 0,
                percentageUsed: 0
            };
        }
    }, [expenses, newBudget, notifications]);

    // Cleanup effect
    useEffect(() => {
        return () => {
            if (notificationTimeoutRef.current) {
                clearTimeout(notificationTimeoutRef.current);
            }
        };
    }, []);

    const stats = calculateStats();

    const handleBudgetSubmit = () => {
        onBudgetChange(Number(newBudget));
        setIsEditingBudget(false);
        // Reset notification states when budget changes
        setLastNotificationState({
            wasOverEighty: false,
            wasOverLimit: false
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mt-4 w-full max-w-5xl mx-auto transition-all duration-300">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                <div className="flex items-center gap-2">
                    {isEditingBudget ? (
                        <>
                            <input
                                type="number"
                                value={newBudget}
                                onChange={(e) => setNewBudget(e.target.value)}
                                className="w-32 p-2 border rounded focus:ring-2 focus:ring-[#af8978] focus:border-transparent transition-all duration-300"
                                placeholder="Enter budget"
                            />
                            <button
                                onClick={handleBudgetSubmit}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:ring-2 focus:ring-green-400 transition-all duration-300"
                            >
                                Save
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditingBudget(true)}
                            className="flex items-center gap-2 text-blue-500 hover:text-blue-600 focus:ring-2 focus:ring-blue-300 px-3 py-2 rounded transition-all duration-300"
                        >
                            <FaEdit /> Edit Budget
                        </button>
                    )}
                </div>
            </div>

            <BudgetProgressBar
                totalSpent={stats.totalExpenses}
                budget={newBudget}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6 mt-6">
                <div className="bg-blue-50 p-4 rounded-lg hover:shadow-md transition-all duration-300">
                    <div className="flex items-center">
                        <FaWallet className="text-blue-500 text-xl mr-2" />
                        <h3 className="font-semibold text-gray-800">Total Expenses</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-600 mt-2">
                        {formatCurrency(stats.totalExpenses)}
                    </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg hover:shadow-md transition-all duration-300">
                    <div className="flex items-center">
                        <FaChartBar className="text-green-500 text-xl mr-2" />
                        <h3 className="font-semibold text-gray-800">Remaining Budget</h3>
                    </div>
                    <p className={`text-2xl font-bold mt-2 ${stats.remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(stats.remainingBudget)}
                    </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg hover:shadow-md transition-all duration-300">
                    <div className="flex items-center">
                        <FaExclamationTriangle className="text-yellow-500 text-xl mr-2" />
                        <h3 className="font-semibold text-gray-800">Active Warnings</h3>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600 mt-2">{stats.warningCount}</p>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-4">
                    {stats.recentExpenses.map((expense, index) => (
                        <div key={expense._id || index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                            <div>
                                <p className="font-medium text-gray-800">{expense.label}</p>
                                <p className="text-sm text-gray-500">{expense.date}</p>
                            </div>
                            <span className="font-bold text-gray-800 mt-2 sm:mt-0">
                                {formatCurrency(expense.value)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
