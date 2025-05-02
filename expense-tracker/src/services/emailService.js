import emailjs from '@emailjs/browser';
import { toast } from 'react-toastify';

export const sendSpendingAlert = async (userEmail, spentAmount, budgetLimit) => {
    try {
        if (!userEmail || !spentAmount || !budgetLimit) {
            console.error('Missing required parameters for email alert');
            return false;
        }

        // Validate environment variables
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        if (!serviceId || !templateId || !publicKey) {
            console.error('Missing required EmailJS configuration');
            return false;
        }

        const templateParams = {
            to_email: userEmail,
            spent_amount: spentAmount.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR'
            }),
            budget_limit: budgetLimit.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR'
            }),
            current_date: new Date().toLocaleDateString(),
            status: spentAmount > budgetLimit ? 'exceeded' : 'warning'
        };

        const response = await emailjs.send(
            serviceId,
            templateId,
            templateParams,
            publicKey
        );

        if (response.status === 200) {
            return true;
        }
        throw new Error('Failed to send email');

    } catch (error) {
        console.error('Email alert error:', error);
        toast.error('Failed to send email notification');
        return false;
    }
};
