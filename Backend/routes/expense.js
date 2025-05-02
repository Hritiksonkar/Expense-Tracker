const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// CREATE EXPENSE
router.post('/', async (req, res) => {
  try {
    const { label, date, value, userId, category, email } = req.body;

    // Validate required fields
    if (!label || !date || !value || !userId) {
      return res.status(400).json({
        message: 'Missing required fields',
        required: 'label, date, value and userId are required',
        received: { label, date, value, userId }
      });
    }

    const expense = new Expense({
      label,
      date,
      value: Number(value),
      userId,
      category: category || 'other',
      email
    });

    const savedExpense = await expense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    console.error('Expense creation error:', error);
    res.status(500).json({ message: 'Error creating expense', error: error.message });
  }
});

// GET ALL EXPENSES

router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const expenses = await Expense.find({ userId: userId }).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json(error);
  }
});

// UPDATE EXPENSES

router.put("/:id", async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json(error);
  }
});

// DELETE EXPENSE

router.delete("/:id", async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json("Expense not found");
    }
    await Expense.findByIdAndDelete(req.params.id);
    res.status(200).json("Expense has been successfully deleted");
  } catch (error) {
    res.status(500).json(error);
  }
});

// DELETE MULTIPLE EXPENSES
router.delete("/bulk/delete", async (req, res) => {
  try {
    const { expenseIds } = req.body;
    if (!expenseIds || !Array.isArray(expenseIds)) {
      return res.status(400).json("Please provide an array of expense IDs");
    }
    const result = await Expense.deleteMany({ _id: { $in: expenseIds } });
    res.status(200).json(`${result.deletedCount} expenses have been successfully deleted`);
  } catch (error) {
    res.status(500).json(error);
  }
});

// DELETE ALL EXPENSES FOR A USER
router.delete("/user/:userId/all", async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await Expense.deleteMany({ userId: userId });
    res.status(200).json(`${result.deletedCount} expenses have been deleted from your profile`);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
