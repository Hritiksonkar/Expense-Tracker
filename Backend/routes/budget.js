const express = require("express");
const router = express.Router();
const Budget = require("../models/Budget");

// Get all budgets for a user
router.get("/:userId", async (req, res) => {
    try {
        const budgets = await Budget.find({ userId: req.params.userId });
        res.status(200).json(budgets);
    } catch (error) {
        res.status(500).json({ message: "Error fetching budgets", error: error.message });
    }
});

// Create new budget
router.post("/", async (req, res) => {
    try {
        const { userId, category, limit, type } = req.body;
        const newBudget = new Budget({
            userId,
            category,
            limit,
            type: type || 'general'
        });
        const savedBudget = await newBudget.save();
        res.status(201).json(savedBudget);
    } catch (error) {
        res.status(500).json({ message: "Error creating budget", error: error.message });
    }
});

// Get category budgets for a specific user
router.get("/categories/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        const budgets = await Budget.find({
            userId: userId,
            type: 'category'
        });
        const budgetMap = budgets.reduce((acc, budget) => {
            acc[budget.category] = budget.limit;
            return acc;
        }, {});
        res.status(200).json(budgetMap);
    } catch (error) {
        res.status(500).json({ message: "Error fetching category budgets", error: error.message });
    }
});

// Set category budget with userId
router.post("/category", async (req, res) => {
    try {
        const { category, amount, userId } = req.body;

        // Validate inputs
        if (!category || !amount || !userId) {
            return res.status(400).json({
                message: "Missing required fields",
                error: "All fields are required: category, amount, userId"
            });
        }

        const budget = await Budget.findOneAndUpdate(
            {
                category,
                userId,
                type: 'category'
            },
            {
                $set: {
                    limit: Number(amount),
                    userId,
                    type: 'category'
                }
            },
            {
                upsert: true,
                new: true,
                runValidators: true
            }
        );

        res.status(201).json(budget);
    } catch (error) {
        console.error("Budget setting error:", error);
        res.status(500).json({
            message: "Error setting category budget",
            error: error.message
        });
    }
});

module.exports = router;
