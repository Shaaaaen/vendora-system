document.addEventListener("DOMContentLoaded", async () => {
    await loadDailySales();
    await loadSalesHistory();

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('filterDate').value = today;
    document.getElementById('filterDate').addEventListener('change', loadSalesHistory);
});

let products = [];
const savedToday = {};

async function loadDailySales() {
    const container = document.getElementById('dailySalesList');
    container.innerHTML = '<div class="spc-loading">Loading…</div>';

    try {
        const savedRes = await fetch('/api/get_today_recorded_products');
        const savedData = await savedRes.json();
        Object.assign(savedToday, savedData);

        const res = await fetch('/api/get_products_simple');
        products = await res.json();

        const fullRes = await fetch('/api/get_products');
        const fullProducts = await fullRes.json();
        const iconMap = {};
        fullProducts.forEach(p => { iconMap[p.product_id] = p.product_icon || '🍽️'; });

        container.innerHTML = '';

        if (products.length === 0) {
            // "No Products Yet" lives as the first card in the grid
            const emptyCard = document.createElement('div');
            emptyCard.className = 'sale-product-card spc-empty-card';
            emptyCard.innerHTML = `
                <div class="spc-empty-inner">
                    <span class="spc-empty-icon">🛒</span>
                    <p class="spc-empty-title">No Products Yet</p >
                    <p class="spc-empty-sub">Add products first before recording sales.</p >
                </div>`;
            container.appendChild(emptyCard);
            return;
        }

        products.forEach((product, i) => {
            container.appendChild(buildSaleCard(product, iconMap[product.product_id] || '🍽️', i));
        });

    } catch (err) {
        console.error("Error loading daily sales:", err);
        container.innerHTML = '<p style="color:red;padding:16px;">Failed to load sales data.</p >';
    }
}

function buildSaleCard(product, icon, index = 0) {
    const isSaved = !!(savedToday[product.product_id]);
    const qty     = isSaved ? (savedToday[product.product_id] || 0) : 1;

    const card = document.createElement('div');
    card.className = `sale-product-card${isSaved ? ' spc-is-saved' : ''}`;
    card.id = `sale-card-${product.product_id}`;
    card.style.animationDelay = `${index * 0.06}s`;

    card.innerHTML = `
        <div class="spc-header">
            <div class="spc-icon-bubble">${icon}</div>
            ${isSaved
                ? '<span class="spc-status-chip spc-chip-done">✓ Done</span>'
                : '<span class="spc-status-chip spc-chip-pending">Pending</span>'}
        </div>
        <div class="spc-body">
            <div class="spc-name">${product.product_name}</div>
            <div class="spc-hint">${isSaved
                ? 'Sales updated for today'
                : "Remember to update today's quantity"}</div>
        </div>
        <div class="spc-footer">
            <div class="spc-stepper">
                <button type="button" class="spc-step" onclick="changeQty(${product.product_id}, -1)">−</button>
                <input
                    type="number"
                    class="spc-qty-input"
                    id="qty-${product.product_id}"
                    value="${qty}"
                    min="1"
                    ${isSaved ? 'disabled' : ''}
                >
                <button type="button" class="spc-step" onclick="changeQty(${product.product_id}, 1)">+</button>
            </div>
            ${isSaved
                ? `<button class="spc-btn spc-btn-edit" onclick="enableEdit(${product.product_id})">Edit</button>`
                : `<button class="spc-btn spc-btn-save" onclick="saveSale(${product.product_id})">Save</button>`}
        </div>
    `;
    return card;
}

function changeQty(product_id, delta) {
    const input = document.getElementById(`qty-${product_id}`);
    if (!input || input.disabled) return;
    input.value = Math.max(1, (parseInt(input.value) || 1) + delta);
}

async function saveSale(product_id) {
    const input    = document.getElementById(`qty-${product_id}`);
    const quantity = parseInt(input.value);
    if (!quantity || quantity < 1) { alert('Please enter a valid quantity.'); return; }

    const res    = await fetch('/api/record_sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ product_id, quantity }] })
    });
    const result = await res.json();

    if (result.status === 'success') {
        savedToday[product_id] = quantity;
        const old     = document.getElementById(`sale-card-${product_id}`);
        const product = products.find(p => p.product_id === product_id);
        const fullRes = await fetch('/api/get_products');
        const full    = await fullRes.json();
        const iconMap = {};
        full.forEach(p => { iconMap[p.product_id] = p.product_icon || '🍽️'; });
        old.replaceWith(buildSaleCard(product, iconMap[product_id] || '🍽️'));
        await loadSalesHistory();
    } else {
        alert(result.message || 'Error recording sale.');
    }
}

function enableEdit(product_id) {
    delete savedToday[product_id];
    const product = products.find(p => p.product_id === product_id);
    fetch('/api/get_products').then(r => r.json()).then(full => {
        const iconMap = {};
        full.forEach(p => { iconMap[p.product_id] = p.product_icon || '🍽️'; });
        document.getElementById(`sale-card-${product_id}`)
                .replaceWith(buildSaleCard(product, iconMap[product_id] || '🍽️'));
    });
}

function openAddSaleModal() {
    const select = document.getElementById('modalProductSelect');
    select.innerHTML = '<option value="">-- Choose a product --</option>';
    products.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.product_id;
        opt.textContent = p.product_name;
        select.appendChild(opt);
    });
    document.getElementById('modalQtyInput').value = 1;
    document.getElementById('addSaleModal').style.display = 'flex';
}

function closeAddSaleModal() {
    document.getElementById('addSaleModal').style.display = 'none';
}

function modalChangeQty(delta) {
    const input = document.getElementById('modalQtyInput');
    input.value = Math.max(1, (parseInt(input.value) || 1) + delta);
}

async function submitModalSale() {
    const product_id = parseInt(document.getElementById('modalProductSelect').value);
    const quantity   = parseInt(document.getElementById('modalQtyInput').value);
    if (!product_id)               { alert('Please select a product.');        return; }
    if (!quantity || quantity < 1) { alert('Please enter a valid quantity.');   return; }

    const res    = await fetch('/api/record_sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ product_id, quantity }] })
    });
    const result = await res.json();

    if (result.status === 'success') {
        closeAddSaleModal();
        savedToday[product_id] = quantity;
        await loadDailySales();
        await loadSalesHistory();
    } else {
        alert(result.message || 'Error recording sale.');
    }
}

function clearDateFilter() {
    document.getElementById('filterDate').value = '';
    loadSalesHistory();
}

async function loadSalesHistory() {
    const res       = await fetch('/api/get_sales');
    const allSales  = await res.json();
    const sym       = window.currencySymbol || 'RM';
    const rate      = parseFloat(window.currencyRate || '1') || 1;
    const fmtS      = (v) => sym + ' ' + (parseFloat(v) * rate).toFixed(2);
    const salesList = document.getElementById('salesList');

    const filterDate = document.getElementById('filterDate').value;
    const sales = filterDate
        ? allSales.filter(sale => {
            const d = new Date(sale.sale_date);
            const s = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
            return s === filterDate;
          })
        : allSales;

    if (!sales.length) { salesList.innerHTML = ''; return; }

    const totalRevenue = sales.reduce((sum, s) => sum + parseFloat(s.total_amount), 0);

    salesList.innerHTML = `
        <div class="shc-summary-row">
            <div class="shc-summary-pill">
                <span class="shc-summary-icon">🧾</span>
                <span class="shc-summary-label">Orders</span>
                <span class="shc-summary-val">${sales.length}</span>
            </div>
            <div class="shc-summary-pill">
                <span class="shc-summary-icon">💰</span>
                <span class="shc-summary-label">Revenue</span>
                <span class="shc-summary-val">${fmtS(totalRevenue)}</span>
            </div>
        </div>
        <div class="sales-history-grid">
            ${sales.map((sale, i) => `
                <div class="sale-history-card" style="animation-delay:${i * 0.05}s">
                    <div class="shc-top">
                        <span class="shc-badge">Sale #${sale.sale_id}</span>
                        <span class="shc-date">${formatDate(sale.sale_date)}</span>
                    </div>
                    <div class="shc-amount">${fmtS(sale.total_amount)}</div>
                    <div class="shc-items">
                        ${sale.items.map(it => `
                            <div class="shc-item-row">
                                <span class="shc-item-name">${it.product_name}</span>
                                <span class="shc-item-qty">× ${it.quantity}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>`;
}

let histProducts = [];

async function openHistoricalSaleModal() {
    // Set default date to yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    document.getElementById('histDate').value = yesterday.toISOString().split('T')[0];
    document.getElementById('histDate').max = new Date().toISOString().split('T')[0];

    // Set currency symbol
    document.getElementById('histSymbol').textContent = window.currencySymbol || 'RM';

    // Load products for optional items
    if (!histProducts.length) {
        const res = await fetch('/api/get_products_simple');
        histProducts = await res.json();
    }

    document.getElementById('histItemsList').innerHTML = '';
    document.getElementById('histProfit').value = '';
    document.getElementById('historicalSaleModal').style.display = 'flex';
}

function closeHistoricalSaleModal() {
    document.getElementById('historicalSaleModal').style.display = 'none';
}

function addHistItem() {
    const container = document.getElementById('histItemsList');
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; gap:8px; align-items:center; margin-bottom:8px;';

    const sel = document.createElement('select');
    sel.style.cssText = 'flex:1; padding:8px; border-radius:8px; border:1.5px solid #e0c97a; font-size:13px;';
    sel.innerHTML = '<option value="">-- Select product --</option>';
    histProducts.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.product_id;
        opt.textContent = p.product_name;
        sel.appendChild(opt);
    });

    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.min = '1';
    qtyInput.value = '1';
    qtyInput.placeholder = 'Qty';
    qtyInput.style.cssText = 'width:70px; padding:8px; border-radius:8px; border:1.5px solid #e0c97a; font-size:13px;';

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '✕';
    removeBtn.type = 'button';
    removeBtn.style.cssText = 'background:#e74c3c; color:#fff; border:none; border-radius:6px; padding:6px 10px; cursor:pointer; font-size:13px;';
    removeBtn.onclick = () => row.remove();

    row.appendChild(sel);
    row.appendChild(qtyInput);
    row.appendChild(removeBtn);
    container.appendChild(row);
}

async function submitHistoricalSale() {
    const sale_date   = document.getElementById('histDate').value;
    const total_profit = parseFloat(document.getElementById('histProfit').value);

    if (!sale_date) { alert('Please select a date.'); return; }
    if (isNaN(total_profit) || total_profit < 0) { alert('Please enter a valid total profit.'); return; }

    // Collect optional items
    const rows = document.getElementById('histItemsList').querySelectorAll('div');
    const items = [];
    for (const row of rows) {
        const sel = row.querySelector('select');
        const qty = row.querySelector('input[type="number"]');
        if (sel && sel.value && qty) {
            items.push({ product_id: parseInt(sel.value), quantity: parseInt(qty.value) || 1 });
        }
    }

    const res = await fetch('/api/record_historical_sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sale_date, total_profit, items })
    });
    const result = await res.json();

    if (result.status === 'success') {
        closeHistoricalSaleModal();
        await loadSalesHistory();
        showSaleToast('✅ Historical sale saved!');
    } else {
        alert(result.message || 'Error saving historical sale.');
    }
}

function showSaleToast(msg) {
    let toast = document.getElementById('saleToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'saleToast';
        toast.style.cssText = `
            position:fixed; bottom:30px; left:50%; transform:translateX(-50%);
            background:#27ae60; color:#fff; padding:12px 28px;
            border-radius:30px; font-size:15px; font-weight:600;
            box-shadow:0 4px 18px rgba(0,0,0,0.18); z-index:9999; transition:opacity .3s;
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-MY', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}
