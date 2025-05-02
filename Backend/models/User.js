const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    notificationPreferences: {
        emailAlerts: { type: Boolean, default: true },
        pushNotifications: { type: Boolean, default: true },
        alertThreshold: { type: Number, default: 80 }, // percentage of budget
        reminderInterval: { type: Number, default: 3 }, // days
        lastNotificationDate: { type: Date },
        lastExpenseDate: { type: Date }
    }
});

module.exports = mongoose.model("User", UserSchema);
