// Use global currency helpers injected via base.html
const sym  = window.currencySymbol || 'RM';
const rate = parseFloat(window.currencyRate || '1') || 1;
const CHART_COLORS = ['#4BC8A0','#6C7FD8','#F4C245','#FF7BAC','#FF9F43','#54A0FF','#5F27CD','#00D2D3'];
const EXP_COLORS   = { fnb: '#4BC8A0', rental: '#6C7FD8', other: '#F4C245' };
const EXP_LABELS   = { fnb: 'F&B Cost', rental: 'Rental', other: 'Others' };
const CATEGORIES   = ['rental', 'fnb', 'other'];

let monthlyChart    = null;
let weeklyChart     = null;
let productPieChart = null;
let expensePieChart = null;

// Expense state: { rental: { amount, saved }, fnb: ..., other: ... }
let expState = { rental: { amount: 0, saved: false }, fnb: { amount: 0, saved: false }, other: { amount: 0, saved: false } };

// ── Helpers ──────────────────────────────
function fmt(n) { return sym + ' ' + (parseFloat(n || 0) * rate).toFixed(2); }

function currentMonthYear() {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
}

// ── Init ─────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    buildDatePicker();
    setDefaultMonth();
    buildYearPicker();

    await Promise.all([
        loadRestockAlert(),
        loadExpenses(),      // load expenses first so net profit is ready
        loadTopSeller(),
    ]);

    await loadTodayStats();  // needs expenses loaded
    await loadCharts();

    document.getElementById('monthPicker').addEventListener('change', loadCharts);
    document.getElementById('datePicker').addEventListener('change', loadTodayStats);
    document.getElementById('yearPicker').addEventListener('change', loadCharts);
});

// ── DATE PICKER ───────────────────────────
function buildDatePicker() {
    const input = document.getElementById('datePicker');
    const today = new Date().toISOString().split('T')[0];
    input.value = today;
    input.max = today; // can't pick future dates
}

function formatDate(d) {
    return `${String(d.getDate()).padStart(2,'0')} / ${String(d.getMonth()+1).padStart(2,'0')} / ${d.getFullYear()}`;
}

function setDefaultMonth() {
    document.getElementById('monthPicker').value = new Date().getMonth() + 1;
}

// ── RESTOCK ALERT ────────────────────────
async function loadRestockAlert() {
    const res = await fetch('/api/get_low_stock');
    const items = await res.json();
    if (!items.length) return;

    const banner = document.getElementById('restockBanner');
    banner.style.display = 'flex';
    document.getElementById('restockCount').textContent = items.length;
    document.getElementById('restockTitle').textContent =
        `${items.length} item${items.length > 1 ? 's' : ''} need to restock soon`;
    document.getElementById('restockItems').textContent =
        'Low Stock Items: ' + items.map(i => i.ingredient_name).join(', ');
}

// ── TODAY STATS (with net profit) ─────────
async function loadTodayStats() {
    const date = document.getElementById('datePicker').value;
    const res  = await fetch(`/api/dashboard/today_stats?date=${date}`);
    const d    = await res.json();

    const revenue   = d.revenue || 0;
    const totalQty  = d.total_qty || 0;
    const cost      = d.cost || 0;
    const grossProfit = revenue - cost;

    // Daily expense share = total monthly expenses / days in month
    const now = new Date(date);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const totalMonthlyExp = CATEGORIES.reduce((s, c) => s + (expState[c]?.amount || 0), 0);
    const dailyExpShare   = totalMonthlyExp / daysInMonth;
    const netProfit       = grossProfit - dailyExpShare;

    document.getElementById('statRevenue').textContent = fmt(revenue);
    document.getElementById('statSales').textContent   = totalQty;
    document.getElementById('statCost').textContent    = fmt(cost);

    const gpEl = document.getElementById('statProfit');
    gpEl.textContent = (grossProfit >= 0 ? '+' : '') + fmt(grossProfit);
    gpEl.className   = 'dash-stat-value ' + (grossProfit >= 0 ? 'positive' : 'negative');

    const npEl = document.getElementById('statNetProfit');
    npEl.textContent = (netProfit >= 0 ? '+' : '') + fmt(netProfit);
    npEl.className   = 'dash-stat-value ' + (netProfit >= 0 ? 'positive' : 'negative');
}

// ── TOP SELLER ───────────────────────────
async function loadTopSeller() {
    const res = await fetch('/api/dashboard/top_seller');
    const d   = await res.json();
    document.getElementById('topSellerName').textContent = d.name || '—';
}

// ── CHARTS ───────────────────────────────
async function loadCharts() {
    const month = document.getElementById('monthPicker').value;
    const year  = new Date().getFullYear();

    const [monthlyRes, weeklyRes, productRes] = await Promise.all([
        fetch(`/api/dashboard/monthly_sales?year=${year}`),
        fetch(`/api/dashboard/weekly_sales?year=${year}&month=${month}`),
        fetch(`/api/dashboard/product_sales?year=${year}&month=${month}`),
    ]);

    drawMonthlyChart(await monthlyRes.json());
    drawWeeklyChart(await weeklyRes.json());
    const products = await productRes.json();
    drawProductPie(products);
    drawProductList(products);
}

// Monthly bar chart
function drawMonthlyChart(data) {
    const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const values = labels.map((_, i) => data[i+1] || 0);
    const currentMonth = new Date().getMonth();
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    if (monthlyChart) monthlyChart.destroy();
    monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets: [{ data: values, backgroundColor: values.map((_, i) => i === currentMonth ? '#F4C245' : '#E0E0E0'), borderRadius: 6, borderSkipped: false }] },
        options: { plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => sym + c.parsed.y.toFixed(2) } } }, scales: { y: { grid: { color: '#F5ECD7' }, ticks: { callback: v => sym + v } }, x: { grid: { display: false } } }, responsive: true }
    });
}

// Weekly bar chart
function drawWeeklyChart(data) {
    const labels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const values = labels.map((_, i) => data[i] || 0);
    const today  = new Date().getDay();
    const ctx = document.getElementById('weeklyChart').getContext('2d');
    if (weeklyChart) weeklyChart.destroy();
    weeklyChart = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets: [{ data: values, backgroundColor: values.map((_, i) => i === today ? '#F4C245' : '#E0E0E0'), borderRadius: 6, borderSkipped: false }] },
        options: { plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => sym + c.parsed.y.toFixed(2) } } }, scales: { y: { grid: { color: '#F5ECD7' }, ticks: { callback: v => sym + v } }, x: { grid: { display: false } } }, responsive: true }
    });
}

// Product pie
function drawProductPie(products) {
    const ctx = document.getElementById('productPieChart').getContext('2d');
    if (productPieChart) productPieChart.destroy();
    if (!products.length) { ctx.clearRect(0,0,300,220); return; }

    const labels = products.map(p => p.product_name);
    const values = products.map(p => p.total_qty);
    const colors = products.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);

    productPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, hoverOffset: 8 }] },
        options: { cutout: '60%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `${c.label}: ${c.parsed}` } } }, responsive: true, maintainAspectRatio: true }
    });

    document.getElementById('productPieLegend').innerHTML = labels.map((l, i) =>
        `<span style="display:flex;align-items:center;gap:5px;"><span style="width:12px;height:12px;border-radius:50%;background:${colors[i]};display:inline-block;"></span>${l}</span>`
    ).join('');
}

// Product list
function drawProductList(products) {
    const el = document.getElementById('productSaleList');
    if (!products.length) { el.innerHTML = '<p style="color:#aaa;text-align:center;margin-top:20px;">No sales this month</p>'; return; }
    const totalQty = products.reduce((s, p) => s + p.total_qty, 0) || 1;
    el.innerHTML = products.map((p, i) => {
        const pct   = Math.round((p.total_qty / totalQty) * 100);
        const color = CHART_COLORS[i % CHART_COLORS.length];
        return `<div class="dash-product-list-item">
            <div class="dash-product-name-wrap"><span class="dash-product-dot" style="background:${color};"></span>${p.product_name}</div>
            <span class="dash-product-pct">${pct}%</span>
            <span class="dash-product-rev">${sym}${parseFloat(p.total_revenue||0).toFixed(2)}</span>
        </div>`;
    }).join('');
}

async function loadExpenses() {
    const { month, year } = getSelectedMonthYear();
    const res  = await fetch(`/api/dashboard/expenses?month=${month}&year=${year}`);
    const data = await res.json();   // [{ category, amount }, ...]

    // Reset state
    CATEGORIES.forEach(c => { expState[c] = { amount: 0, saved: false }; });

    data.forEach(row => {
        const c = row.category;
        if (expState[c] !== undefined) {
            expState[c].amount = parseFloat(row.amount) || 0;
            expState[c].saved  = true;
        }
    });

    CATEGORIES.forEach(c => renderExpCard(c));
    drawExpensePie();
}

function renderExpCard(cat) {
    const { amount, saved } = expState[cat];
    document.getElementById(`expVal-${cat}`).textContent     = amount.toFixed(0);
    document.getElementById(`expView-${cat}`).style.display  = saved ? 'flex'   : 'none';
    document.getElementById(`expEdit-${cat}`).style.display  = saved ? 'none'   : 'flex';
    document.getElementById(`expInput-${cat}`).value         = saved ? ''       : (amount || '');
    const btn = document.getElementById(`expBtn-${cat}`);
    btn.textContent  = saved ? 'Edit' : 'Save';
    btn.className    = saved ? 'exp-action-btn saved' : 'exp-action-btn';
}

function adjustExp(cat, delta) {
    if (!expState[cat].saved) return; // only when in view mode
    const newVal = Math.max(0, expState[cat].amount + delta);
    expState[cat].amount = newVal;
    document.getElementById(`expVal-${cat}`).textContent = newVal.toFixed(0);
    // Keep it in "unsaved" state so user must re-save after adjustment
    expState[cat].saved = false;
    renderExpCard(cat);
    drawExpensePie();
}

async function saveExpense(cat) {
    const { saved } = expState[cat];

    if (saved) {
        // Switch to edit mode
        expState[cat].saved = false;
        document.getElementById(`expInput-${cat}`).value = expState[cat].amount;
        renderExpCard(cat);
        return;
    }

    // Save mode — read input
    const inputVal = parseFloat(document.getElementById(`expInput-${cat}`).value);
    if (isNaN(inputVal) || inputVal < 0) { alert('Please enter a valid amount.'); return; }

    const { month, year } = currentMonthYear();
    const res = await fetch('/api/dashboard/save_expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: cat, amount: inputVal, month, year })
    });
    const result = await res.json();
    if (result.status === 'success') {
        expState[cat].amount = inputVal;
        expState[cat].saved  = true;
        renderExpCard(cat);
        drawExpensePie();
        await loadTodayStats();   // refresh net profit
    } else {
        alert('Failed to save expense.');
    }
}

function drawExpensePie() {
    const ctx = document.getElementById('expensePieChart').getContext('2d');
    if (expensePieChart) expensePieChart.destroy();

    const cats   = CATEGORIES.filter(c => expState[c].amount > 0);
    const values = cats.map(c => expState[c].amount);
    const colors = cats.map(c => EXP_COLORS[c]);
    const labels = cats.map(c => EXP_LABELS[c]);

    if (!cats.length) {
        ctx.clearRect(0,0,300,220);
        document.getElementById('expensePieLegend').innerHTML = '<p style="color:#aaa;font-size:13px;">No expenses saved yet</p>';
        return;
    }

    expensePieChart = new Chart(ctx, {
        type: 'doughnut',
        data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, hoverOffset: 8 }] },
        options: { cutout: '60%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `${c.label}: ${sym}${c.parsed.toFixed(2)}` } } }, responsive: true, maintainAspectRatio: true }
    });

    document.getElementById('expensePieLegend').innerHTML = labels.map((l, i) =>
        `<span style="display:flex;align-items:center;gap:5px;"><span style="width:12px;height:12px;border-radius:50%;background:${colors[i]};display:inline-block;"></span>${l}</span>`
    ).join('');
}

//function year picker
function buildYearPicker() {
    const yearSelect = document.getElementById('yearPicker');
    const currentYear = new Date().getFullYear();

    for (let y = currentYear; y >= currentYear - 5; y--) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        yearSelect.appendChild(opt);
    }

    yearSelect.value = currentYear;
}

function getSelectedMonthYear() {
    return {
        month: parseInt(document.getElementById('monthPicker').value),
        year: parseInt(document.getElementById('yearPicker').value)
    };
}