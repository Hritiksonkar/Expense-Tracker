import React from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const ExpenseAnalytics = ({ expenses }) => {
    const prepareChartData = () => {
        // Group expenses by category
        const categoryData = expenses.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.value;
            return acc;
        }, {});

        // Group expenses by month
        const monthlyData = expenses.reduce((acc, exp) => {
            const month = new Date(exp.date).toLocaleString('default', { month: 'short' });
            acc[month] = (acc[month] || 0) + exp.value;
            return acc;
        }, {});

        return {
            categoryData,
            monthlyData
        };
    };

    const { categoryData, monthlyData } = prepareChartData();

    const doughnutColors = [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40'
    ];

    const doughnutData = {
        labels: Object.keys(categoryData),
        datasets: [{
            data: Object.values(categoryData),
            backgroundColor: doughnutColors.slice(0, Object.keys(categoryData).length)
        }]
    };

    const lineData = {
        labels: Object.keys(monthlyData),
        datasets: [{
            label: 'Monthly Expenses',
            data: Object.values(monthlyData),
            fill: false,
            borderColor: '#af8978',
            tension: 0.1
        }]
    };

    const barData = {
        labels: Object.keys(categoryData),
        datasets: [{
            label: 'Expenses by Category',
            data: Object.values(categoryData),
            backgroundColor: '#af8978',
            borderColor: '#97756b',
            borderWidth: 1
        }]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Expense Analysis'
            }
        }
    };

    const totalSum = expenses.reduce((acc, exp) => acc + exp.value, 0).toFixed(2);

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-black">Expense Distribution</h3>
                    <Doughnut data={doughnutData} options={options} />
                    {/* Category legend */}
                    <div className="mt-4 flex flex-wrap gap-3 bg-white p-2 rounded">
                        {Object.keys(categoryData).map((cat, idx) => (
                            <div key={cat} className="flex items-center gap-2">
                                <span
                                    className="inline-block w-4 h-4 rounded-full"
                                    style={{ backgroundColor: doughnutColors[idx % doughnutColors.length], border: '1px solid #ccc' }}
                                ></span>
                                <span className="text-sm font-medium text-black">{cat}</span>
                                <span className="text-sm font-semibold text-black">
                                    ₹{categoryData[cat].toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-black">Monthly Trend</h3>
                    <Line data={lineData} options={options} />
                </div>
                <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-black">Category Comparison</h3>
                    <Bar data={barData} options={options} />
                </div>
            </div>
            <div className="mt-6 flex justify-center">
                <div className="bg-white px-6 py-3 rounded shadow text-center">
                    <span className="block text-lg font-semibold text-black">Total Expenses</span>
                    <span className="block text-2xl font-bold text-black tracking-wide">
                        ₹{totalSum}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ExpenseAnalytics;
