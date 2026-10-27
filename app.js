// ===== App State =====
let currentUser = null;
let currentAccount = null;
let currentBills = [];
let dailyUsageChart = null;
let usageHistoryChart = null;
let costHistoryChart = null;

// ===== DOM Elements =====
const loginPage = document.getElementById('login-page');
const appPage = document.getElementById('app-page');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const userGreeting = document.getElementById('user-greeting');

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Check for existing session
    const savedUser = sessionStorage.getItem('currentUser');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        loginUser(user);
    }
    
    // Set up event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
    // Logout button
    logoutBtn.addEventListener('click', handleLogout);
    
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Back to bills button
    document.getElementById('back-to-bills').addEventListener('click', showBillsList);
    
    // Download statement button
    document.getElementById('download-statement-btn').addEventListener('click', downloadStatement);
    
    // Account form
    document.getElementById('account-form').addEventListener('submit', handleAccountSave);
    
    // Contact form
    document.getElementById('contact-form').addEventListener('submit', handleContactSubmit);

    // Payments
    document.getElementById('pay-bill-btn').addEventListener('click', () => {
        if (currentBillDetail) openPayModal([currentBillDetail.billId]);
    });
    document.getElementById('pay-cancel').addEventListener('click', closePayModal);
    document.getElementById('pay-confirm').addEventListener('click', handlePayConfirm);

    // Service requests
    document.getElementById('request-form').addEventListener('submit', handleRequestSubmit);

    // Billing preferences
    [['setting-autopay', 'autopay'], ['setting-paperless', 'paperless'],
     ['setting-email', 'emailAlerts'], ['setting-sms', 'smsAlerts']].forEach(([id, key]) => {
        document.getElementById(id).addEventListener('change', e => {
            accountSettings[currentUser.accountId][key] = e.target.checked;
            renderBanner();
        });
    });

    // Notifications
    document.getElementById('notif-btn').addEventListener('click', e => {
        e.stopPropagation();
        toggleNotifications();
    });
    document.addEventListener('click', e => {
        if (!e.target.closest('.notif-wrapper')) {
            document.getElementById('notif-panel').classList.add('hidden');
        }
    });
}

// ===== Authentication =====
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    // Find user
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        loginError.textContent = '';
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        loginUser(user);
    } else {
        loginError.textContent = 'Invalid username or password. Please try again.';
    }
}

function loginUser(user) {
    currentUser = user;
    currentAccount = accounts[user.accountId];
    currentBills = bills[user.accountId] || [];
    
    // Update UI
    userGreeting.textContent = `Welcome, ${currentAccount.name}`;
    
    // Switch to app
    loginPage.classList.remove('active');
    appPage.classList.add('active');
    
    // Redirect to home page
    window.location.hash = '#home';
    
    // Load initial data
    renderBillsList();
    renderBanner();
    renderPayments();
    renderService();
    renderNotifications();
    renderUsageHistory();
    renderAccountInfo();
    renderContactInfo();
}

function handleLogout() {
    // Clear session
    sessionStorage.removeItem('currentUser');
    currentUser = null;
    currentAccount = null;
    currentBills = [];
    
    // Reset forms
    loginForm.reset();
    loginError.textContent = '';
    
    // Switch to login
    appPage.classList.remove('active');
    loginPage.classList.add('active');
    
    // Reset to bills tab
    switchTab('bills');
    showBillsList();
    
    // Destroy charts
    destroyCharts();
}

// ===== Tab Navigation =====
function switchTab(tabId) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    
    // Update tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === `${tabId}-tab`);
    });
    
    // Refresh charts when switching to usage tab
    if (tabId === 'usage') {
        setTimeout(() => {
            renderUsageHistory();
        }, 100);
    }
}

// ===== Bills Tab =====
function renderBillsList() {
    const container = document.getElementById('bills-list');
    
    if (currentBills.length === 0) {
        container.innerHTML = '<p class="loading">No bills found.</p>';
        return;
    }
    
    container.innerHTML = currentBills.map(bill => `
        <div class="bill-item" onclick="showBillDetail('${bill.billId}')">
            <div class="bill-item-left">
                <span class="bill-period">${bill.billingPeriod}</span>
                <span class="bill-dates">${formatDate(bill.startDate)} - ${formatDate(bill.endDate)}</span>
            </div>
            <div class="bill-item-right">
                <span class="bill-amount">${formatCurrency(bill.amountDue)}</span>
                <span class="bill-status ${getBillStatus(bill)}">
                    ${statusLabel(getBillStatus(bill))}
                </span>
                <span class="bill-arrow">→</span>
            </div>
        </div>
    `).join('');
}

let currentBillDetail = null;
let payBillIds = [];

function showBillDetail(billId) {
    const bill = currentBills.find(b => b.billId === billId);
    if (!bill) return;
    
    currentBillDetail = bill;
    
    // Hide list, show detail
    document.getElementById('bills-list').classList.add('hidden');
    document.getElementById('account-banner').classList.add('hidden');
    document.getElementById('bill-detail').classList.remove('hidden');
    
    // Populate bill details
    const status = getBillStatus(bill);
    document.getElementById('detail-period').textContent = bill.billingPeriod;
    document.getElementById('detail-status').textContent = statusLabel(status);
    document.getElementById('detail-status').className = `bill-status ${status}`;
    document.getElementById('pay-bill-btn').classList.toggle('hidden', bill.isPaid);
    
    document.getElementById('detail-account-number').textContent = currentAccount.accountNumber;
    document.getElementById('detail-name').textContent = currentAccount.name;
    document.getElementById('detail-address').textContent = 
        `${currentAccount.serviceAddress}, ${currentAccount.city}, ${currentAccount.state} ${currentAccount.zip}`;
    
    document.getElementById('detail-dates').textContent = 
        `${formatDate(bill.startDate)} - ${formatDate(bill.endDate)}`;
    document.getElementById('detail-due-date').textContent = formatDate(bill.dueDate);
    document.getElementById('detail-meter').textContent = currentAccount.meterNumber;
    
    document.getElementById('detail-prev-reading').textContent = `${bill.previousReading.toLocaleString()} kWh`;
    document.getElementById('detail-curr-reading').textContent = `${bill.currentReading.toLocaleString()} kWh`;
    document.getElementById('detail-usage').textContent = `${bill.usageKwh.toLocaleString()} kWh`;
    
    document.getElementById('detail-line-items').innerHTML = bill.lineItems.map(item => `
        <div class="info-row">
            <span class="info-label">${item.description}:</span>
            <span class="info-value">${formatCurrency(item.amount)}</span>
        </div>`).join('');
    document.getElementById('detail-total').textContent = formatCurrency(bill.amountDue);
    
    // Render daily usage chart
    renderDailyUsageChart(bill);
}

function showBillsList() {
    document.getElementById('bill-detail').classList.add('hidden');
    document.getElementById('bills-list').classList.remove('hidden');
    document.getElementById('account-banner').classList.remove('hidden');
    currentBillDetail = null;
    
    // Destroy daily usage chart
    if (dailyUsageChart) {
        dailyUsageChart.destroy();
        dailyUsageChart = null;
    }
}

function downloadStatement() {
    if (!currentBillDetail || !currentAccount) return;
    
    const bill = currentBillDetail;
    const account = currentAccount;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const pageWidth = 210;
    const leftMargin = 15;
    const rightMargin = 195;
    
    // ===== HEADER SECTION =====
    // Blue header bar
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    // Lightning bolt icon (yellow)
    doc.setFillColor(250, 204, 21);
    doc.triangle(25, 8, 18, 20, 23, 18, 'F');
    doc.triangle(20, 16, 27, 28, 22, 18, 'F');
    
    // Company name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('SPRINGFIELD ELECTRIC', 32, 18);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Your Trusted Energy Partner Since 1952', 32, 26);
    
    // Statement label on right
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('BILLING STATEMENT', rightMargin, 16, { align: 'right' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Statement Date: ${formatDate(bill.endDate)}`, rightMargin, 26, { align: 'right' });
    
    doc.setTextColor(0, 0, 0);
    
    // ===== AMOUNT DUE BOX =====
    const boxY = 42;
    doc.setDrawColor(bill.isPaid ? 34 : 234, bill.isPaid ? 197 : 179, bill.isPaid ? 94 : 8);
    doc.setLineWidth(1);
    doc.roundedRect(120, boxY, 75, 38, 3, 3, 'S');
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('AMOUNT DUE', 157.5, boxY + 10, { align: 'center' });
    
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(bill.isPaid ? 34 : 180, bill.isPaid ? 197 : 90, bill.isPaid ? 94 : 0);
    doc.text(formatCurrency(bill.amountDue), 157.5, boxY + 24, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(bill.isPaid ? 'PAID' : `Due: ${formatDate(bill.dueDate)}`, 157.5, boxY + 33, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    
    // ===== ACCOUNT INFO (Left side) =====
    let y = boxY + 5;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('ACCOUNT NUMBER', leftMargin, y);
    y += 5;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(account.accountNumber, leftMargin, y);
    
    y += 10;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('SERVICE ADDRESS', leftMargin, y);
    y += 5;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(account.name, leftMargin, y);
    if (account.secondaryName) {
        y += 5;
        doc.text(account.secondaryName, leftMargin, y);
    }
    y += 5;
    doc.text(account.serviceAddress, leftMargin, y);
    y += 5;
    doc.text(`${account.city}, ${account.state} ${account.zip}`, leftMargin, y);
    
    // ===== BILLING PERIOD BAR =====
    y = 88;
    doc.setFillColor(241, 245, 249);
    doc.rect(leftMargin, y, 180, 12, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Billing Period: ${bill.billingPeriod}`, leftMargin + 5, y + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(`${formatDate(bill.startDate)} - ${formatDate(bill.endDate)}`, rightMargin - 5, y + 8, { align: 'right' });
    
    // ===== METER READINGS SECTION =====
    y = 108;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Meter Information', leftMargin, y);
    
    y += 8;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    
    // Table header
    doc.setFillColor(248, 250, 252);
    doc.rect(leftMargin, y, 180, 8, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Meter #', leftMargin + 3, y + 6);
    doc.text('Previous', leftMargin + 50, y + 6);
    doc.text('Current', leftMargin + 90, y + 6);
    doc.text('Usage (kWh)', leftMargin + 130, y + 6);
    
    // Table row
    y += 8;
    doc.rect(leftMargin, y, 180, 10, 'S');
    doc.setFont('helvetica', 'normal');
    doc.text(account.meterNumber, leftMargin + 3, y + 7);
    doc.text(bill.previousReading.toLocaleString(), leftMargin + 50, y + 7);
    doc.text(bill.currentReading.toLocaleString(), leftMargin + 90, y + 7);
    doc.setFont('helvetica', 'bold');
    doc.text(bill.usageKwh.toLocaleString(), leftMargin + 130, y + 7);
    
    // ===== CHARGES SECTION =====
    y += 20;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Charges Summary', leftMargin, y);
    
    y += 8;
    // Charges table
    doc.setFillColor(248, 250, 252);
    doc.rect(leftMargin, y, 180, 8, 'F');
    doc.setFontSize(9);
    doc.text('Description', leftMargin + 3, y + 6);
    doc.text('Amount', rightMargin - 3, y + 6, { align: 'right' });
    
    y += 8;
    doc.setFont('helvetica', 'normal');
    const charges = bill.lineItems.map(item => [item.description, formatCurrency(item.amount)]);
    
    charges.forEach((charge, i) => {
        doc.rect(leftMargin, y, 180, 8, 'S');
        doc.text(charge[0], leftMargin + 3, y + 6);
        doc.text(charge[1], rightMargin - 3, y + 6, { align: 'right' });
        y += 8;
    });
    
    // Total row
    doc.setFillColor(30, 64, 175);
    doc.rect(leftMargin, y, 180, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL AMOUNT DUE', leftMargin + 3, y + 7);
    doc.text(formatCurrency(bill.amountDue), rightMargin - 3, y + 7, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    
    // ===== PAYMENT STUB (Bottom) =====
    y = 220;
    doc.setDrawColor(150, 150, 150);
    doc.setLineDashPattern([3, 3], 0);
    doc.line(leftMargin, y, rightMargin, y);
    doc.setLineDashPattern([], 0);
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('- - - DETACH AND RETURN WITH PAYMENT - - -', 105, y + 5, { align: 'center' });
    
    y += 12;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Springfield Electric Utility', leftMargin, y);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('P.O. Box 12345', leftMargin, y + 5);
    doc.text('Springfield, IL 62701', leftMargin, y + 10);
    
    // Payment info box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(100, y - 5, 95, 35, 2, 2, 'F');
    doc.setFontSize(8);
    doc.text('Account Number:', 105, y + 2);
    doc.setFont('helvetica', 'bold');
    doc.text(account.accountNumber, 150, y + 2);
    doc.setFont('helvetica', 'normal');
    doc.text('Amount Due:', 105, y + 10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(formatCurrency(bill.amountDue), 150, y + 11);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Due Date:', 105, y + 18);
    doc.setFont('helvetica', 'bold');
    doc.text(formatDate(bill.dueDate), 150, y + 18);
    doc.setFont('helvetica', 'normal');
    doc.text('Amount Enclosed: $__________', 105, y + 26);
    
    // Footer
    y = 280;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Questions? Call 1-800-555-ELEC | Pay online at springfieldelectric.com | Available 24/7', 105, y, { align: 'center' });
    
    // Save PDF
    doc.save(`Springfield_Electric_Statement_${bill.billingPeriod.replace(' ', '_')}.pdf`);
}

function renderDailyUsageChart(bill) {
    const ctx = document.getElementById('daily-usage-chart').getContext('2d');
    
    if (dailyUsageChart) {
        dailyUsageChart.destroy();
    }
    
    const labels = bill.dailyUsage.map((_, i) => `Day ${i + 1}`);
    
    dailyUsageChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Daily Usage (kWh)',
                data: bill.dailyUsage,
                backgroundColor: 'rgba(37, 99, 235, 0.7)',
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 1,
                borderRadius: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'kWh'
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 10
                    }
                }
            }
        }
    });
}

// ===== Usage History Tab =====
function renderUsageHistory() {
    if (currentBills.length === 0) return;
    
    // Calculate summary stats
    const totalUsage = currentBills.reduce((sum, bill) => sum + bill.usageKwh, 0);
    const avgUsage = Math.round(totalUsage / currentBills.length);
    const lastMonth = currentBills[0]?.usageKwh || 0;
    const prevMonth = currentBills[1]?.usageKwh || 0;
    const trend = prevMonth > 0 ? Math.round(((lastMonth - prevMonth) / prevMonth) * 100) : 0;
    
    document.getElementById('avg-usage').textContent = avgUsage.toLocaleString();
    document.getElementById('total-usage').textContent = totalUsage.toLocaleString();
    document.getElementById('usage-trend').textContent = 
        trend >= 0 ? `+${trend}%` : `${trend}%`;
    document.getElementById('usage-trend').style.color = 
        trend > 0 ? '#ef4444' : trend < 0 ? '#22c55e' : '#64748b';

    const recent = currentBills.slice(0, 3);
    const estimate = recent.reduce((sum, bill) => sum + bill.amountDue, 0) / recent.length;
    document.getElementById('est-next-bill').textContent = formatCurrency(estimate);
    
    // Prepare chart data (reverse to show oldest first)
    const sortedBills = [...currentBills].reverse();
    const labels = sortedBills.map(bill => bill.billingPeriod);
    const usageData = sortedBills.map(bill => bill.usageKwh);
    const costData = sortedBills.map(bill => bill.amountDue);
    
    // Usage History Chart
    const usageCtx = document.getElementById('usage-history-chart').getContext('2d');
    
    if (usageHistoryChart) {
        usageHistoryChart.destroy();
    }
    
    usageHistoryChart = new Chart(usageCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Usage (kWh)',
                data: usageData,
                backgroundColor: 'rgba(37, 99, 235, 0.7)',
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'kWh'
                    }
                }
            }
        }
    });
    
    // Cost History Chart
    const costCtx = document.getElementById('cost-history-chart').getContext('2d');
    
    if (costHistoryChart) {
        costHistoryChart.destroy();
    }
    
    costHistoryChart = new Chart(costCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Amount Due ($)',
                data: costData,
                borderColor: 'rgba(34, 197, 94, 1)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(34, 197, 94, 1)',
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount ($)'
                    },
                    ticks: {
                        callback: value => '$' + value
                    }
                }
            }
        }
    });
}

// ===== Account Tab =====
function renderAccountInfo() {
    if (!currentAccount) return;
    
    // Personal info form
    document.getElementById('account-name').value = currentAccount.name;
    document.getElementById('account-email').value = currentAccount.email;
    document.getElementById('account-phone').value = currentAccount.phone;
    document.getElementById('account-number-display').value = currentAccount.accountNumber;
    
    // Secondary account holder
    document.getElementById('secondary-name').value = currentAccount.secondaryName || '';
    document.getElementById('secondary-email').value = currentAccount.secondaryEmail || '';
    document.getElementById('secondary-phone').value = currentAccount.secondaryPhone || '';
    
    // Service info
    document.getElementById('service-address').textContent = 
        `${currentAccount.serviceAddress}, ${currentAccount.city}, ${currentAccount.state} ${currentAccount.zip}`;
    document.getElementById('service-meter').textContent = currentAccount.meterNumber;
    document.getElementById('service-rate-type').textContent = currentAccount.rateType;
    document.getElementById('service-start').textContent = formatDate(currentAccount.serviceStartDate);

    const methods = paymentMethods[currentUser.accountId] || [];
    document.getElementById('payment-methods').innerHTML = methods.map(m => `
        <div class="payment-card-display">
            <span class="card-icon">💳</span>
            <div class="card-details">
                <span class="card-number">${m.type} ending ${m.last4}${m.isDefault ? ' (default)' : ''}</span>
                ${m.expiry ? `<span class="card-expiry">Exp: ${m.expiry}</span>` : ''}
            </div>
        </div>`).join('');

    const s = accountSettings[currentUser.accountId];
    document.getElementById('setting-autopay').checked = s.autopay;
    document.getElementById('setting-paperless').checked = s.paperless;
    document.getElementById('setting-email').checked = s.emailAlerts;
    document.getElementById('setting-sms').checked = s.smsAlerts;
}

function handleAccountSave(e) {
    e.preventDefault();
    
    const messageEl = document.getElementById('save-message');
    
    // Simulate saving (update local data)
    currentAccount.name = document.getElementById('account-name').value;
    currentAccount.email = document.getElementById('account-email').value;
    currentAccount.phone = document.getElementById('account-phone').value;
    
    // Secondary account holder
    currentAccount.secondaryName = document.getElementById('secondary-name').value;
    currentAccount.secondaryEmail = document.getElementById('secondary-email').value;
    currentAccount.secondaryPhone = document.getElementById('secondary-phone').value;
    
    // Update header greeting
    userGreeting.textContent = `Welcome, ${currentAccount.name}`;
    
    // Show success message
    messageEl.textContent = 'Changes saved successfully!';
    messageEl.className = 'save-message success';
    
    setTimeout(() => {
        messageEl.textContent = '';
    }, 3000);
}

// ===== Contact Tab =====
function renderContactInfo() {
    document.getElementById('company-phone').textContent = companyInfo.phone;
    document.getElementById('company-email').textContent = companyInfo.email;
    document.getElementById('company-hours').textContent = companyInfo.hours;
    document.getElementById('emergency-line').textContent = companyInfo.emergencyLine;
    document.getElementById('footer-emergency').textContent = companyInfo.emergencyLine;
    document.getElementById('footer-hours').textContent = companyInfo.hours;
    document.getElementById('company-name-address').textContent = companyInfo.name;
    document.getElementById('company-address').textContent = companyInfo.address;
    document.getElementById('company-city-state').textContent = 
        `${companyInfo.city}, ${companyInfo.state} ${companyInfo.zip}`;
}

function handleContactSubmit(e) {
    e.preventDefault();
    
    const messageEl = document.getElementById('contact-message-status');
    const form = e.target;
    
    // Simulate sending (just show success)
    messageEl.textContent = 'Message sent successfully! We\'ll respond within 1-2 business days.';
    messageEl.className = 'save-message success';
    
    // Reset form
    form.reset();
    
    setTimeout(() => {
        messageEl.textContent = '';
    }, 5000);
}

// ===== Billing Status & Payments =====
function getBillStatus(bill) {
    if (bill.isPaid) return 'paid';
    return new Date(`${bill.dueDate}T23:59:59`) < new Date() ? 'overdue' : 'due';
}

function statusLabel(status) {
    return { paid: 'Paid', due: 'Due', overdue: 'Overdue' }[status];
}

function renderBanner() {
    const banner = document.getElementById('account-banner');
    const unpaid = currentBills.filter(b => !b.isPaid);
    const settings = accountSettings[currentUser.accountId];

    if (unpaid.length === 0) {
        banner.className = 'account-banner paid-up';
        banner.innerHTML = `
            <div><span class="banner-label">Account Balance</span>
            <span class="banner-amount">${formatCurrency(0)}</span></div>
            <div class="banner-note">You're all paid up. Thank you!</div>`;
        return;
    }

    const total = unpaid.reduce((sum, b) => sum + b.amountDue, 0);
    const next = [...unpaid].sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
    const overdue = unpaid.some(b => getBillStatus(b) === 'overdue');
    const days = Math.ceil((new Date(`${next.dueDate}T23:59:59`) - new Date()) / 86400000);
    const dueText = days < 0
        ? `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`
        : `Due in ${days} day${days === 1 ? '' : 's'}`;

    banner.className = `account-banner ${overdue ? 'overdue' : ''}`;
    banner.innerHTML = `
        <div>
            <span class="banner-label">Amount Due</span>
            <span class="banner-amount">${formatCurrency(total)}</span>
        </div>
        <div class="banner-note">
            <span class="bill-status ${overdue ? 'overdue' : 'due'}">${dueText}</span>
            <span>Next due date: ${formatDate(next.dueDate)}</span>
            ${settings.autopay ? '<span>Auto-Pay is on</span>' : ''}
        </div>
        <button class="btn btn-primary" onclick="openPayModal()">Pay Now</button>`;
}

function openPayModal(billIds) {
    const ids = billIds || currentBills.filter(b => !b.isPaid).map(b => b.billId);
    if (ids.length === 0) return;
    payBillIds = ids;

    const selected = currentBills.filter(b => ids.includes(b.billId));
    const total = selected.reduce((sum, b) => sum + b.amountDue, 0);
    document.getElementById('pay-bill-summary').innerHTML = selected.map(b => `
        <div class="info-row"><span class="info-label">${b.billingPeriod}</span>
        <span class="info-value">${formatCurrency(b.amountDue)}</span></div>`).join('');
    document.getElementById('pay-total').textContent = `Total: ${formatCurrency(total)}`;
    document.getElementById('pay-method').innerHTML = paymentMethods[currentUser.accountId].map(m =>
        `<option value="${m.id}">${m.type} ending ${m.last4}</option>`).join('');

    document.getElementById('pay-result').innerHTML = '';
    document.getElementById('pay-form-area').classList.remove('hidden');
    document.getElementById('pay-bill-summary').classList.remove('hidden');
    document.getElementById('pay-confirm').classList.remove('hidden');
    document.getElementById('pay-cancel').textContent = 'Cancel';
    document.getElementById('pay-modal').classList.remove('hidden');
}

function closePayModal() {
    document.getElementById('pay-modal').classList.add('hidden');
    payBillIds = [];
}

function handlePayConfirm() {
    const accountId = currentUser.accountId;
    const method = paymentMethods[accountId].find(m => m.id === document.getElementById('pay-method').value);
    const today = new Date().toISOString().slice(0, 10);
    const paidBills = currentBills.filter(b => payBillIds.includes(b.billId));
    const confirmation = `CNF${Date.now().toString().slice(-9)}`;

    paidBills.forEach(bill => {
        bill.isPaid = true;
        payments[accountId].unshift({
            paymentId: `PAY-${bill.billId.slice(4)}`,
            billId: bill.billId,
            billingPeriod: bill.billingPeriod,
            date: today,
            amount: bill.amountDue,
            method: `${method.type} ending ${method.last4}`,
            confirmation,
            status: 'Completed'
        });
    });

    const total = paidBills.reduce((sum, b) => sum + b.amountDue, 0);
    notifications[accountId].unshift({
        id: `N${Date.now()}`,
        title: 'Payment received',
        message: `We received your payment of ${formatCurrency(total)}.`,
        date: today,
        read: false
    });

    document.getElementById('pay-form-area').classList.add('hidden');
    document.getElementById('pay-bill-summary').classList.add('hidden');
    document.getElementById('pay-confirm').classList.add('hidden');
    document.getElementById('pay-cancel').textContent = 'Close';
    document.getElementById('pay-result').innerHTML = `
        <p class="save-message success">Payment of ${formatCurrency(total)} successful.<br>Confirmation #: ${confirmation}</p>`;

    renderBillsList();
    renderBanner();
    renderPayments();
    renderNotifications();
    if (currentBillDetail) showBillDetail(currentBillDetail.billId);
}

function renderPayments() {
    const list = payments[currentUser.accountId] || [];
    const container = document.getElementById('payments-list');
    if (list.length === 0) {
        container.innerHTML = '<p class="loading">No payments found.</p>';
        return;
    }
    container.innerHTML = `
        <table class="data-table">
            <thead><tr><th>Date</th><th>Bill</th><th>Method</th><th>Confirmation</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>${list.map(p => `
                <tr>
                    <td>${formatDate(p.date)}</td>
                    <td>${p.billingPeriod}</td>
                    <td>${p.method}</td>
                    <td>${p.confirmation}</td>
                    <td>${formatCurrency(p.amount)}</td>
                    <td><span class="bill-status paid">${p.status}</span></td>
                </tr>`).join('')}
            </tbody>
        </table>`;
}

// ===== Service Tab =====
function renderService() {
    const accountId = currentUser.accountId;

    const areaOutages = outages.filter(o => o.area === currentAccount.city);
    document.getElementById('outage-list').innerHTML = areaOutages.length === 0
        ? '<p class="help-text">No outages reported in your area.</p>'
        : areaOutages.map(o => `
            <div class="list-row">
                <div>
                    <strong>${o.type} outage</strong>
                    <div class="bill-dates">${o.start} - ${o.end.slice(-5)} &middot; ${o.customersAffected.toLocaleString()} customers</div>
                    <div class="bill-dates">${o.description}</div>
                </div>
                <span class="bill-status ${o.status === 'Restored' ? 'paid' : 'due'}">${o.status}</span>
            </div>`).join('');

    const requests = serviceRequests[accountId] || [];
    document.getElementById('request-list').innerHTML = requests.length === 0
        ? '<p class="help-text">No service requests.</p>'
        : requests.map(r => `
            <div class="list-row">
                <div>
                    <strong>${r.type}</strong> <span class="bill-dates">${r.id} &middot; ${formatDate(r.date)}</span>
                    <div class="bill-dates">${r.description}</div>
                </div>
                <span class="bill-status ${r.status === 'Resolved' ? 'paid' : 'due'}">${r.status}</span>
            </div>`).join('');

    document.getElementById('tips-list').innerHTML = energyTips.map(t => `
        <div class="tip-card"><h4>${t.title}</h4><p>${t.text}</p></div>`).join('');
}

function handleRequestSubmit(e) {
    e.preventDefault();
    const accountId = currentUser.accountId;
    const type = document.getElementById('request-type').value;
    const description = document.getElementById('request-description').value.trim();
    const id = `SR-${1100 + serviceRequests[accountId].length + 1}`;
    const today = new Date().toISOString().slice(0, 10);

    serviceRequests[accountId].unshift({ id, type, description, date: today, status: 'Submitted' });
    notifications[accountId].unshift({
        id: `N${Date.now()}`,
        title: 'Request submitted',
        message: `${type} request ${id} was received.`,
        date: today,
        read: false
    });

    e.target.reset();
    renderService();
    renderNotifications();

    const statusEl = document.getElementById('request-status');
    statusEl.textContent = `Request ${id} submitted.`;
    statusEl.className = 'save-message success';
    setTimeout(() => { statusEl.textContent = ''; }, 4000);
}

// ===== Notifications =====
function renderNotifications() {
    const list = notifications[currentUser.accountId] || [];
    const unread = list.filter(n => !n.read).length;
    const badge = document.getElementById('notif-count');
    badge.textContent = unread;
    badge.classList.toggle('hidden', unread === 0);

    document.getElementById('notif-panel').innerHTML = list.length === 0
        ? '<p class="help-text">No notifications.</p>'
        : list.map(n => `
            <div class="notif-item ${n.read ? '' : 'unread'}">
                <strong>${n.title}</strong>
                <span>${n.message}</span>
                <small>${formatDate(n.date)}</small>
            </div>`).join('');
}

function toggleNotifications() {
    const panel = document.getElementById('notif-panel');
    const opening = panel.classList.contains('hidden');
    panel.classList.toggle('hidden');
    if (opening) {
        // Keep unread highlighting visible for this view, then clear the badge.
        const list = notifications[currentUser.accountId];
        list.forEach(n => { n.read = true; });
        const badge = document.getElementById('notif-count');
        badge.classList.add('hidden');
    }
}

// ===== Utility Functions =====
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function destroyCharts() {
    if (dailyUsageChart) {
        dailyUsageChart.destroy();
        dailyUsageChart = null;
    }
    if (usageHistoryChart) {
        usageHistoryChart.destroy();
        usageHistoryChart = null;
    }
    if (costHistoryChart) {
        costHistoryChart.destroy();
        costHistoryChart = null;
    }
}
