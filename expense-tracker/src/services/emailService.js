import emailjs from '@emailjs/browser';
import { toast } from 'react-toastify';

export const sendSpendingAlert = async (userEmail, spentAmount, budgetLimit) => {
    try {
        if (!userEmail || !spentAmount || !budgetLimit) {
            console.error('Missing required parameters for email alert');
            return false;
        }

        // Validate environment variables with better error handling
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        if (!serviceId || !templateId || !publicKey) {
            console.error('Missing required EmailJS configuration:', {
                hasServiceId: !!serviceId,
                hasTemplateId: !!templateId,
                hasPublicKey: !!publicKey
            });

            // In production, don't show config errors to user
            if (import.meta.env.PROD) {
                console.error('Email service configuration error');
                return false;
            } else {
                toast.error('Email service not configured properly');
                return false;
            }
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

        // More specific error handling for production
        if (import.meta.env.PROD) {
            console.error('Email notification failed');
        } else {
            toast.error('Failed to send email notification: ' + error.message);
        }
        return false;
    }
};
