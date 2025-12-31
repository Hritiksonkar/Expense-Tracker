const router = require("express").Router();
const User = require("../models/User");
const Expense = require("../models/Expense");
const bcrypt = require("bcrypt");

// REGISTER
router.post("/register", async (req, res) => {
    try {
        let { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Normalize email
        email = String(email).trim().toLowerCase();

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            email,
            password: hashedPassword
        });

        const savedUser = await newUser.save();

        // Create initial expense record
        const initialExpense = new Expense({
            label: "Welcome Bonus",
            value: 1000,
            date: new Date().toISOString().split('T')[0],
            userId: savedUser._id
        });

        await initialExpense.save();

        res.status(201).json({
            message: "User registered successfully",
            user: { id: savedUser._id, email: savedUser.email }
        });
    } catch (err) {
        res.status(500).json({ message: "Registration failed", error: err.message });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        let { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Normalize email
        email = String(email).trim().toLowerCase();

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check password (try bcrypt first; fallback to plain text for legacy accounts)
        let validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            // Fallback: maybe the stored password is plaintext from an older import
            if (user.password === password) {
                // Upgrade stored password to hashed version for security
                try {
                    const hashed = await bcrypt.hash(password, 10);
                    user.password = hashed;
                    await user.save();
                    validPassword = true;
                } catch (upgradeErr) {
                    // If upgrade fails, still allow login if plaintext matched
                    validPassword = true;
                }
            }
        }

        if (!validPassword) {
            return res.status(401).json({ message: "Invalid password" });
        }

        res.status(200).json({
            id: user._id,
            email: user.email,
            token: "dummy-token" // In real app, use JWT token here
        });
    } catch (err) {
        res.status(500).json({ message: "Login failed", error: err.message });
    }
});

// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and new password are required" });
        }

        email = String(email).trim().toLowerCase();

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (err) {
        res.status(500).json({ message: "Password reset failed", error: err.message });
    }
});

module.exports = router;
