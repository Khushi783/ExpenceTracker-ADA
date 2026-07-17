
let sortData = [];
let sortResolveStep = null;
let sortRunning = false;
let sortComps = 0;
let sortSwapsCount = 0;

document.addEventListener('DOMContentLoaded', () => {
    sortData = getExpenses();
    renderSortArray(sortData);
});

function renderSortArray(data, activeIndices = [], sortedIndices = []) {
    const container = document.getElementById('sortVisualization');
    container.innerHTML = '';
    
    const maxAmount = Math.max(...data.map(d => d.amount), 100);
    
    data.forEach((item, idx) => {
        const heightPercent = Math.max(10, (item.amount / maxAmount) * 100);
        const el = document.createElement('div');
        el.style.flex = '1';
        el.style.height = heightPercent + '%';
        el.style.background = sortedIndices.includes(idx) ? 'var(--success)' : 
                             activeIndices.includes(idx) ? 'var(--danger)' : 'var(--primary-color)';
        el.style.borderRadius = '4px 4px 0 0';
        el.style.transition = 'all 0.3s';
        el.style.display = 'flex';
        el.style.alignItems = 'flex-end';
        el.style.justifyContent = 'center';
        el.style.paddingBottom = '5px';
        el.style.color = 'white';
        el.style.fontSize = '10px';
        el.style.overflow = 'hidden';
        
        const label = document.createElement('span');
        label.style.transform = 'rotate(-90deg)';
        label.style.transformOrigin = 'left bottom';
        label.style.whiteSpace = 'nowrap';
        label.innerText = item.amount;
        
        el.appendChild(label);
        container.appendChild(el);
    });
}

async function waitSortStep(ms) {
    if (document.getElementById('sortLearningMode').checked) {
        document.getElementById('sortLearningControls').style.display = 'block';
        return new Promise(resolve => { sortResolveStep = resolve; });
    }
    return new Promise(r => setTimeout(r, ms));
}

window.nextSortStep = function() {
    if (sortResolveStep) {
        sortResolveStep();
        sortResolveStep = null;
        document.getElementById('sortLearningControls').style.display = 'none';
    }
}

window.startSort = async function() {
    if (sortRunning) return;
    
    sortData = getExpenses();
    if(sortData.length < 2) return;
    
    const sortBy = document.getElementById('sortBy').value;
    const sortOrder = document.getElementById('sortOrder').value;
    
    sortRunning = true;
    sortComps = 0;
    sortSwapsCount = 0;
    document.getElementById('sortComps').innerText = '0';
    document.getElementById('sortSwaps').innerText = '0';
    document.getElementById('sortTime').innerText = '0 ms';
    
    const t0 = performance.now();
    let sortedIndices = [];
    
    for (let i = 0; i < sortData.length; i++) {
        for (let j = 0; j < sortData.length - i - 1; j++) {
            sortComps++;
            document.getElementById('sortComps').innerText = sortComps;
            document.getElementById('sortStatus').innerText = `Comparing ${j} and ${j+1}`;
            
            renderSortArray(sortData, [j, j+1], sortedIndices);
            await waitSortStep(400);
            
            let condition = false;
            let valA = sortData[j][sortBy];
            let valB = sortData[j+1][sortBy];
            
            if (sortBy === 'title' || sortBy === 'date') {
                condition = sortOrder === 'asc' ? valA > valB : valA < valB;
            } else {
                condition = sortOrder === 'asc' ? parseFloat(valA) > parseFloat(valB) : parseFloat(valA) < parseFloat(valB);
            }
            
            if (condition) {
                sortSwapsCount++;
                document.getElementById('sortSwaps').innerText = sortSwapsCount;
                document.getElementById('sortStatus').innerText = `Swapping ${j} and ${j+1}`;
                
                let temp = sortData[j];
                sortData[j] = sortData[j+1];
                sortData[j+1] = temp;
                
                renderSortArray(sortData, [j, j+1], sortedIndices);
                await waitSortStep(400);
            }
        }
        sortedIndices.push(sortData.length - i - 1);
    }
    sortedIndices.push(0);
    renderSortArray(sortData, [], sortedIndices);
    
    const t1 = performance.now();
    document.getElementById('sortTime').innerText = (t1 - t0).toFixed(2) + ' ms';
    document.getElementById('sortStatus').innerText = 'Sorting Complete!';
    
    // Save sorted state back
    saveExpenses(sortData);
    
    sortRunning = false;
}
