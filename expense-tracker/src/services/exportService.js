export const exportToExcel = (expenses) => {
    if (!expenses || expenses.length === 0) {
        throw new Error('No expenses to export');
    }

    // Create CSV content
    const headers = ['Date', 'Category', 'Description', 'Amount', 'Running Total', 'Month', 'Year'];
    let csvContent = headers.join(',') + '\n';

    let runningTotal = 0;
    const rows = expenses.map(expense => {
        const date = new Date(expense.date);
        runningTotal += expense.value;

        return [
            expense.date,
            expense.category || 'Uncategorized',
            `"${expense.label.replace(/"/g, '""')}"`, // Escape quotes in description
            expense.value.toFixed(2),
            runningTotal.toFixed(2),
            date.toLocaleString('default', { month: 'long' }),
            date.getFullYear()
        ].join(',');
    });

    csvContent += rows.join('\n');

    // Add summary section
    const summaryData = calculateSummary(expenses);
    csvContent += '\n\nSummary\n';
    csvContent += `Total Expenses,${summaryData.total.toFixed(2)}\n\n`;

    // Add category breakdown
    csvContent += 'Category Breakdown\n';
    Object.entries(summaryData.categoryTotals).forEach(([category, total]) => {
        csvContent += `${category},${total.toFixed(2)}\n`;
    });

    // Add monthly trends
    csvContent += '\nMonthly Trends\n';
    Object.entries(summaryData.monthlyTotals).forEach(([month, total]) => {
        csvContent += `${month},${total.toFixed(2)}\n`;
    });

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];

    link.setAttribute('href', url);
    link.setAttribute('download', `expense_report_${timestamp}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const calculateSummary = (expenses) => {
    const total = expenses.reduce((sum, exp) => sum + exp.value, 0);

    // Calculate category totals
    const categoryTotals = expenses.reduce((acc, exp) => {
        const category = exp.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + exp.value;
        return acc;
    }, {});

    // Calculate monthly totals
    const monthlyTotals = expenses.reduce((acc, exp) => {
        const month = new Date(exp.date).toLocaleString('default', { month: 'long' });
        acc[month] = (acc[month] || 0) + exp.value;
        return acc;
    }, {});

    return {
        total,
        categoryTotals,
        monthlyTotals
    };
};
