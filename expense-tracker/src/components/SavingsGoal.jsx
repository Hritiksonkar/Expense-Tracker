import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaPiggyBank, FaEdit } from 'react-icons/fa';
import { formatCurrency } from '../utils/currencyFormat';

const SavingsGoal = ({ currentSavings = 0, targetAmount = 0, onGoalUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newTarget, setNewTarget] = useState(targetAmount || 0);
    const [progress, setProgress] = useState(0);
    const [monthlyTarget, setMonthlyTarget] = useState(0);

    useEffect(() => {
        const tgt = Number(targetAmount) || 0;
        const cur = Number(currentSavings) || 0;
        const calculatedProgress = tgt > 0 ? (cur / tgt) * 100 : 0;
        setProgress(Math.max(0, Math.min(1000, calculatedProgress))); // cap to reasonable max
        setMonthlyTarget(tgt > 0 ? tgt / 12 : 0);
    }, [currentSavings, targetAmount]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const num = Number(newTarget);
        if (!num || num <= 0) {
            toast.error("Savings goal must be greater than 0");
            return;
        }
        if (typeof onGoalUpdate === 'function') onGoalUpdate(num);
        setIsEditing(false);
        toast.success("Savings goal updated!");
    };

    return (
        <div className="card">
            <style>{`
				.savings-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
				@media(max-width:640px){ .savings-grid { grid-template-columns:1fr; } }
				.small-muted { color: var(--muted); font-size:0.95rem; }
			`}</style>

            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <FaPiggyBank className="text-[var(--accent)] text-2xl" />
                    <h3 className="text-lg font-semibold">Annual Savings Goal</h3>
                </div>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="inline-flex items-center gap-2 text-[var(--accent)] hover:opacity-90">
                        <FaEdit /> Edit Goal
                    </button>
                )}
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit} className="animate-fadeIn">
                    <div className="flex flex-col gap-3">
                        <label className="text-sm small-muted">Annual Target Amount</label>
                        <input
                            type="number"
                            value={newTarget}
                            onChange={(e) => setNewTarget(e.target.value)}
                            className="p-2 border rounded"
                            placeholder="Enter annual savings goal"
                            min="0"
                        />
                        <div className="flex gap-2">
                            <button type="submit" className="px-4 py-2 rounded bg-[var(--accent)] text-black font-semibold">Save</button>
                            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 rounded bg-gray-500 text-white">Cancel</button>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="space-y-4">
                    <div className="savings-grid">
                        <div className="p-3 rounded bg-[var(--card-bg)]">
                            <p className="small-muted">Annual Target</p>
                            <p className="text-xl font-bold text-[var(--accent)]">{formatCurrency(targetAmount)}</p>
                        </div>
                        <div className="p-3 rounded bg-[var(--card-bg)]">
                            <p className="small-muted">Monthly Target</p>
                            <p className="text-xl font-bold text-[var(--accent)]">{formatCurrency(monthlyTarget)}</p>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium small-muted">Progress</span>
                            <span className="text-sm font-medium small-muted">{Math.max(0, progress).toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${progress >= 100 ? 'bg-green-500' : progress >= 75 ? 'bg-blue-500' : 'bg-[var(--accent)]'}`}
                                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                                role="progressbar"
                                aria-valuenow={Math.round(Math.min(100, Math.max(0, progress)))}
                                aria-valuemin="0"
                                aria-valuemax="100"
                            />
                        </div>
                        <p className="text-sm small-muted mt-2">{formatCurrency(Math.max(0, (targetAmount || 0) - (currentSavings || 0)))} left to reach your goal</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SavingsGoal;
