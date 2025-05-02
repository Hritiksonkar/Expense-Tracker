import React from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../utils/currencyFormat';

const BudgetProgressBar = ({ totalSpent = 0, budget = 0 }) => {
    // Convert to numbers and handle edge cases
    const numericBudget = Number(budget) || 0;
    const numericSpent = Number(totalSpent) || 0;
    const percentage = Math.min((numericSpent / numericBudget) * 100, 100) || 0;
    const dynamicWidth = `${Math.min(percentage, 100)}%`;

    const getProgressColor = () => {
        if (percentage > 100) return 'bg-red-600';
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 75) return 'bg-orange-500';
        return 'bg-green-500';
    };

    const getTextColor = () => {
        if (percentage > 100) return 'text-red-600';
        if (percentage >= 90) return 'text-red-500';
        if (percentage >= 75) return 'text-orange-500';
        return 'text-gray-600';
    };

    return (
        <div className="w-full p-4 bg-white rounded-lg shadow-sm">
            <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Monthly Budget Usage</span>
                <span className={`text-sm font-bold ${getTextColor()}`}>
                    {percentage.toFixed(1)}% {percentage > 100 ? '(Over Budget!)' : ''}
                </span>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ease-in-out ${getProgressColor()}`}
                    style={{ width: dynamicWidth }}
                >
                    {percentage > 15 && (
                        <span className="absolute text-xs text-white ml-2 mt-0.5">
                            {formatCurrency(numericSpent)} / {formatCurrency(numericBudget)}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex justify-between mt-2">
                <span className={`text-sm ${getTextColor()}`}>
                    {formatCurrency(numericSpent)} spent
                </span>
                <span className="text-sm text-gray-600">
                    {formatCurrency(numericBudget)} budget
                </span>
            </div>
            {percentage > 100 && (
                <div className="mt-2 text-sm text-red-600 font-medium">
                    Over budget by {formatCurrency(numericSpent - numericBudget)}!
                </div>
            )}
        </div>
    );
};

export default BudgetProgressBar;
