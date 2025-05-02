const calculateBudgetStatus = (totalSpent, budget) => {
    const percentageUsed = (totalSpent / budget) * 100;

    return {
        percentageUsed,
        isWarning: percentageUsed >= 80 && percentageUsed < 100,
        isAlert: percentageUsed >= 100,
        remaining: budget - totalSpent
    };
};

const generateMonthlyReport = (expenses, budget) => {
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.value, 0);
    const categoryTotals = expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.value;
        return acc;
    }, {});

    return {
        totalSpent,
        budget,
        remaining: budget - totalSpent,
        categoryBreakdown: categoryTotals,
        date: new Date().toISOString()
    };
};

const checkCategoryBudget = (expenses, categoryLimits) => {
    const alerts = [];
    const categorySpending = expenses.reduce((acc, exp) => {
        const category = exp.category || 'other';
        acc[category] = (acc[category] || 0) + exp.value;
        return acc;
    }, {});

    Object.entries(categoryLimits).forEach(([category, limit]) => {
        const spent = categorySpending[category] || 0;
        const percentageUsed = (spent / limit) * 100;

        if (percentageUsed >= 100) {
            alerts.push({
                type: 'alert',
                title: 'Category Budget Alert',
                message: `${category} expenses (₹${spent}) have exceeded the budget limit of ₹${limit}`,
                category: category
            });
        } else if (percentageUsed >= 80) {
            alerts.push({
                type: 'warning',
                title: 'Category Budget Warning',
                message: `${category} expenses (₹${spent}) are at ${percentageUsed.toFixed(1)}% of budget limit`,
                category: category
            });
        }
    });

    return alerts;
};

module.exports = {
    calculateBudgetStatus,
    generateMonthlyReport,
    checkCategoryBudget
};
