let expenses = [];
let totalAmount = 0;
let totalIncome = 0;
let totalExpenses = 0;
let editIndex = null;

const categorySelect = document.getElementById('category_select');
const amountInput = document.getElementById('amount_input');
const infoInput = document.getElementById('info');
const dateInput = document.getElementById('date_input');
const addBtn = document.getElementById('add_btn');
const updateBtn = document.getElementById('update_btn') || document.createElement('button');
const expenseTableBody = document.getElementById('expense-table-body');
const totalAmountCell = document.getElementById('total-amount');
const totalIncomeCell = document.getElementById('total-income');
const totalExpensesCell = document.getElementById('total-expenses');

// Ensure the update button is hidden by default (if it exists in your HTML)
if (updateBtn) updateBtn.style.display = "none";

// Function to update the summary section
function updateSummary() {
    totalAmountCell.textContent = `₹${totalAmount.toFixed(2)}`;
    totalIncomeCell.textContent = `₹${totalIncome.toFixed(2)}`;
    totalExpensesCell.textContent = `₹${totalExpenses.toFixed(2)}`;
}

// Function to add a new transaction to the table
function addTransaction(expense) {
    const newRow = expenseTableBody.insertRow();

    const categoryCell = newRow.insertCell();
    const amountCell = newRow.insertCell();
    const infoCell = newRow.insertCell();
    const dateCell = newRow.insertCell();
    const actionCell = newRow.insertCell();

    categoryCell.textContent = expense.category;
    amountCell.textContent = `₹${expense.amount.toFixed(2)}`;
    infoCell.textContent = expense.info;
    dateCell.textContent = expense.date;

    // Create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.classList.add('delete-btn');

    // Create edit button
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.classList.add('edit-btn');

    // Delete Transaction Logic
    deleteBtn.addEventListener('click', function () {
        console.log(`Deleting expense with ID: ${expense._id}`);  // Log the ID to check if it's correct

        fetch(`/delete/${expense._id}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete record');
            }
            return response.json();
        })
        .then(data => {
            console.log('Record deleted successfully', data);

            expenses.splice(expenses.indexOf(expense), 1);
            if (expense.category === 'Income') {
                totalAmount -= expense.amount;
                totalIncome -= expense.amount;
            } else if (expense.category === 'Expense') {
                totalAmount += expense.amount;
                totalExpenses -= expense.amount;
            }
            updateSummary();
            expenseTableBody.removeChild(newRow);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    // Edit Transaction Logic
    editBtn.addEventListener('click', function () {
        categorySelect.value = expense.category;
        amountInput.value = expense.amount;
        infoInput.value = expense.info;
        dateInput.value = expense.date;
        editIndex = expenses.indexOf(expense); // Set the index to edit
        addBtn.style.display = "none";
        updateBtn.style.display = "block";
    });

    actionCell.appendChild(editBtn);
    actionCell.appendChild(deleteBtn);
}

// Add Transaction Logic
addBtn.addEventListener('click', function (event) {
    event.preventDefault(); // Prevent form from submitting traditionally

    const category = categorySelect.value;
    const amount = Number(amountInput.value);
    const info = infoInput.value;
    const date = dateInput.value;

    // Validation
    if (category === '' || isNaN(amount) || amount <= 0 || info === '' || date === '') {
        alert('Please fill out all fields.');
        return;
    }

    const transactionData = {
        category_select: category,
        amount_input: amount,
        info: info,
        date_input: date
    };

    // Use Fetch API to send data to the server
    fetch('/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(transactionData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to insert record');
        }
        return response.json();
    })
    .then(data => {
        console.log('Record inserted successfully', data);
        const expense = {
            _id: data._id, // Ensure the server returns the new record's ID
            category: transactionData.category_select,
            amount: transactionData.amount_input,
            info: transactionData.info,
            date: transactionData.date_input
        };
        
        // Add the transaction to the local array and update the UI
        expenses.push(expense);

        // Update totals
        if (category === 'Income') {
            totalAmount += amount;
            totalIncome += amount;
        } else if (category === 'Expense') {
            totalAmount -= amount;
            totalExpenses += amount;
        }

        addTransaction(expense);  // Update the UI to display the new transaction
        updateSummary();  // Update totals
        clearForm();  // Clear form after submission
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

// Update Transaction Logic
updateBtn.addEventListener('click', function (event) {
    event.preventDefault();

    const category = categorySelect.value;
    const amount = Number(amountInput.value);
    const info = infoInput.value;
    const date = dateInput.value;

    // Validation
    if (category === '' || isNaN(amount) || amount <= 0 || info === '' || date === '') {
        alert('Please fill out all fields.');
        return;
    }

    const expense = expenses[editIndex];

    const updatedData = {
        category_select: category,
        amount_input: amount,
        info: info,
        date_input: date
    };

    // Send update request to the server
    fetch(`/update/${expense._id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update record');
        }
        return response.json();
    })
    .then(data => {
        console.log('Record updated successfully', data);

        const oldExpense = expenses[editIndex];

        // Adjust totals before updating
        if (oldExpense.category === 'Income') {
            totalAmount -= oldExpense.amount;
            totalIncome -= oldExpense.amount;
        } else if (oldExpense.category === 'Expense') {
            totalAmount += oldExpense.amount;
            totalExpenses -= oldExpense.amount;
        }

        // Update the expense in the array
        expenses[editIndex] = {
            ...expense,
            category,
            amount,
            info,
            date
        };

        // Adjust totals after updating
        if (category === 'Income') {
            totalAmount += amount;
            totalIncome += amount;
        } else if (category === 'Expense') {
            totalAmount -= amount;
            totalExpenses += amount;
        }

        // Rebuild the table to reflect changes
        rebuildTable();
        updateSummary();
        clearForm();

        addBtn.style.display = "block";
        updateBtn.style.display = "none";
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

// Rebuild the transaction table after updating
function rebuildTable() {
    expenseTableBody.innerHTML = ''; // Clear the table body
    expenses.forEach(expense => {
        addTransaction(expense);
    });
}

// Clear the form inputs after adding or updating a transaction
function clearForm() {
    categorySelect.value = '';
    amountInput.value = '';
    infoInput.value = '';
    dateInput.value = '';
}
