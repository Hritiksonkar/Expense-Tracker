const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
        trim: true
    },
    value: {
        type: Number,
        required: true,
        min: 0
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    category: {
        type: String,
        required: true,
        default: 'other'
    },
    userId: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('Expense', expenseSchema);