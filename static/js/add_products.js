// ===== FOOD ICONS FOR PICKER =====
const FOOD_ICONS = [
    '🍽️','🍜','🍛','🍲','🥘','🍱','🥗','🍣','🍤','🍗',
    '🍖','🥩','🌮','🌯','🥪','🥙','🧆','🥚','🍳','🥞',
    '🧇','🥓','🍔','🌭','🍟','🍕','🥨','🥐','🍞','🧀',
    '🥧','🍰','🎂','🧁','🍩','🍪','🍫','🍬','🍭','🍮',
    '🍦','🍧','🍨','🍡','🍢','🍣','🍤','🍥','🥟','🥠',
    '🥡','🍚','🍝','🥫','🧂','☕','🍵','🧋','🥤','🍹',
];

// ===== AVAILABLE INGREDIENTS =====
let availableIngredients = [];

async function loadIngredients() {
    const res = await fetch('/api/get_ingredients');
    availableIngredients = await res.json();
}

// ===== BUILD ICON PICKER =====
function buildIconPicker(gridId, hiddenInputId, defaultIcon = '🍽️') {
    const grid = document.getElementById(gridId);
    grid.innerHTML = '';

    FOOD_ICONS.forEach(icon => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'icon-option' + (icon === defaultIcon ? ' selected' : '');
        btn.textContent = icon;
        btn.title = icon;
        btn.addEventListener('click', () => {
            grid.querySelectorAll('.icon-option').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            document.getElementById(hiddenInputId).value = icon;
        });
        grid.appendChild(btn);
    });

    document.getElementById(hiddenInputId).value = defaultIcon;
}

// ===== ADD INGREDIENT ROW =====
function buildIngredientRow(containerId, selectedId = '', quantity = '') {
    const container = document.getElementById(containerId);

    const row = document.createElement('div');
    row.className = 'ingredient-row';

    const select = document.createElement('select');
    select.name = 'ingredient_id';
    select.innerHTML = '<option value="">Select Ingredient</option>';
    availableIngredients.forEach(ing => {
        const opt = document.createElement('option');
        opt.value = ing.ingredient_id;
        opt.textContent = `${ing.ingredient_name} (${ing.unit})`;
        if (ing.ingredient_id == selectedId) opt.selected = true;
        select.appendChild(opt);
    });

    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.name = 'quantity_used';
    qtyInput.placeholder = 'Qty';
    qtyInput.value = quantity;
    qtyInput.min = 0;
    qtyInput.step = 'any';

    const unitTag = document.createElement('span');
    unitTag.className = 'unit-tag';

    const updateUnit = () => {
        const found = availableIngredients.find(i => i.ingredient_id == select.value);
        unitTag.textContent = found ? found.unit : '';
    };
    select.addEventListener('change', updateUnit);
    if (selectedId) updateUnit();

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-row-btn';
    removeBtn.innerHTML = '✕';
    removeBtn.addEventListener('click', () => row.remove());

    row.appendChild(select);
    row.appendChild(qtyInput);
    row.appendChild(unitTag);
    row.appendChild(removeBtn);
    container.appendChild(row);
}

function collectIngredientRows(containerId) {
    const rows = document.querySelectorAll(`#${containerId} .ingredient-row`);
    const ingredients = [];
    rows.forEach(row => {
        const ingredient_id = row.querySelector('[name="ingredient_id"]').value;
        const quantity_used = parseFloat(row.querySelector('[name="quantity_used"]').value);
        if (ingredient_id && !isNaN(quantity_used)) {
            ingredients.push({ ingredient_id: parseInt(ingredient_id), quantity_used });
        }
    });
    return ingredients;
}

// ===== ADD MODAL =====
function openAddModal() {
    document.getElementById('addProductForm').reset();
    document.getElementById('addIngredientContainer').innerHTML = '';
    buildIconPicker('iconPickerGrid', 'selectedIcon', '🍽️');
    buildIngredientRow('addIngredientContainer');
    document.getElementById('addProductModal').style.display = 'flex';
}

function closeAddModal() {
    document.getElementById('addProductModal').style.display = 'none';
}

document.getElementById('addIngredientRowBtn').addEventListener('click', () => {
    buildIngredientRow('addIngredientContainer');
});

document.getElementById('addProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const product_name = e.target.querySelector('[name="product_name"]').value.trim();
    const selling_price = parseFloat(e.target.querySelector('[name="selling_price"]').value);
    const product_icon = document.getElementById('selectedIcon').value || '🍽️';
    const ingredients = collectIngredientRows('addIngredientContainer');

    if (!product_name || isNaN(selling_price)) {
        alert('Please fill in all required fields.');
        return;
    }

    const res = await fetch('/api/add_product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_name, selling_price, product_icon, ingredients })
    });

    const data = await res.json();
    if (data.status === 'success') {
        closeAddModal();
        loadProducts();
    } else {
        alert('Error: ' + (data.message || 'Something went wrong.'));
    }
});

// ===== EDIT MODAL =====
async function editProduct(product_id) {
    const [productsRes, recipeRes] = await Promise.all([
        fetch('/api/get_products'),
        fetch(`/api/get_product_recipe/${product_id}`)
    ]);
    const products = await productsRes.json();
    const recipe = await recipeRes.json();
    const product = products.find(p => p.product_id === product_id);
    if (!product) return;

    // Set icon + title in header
    const icon = product.product_icon || '🍽️';
    document.getElementById('editModalIcon').textContent = icon;
    document.getElementById('editModalTitle').textContent = product.product_name;
    document.getElementById('editSelectedIcon').value = icon;

    // Fill fields
    document.querySelector('#editProductForm [name="product_name"]').value = product.product_name;
    document.querySelector('#editProductForm [name="selling_price"]').value = product.selling_price;

    // Clear + fill ingredient rows
    document.getElementById('editIngredientContainer').innerHTML = '';
    recipe.forEach(r => buildIngredientRow('editIngredientContainer', r.ingredient_id, r.quantity_used));
    if (recipe.length === 0) buildIngredientRow('editIngredientContainer');

    // Store product_id
    document.getElementById('editProductForm').dataset.editId = product_id;

    document.getElementById('editProductModal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editProductModal').style.display = 'none';
}

document.getElementById('editAddIngredientRowBtn').addEventListener('click', () => {
    buildIngredientRow('editIngredientContainer');
});

document.getElementById('editProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const product_id = e.target.dataset.editId;
    const product_name = e.target.querySelector('[name="product_name"]').value.trim();
    const selling_price = parseFloat(e.target.querySelector('[name="selling_price"]').value);
    const product_icon = document.getElementById('editSelectedIcon').value || '🍽️';
    const ingredients = collectIngredientRows('editIngredientContainer');

    if (!product_name || isNaN(selling_price)) {
        alert('Please fill in all required fields.');
        return;
    }

    const res = await fetch(`/api/edit_product/${product_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_name, selling_price, product_icon, ingredients })
    });

    const data = await res.json();
    if (data.status === 'success') {
        closeEditModal();
        loadProducts();
    } else {
        alert('Error: ' + (data.message || 'Something went wrong.'));
    }
});

// ===== DELETE PRODUCT =====
async function deleteProduct(product_id) {
    if (!confirm('Delete this product?')) return;
    const res = await fetch(`/api/delete_product/${product_id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.status === 'success') loadProducts();
    else alert('Error deleting product.');
}

// ===== LOAD & RENDER PRODUCTS =====
async function loadProducts() {
    const [productsRes, fullIngRes] = await Promise.all([
        fetch('/api/get_products'),
        fetch('/api/get_ingredients_full')
    ]);

    const products = await productsRes.json();
    const fullIngredients = fullIngRes.ok ? await fullIngRes.json() : [];

    const ingMap = {};
    fullIngredients.forEach(i => { ingMap[i.ingredient_id] = i; });

    const container = document.getElementById('productList');
    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🧀</div>
                <h4>No products yet</h4>
                <p>Click "+ Add Product" to create your first product.</p>
            </div>`;
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'product-grid';
    container.appendChild(grid);

    for (const product of products) {
        const recipeRes = await fetch(`/api/get_product_recipe/${product.product_id}`);
        const recipe = await recipeRes.json();

        let cost = 0;
        recipe.forEach(r => {
            const ing = ingMap[r.ingredient_id];
            if (ing) cost += ing.price_per_unit * r.quantity_used;
        });

        const profit = product.selling_price - cost;
        const profitColor = profit >= 0 ? '#00C091' : '#FF3B3B';
        const sym  = window.currencySymbol || 'RM';
        const rate = parseFloat(window.currencyRate || '1') || 1;
        const fmtP = (v) => sym + ' ' + (parseFloat(v) * rate).toFixed(2);
        const icon = product.product_icon || '🍽️';

        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-card-header">
                <div class="product-icon">${icon}</div>
                <div class="product-card-actions">
                    <button class="btn-edit" onclick="editProduct(${product.product_id})">Edit</button>
                    <button class="btn-delete" onclick="deleteProduct(${product.product_id})">Delete</button>
                </div>
            </div>
            <h3 class="product-name">${product.product_name}</h3>
            <div class="product-info">
                <div class="info-row">
                    <span>Selling Price:</span>
                    <span>${fmtP(product.selling_price)}</span>
                </div>
                <div class="info-row">
                    <span>Cost:</span>
                    <span>${fmtP(cost)}</span>
                </div>
                <div class="info-row profit-row">
                    <span>Profit:</span>
                    <span style="color:${profitColor};font-weight:700;">${fmtP(profit)}</span>
                </div>
            </div>
            <div class="product-divider"></div>
            <div class="recipe-section">
                <strong>Recipe &amp; Ingredients</strong>
                <ul class="recipe-list">
                    ${recipe.length > 0
                        ? recipe.map(r => `<li>• ${r.ingredient_name}: ${r.quantity_used} ${r.unit}</li>`).join('')
                        : '<li style="color:#aaa;">No ingredients added</li>'}
                </ul>
            </div>`;
        grid.appendChild(card);
    }
}

// ===== INIT =====
(async () => {
    await loadIngredients();
    await loadProducts();
})();