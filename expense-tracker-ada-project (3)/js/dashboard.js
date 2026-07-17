document.addEventListener('DOMContentLoaded', () => {

    const expDateInput = document.getElementById('expDate');
    if (expDateInput) {
        const today = new Date().toISOString().split('T')[0];
        expDateInput.setAttribute('max', today);
        expDateInput.value = today; // Set default value to today as well
    }

    const editBalanceForm = document.getElementById('editBalanceForm');
    if (editBalanceForm) {
        editBalanceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newBalance = parseFloat(document.getElementById('editBalanceAmount').value);
            if (!isNaN(newBalance) && typeof setStartingBalance === 'function') {
                setStartingBalance(newBalance);
                document.getElementById('editBalanceModal').style.display = 'none';
                renderDashboard();
            }
        });
    }

    renderDashboard();
    
    const form = document.getElementById('addExpenseForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const expense = {
                title: document.getElementById('expTitle').value,
                amount: parseFloat(document.getElementById('expAmount').value),
                category: document.getElementById('expCategory').value,
                type: document.getElementById('expType').value,
                date: document.getElementById('expDate').value
            };
            addExpense(expense);
            document.getElementById('addExpenseModal').style.display = 'none';
            form.reset();
            renderDashboard();
        });
    }
});

function renderDashboard() {
    const expenses = getExpenses();
    const list = document.getElementById('expensesList');
    
    let inc = 0;
    let exp = 0;
    
    list.innerHTML = '';
    
    const sortedExpenses = [...expenses].sort((a,b) => new Date(b.date) - new Date(a.date));
    
    sortedExpenses.forEach(e => {
        if (e.type === 'income') inc += e.amount;
        else exp += e.amount;
        
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--border-color)';
        tr.innerHTML = `
            <td style="padding: 0.75rem; font-weight: 500;">${e.title}</td>
            <td style="padding: 0.75rem; color: var(--text-muted);">${e.category}</td>
            <td style="padding: 0.75rem; color: var(--text-muted);">${e.date}</td>
            <td style="padding: 0.75rem; font-weight: bold; color: ${e.type === 'income' ? 'var(--success)' : 'var(--danger)'}">
                ${e.type === 'income' ? '+' : '-'}₹${e.amount.toFixed(2)}
            </td>
            <td style="padding: 0.75rem;">
                <button onclick="removeExp('${e.id}')" style="background: var(--danger); padding: 0.25rem 0.5rem; font-size: 0.75rem;">Delete</button>
            </td>
        `;
        list.appendChild(tr);
    });
    
    document.getElementById('totalIncome').innerText = '₹' + inc.toFixed(2);
    document.getElementById('totalExpense').innerText = '₹' + exp.toFixed(2);
    
    const startingBalance = typeof getStartingBalance === 'function' ? getStartingBalance() : 0;
    document.getElementById('currentBalance').innerText = '₹' + (startingBalance + inc - exp).toFixed(2);
    
    
    document.getElementById('totalTransactions').innerText = expenses.length;
    
    // Monthly Budget Logic
    const monthlyBudget = localStorage.getItem('monthlyBudget') ? parseFloat(localStorage.getItem('monthlyBudget')) : 0;
    document.getElementById('monthlyBudgetDisplay').innerText = '₹' + monthlyBudget.toFixed(2);
    
    // Calculate this month's expenses
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    let thisMonthExpense = 0;
    
    expenses.forEach(e => {
        const d = new Date(e.date);
        if (e.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            thisMonthExpense += e.amount;
        }
    });
    
    const progressContainer = document.getElementById('budgetProgressBar');
    const warning = document.getElementById('budgetWarning');
    
    if (monthlyBudget > 0) {
        let percent = (thisMonthExpense / monthlyBudget) * 100;
        if (percent > 100) percent = 100;
        progressContainer.style.width = percent + '%';
        
        if (thisMonthExpense >= monthlyBudget) {
            progressContainer.style.background = 'var(--danger)';
            warning.style.display = 'block';
            warning.innerText = 'Budget Exceeded! (Spent: ₹' + thisMonthExpense.toFixed(2) + ')';
        } else if (thisMonthExpense >= monthlyBudget * 0.8) {
            progressContainer.style.background = '#f59e0b'; // warning orange
            warning.style.display = 'block';
            warning.innerText = 'Approaching Budget Limit! (Spent: ₹' + thisMonthExpense.toFixed(2) + ')';
            warning.style.color = '#f59e0b';
        } else {
            progressContainer.style.background = 'var(--primary-color)';
            warning.style.display = 'block';
            warning.innerText = 'Spent: ₹' + thisMonthExpense.toFixed(2) + ' / ₹' + monthlyBudget.toFixed(2);
            warning.style.color = 'var(--text-muted)';
        }
    } else {
        progressContainer.style.width = '0%';
        warning.style.display = 'block';
        warning.innerText = 'No budget set.';
        warning.style.color = 'var(--text-muted)';
    }

}

window.removeExp = function(id) {
    if(confirm('Are you sure?')) {
        deleteExpense(id);
        renderDashboard();
    }
}

window.editBalance = function() {
    const currentStart = typeof getStartingBalance === 'function' ? getStartingBalance() : 0;
    document.getElementById('editBalanceAmount').value = currentStart;
    document.getElementById('editBalanceModal').style.display = 'flex';
};


window.toggleEditBalance = function() {
    const currentStart = typeof getStartingBalance === 'function' ? getStartingBalance() : 0;
    document.getElementById('inlineBalanceInput').value = currentStart;
    document.getElementById('currentBalance').style.display = 'none';
    document.getElementById('editBalanceInline').style.display = 'flex';
};

window.saveInlineBalance = function() {
    const newBalance = parseFloat(document.getElementById('inlineBalanceInput').value);
    if (!isNaN(newBalance) && typeof setStartingBalance === 'function') {
        setStartingBalance(newBalance);
        document.getElementById('currentBalance').style.display = 'block';
        document.getElementById('editBalanceInline').style.display = 'none';
        renderDashboard();
    }
};

window.cancelInlineBalance = function() {
    document.getElementById('currentBalance').style.display = 'block';
    document.getElementById('editBalanceInline').style.display = 'none';
};


window.toggleEditBudget = function() {
    const currentBudget = localStorage.getItem('monthlyBudget') ? parseFloat(localStorage.getItem('monthlyBudget')) : 0;
    document.getElementById('inlineBudgetInput').value = currentBudget;
    document.getElementById('monthlyBudgetContainer').style.display = 'none';
    document.getElementById('editBudgetInline').style.display = 'flex';
};

window.saveInlineBudget = function() {
    const newBudget = parseFloat(document.getElementById('inlineBudgetInput').value);
    if (!isNaN(newBudget)) {
        localStorage.setItem('monthlyBudget', newBudget.toString());
        document.getElementById('monthlyBudgetContainer').style.display = 'block';
        document.getElementById('editBudgetInline').style.display = 'none';
        renderDashboard();
    }
};

window.cancelInlineBudget = function() {
    document.getElementById('monthlyBudgetContainer').style.display = 'block';
    document.getElementById('editBudgetInline').style.display = 'none';
};
