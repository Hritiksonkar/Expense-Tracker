import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { formatCurrency } from '../utils/currencyFormat';

const ExpenseLimit = ({ currentLimit, onLimitChange }) => {
    const [limit, setLimit] = useState(currentLimit || 0);
    const [isEditing, setIsEditing] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (limit <= 0) {
            toast.error("Limit must be greater than 0");
            return;
        }
        onLimitChange(limit);
        setIsEditing(false);
        toast.success("Expense limit updated successfully!");
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-700">Expense Limit</h3>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-blue-500 hover:text-blue-600"
                    >
                        Edit Limit
                    </button>
                )}
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
                    <input
                        type="number"
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        className="p-2 border rounded flex-1"
                        placeholder="Enter expense limit"
                    />
                    <button
                        type="submit"
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
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
                </form>
            ) : (
                <div className="mt-2">
                    <p className="text-xl font-bold text-gray-800">{formatCurrency(currentLimit)}</p>
                    <p className="text-sm text-gray-500">Maximum amount per expense</p>
                </div>
            )}
        </div>
    );
};

export default ExpenseLimit;
