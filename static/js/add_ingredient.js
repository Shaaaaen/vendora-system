document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("addIngredientModal");
    const openBtn = document.querySelector(".add-btn");
    const cancelBtns = document.querySelectorAll(".btn-cancel");
    const unitSelect = document.getElementById('unitSelect');
    const dynamicUnitTag1 = document.getElementById('dynamicUnitTag1');
    const dynamicUnitTag2 = document.getElementById('dynamicUnitTag2');
    const form = document.getElementById('addIngredientForm');

    let editMode = false;
    let editId = null;

    // Open modal for add
    openBtn?.addEventListener('click', () => openModal(false));

    // Open modal (add/edit)
    function openModal(isEdit = false, data = {}) {
        modal.style.display = "flex";
        editMode = isEdit;
        editId = isEdit ? data.id : null;

        form.reset();
        backToSelect();

        if (isEdit) {
            const select = document.getElementById('ingredientSelect');
            const manual = document.getElementById('ingredientManual');

            // Ingredient name
            if (data.nameInDropdown) {
                select.value = data.name;
            } else {
                select.value = 'others';
                toggleIngredientInput();
                manual.value = data.name;
            }

            // Unit (case-insensitive match)
            const unitOption = Array.from(unitSelect.options)
                .find(opt => opt.value.toLowerCase() === (data.unit || '').toLowerCase());
            unitSelect.value = unitOption ? unitOption.value : 'Unit';
            dynamicUnitTag1.textContent = unitSelect.value;
            dynamicUnitTag2.textContent = unitSelect.value;

            // Stocks & price
            form.querySelector('input[name="current_stock"]').value = data.current_stock ?? 0;
            form.querySelector('input[name="target_stock"]').value = data.target_stock ?? 0;
            form.querySelector('input[name="price_per_unit"]').value = data.price_per_unit ?? 0;
        }
    }

    // Cancel buttons & click outside modal
    cancelBtns.forEach(btn => btn.addEventListener('click', () => modal.style.display = 'none'));

    // Update dynamic unit tags
    unitSelect.addEventListener('change', () => {
        dynamicUnitTag1.textContent = unitSelect.value;
        dynamicUnitTag2.textContent = unitSelect.value;
    });

    // Prevent scroll on number inputs
    document.querySelectorAll('.custom-ingredient-modal input[type="number"]')
        .forEach(input => input.addEventListener('wheel', e => { if (document.activeElement === input) e.preventDefault(); }));

    // Submit form (add/edit)
    form.addEventListener('submit', async e => {
        e.preventDefault();

        const select = document.getElementById('ingredientSelect');
        const manual = document.getElementById('ingredientManual');
        const ingredient_name = (select.value === 'others' || !select.value) ? manual.value.trim() : select.value;

        const data = {
            ingredient_name,
            unit: unitSelect.value,
            current_stock: parseFloat(form.querySelector('input[name="current_stock"]').value) || 0,
            target_stock: parseFloat(form.querySelector('input[name="target_stock"]').value) || 0,
            price_per_unit: parseFloat(form.querySelector('input[name="price_per_unit"]').value) || 0
        };

        try {
            const url = editMode && editId ? `/api/edit_ingredient/${editId}` : '/api/add_ingredient';
            const method = editMode ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            const result = await res.json();

            if (result.status === 'success') {
                alert(editMode ? 'Ingredient updated!' : 'Ingredient added!');
                modal.style.display = 'none';
                window.location.reload();
            } else {
                alert(result.message || 'Failed to save ingredient.');
            }
        } catch (err) {
            console.error(err);
            alert('Error saving ingredient.');
        }
    });

    // Delete ingredient
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async e => {
            const card = e.target.closest('.ingredient-card');
            const id = card?.dataset?.id;
            if (!id) return alert('Ingredient ID not found!');
            if (!confirm('Are you sure you want to delete this ingredient?')) return;

            try {
                const res = await fetch(`/api/delete_ingredient/${id}`, {method:'DELETE'});
                const result = await res.json();
                if (result.status === 'success') card.remove();
                else alert(result.message || 'Failed to delete ingredient.');
            } catch (err) {
                console.error(err);
                alert('Error deleting ingredient.');
            }
        });
    });

    // Edit ingredient
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', e => {
            const card = e.target.closest('.ingredient-card');
            if (!card) return;

            const id = card.dataset.id;
            const name = card.querySelector('h4')?.textContent?.trim() ?? '';
            const unit = card.dataset.unit ?? 'Unit';
            const priceText = card.querySelector('.info-row strong')?.textContent ?? '0';
            const price = parseFloat(priceText.replace(/[^0-9.-]+/g,"")) || 0;

            const stockRow = Array.from(card.querySelectorAll('.info-row'))
                .find(r => r.querySelector('span')?.textContent.includes('Stock'));
            const current_stock = parseFloat(stockRow?.querySelector('strong')?.textContent) || 0;

            const targetRow = Array.from(card.querySelectorAll('.info-row'))
                .find(r => r.querySelector('span')?.textContent.includes('Daily Target'));
            const target_stock = parseFloat(targetRow?.querySelectorAll('span')[1]?.textContent) || 0;

            const nameInDropdown = Array.from(document.getElementById('ingredientSelect').options)
                .some(opt => opt.value === name);

            openModal(true, {id, name, unit, price_per_unit: price, current_stock, target_stock, nameInDropdown});
        });
    });
});

// Toggle manual input
function toggleIngredientInput() {
    const selectContainer = document.getElementById('selectContainer');
    const manualContainer = document.getElementById('manualInputContainer');
    const select = document.getElementById('ingredientSelect');
    const manual = document.getElementById('ingredientManual');

    if (select.value === 'others') {
        selectContainer.style.display = 'none';
        manualContainer.style.display = 'flex';
        manual.required = true;
        select.required = false;
        manual.focus();
    }
}

// Back to select
function backToSelect() {
    const selectContainer = document.getElementById('selectContainer');
    const manualContainer = document.getElementById('manualInputContainer');
    const select = document.getElementById('ingredientSelect');
    const manual = document.getElementById('ingredientManual');

    selectContainer.style.display = 'flex';
    manualContainer.style.display = 'none';
    select.value = '';
    select.required = true;
    manual.required = false;
    manual.value = '';
}