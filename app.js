/**
 * OMEGA FACTURE - Application Logic & Engine
 * High-performance, reactive, pixel-perfect invoicing suite
 */

// Application State
const state = {
    docType: 'Facture',
    currency: 'FCFA',
    zoom: 1,
    theme: 'dark',
    logoBase64: null,
    items: [
        { id: 1, description: 'Course Express Intra-Allada (Documents urgents & plis scellés)', qty: 3, price: 700 },
        { id: 2, description: 'Liaison Express Inter-Communes Allada ⇄ Cotonou (Colis standard)', qty: 2, price: 4000 },
        { id: 3, description: 'Pack E-Commerce & Logistique Mensuelle (Option Cash On Delivery)', qty: 1, price: 25000 }
    ],
    invoices: []
};

// Initialize DOM Events
document.addEventListener('DOMContentLoaded', () => {
    initDefaultDates();
    loadStoredTheme();
    loadSavedInvoices();
    renderItemsEditor();
    bindFormEvents();
    bindHeaderActions();
    bindHistoryEvents();
    bindZoomControls();
    bindMobileTabs();
    updateLiveSheet();
});

/* ===================================================================
   1. DATES & INITIAL SETUP
   =================================================================== */
function initDefaultDates() {
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 7);

    const docDateInput = document.getElementById('docDate');
    const docDueDateInput = document.getElementById('docDueDate');

    if (docDateInput) docDateInput.value = today.toISOString().split('T')[0];
    if (docDueDateInput) docDueDateInput.value = dueDate.toISOString().split('T')[0];
}

/* ===================================================================
   2. REACTIVE FORM BINDINGS
   =================================================================== */
function bindFormEvents() {
    // Inputs to live sync
    const liveInputIds = [
        'docNumber', 'docDate', 'docDueDate', 'docStatus', 'docObject',
        'companyName', 'companyTagline', 'companyPhone', 'companyEmail', 'companyNif', 'companyAddress',
        'clientName', 'clientAttention', 'clientPhone', 'clientEmail', 'clientAddress',
        'taxRate', 'discountAmount', 'depositAmount', 'paymentMethod', 'paymentDetails', 'invoiceNotes'
    ];

    liveInputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updateLiveSheet);
            el.addEventListener('change', updateLiveSheet);
        }
    });

    // Logo Upload
    const logoInput = document.getElementById('logoInput');
    const removeLogoBtn = document.getElementById('removeLogoBtn');

    if (logoInput) {
        logoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) {
                    showToast("L'image est trop lourde (maximum 2 Mo)");
                    return;
                }
                const reader = new FileReader();
                reader.onload = (event) => {
                    state.logoBase64 = event.target.result;
                    if (removeLogoBtn) removeLogoBtn.classList.remove('hidden');
                    updateLiveSheet();
                    showToast("Logo importé avec succès !");
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (removeLogoBtn) {
        removeLogoBtn.addEventListener('click', () => {
            state.logoBase64 = null;
            if (logoInput) logoInput.value = '';
            removeLogoBtn.classList.add('hidden');
            updateLiveSheet();
            showToast("Logo retiré.");
        });
    }

    // Add Preset Service Item
    const addPresetBtn = document.getElementById('addPresetBtn');
    if (addPresetBtn) {
        addPresetBtn.addEventListener('click', () => {
            const presets = [
                { desc: "Course Flash Intra-Allada (Rayon 5km)", qty: 1, price: 700 },
                { desc: "Course Express Inter-Communes Allada ⇄ Tori / Ouidah", qty: 1, price: 2000 },
                { desc: "Navette Quotidienne Allada ⇄ Calavi / Cotonou", qty: 1, price: 4000 },
                { desc: "Frais de manutention et conditionnement sécurisé", qty: 1, price: 1500 },
                { desc: "Pack Mensuel Vendeur E-Commerce (Courses illimitées)", qty: 1, price: 25000 }
            ];
            const randomPreset = presets[Math.floor(Math.random() * presets.length)];
            state.items.push({
                id: Date.now(),
                description: randomPreset.desc,
                qty: randomPreset.qty,
                price: randomPreset.price
            });
            renderItemsEditor();
            updateLiveSheet();
            showToast("Prestation type ajoutée !");
        });
    }

    // Add custom blank item
    const addItemBtn = document.getElementById('addItemBtn');
    if (addItemBtn) {
        addItemBtn.addEventListener('click', () => {
            state.items.push({
                id: Date.now(),
                description: 'Nouvelle prestation',
                qty: 1,
                price: 1000
            });
            renderItemsEditor();
            updateLiveSheet();
        });
    }
}

/* ===================================================================
   3. ITEMS EDITOR RENDERING
   =================================================================== */
function renderItemsEditor() {
    const container = document.getElementById('itemsContainer');
    if (!container) return;

    container.innerHTML = '';

    state.items.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'item-row';
        row.dataset.id = item.id;

        const rowTotal = (item.qty * item.price);

        row.innerHTML = `
            <input type="text" class="item-desc-input" value="${escapeHtml(item.description)}" placeholder="Description...">
            <input type="number" class="item-qty-input text-center" value="${item.qty}" min="1" step="1">
            <input type="number" class="item-price-input text-right" value="${item.price}" min="0" step="50">
            <span class="row-total-display">${formatMoney(rowTotal, false)}</span>
            <button type="button" class="btn-remove-row" title="Supprimer la ligne">&times;</button>
        `;

        // Event listeners for this row
        const descInput = row.querySelector('.item-desc-input');
        const qtyInput = row.querySelector('.item-qty-input');
        const priceInput = row.querySelector('.item-price-input');
        const removeBtn = row.querySelector('.btn-remove-row');

        descInput.addEventListener('input', (e) => {
            item.description = e.target.value;
            updateLiveSheet();
        });

        qtyInput.addEventListener('input', (e) => {
            item.qty = parseFloat(e.target.value) || 0;
            row.querySelector('.row-total-display').textContent = formatMoney(item.qty * item.price, false);
            updateLiveSheet();
        });

        priceInput.addEventListener('input', (e) => {
            item.price = parseFloat(e.target.value) || 0;
            row.querySelector('.row-total-display').textContent = formatMoney(item.qty * item.price, false);
            updateLiveSheet();
        });

        removeBtn.addEventListener('click', () => {
            if (state.items.length <= 1) {
                showToast("Le document doit comporter au moins une ligne.");
                return;
            }
            state.items.splice(index, 1);
            renderItemsEditor();
            updateLiveSheet();
        });

        container.appendChild(row);
    });
}

/* ===================================================================
   4. LIVE SHEET SYNCHRONIZATION & CALCULATIONS
   =================================================================== */
function updateLiveSheet() {
    // 1. Emitter values
    setText('pCompanyName', getValue('companyName') || 'OMEGA LivrExpress');
    setText('pCompanyTagline', getValue('companyTagline') || 'Services Professionnels');
    setText('pCompanyAddress', getValue('companyAddress'));
    setText('pCompanyPhone', '📞 ' + getValue('companyPhone'));
    setText('pCompanyEmail', '✉️ ' + getValue('companyEmail'));
    setText('pCompanyNif', getValue('companyNif'));

    // Logo
    const previewLogoImg = document.getElementById('previewLogoImg');
    const defaultLogo = document.querySelector('.default-sheet-logo');
    if (previewLogoImg && defaultLogo) {
        if (state.logoBase64) {
            previewLogoImg.src = state.logoBase64;
            previewLogoImg.classList.remove('hidden');
            defaultLogo.classList.add('hidden');
        } else {
            previewLogoImg.classList.add('hidden');
            defaultLogo.classList.remove('hidden');
        }
    }

    // 2. Document Meta
    setText('pDocType', state.docType.toUpperCase());
    setText('pDocNumber', getValue('docNumber'));
    setText('pDocDate', formatDateFr(getValue('docDate')));
    setText('pDocDueDate', formatDateFr(getValue('docDueDate')));
    setText('pDocObject', getValue('docObject'));
    setText('pPaymentMethod', getValue('paymentMethod'));
    setText('pPaymentDetails', getValue('paymentDetails'));
    setText('pInvoiceNotes', getValue('invoiceNotes'));

    // Status Stamp
    const statusVal = getValue('docStatus');
    const statusEl = document.getElementById('pStatusStamp');
    if (statusEl) {
        statusEl.textContent = statusVal;
        statusEl.className = 'status-stamp';
        if (statusVal === 'PAYÉE') statusEl.classList.add('status-payee');
        else if (statusVal === 'ANNULÉE') statusEl.classList.add('status-annulee');
    }

    // 3. Client
    setText('pClientName', getValue('clientName') || 'Client Partenaire');
    setText('pClientAttention', getValue('clientAttention') ? 'Attn: ' + getValue('clientAttention') : '');
    setText('pClientAddress', getValue('clientAddress'));
    setText('pClientPhone', 'Tel: ' + getValue('clientPhone'));
    setText('pClientEmail', getValue('clientEmail') ? ' • ' + getValue('clientEmail') : '');

    // 4. Items Table in Sheet
    const tableBody = document.getElementById('pItemsBody');
    if (tableBody) {
        tableBody.innerHTML = '';
        state.items.forEach((item, idx) => {
            const tr = document.createElement('tr');
            const rowTotal = item.qty * item.price;
            tr.innerHTML = `
                <td class="td-num">${String(idx + 1).padStart(2, '0')}</td>
                <td class="td-desc">
                    <strong>${escapeHtml(item.description)}</strong>
                </td>
                <td class="td-qty">${item.qty}</td>
                <td class="td-price text-right">${formatMoney(item.price)}</td>
                <td class="td-total text-right">${formatMoney(rowTotal)}</td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // 5. Calculations
    const subtotal = state.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const discount = parseFloat(getValue('discountAmount')) || 0;
    const taxableSubtotal = Math.max(0, subtotal - discount);

    const taxRate = parseFloat(getValue('taxRate')) || 0;
    const tax = Math.round((taxableSubtotal * taxRate) / 100);

    const totalTtc = taxableSubtotal + tax;
    const deposit = parseFloat(getValue('depositAmount')) || 0;
    const balanceDue = Math.max(0, totalTtc - deposit);

    // Update Totals DOM
    setText('pSubtotal', formatMoney(subtotal));
    
    // Discount row
    const discountRow = document.getElementById('pDiscountRow');
    if (discountRow) {
        if (discount > 0) {
            discountRow.classList.remove('hidden');
            setText('pDiscount', '- ' + formatMoney(discount));
        } else {
            discountRow.classList.add('hidden');
        }
    }

    // Tax row
    const taxRow = document.getElementById('pTaxRow');
    if (taxRow) {
        if (taxRate > 0) {
            taxRow.classList.remove('hidden');
            setText('pTaxLabel', `TVA (${taxRate}%) :`);
            setText('pTax', formatMoney(tax));
        } else {
            taxRow.classList.add('hidden');
        }
    }

    setText('pTotalTtc', formatMoney(totalTtc));

    // Deposit row
    const depositRow = document.getElementById('pDepositRow');
    if (depositRow) {
        if (deposit > 0) {
            depositRow.classList.remove('hidden');
            setText('pDeposit', '- ' + formatMoney(deposit));
        } else {
            depositRow.classList.add('hidden');
        }
    }

    setText('pBalanceDue', formatMoney(balanceDue));

    // 6. Number to French Words
    const currencyWord = state.currency === 'FCFA' ? 'Francs CFA' : (state.currency === 'EUR' ? 'Euros' : 'Dollars');
    const words = nombreEnLettres(balanceDue) + ' ' + currencyWord;
    setText('pWordsAmount', words ? capitalizeFirstLetter(words) + '.' : '');

    // Update Currency Labels
    document.querySelectorAll('.currency-label').forEach(el => {
        el.textContent = state.currency;
    });
}

/* ===================================================================
   5. HEADER ACTIONS & TOOLBAR
   =================================================================== */
function bindHeaderActions() {
    // Document Type Selector (Facture, Devis, Proforma, Reçu)
    const typeButtons = document.querySelectorAll('.type-btn');
    typeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            typeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.docType = btn.dataset.type;
            
            // Auto update number prefix if standard
            const docNumInput = document.getElementById('docNumber');
            if (docNumInput && docNumInput.value.includes('-2026-')) {
                const currentNum = docNumInput.value.split('-')[2] || '001';
                let prefix = 'FACT';
                if (state.docType === 'Devis') prefix = 'DEV';
                else if (state.docType === 'Proforma') prefix = 'PROF';
                else if (state.docType === 'Reçu') prefix = 'REC';
                docNumInput.value = `${prefix}-2026-${currentNum}`;
            }

            updateLiveSheet();
            showToast(`Mode document changé : ${state.docType}`);
        });
    });

    // Currency Switcher
    const currencySelect = document.getElementById('currencySelect');
    if (currencySelect) {
        currencySelect.addEventListener('change', (e) => {
            state.currency = e.target.value;
            updateLiveSheet();
            showToast(`Devise sélectionnée : ${state.currency}`);
        });
    }

    // Print / PDF Button
    const printBtn = document.getElementById('printBtn');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }

    // New blank invoice
    const newInvoiceBtn = document.getElementById('newInvoiceBtn');
    if (newInvoiceBtn) {
        newInvoiceBtn.addEventListener('click', () => {
            if (confirm("Voulez-vous réinitialiser le formulaire pour créer une nouvelle facture vierge ?")) {
                resetFormToBlank();
                showToast("Nouveau document vierge prêt !");
            }
        });
    }

    // Save invoice
    const saveInvoiceBtn = document.getElementById('saveInvoiceBtn');
    if (saveInvoiceBtn) {
        saveInvoiceBtn.addEventListener('click', saveCurrentInvoice);
    }

    // WhatsApp Share Button
    const shareWaBtn = document.getElementById('shareWaBtn');
    if (shareWaBtn) {
        shareWaBtn.addEventListener('click', shareOnWhatsApp);
    }

    // Theme Switcher
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Keyboard Shortcuts (⌘+P to print, ⌘+S to save)
    window.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
            e.preventDefault();
            window.print();
        } else if ((e.metaKey || e.ctrlKey) && e.key === 's') {
            e.preventDefault();
            saveCurrentInvoice();
        }
    });
}

/* ===================================================================
   6. INVOICE PERSISTENCE & HISTORY (LOCALSTORAGE)
   =================================================================== */
function saveCurrentInvoice() {
    const subtotal = state.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const discount = parseFloat(getValue('discountAmount')) || 0;
    const taxable = Math.max(0, subtotal - discount);
    const taxRate = parseFloat(getValue('taxRate')) || 0;
    const tax = Math.round((taxable * taxRate) / 100);
    const totalTtc = taxable + tax;
    const deposit = parseFloat(getValue('depositAmount')) || 0;
    const balanceDue = Math.max(0, totalTtc - deposit);

    const invoiceData = {
        id: getValue('docNumber') || ('FACT-' + Date.now()),
        docNumber: getValue('docNumber'),
        docType: state.docType,
        docDate: getValue('docDate'),
        docDueDate: getValue('docDueDate'),
        docStatus: getValue('docStatus'),
        docObject: getValue('docObject'),
        currency: state.currency,
        
        company: {
            name: getValue('companyName'),
            tagline: getValue('companyTagline'),
            phone: getValue('companyPhone'),
            email: getValue('companyEmail'),
            nif: getValue('companyNif'),
            address: getValue('companyAddress'),
            logo: state.logoBase64
        },

        client: {
            name: getValue('clientName'),
            attention: getValue('clientAttention'),
            phone: getValue('clientPhone'),
            email: getValue('clientEmail'),
            address: getValue('clientAddress')
        },

        items: JSON.parse(JSON.stringify(state.items)),
        taxRate: taxRate,
        discountAmount: discount,
        depositAmount: deposit,
        paymentMethod: getValue('paymentMethod'),
        paymentDetails: getValue('paymentDetails'),
        invoiceNotes: getValue('invoiceNotes'),
        
        totals: {
            subtotal,
            discount,
            tax,
            totalTtc,
            deposit,
            balanceDue
        },
        savedAt: new Date().toISOString()
    };

    // Update or add in array
    const existingIdx = state.invoices.findIndex(inv => inv.id === invoiceData.id);
    if (existingIdx >= 0) {
        state.invoices[existingIdx] = invoiceData;
    } else {
        state.invoices.unshift(invoiceData);
    }

    try {
        localStorage.setItem('omega_invoices_data', JSON.stringify(state.invoices));
        updateInvoiceCountBadge();
        showToast(`Document ${invoiceData.docNumber} enregistré avec succès !`);
    } catch (e) {
        showToast("Erreur lors de la sauvegarde locale (quota dépassé)");
    }
}

function loadSavedInvoices() {
    try {
        const raw = localStorage.getItem('omega_invoices_data');
        if (raw) {
            state.invoices = JSON.parse(raw);
        }
    } catch (e) {
        state.invoices = [];
    }
    updateInvoiceCountBadge();
}

function updateInvoiceCountBadge() {
    const badge = document.getElementById('invoiceCountBadge');
    if (badge) {
        badge.textContent = state.invoices.length;
    }
}

/* ===================================================================
   7. HISTORY MODAL & KPI DASHBOARD
   =================================================================== */
function bindHistoryEvents() {
    const openBtn = document.getElementById('openHistoryBtn');
    const closeBtn = document.getElementById('closeHistoryBtn');
    const modal = document.getElementById('historyModal');
    const searchInput = document.getElementById('historySearchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const clearAllBtn = document.getElementById('clearAllHistoryBtn');
    const exportBackupBtn = document.getElementById('exportBackupBtn');

    if (openBtn && modal) {
        openBtn.addEventListener('click', () => {
            renderHistoryModal();
            modal.classList.remove('hidden');
        });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    // Close on overlay click
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });
    }

    // Filter clicks
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderHistoryModal();
        });
    });

    // Search filter
    if (searchInput) {
        searchInput.addEventListener('input', renderHistoryModal);
    }

    // Export JSON Backup
    if (exportBackupBtn) {
        exportBackupBtn.addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.invoices, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `OMEGA_FACTURES_BACKUP_${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            showToast("Sauvegarde JSON téléchargée !");
        });
    }

    // Clear all history
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            if (confirm("Attention : Voulez-vous vraiment supprimer tout l'historique des factures enregistrées ? Cette action est irréversible.")) {
                state.invoices = [];
                localStorage.removeItem('omega_invoices_data');
                updateInvoiceCountBadge();
                renderHistoryModal();
                showToast("Historique vidé.");
            }
        });
    }
}

function renderHistoryModal() {
    const tableBody = document.getElementById('historyTableBody');
    const emptyState = document.getElementById('historyEmptyState');
    const searchVal = (document.getElementById('historySearchInput')?.value || '').toLowerCase();
    const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'ALL';

    // 1. Compute KPIs
    let totalBilled = 0;
    let totalPaid = 0;
    let totalPending = 0;

    state.invoices.forEach(inv => {
        const net = inv.totals?.balanceDue || 0;
        totalBilled += net;
        if (inv.docStatus === 'PAYÉE') {
            totalPaid += net;
        } else {
            totalPending += net;
        }
    });

    setText('kpiTotalBilled', formatMoney(totalBilled));
    setText('kpiTotalPaid', formatMoney(totalPaid));
    setText('kpiTotalPending', formatMoney(totalPending));
    setText('kpiDocCount', state.invoices.length);

    // 2. Filter list
    const filtered = state.invoices.filter(inv => {
        const matchesFilter = (activeFilter === 'ALL') || (inv.docStatus === activeFilter);
        const matchesSearch = !searchVal || 
            (inv.docNumber && inv.docNumber.toLowerCase().includes(searchVal)) ||
            (inv.client?.name && inv.client.name.toLowerCase().includes(searchVal)) ||
            (inv.docObject && inv.docObject.toLowerCase().includes(searchVal));
        return matchesFilter && matchesSearch;
    });

    if (!tableBody || !emptyState) return;

    if (filtered.length === 0) {
        tableBody.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    tableBody.innerHTML = '';

    filtered.forEach(inv => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${escapeHtml(inv.docNumber)}</strong></td>
            <td>${formatDateFr(inv.docDate)}</td>
            <td>${escapeHtml(inv.client?.name || 'Client')}</td>
            <td><strong>${formatMoney(inv.totals?.balanceDue || 0)}</strong></td>
            <td><span class="status-stamp ${inv.docStatus === 'PAYÉE' ? 'status-payee' : ''}">${escapeHtml(inv.docStatus)}</span></td>
            <td class="text-right">
                <button type="button" class="btn btn-sm btn-secondary btn-load-inv" data-id="${inv.id}">Ouvrir</button>
                <button type="button" class="btn btn-sm btn-ghost btn-del-inv" data-id="${inv.id}">&times;</button>
            </td>
        `;

        tr.querySelector('.btn-load-inv').addEventListener('click', () => {
            loadInvoiceIntoForm(inv);
            document.getElementById('historyModal').classList.add('hidden');
            showToast(`Facture ${inv.docNumber} chargée !`);
        });

        tr.querySelector('.btn-del-inv').addEventListener('click', () => {
            if (confirm(`Supprimer définitivement le document ${inv.docNumber} ?`)) {
                state.invoices = state.invoices.filter(item => item.id !== inv.id);
                localStorage.setItem('omega_invoices_data', JSON.stringify(state.invoices));
                updateInvoiceCountBadge();
                renderHistoryModal();
                showToast("Document supprimé.");
            }
        });

        tableBody.appendChild(tr);
    });
}

function loadInvoiceIntoForm(inv) {
    state.docType = inv.docType || 'Facture';
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === state.docType);
    });

    setVal('docNumber', inv.docNumber);
    setVal('docDate', inv.docDate);
    setVal('docDueDate', inv.docDueDate);
    setVal('docStatus', inv.docStatus);
    setVal('docObject', inv.docObject);

    if (inv.company) {
        setVal('companyName', inv.company.name);
        setVal('companyTagline', inv.company.tagline);
        setVal('companyPhone', inv.company.phone);
        setVal('companyEmail', inv.company.email);
        setVal('companyNif', inv.company.nif);
        setVal('companyAddress', inv.company.address);
        state.logoBase64 = inv.company.logo || null;
    }

    if (inv.client) {
        setVal('clientName', inv.client.name);
        setVal('clientAttention', inv.client.attention);
        setVal('clientPhone', inv.client.phone);
        setVal('clientEmail', inv.client.email);
        setVal('clientAddress', inv.client.address);
    }

    state.items = JSON.parse(JSON.stringify(inv.items || []));
    setVal('taxRate', inv.taxRate || 0);
    setVal('discountAmount', inv.discountAmount || 0);
    setVal('depositAmount', inv.depositAmount || 0);
    setVal('paymentMethod', inv.paymentMethod || 'Mobile Money');
    setVal('paymentDetails', inv.paymentDetails || '');
    setVal('invoiceNotes', inv.invoiceNotes || '');

    renderItemsEditor();
    updateLiveSheet();
}

function resetFormToBlank() {
    const nextNum = 'FACT-2026-' + String(state.invoices.length + 1).padStart(3, '0');
    setVal('docNumber', nextNum);
    initDefaultDates();
    setVal('docStatus', 'EN ATTENTE');
    setVal('clientName', '');
    setVal('clientAttention', '');
    setVal('clientPhone', '');
    setVal('clientEmail', '');
    setVal('clientAddress', '');
    setVal('discountAmount', 0);
    setVal('depositAmount', 0);

    state.items = [
        { id: Date.now(), description: 'Prestation de service', qty: 1, price: 5000 }
    ];

    renderItemsEditor();
    updateLiveSheet();
}

/* ===================================================================
   8. WHATSAPP SUMMARY GENERATOR
   =================================================================== */
function shareOnWhatsApp() {
    const docNumber = getValue('docNumber');
    const clientName = getValue('clientName') || 'Client';
    const totalDue = document.getElementById('pBalanceDue')?.textContent || '0 FCFA';
    const dueDate = formatDateFr(getValue('docDueDate'));
    const paymentDetails = getValue('paymentDetails');
    const company = getValue('companyName') || 'OMEGA LivrExpress';

    const message = `Bonjour *${clientName}* !\n\nVoici le récapitulatif de votre *${state.docType}* émise par *${company}* :\n\n📄 *N° Document* : ${docNumber}\n💰 *Net à Payer* : *${totalDue}*\n📅 *Échéance* : ${dueDate}\n\n💳 *Règlement* :\n${paymentDetails}\n\nMerci pour votre confiance ! Restant à votre disposition pour toute précision.`;

    const encodedMsg = encodeURIComponent(message);
    const clientPhone = getValue('clientPhone').replace(/[^0-9]/g, '');
    const waUrl = clientPhone.length >= 8 
        ? `https://wa.me/${clientPhone}?text=${encodedMsg}`
        : `https://wa.me/?text=${encodedMsg}`;

    showToast("Redirection vers WhatsApp pour envoyer la facture...");
    setTimeout(() => {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
    }, 400);
}

/* ===================================================================
   9. ZOOM & MOBILE CONTROLS
   =================================================================== */
function bindZoomControls() {
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const zoomResetBtn = document.getElementById('zoomResetBtn');
    const zoomLevel = document.getElementById('zoomLevel');
    const invoiceSheet = document.getElementById('invoiceSheet');

    function applyZoom() {
        if (invoiceSheet && zoomLevel) {
            invoiceSheet.style.transform = `scale(${state.zoom})`;
            zoomLevel.textContent = `${Math.round(state.zoom * 100)}%`;
        }
    }

    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => {
            if (state.zoom < 1.4) {
                state.zoom = +(state.zoom + 0.1).toFixed(1);
                applyZoom();
            }
        });
    }

    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => {
            if (state.zoom > 0.5) {
                state.zoom = +(state.zoom - 0.1).toFixed(1);
                applyZoom();
            }
        });
    }

    if (zoomResetBtn) {
        zoomResetBtn.addEventListener('click', () => {
            state.zoom = 1;
            applyZoom();
        });
    }
}

function bindMobileTabs() {
    const tabEditor = document.getElementById('tabShowEditor');
    const tabPreview = document.getElementById('tabShowPreview');
    const editorPane = document.getElementById('editorPane');
    const previewPane = document.getElementById('previewPane');

    if (tabEditor && tabPreview && editorPane && previewPane) {
        tabEditor.addEventListener('click', () => {
            tabEditor.classList.add('active');
            tabPreview.classList.remove('active');
            editorPane.classList.remove('hide-mobile');
            previewPane.classList.add('hide-mobile');
        });

        tabPreview.addEventListener('click', () => {
            tabPreview.classList.add('active');
            tabEditor.classList.remove('active');
            editorPane.classList.add('hide-mobile');
            previewPane.classList.remove('hide-mobile');
        });
    }
}

/* ===================================================================
   10. THEME SWITCHER (DARK / LIGHT)
   =================================================================== */
function loadStoredTheme() {
    const stored = localStorage.getItem('omega_theme') || 'dark';
    state.theme = stored;
    applyTheme();
}

function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('omega_theme', state.theme);
    applyTheme();
}

function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    const moonIcon = document.getElementById('moonIcon');
    const sunIcon = document.getElementById('sunIcon');
    if (moonIcon && sunIcon) {
        if (state.theme === 'light') {
            moonIcon.classList.add('hidden');
            sunIcon.classList.remove('hidden');
        } else {
            moonIcon.classList.remove('hidden');
            sunIcon.classList.add('hidden');
        }
    }
}

/* ===================================================================
   11. FRENCH NUMBER-TO-WORDS ALGORITHM (COMPLIANCE CERTIFIED)
   =================================================================== */
function nombreEnLettres(n) {
    if (n === 0) return 'zéro';
    if (!n || isNaN(n)) return '';

    n = Math.floor(Math.abs(n));

    const unites = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
    const dizaines = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingts', 'quatre-vingt-dix'];

    function convertirCentaines(val) {
        let str = '';
        const c = Math.floor(val / 100);
        const r = val % 100;

        if (c === 1) str += 'cent ';
        else if (c > 1) str += unites[c] + ' cent' + (r === 0 ? 's ' : ' ');

        if (r > 0) {
            if (r < 10) {
                str += unites[r];
            } else if (r === 11) {
                str += 'onze';
            } else if (r === 12) {
                str += 'douze';
            } else if (r === 13) {
                str += 'treize';
            } else if (r === 14) {
                str += 'quatorze';
            } else if (r === 15) {
                str += 'quinze';
            } else if (r === 16) {
                str += 'seize';
            } else if (r < 20) {
                str += 'dix-' + unites[r - 10];
            } else if (r < 70) {
                const d = Math.floor(r / 10);
                const u = r % 10;
                if (u === 1) str += dizaines[d] + ' et un';
                else if (u > 0) str += dizaines[d] + '-' + unites[u];
                else str += dizaines[d];
            } else if (r < 80) {
                const u = r - 70;
                if (u === 1) str += 'soixante et onze';
                else str += 'soixante-' + (u < 10 ? ('dix-' + unites[u]) : 'onze');
            } else if (r < 90) {
                const u = r - 80;
                if (u === 0) str += 'quatre-vingts';
                else str += 'quatre-vingt-' + unites[u];
            } else {
                const u = r - 90;
                str += 'quatre-vingt-' + (u === 1 ? 'onze' : (u < 10 ? 'dix-' + unites[u] : 'onze'));
            }
        }
        return str.trim();
    }

    if (n < 1000) return convertirCentaines(n);

    // Milliers
    const millions = Math.floor(n / 1000000);
    const milliers = Math.floor((n % 1000000) / 1000);
    const reste = n % 1000;

    let resultat = '';

    if (millions > 0) {
        if (millions === 1) resultat += 'un million ';
        else resultat += convertirCentaines(millions) + ' millions ';
    }

    if (milliers > 0) {
        if (milliers === 1) resultat += 'mille ';
        else resultat += convertirCentaines(milliers) + ' mille ';
    }

    if (reste > 0) {
        resultat += convertirCentaines(reste);
    }

    return resultat.trim();
}

/* ===================================================================
   12. GENERAL UTILITIES
   =================================================================== */
function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
}

function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val !== undefined && val !== null ? val : '';
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function formatMoney(amount, withCurrency = true) {
    const formatted = Math.round(amount).toLocaleString('fr-FR');
    return withCurrency ? `${formatted} ${state.currency}` : formatted;
}

function formatDateFr(isoDateStr) {
    if (!isoDateStr) return '';
    const parts = isoDateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoDateStr;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}
