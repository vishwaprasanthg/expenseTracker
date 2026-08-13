const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
mongoose.set('bufferCommands', false);
const cors = require("cors");
const path = require("path");
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files
app.use(cors()); // Enable CORS for cross-origin requests

// Schema for Expenses
const expenseSchema = new mongoose.Schema({
    category: String,
    amount: Number,
    info: String,
    date: String
});

const Expense = mongoose.model('Expense', expenseSchema);

// Route to add data
app.post("/add", (req, res) => {
    const { category_select, amount_input, info, date_input } = req.body;
    const expense = new Expense({
        category: category_select,
        amount: amount_input,
        info: info,
        date: date_input
    });
    expense.save()
        .then(savedExpense => res.status(200).json({
            _id: savedExpense._id,
            message: "Record inserted successfully"
        }))
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Error inserting data" });
        });
});

// Route to update a record
app.put("/update/:id", (req, res) => {
    const { id } = req.params;
    const { category_select, amount_input, info, date_input } = req.body;

    Expense.findByIdAndUpdate(id, {
        category: category_select,
        amount: amount_input,
        info: info,
        date: date_input
    }, { new: true })
        .then(updatedExpense => {
            if (!updatedExpense) return res.status(404).json({ message: "Record not found" });
            res.status(200).json({ message: "Record updated successfully", expense: updatedExpense });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Error updating data" });
        });
});

// Route to delete a record
app.delete("/delete/:id", (req, res) => {
    const { id } = req.params;

    Expense.findByIdAndDelete(id)
        .then(deletedExpense => {
            if (!deletedExpense) return res.status(404).json({ message: "Record not found" });
            res.status(200).json({ message: "Record deleted successfully" });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Error deleting data" });
        });
});

// Serve index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;
