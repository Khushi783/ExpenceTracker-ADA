let searchData = [];
let sortedData = [];
let resolveSteps = [];
let isRunning = false;

document.addEventListener('DOMContentLoaded', () => {
    searchData = getExpenses();
    const field = document.getElementById('searchField') ? document.getElementById('searchField').value : 'title';
    sortedData = [...searchData].sort((a,b) => a[field].localeCompare(b[field]));
    renderLinearArray(searchData, -1, [], field);
    renderBinaryArray(sortedData, -1, -1, -1, [], field);
});

function createBox(item, state, field = 'title') {
    const el = document.createElement('div');
    el.style.padding = '0.5rem 1rem';
    el.style.border = '1px solid var(--border-color)';
    el.style.borderRadius = '4px';
    el.style.fontSize = '0.875rem';
    el.innerText = item[field] + (field !== 'title' ? ` (${item.title})` : '');
    
    if (state === 'found') {
        el.style.background = 'var(--success)';
        el.style.color = 'white';
        el.style.borderColor = 'var(--success)';
    } else if (state === 'active') {
        el.style.background = 'var(--primary-color)';
        el.style.color = 'white';
        el.style.borderColor = 'var(--primary-color)';
    } else if (state === 'inactive') {
        el.style.opacity = '0.3';
    }
    
    return el;
}

function renderLinearArray(data, activeIdx = -1, foundIndices = [], field = 'title') {
    const container = document.getElementById('linearArray');
    if (!container) return;
    container.innerHTML = '';
    
    data.forEach((item, idx) => {
        let state = 'normal';
        if (Array.isArray(foundIndices) ? foundIndices.includes(idx) : idx === foundIndices) state = 'found';
        else if (idx === activeIdx) state = 'active';
        container.appendChild(createBox(item, state, field));
    });
}

function renderBinaryArray(data, leftIdx = -1, rightIdx = -1, midIdx = -1, foundIndices = [], field = 'title') {
    const container = document.getElementById('binaryArray');
    if (!container) return;
    container.innerHTML = '';
    
    data.forEach((item, idx) => {
        let state = 'normal';
        if (Array.isArray(foundIndices) ? foundIndices.includes(idx) : idx === foundIndices) {
            state = 'found';
        } else if (idx === midIdx) {
            state = 'active';
        } else if (leftIdx !== -1 && rightIdx !== -1 && (idx < leftIdx || idx > rightIdx)) {
            state = 'inactive';
        }
        container.appendChild(createBox(item, state, field));
    });
}

async function waitStep(ms) {
    if (document.getElementById('learningMode').checked) {
        document.getElementById('learningControls').style.display = 'block';
        return new Promise(resolve => { resolveSteps.push(resolve); });
    }
    return new Promise(r => setTimeout(r, ms));
}

window.nextSearchStep = function() {
    if (resolveSteps.length > 0) {
        const toResolve = [...resolveSteps];
        resolveSteps = [];
        toResolve.forEach(r => r());
    }
}

window.startSearch = async function() {
    if (isRunning) return;
    
    const query = document.getElementById('searchQuery').value.toLowerCase();
    const field = document.getElementById('searchField') ? document.getElementById('searchField').value : 'title';
    if (!query) return;
    
    isRunning = true;
    
    searchData = getExpenses();
    sortedData = [...searchData].sort((a,b) => a[field].localeCompare(b[field]));
    
    document.getElementById('linearComps').innerText = '0';
    document.getElementById('linearTime').innerText = '0 ms';
    document.getElementById('binaryComps').innerText = '0';
    document.getElementById('binaryTime').innerText = '0 ms';
    
    renderLinearArray(searchData, -1, [], field);
    renderBinaryArray(sortedData, -1, -1, -1, [], field);
    
    // Run both searches in parallel
    await Promise.all([
        runLinear(query, field),
        runBinary(query, field)
    ]);
    
    document.getElementById('learningControls').style.display = 'none';
    isRunning = false;
}

async function runLinear(query, field) {
    const data = searchData;
    let comparisons = 0;
    
    const t0 = performance.now();
    let foundIndices = [];
    
    for (let i = 0; i < data.length; i++) {
        comparisons++;
        document.getElementById('linearComps').innerText = comparisons;
        renderLinearArray(data, i, foundIndices, field);
        
        await waitStep(500);
        
        if (data[i][field].toLowerCase().includes(query)) {
            foundIndices.push(i);
            renderLinearArray(data, -1, foundIndices, field);
        }
    }
    
    const t1 = performance.now();
    document.getElementById('linearTime').innerText = (t1 - t0).toFixed(2) + ' ms';
    renderLinearArray(data, -1, foundIndices, field);
}

async function runBinary(query, field) {
    const data = sortedData;
    let comparisons = 0;
    
    const t0 = performance.now();
    let foundIndices = [];
    let leftIndex = 0;
    let rightIndex = data.length - 1;
    
    while (leftIndex <= rightIndex) {
        comparisons++;
        document.getElementById('binaryComps').innerText = comparisons;
        
        let midIndex = Math.floor((leftIndex + rightIndex) / 2);
        renderBinaryArray(data, leftIndex, rightIndex, midIndex, foundIndices, field);
        
        await waitStep(500);
        
        const midVal = data[midIndex][field].toLowerCase();
        
        // Exact match checking for simplicity in binary search
        if (midVal === query) {
            foundIndices.push(midIndex);
            renderBinaryArray(data, leftIndex, rightIndex, -1, foundIndices, field);
            
            // Scan left for duplicates
            let l = midIndex - 1;
            while(l >= 0 && data[l][field].toLowerCase() === query) {
                comparisons++;
                document.getElementById('binaryComps').innerText = comparisons;
                renderBinaryArray(data, leftIndex, rightIndex, l, foundIndices, field);
                await waitStep(500);
                foundIndices.push(l);
                renderBinaryArray(data, leftIndex, rightIndex, -1, foundIndices, field);
                l--;
            }
            
            // Scan right for duplicates
            let r = midIndex + 1;
            while(r < data.length && data[r][field].toLowerCase() === query) {
                comparisons++;
                document.getElementById('binaryComps').innerText = comparisons;
                renderBinaryArray(data, leftIndex, rightIndex, r, foundIndices, field);
                await waitStep(500);
                foundIndices.push(r);
                renderBinaryArray(data, leftIndex, rightIndex, -1, foundIndices, field);
                r++;
            }
            break;
        } else if (midVal < query) {
            leftIndex = midIndex + 1;
        } else {
            rightIndex = midIndex - 1;
        }
    }
    
    const t1 = performance.now();
    document.getElementById('binaryTime').innerText = (t1 - t0).toFixed(2) + ' ms';
    
    renderBinaryArray(data, -1, -1, -1, foundIndices, field);
}