const dotenv = require("dotenv");
const sendMail = require("../helpers/SendMail");
const Expense = require("../models/Expense");
dotenv.config();

const expenseEmail = async () => {
  const expenses = await Expense.find({});
  const totalExpense = expenses.reduce(
    (acc, expense) => acc + expense.value,
    0
  );
  if (totalExpense > 10000) {
    let messageoption = {
      from: process.env.EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: "Warning",
      text: `Your total expense is $10000. Please review your expenses.`
    };

    await sendMail(messageoption);
  }
};

const newExpenseNotification = async (expense) => {
  try {
    let messageoption = {
      from: process.env.EMAIL,
      to: expense.userEmail,
      subject: "New Expense Added",
      text: `You have added a new expense:
                Label: ${expense.label}
                Amount: $${expense.value}
                Date: ${expense.date}
                
                Your expense has been recorded successfully.`
    };

    await sendMail(messageoption);
    return true;
  } catch (error) {
    console.error("Email notification error:", error);
    return false;
  }
};

module.exports = {
  expenseEmail,
  newExpenseNotification
};
