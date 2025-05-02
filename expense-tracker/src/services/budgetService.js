import { publicRequest } from "../requestMethods";
import { toast } from 'react-toastify';

export const setBudget = async (category, limit, userId) => {
    try {
        const response = await publicRequest.post("/budgets", {
            category,
            limit,
            userId,
            type: 'category'
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to set budget");
    }
};

export const getBudgets = async () => {
    try {
        const response = await publicRequest.get("/budgets");
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get budgets");
    }
};

export const updateBudget = async (budgetId, updates) => {
    try {
        const response = await publicRequest.put(`/budgets/${budgetId}`, updates);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to update budget");
    }
};

export const checkBudgetStatus = (expenses, budgets) => {
    const status = {};

    budgets.forEach(budget => {
        const categoryExpenses = expenses.filter(exp => exp.category === budget.category);
        const totalSpent = categoryExpenses.reduce((sum, exp) => sum + exp.value, 0);
        const percentageUsed = (totalSpent / budget.limit) * 100;

        status[budget.category] = {
            spent: totalSpent,
            limit: budget.limit,
            percentage: percentageUsed,
            remaining: budget.limit - totalSpent,
            isOverBudget: totalSpent > budget.limit,
            warningLevel: percentageUsed >= 90 ? 'high' :
                percentageUsed >= 75 ? 'medium' : 'low'
        };
    });

    return status;
};

export const getCategoryBudgets = async (userId) => {
    try {
        if (!userId) {
            throw new Error("User ID is required");
        }

        const response = await publicRequest.get(`/budgets/categories/${userId}`);
        return response.data;
    } catch (error) {
        if (error.code === 'ERR_NETWORK') {
            toast.error('Unable to connect to server. Please check your connection.');
            console.error('Server connection failed:', error);
        } else {
            toast.error(error.response?.data?.message || "Failed to get category budgets");
            console.error('Category budgets error:', error);
        }
        throw new Error("Failed to get category budgets");
    }
};

export const setCategoryBudget = async (category, amount, userId) => {
    try {
        if (!category || !amount || !userId) {
            throw new Error("Missing required fields");
        }

        const response = await publicRequest.post("/budgets/category", {
            category,
            amount: Number(amount),
            userId,
            type: 'category'
        });

        if (!response.data) {
            throw new Error("No data received from server");
        }

        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to set category budget");
    }
};

export const getExpenseAnalytics = (expenses) => {
    // Total spending by category
    const categorySpending = expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.value;
        return acc;
    }, {});

    // Daily spending for last 30 days
    const dailySpending = expenses.reduce((acc, exp) => {
        const date = exp.date.split('T')[0];
        acc[date] = (acc[date] || 0) + exp.value;
        return acc;
    }, {});

    // Monthly spending
    const monthlySpending = expenses.reduce((acc, exp) => {
        const month = new Date(exp.date).toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + exp.value;
        return acc;
    }, {});

    return {
        categorySpending,
        dailySpending,
        monthlySpending
    };
};
