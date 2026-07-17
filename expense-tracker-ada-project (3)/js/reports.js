
document.addEventListener('DOMContentLoaded', () => {
    const data = getExpenses();
    
    // Category Chart
    const categories = {};
    data.filter(d => d.type === 'expense').forEach(d => {
        categories[d.category] = (categories[d.category] || 0) + d.amount;
    });
    
    new Chart(document.getElementById('categoryChart'), {
        type: 'pie',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: ['#2563eb', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b']
            }]
        }
    });
    
    // Type Chart
    let inc = 0, exp = 0;
    data.forEach(d => {
        if(d.type === 'income') inc += d.amount;
        else exp += d.amount;
    });
    
    new Chart(document.getElementById('typeChart'), {
        type: 'bar',
        data: {
            labels: ['Income', 'Expense'],
            datasets: [{
                label: 'Amount (₹)',
                data: [inc, exp],
                backgroundColor: ['#10b981', '#ef4444']
            }]
        },
        options: {
            scales: { y: { beginAtZero: true } }
        }
    });
});
