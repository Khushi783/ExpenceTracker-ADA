
window.startRace = function() {
    const query = document.getElementById('raceQuery').value.toLowerCase();
    const data = getExpenses();
    if (!query || data.length === 0) return;
    
    document.getElementById('raceResults').style.display = 'block';
    
    // Increase dataset artificially for the race
    let raceData = [];
    for(let i=0; i<200; i++) {
        raceData.push(...data.map(e => ({...e, id: e.id + '_' + i})));
    }
    raceData.push({ title: query, amount: 0, category: 'Other', type: 'expense', date: '2020-01-01' });
    
    // Linear
    const t0 = performance.now();
    let lComps = 0;
    let lFound = false;
    for (let i = 0; i < raceData.length; i++) {
        lComps++;
        if (raceData[i].title.toLowerCase() === query) {
            lFound = true;
            break;
        }
    }
    const lTime = performance.now() - t0;
    
    // Binary
    const t1 = performance.now();
    const sortedData = [...raceData].sort((a,b) => a.title.localeCompare(b.title));
    const sortTime = performance.now() - t1;
    
    const t2 = performance.now();
    let bComps = 0;
    let bFound = false;
    let left = 0, right = sortedData.length - 1;
    while(left <= right) {
        bComps++;
        let mid = Math.floor((left+right)/2);
        let val = sortedData[mid].title.toLowerCase();
        if (val === query) { bFound = true; break; }
        else if (val < query) left = mid + 1;
        else right = mid - 1;
    }
    const bTime = performance.now() - t2;
    
    document.getElementById('raceLinearComps').innerText = lComps;
    document.getElementById('raceLinearTime').innerText = lTime.toFixed(4) + ' ms';
    document.getElementById('raceLinearFound').innerText = lFound ? 'Found' : 'Not Found';
    
    document.getElementById('raceBinaryComps').innerText = bComps;
    document.getElementById('raceBinaryTime').innerText = bTime.toFixed(4) + ' ms';
    document.getElementById('raceSortTime').innerText = sortTime.toFixed(4) + ' ms';
    document.getElementById('raceBinaryFound').innerText = bFound ? 'Found' : 'Not Found';
    
    let conc = '';
    if (lTime < bTime) conc = 'Linear Search was faster for this query!';
    else conc = 'Binary Search was faster for retrieval! (Note the sorting time overhead).';
    
    document.getElementById('raceConclusion').innerText = conc;
    
    // UI Highlights
    document.getElementById('linearResultCard').style.borderColor = lTime < bTime ? 'var(--success)' : 'var(--border-color)';
    document.getElementById('binaryResultCard').style.borderColor = bTime < lTime ? 'var(--success)' : 'var(--border-color)';
}
