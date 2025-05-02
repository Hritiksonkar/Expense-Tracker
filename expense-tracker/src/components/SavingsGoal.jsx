import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaPiggyBank, FaEdit } from 'react-icons/fa';
import { formatCurrency } from '../utils/currencyFormat';

const SavingsGoal = ({ currentSavings, targetAmount, onGoalUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newTarget, setNewTarget] = useState(targetAmount);
    const [progress, setProgress] = useState(0);
    const [monthlyTarget, setMonthlyTarget] = useState(0);

    useEffect(() => {
        const calculatedProgress = (currentSavings / targetAmount) * 100;
        setProgress(calculatedProgress);
        setMonthlyTarget(targetAmount / 12);
    }, [currentSavings, targetAmount]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newTarget <= 0) {
            toast.error("Savings goal must be greater than 0");
            return;
        }
        onGoalUpdate(newTarget);
        setIsEditing(false);
        toast.success("Savings goal updated!");
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-4">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <FaPiggyBank className="text-[#af8978] text-2xl" />
                    <h3 className="text-lg font-semibold text-gray-700">Annual Savings Goal</h3>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 text-[#af8978] hover:text-[#97756b] transition-colors duration-300"
                    >
                        <FaEdit /> Edit Goal
                    </button>
                )}
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit} className="animate-fadeIn">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm text-gray-600">Annual Target Amount</label>
                        <input
                            type="number"
                            value={newTarget}
                            onChange={(e) => setNewTarget(Number(e.target.value))}
                            className="p-2 border rounded focus:ring-2 focus:ring-[#af8978] focus:border-transparent transition-all duration-300"
                            placeholder="Enter annual savings goal"
                        />
                        <div className="flex gap-2 mt-2">
                            <button
                                type="submit"
                                className="bg-[#af8978] text-white px-4 py-2 rounded hover:bg-[#97756b] transform hover:scale-105 transition-all duration-300"
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded">
                            <p className="text-sm text-gray-500">Annual Target</p>
                            <p className="text-xl font-bold text-[#af8978]">
                                {formatCurrency(targetAmount)}
                            </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                            <p className="text-sm text-gray-500">Monthly Target</p>
                            <p className="text-xl font-bold text-[#af8978]">
                                {formatCurrency(monthlyTarget)}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">Progress</span>
                            <span className="text-sm font-medium text-gray-600">
                                {progress.toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${progress >= 100 ? 'bg-green-500' :
                                        progress >= 75 ? 'bg-blue-500' :
                                            'bg-[#af8978]'
                                    }`}
                                style={{ width: `${Math.min(100, progress)}%` }}
                            />
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            {formatCurrency(targetAmount - currentSavings)} left to reach your goal
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SavingsGoal;
