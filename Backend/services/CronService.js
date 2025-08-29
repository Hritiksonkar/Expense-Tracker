const cron = require("node-cron");
const { expenseEmail } = require("./EmailService");

const startCronJobs = () => {
    // Check expenses every day at 6 PM
    cron.schedule("0 18 * * *", () => {
        console.log("Running daily expense check...");
        expenseEmail();
    });

    // Weekly expense summary (every Sunday at 9 AM)
    cron.schedule("0 9 * * 0", () => {
        console.log("Running weekly expense summary...");
        // Add weekly summary logic here
    });

    // Monthly expense report (1st day of month at 10 AM)
    cron.schedule("0 10 1 * *", () => {
        console.log("Running monthly expense report...");
        // Add monthly report logic here
    });

    console.log("Cron jobs started successfully");
};

module.exports = {
    startCronJobs
};
