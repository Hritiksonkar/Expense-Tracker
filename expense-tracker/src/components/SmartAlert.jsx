import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { sendSpendingAlert } from '../services/emailService';
import {
    checkBudgetThresholds,
    checkInactivity,
    getRandomSavingTip,
    analyzeCategorySpending
} from '../services/notificationService';

const SmartAlert = ({ expenses, budgets, user }) => {
    const [lastCheckDate, setLastCheckDate] = useState(new Date());

    useEffect(() => {
        const checkAlerts = async () => {
            try {
                // Budget threshold check
                if (expenses.length && budgets.total) {
                    const totalSpent = expenses.reduce((sum, exp) => sum + exp.value, 0);
                    const budgetStatus = checkBudgetThresholds(totalSpent, budgets.total);

                    if (budgetStatus && user?.email) {
                        if (budgetStatus.type === 'alert') {
                            const emailSent = await sendSpendingAlert(user.email, totalSpent, budgets.total);
                            if (!emailSent) {
                                console.warn('Failed to send budget alert email');
                            }
                        }
                        toast[budgetStatus.type === 'alert' ? 'error' : 'warning'](budgetStatus.message);
                    }
                }

                // Check for inactivity
                const lastExpense = expenses[0]?.date;
                if (lastExpense) {
                    const inactivityAlert = checkInactivity(lastExpense);
                    if (inactivityAlert) {
                        toast.info(inactivityAlert.message);
                    }
                }

                // Show random saving tip (once per day)
                const today = new Date();
                if (today.getDate() !== lastCheckDate.getDate()) {
                    const tip = getRandomSavingTip();
                    toast.info(tip.message);
                    setLastCheckDate(today);
                }

                // Check category spending
                const categoryAlerts = analyzeCategorySpending(expenses, budgets);
                categoryAlerts.forEach(alert => {
                    toast.warning(alert.message);
                });
            } catch (error) {
                console.error('Error checking alerts:', error);
            }
        };

        const alertInterval = setInterval(checkAlerts, 24 * 60 * 60 * 1000);
        checkAlerts(); // Initial check

        return () => clearInterval(alertInterval);
    }, [expenses, budgets, user]);

    return null; // This is a non-visual component
};

export default SmartAlert;
