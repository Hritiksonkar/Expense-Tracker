import { publicRequest } from "../requestMethods";

export const checkBudgetThresholds = (totalSpent, budget) => {
    const percentageUsed = (totalSpent / budget) * 100;

    if (percentageUsed >= 100) {
        return {
            type: 'alert',
            title: 'Budget Alert',
            message: `You've exceeded your budget limit of $${budget}`,
            category: 'Budget'
        };
    } else if (percentageUsed >= 80) {
        return {
            type: 'warning',
            title: 'Budget Warning',
            message: `You've used ${Math.round(percentageUsed)}% of your budget`,
            category: 'Budget'
        };
    }
    return null;
};

export const generateMonthlyReport = (expenses, budget) => {
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.value, 0);
    const remaining = budget - totalSpent;

    // Group by category
    const categoryTotals = expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.value;
        return acc;
    }, {});

    return {
        type: 'info',
        title: 'Monthly Spending Report',
        message: `Total Spent: $${totalSpent}\nRemaining: $${remaining}\nBreakdown:\n${Object.entries(categoryTotals)
            .map(([category, amount]) => `${category}: $${amount}`)
            .join('\n')}`,
        category: 'Monthly Report'
    };
};
