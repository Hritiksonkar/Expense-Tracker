const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
dotenv.config();

function createTransporter(config) {
    const transporter = nodemailer.createTransport(config);
    return transporter;
}

const configurations = {
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    requireTLS: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
};

const sendMail = async (messageoption) => {
    try {
        const transporter = await createTransporter(configurations);
        await transporter.verify();
        await transporter.sendMail(messageoption);
        return true;
    } catch (error) {
        console.error("Email sending error:", error);
        return false;
    }
};

const newExpenseNotification = async (expense) => {
    try {
        const messageoption = {
            from: process.env.EMAIL,
            to: expense.userEmail,
            subject: expense.subject || "New Expense Added",
            text: expense.text || `You have added a new expense:
                Label: ${expense.label}
                Amount: $${expense.value}
                Date: ${expense.date}
                
                ${expense.isExceeded ? `Warning: This expense exceeds your monthly limit by $${expense.exceedAmount}` : ''}
                Your expense has been recorded successfully.`
        };

        return await sendMail(messageoption);
    } catch (error) {
        console.error("Notification error:", error);
        return false;
    }
};

module.exports = {
    newExpenseNotification
};
