
function getExpenses() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return [];
    return JSON.parse(localStorage.getItem('expenses_' + user.username)) || [];
}

function saveExpenses(expenses) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        localStorage.setItem('expenses_' + user.username, JSON.stringify(expenses));
    }
}

function addExpense(expense) {
    const expenses = getExpenses();
    expense.id = 'EXP-' + Date.now();
    expenses.push(expense);
    saveExpenses(expenses);
}

function deleteExpense(id) {
    let expenses = getExpenses();
    expenses = expenses.filter(e => e.id !== id);
    saveExpenses(expenses);
}

function getStartingBalance() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return 0;
    return parseFloat(localStorage.getItem('balance_' + user.username)) || 0;
}

function setStartingBalance(amount) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        localStorage.setItem('balance_' + user.username, amount);
    }
}
