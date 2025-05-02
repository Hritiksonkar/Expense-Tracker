import { toast } from 'react-toastify';

export const analyzeSpending = (currentExpenses, historicalExpenses, category) => {
    if (!historicalExpenses.length) return null;

    const currentCategoryTotal = currentExpenses
        .filter(exp => exp.category === category)
        .reduce((sum, exp) => sum + exp.value, 0);

    const historicalAverage = historicalExpenses
        .filter(exp => exp.category === category)
        .reduce((sum, exp) => sum + exp.value, 0) / historicalExpenses.length;

    const percentageChange = ((currentCategoryTotal - historicalAverage) / historicalAverage) * 100;

    if (Math.abs(percentageChange) >= 15) {
        return {
            type: percentageChange > 0 ? 'warning' : 'success',
            message: `You spent ${Math.abs(percentageChange.toFixed(1))}% ${percentageChange > 0 ? 'more' : 'less'
                } on ${category} than usual this month.${percentageChange > 0 ? ' Consider reducing expenses next month.' : ' Great job saving!'
                }`
        };
    }

    return null;
};

export const checkSavingsProgress = (currentSavings, targetAmount) => {
    const remaining = targetAmount - currentSavings;
    const progress = (currentSavings / targetAmount) * 100;

    if (progress >= 100) {
        toast.success("Congratulations! You've reached your savings goal! 🎉");
        return {
            type: 'success',
            message: "You've reached your savings goal!"
        };
    }

    if (remaining <= targetAmount * 0.1) {
        return {
            type: 'info',
            message: `Almost there! Only $${remaining.toFixed(2)} left to reach your goal!`
        };
    }

    return {
        type: 'info',
        message: `$${remaining.toFixed(2)} away from your savings target.`
    };
};
