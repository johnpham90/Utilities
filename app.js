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
    
    // ===== STATEMENT DATA =====
    const settings = accountSettings[currentUser.accountId];
    const website = 'www.springfieldelectric.com';
    const remitAddress = ['P.O. Box 12345', `${companyInfo.city}, ${companyInfo.state} ${companyInfo.zip}`];
    const idx = currentBills.indexOf(bill);
    const prevBill = currentBills[idx + 1];
    const history = currentBills.slice(idx, idx + 13).reverse();
    const avgUsage = Math.round(history.reduce((sum, b) => sum + b.usageKwh, 0) / history.length);
    const previousBalance = prevBill ? prevBill.amountDue : 0;
    const paymentReceived = prevBill && prevBill.isPaid ? prevBill.amountDue : 0;
    const balanceForward = previousBalance - paymentReceived;
    const totalDue = balanceForward + bill.amountDue;
    const invoiceNumber = `INV-${bill.billId.replace(/\D/g, '')}`;
    const daysInPeriod = Math.round((new Date(bill.endDate) - new Date(bill.startDate)) / 86400000) + 1;
    const avgCents = (bill.amountDue / bill.usageKwh * 100).toFixed(1);

    // ===== DRAWING HELPERS =====
    const lightBlue = [207, 226, 243];
    const setText = (size, style = 'normal', gray = 0) => {
        doc.setFontSize(size);
        doc.setFont('helvetica', style);
        doc.setTextColor(gray, gray, gray);
    };
    const sectionHeader = (title, x, y, w, h = 7, size = 10) => {
        doc.setFillColor(...lightBlue);
        doc.rect(x, y, w, h, 'F');
        setText(size, 'bold');
        doc.text(title, x + 3, y + h / 2 + size * 0.12);
    };
    const row = (label, value, x, y, w, style = 'normal') => {
        setText(9, style);
        doc.text(label, x + 3, y);
        doc.text(value, x + w - 3, y, { align: 'right' });
    };
    // Returns the baseline y just below the wrapped text
    const paragraph = (text, x, y, w, size = 9, style = 'normal', gray = 0) => {
        setText(size, style, gray);
        const lines = doc.splitTextToSize(text, w);
        doc.text(lines, x, y);
        return y + lines.length * size * 0.41;
    };
    const boxBorder = (x, y, w, h) => {
        doc.setDrawColor(190, 210, 230);
        doc.setLineWidth(0.3);
        doc.rect(x, y, w, h, 'S');
    };
    const dashedLine = (y) => {
        doc.setDrawColor(120, 120, 120);
        doc.setLineWidth(0.3);
        doc.setLineDashPattern([2, 2], 0);
        doc.line(0, y, pageWidth, y);
        doc.setLineDashPattern([], 0);
    };

    const colLeftW = 90;
    const colRightX = 112;
    const colRightW = rightMargin - colRightX;

    // ===== YOUR BILL AT A GLANCE =====
    let y = 42;
    sectionHeader('Your Bill at a Glance', leftMargin, y, colLeftW, 8, 11);
    [
        ['Statement Date:', formatDate(bill.endDate)],
        ['Due Date:', formatDate(bill.dueDate)],
        ['Customer Name:', account.name],
        ['Account Number:', account.accountNumber],
        ['Invoice Number:', invoiceNumber]
    ].forEach(([label, value], i) => {
        const ly = y + 14 + i * 5.5 + (i >= 2 ? 3 : 0);
        setText(9, 'bold');
        doc.text(label, leftMargin + 3, ly);
        setText(9);
        doc.text(value, leftMargin + 33, ly);
    });
    boxBorder(leftMargin, y, colLeftW, 42);

    // ===== THANK YOU + AMOUNT DUE =====
    setText(15, 'bold', 40);
    doc.text('Thank you, valued customer!', colRightX, y + 6);
    paragraph(`We appreciate the opportunity to power your home. Since 1952, ${companyInfo.name} has proudly served our neighbors with safe, reliable, and affordable energy.`,
        colRightX, y + 13, colRightW, 8.5);

    setText(9, 'normal', 100);
    doc.text('AMOUNT DUE', colRightX, y + 32);
    setText(24, 'bold');
    doc.text(formatCurrency(totalDue), colRightX, y + 42);
    setText(10);
    doc.text(bill.isPaid ? 'PAID - Thank you!' : `Due: ${formatDate(bill.dueDate)}`, rightMargin, y + 42, { align: 'right' });

    // ===== BILLING SUMMARY =====
    y = 94;
    sectionHeader('Billing Summary', leftMargin, y, colLeftW);
    [
        ['Previous Balance', formatCurrency(previousBalance)],
        ['Payment Received - Thank You', paymentReceived ? `${formatCurrency(paymentReceived)} CR` : formatCurrency(0)],
        ['Balance Forward', formatCurrency(balanceForward)],
        ['Total Current Charges', formatCurrency(bill.amountDue)]
    ].forEach(([label, value], i) => row(label, value, leftMargin + 4, y + 12 + i * 5, colLeftW - 4));
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(leftMargin + 68, y + 18, leftMargin + colLeftW - 3, y + 18);
    doc.line(leftMargin + 68, y + 28, leftMargin + colLeftW - 3, y + 28);
    doc.setFillColor(...lightBlue);
    doc.rect(leftMargin, y + 30, colLeftW, 7, 'F');
    row('Total Amount Due', formatCurrency(totalDue), leftMargin, y + 34.8, colLeftW, 'bold');

    // ===== USAGE HISTORY CHART =====
    setText(10, 'bold');
    doc.text(`${history.length}-Month Electric (kWh) Usage History`, leftMargin + colLeftW / 2, y + 46, { align: 'center' });

    const chartX = leftMargin + 14;
    const chartW = colLeftW - 20;
    const chartTop = y + 51;
    const chartBottom = y + 86;
    const chartH = chartBottom - chartTop;
    const rawStep = Math.max(...history.map(b => b.usageKwh)) / 5;
    const magnitude = 10 ** Math.floor(Math.log10(rawStep));
    const step = [1, 2, 2.5, 5, 10].map(m => m * magnitude).find(s => s >= rawStep);
    const axisMax = step * 5;

    setText(6, 'normal', 80);
    for (let i = 0; i <= 5; i++) {
        doc.text((step * i).toLocaleString(), chartX - 2, chartBottom - (chartH * i) / 5 + 1, { align: 'right' });
    }
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(chartX, chartTop, chartX, chartBottom);
    doc.line(chartX, chartBottom, chartX + chartW, chartBottom);

    const slot = chartW / history.length;
    history.forEach((b, i) => {
        const barH = (b.usageKwh / axisMax) * chartH;
        const barX = chartX + i * slot + slot * 0.2;
        if (b === bill) doc.setFillColor(30, 64, 175);
        else doc.setFillColor(128, 128, 115);
        doc.rect(barX, chartBottom - barH, slot * 0.6, barH, 'F');
        setText(6, 'normal', 80);
        doc.text(b.billingPeriod.slice(0, 3).toUpperCase(), barX + slot * 0.3, chartBottom + 4, { align: 'center' });
    });

    // ===== USAGE PER MONTH =====
    setText(10, 'bold');
    doc.text('Usage Per Month', leftMargin + colLeftW / 2, y + 95, { align: 'center' });
    [
        [prevBill ? `${prevBill.usageKwh.toLocaleString()} kWh` : 'N/A', 'Last Month'],
        [`${bill.usageKwh.toLocaleString()} kWh`, 'This Month'],
        [`${avgUsage.toLocaleString()} kWh`, 'Monthly Average']
    ].forEach(([value, label], i) => {
        const cx = leftMargin + 15 + i * 30;
        setText(12, 'bold');
        doc.text(value, cx, y + 102, { align: 'center' });
        setText(7, 'bold', 60);
        doc.text(label, cx, y + 106.5, { align: 'center' });
    });
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.4);
    doc.line(leftMargin + 30, y + 98, leftMargin + 30, y + 108);
    doc.line(leftMargin + 60, y + 98, leftMargin + 60, y + 108);
    boxBorder(leftMargin, y, colLeftW, 112);

    // ===== CUSTOMER COMMUNICATIONS =====
    sectionHeader('Customer Communications', colRightX, y, colRightW);
    const messages = [];
    const planned = outages.find(o => o.area === account.city && o.status === 'Scheduled');
    if (planned) {
        messages.push(['Planned Maintenance in Your Area',
            `${planned.description} Service may be interrupted on ${planned.start} until ${planned.end.slice(-5)}. Our crews will restore power as quickly and safely as possible.`]);
    }
    messages.push(['Ways to Save This Season',
        `${energyTips[3].text} ${energyTips[2].text} Visit ${website} to learn more.`]);
    if (!settings.paperless) {
        messages.push(['Go Paperless', 'Get your statement faster and help the environment. Enroll in paperless billing in the customer portal.']);
    }
    let cy = y + 13;
    messages.forEach(([title, text]) => {
        if (cy > y + 44) return;
        setText(9, 'bold');
        doc.text(title, colRightX + 3, cy);
        cy = paragraph(text, colRightX + 3, cy + 4.5, colRightW - 6, 8.5) + 2.5;
    });
    boxBorder(colRightX, y, colRightW, 56);

    // ===== CONTACT INFO =====
    const cbY = y + 62;
    doc.setFillColor(241, 243, 245);
    doc.rect(colRightX, cbY, colRightW, 50, 'F');
    setText(9);
    doc.text([companyInfo.name, ...remitAddress], colRightX + 4, cbY + 7);
    setText(8.5, 'bold');
    const outageLines = doc.splitTextToSize('Power Outages or Emergencies:', 34);
    doc.text(outageLines, colRightX + 46, cbY + 7);
    setText(8.5);
    doc.text(companyInfo.emergencyLine, colRightX + 46, cbY + 7 + outageLines.length * 3.6);

    setText(9, 'bold');
    doc.text('Questions?', colRightX + 4, cbY + 25);
    setText(8);
    [
        `Web: ${website}`,
        `Email: ${companyInfo.email}`,
        `Phone: ${companyInfo.phone}`,
        `Hours: ${companyInfo.hours}`
    ].forEach((line, i) => doc.text(line, colRightX + 4, cbY + 30 + i * 4.2));
    setText(7, 'italic', 80);
    doc.text(companyInfo.tagline, colRightX + 4, cbY + 47.5);

    // ===== FOOTER NOTE =====
    setText(9);
    doc.text(`For more information about your electric service, please visit ${website}.`, pageWidth / 2, 213, { align: 'center' });

    // ===== PAYMENT STUB (Bottom) =====
    dashedLine(217);
    setText(7, 'normal', 110);
    doc.text(`Detach here and return with your check made payable to ${companyInfo.name}. Please write your account number on the memo line.`,
        pageWidth / 2, 221, { align: 'center' });

    y = 230;
    setText(12, 'bold');
    doc.text(companyInfo.name, leftMargin, y + 2);
    setText(9);
    doc.text(remitAddress, leftMargin, y + 7);

    [
        ['Account Number:', account.accountNumber, 128],
        ['Due Date:', formatDate(bill.dueDate), 160],
        ['Amount Due:', formatCurrency(totalDue), 184]
    ].forEach(([label, value, cx]) => {
        setText(9, 'bold');
        doc.text(label, cx, y, { align: 'center' });
        setText(10);
        doc.text(value, cx, y + 6, { align: 'center' });
    });

    doc.setFillColor(...lightBlue);
    doc.rect(110, y + 10, 85, 6, 'F');
    setText(8, 'bold');
    doc.text(settings.autopay ? 'AutoPay draft date: on the due date' : `Enroll in AutoPay at ${website}`, 152.5, y + 14, { align: 'center' });
    setText(9);
    doc.text('Amount Enclosed:  $____________', 152.5, y + 24, { align: 'center' });

    setText(9);
    doc.text([
        account.name.toUpperCase(),
        account.serviceAddress.toUpperCase(),
        `${account.city.toUpperCase()} ${account.state} ${account.zip}`
    ], leftMargin + 5, y + 36);
    doc.text([companyInfo.name.toUpperCase(), ...remitAddress.map(line => line.toUpperCase())], 120, y + 36);

    doc.setFont('courier', 'normal');
    doc.setFontSize(11);
    doc.text(`${account.accountNumber.replace(/\D/g, '')}${bill.dueDate.replace(/-/g, '')}${String(Math.round(totalDue * 100)).padStart(10, '0')}`,
        rightMargin, 284, { align: 'right' });

    setText(7, 'normal', 110);
    doc.text('Page 1 of 2', rightMargin, 292, { align: 'right' });

    // ===== PAGE 2 =====
    doc.addPage();
    setText(8, 'normal', 90);
    doc.text(`${companyInfo.name}  |  Account ${account.accountNumber}  |  ${bill.billingPeriod}`, leftMargin, 12);
    doc.text('Page 2 of 2', rightMargin, 12, { align: 'right' });

    const p2RightX = 110;
    const p2RightW = rightMargin - p2RightX;

    // ===== SERVICE LOCATION DETAILS =====
    y = 22;
    sectionHeader('Service Location Details', leftMargin, y, colLeftW, 10, 13);
    row('Account Number', account.accountNumber, leftMargin, y + 16, colLeftW);
    row('Service Address', account.serviceAddress, leftMargin, y + 21.5, colLeftW);
    row('', `${account.city}, ${account.state} ${account.zip}`, leftMargin, y + 26, colLeftW);
    row('Rate Type', account.rateType, leftMargin, y + 31.5, colLeftW);
    row('Customer Since', formatDate(account.serviceStartDate), leftMargin, y + 37, colLeftW);
    boxBorder(leftMargin, y, colLeftW, 41);

    // ===== METER DETAILS =====
    y = 67;
    sectionHeader('Meter Details', leftMargin, y, colLeftW, 8, 10);
    [
        ['Meter Number', account.meterNumber],
        ['Service Period', `${formatDate(bill.startDate)} - ${formatDate(bill.endDate)}`],
        ['Read Type', 'Actual'],
        ['Previous Meter Read', bill.previousReading.toLocaleString()],
        ['Current Meter Read', bill.currentReading.toLocaleString()],
        ['Days in Service Period', String(daysInPeriod)],
        ['Average Daily Usage', `${(bill.usageKwh / daysInPeriod).toFixed(1)} kWh`]
    ].forEach(([label, value], i) => row(label, value, leftMargin, y + 13 + i * 5.5, colLeftW));
    row('kWh Usage', bill.usageKwh.toLocaleString(), leftMargin, y + 13 + 7 * 5.5, colLeftW, 'bold');
    boxBorder(leftMargin, y, colLeftW, 56);

    // ===== CURRENT CHARGE DETAILS =====
    y = 22;
    const energyItems = bill.lineItems.slice(0, 2);
    const feeItems = bill.lineItems.slice(2);
    sectionHeader('Current Charge Details', p2RightX, y, p2RightW, 10, 13);
    setText(9);
    doc.text(`Product: ${account.rateType} Standard Service`, p2RightX + 3, y + 16);
    energyItems.forEach((item, i) => row(item.description, formatCurrency(item.amount), p2RightX, y + 21.5 + i * 5.5, p2RightW));
    boxBorder(p2RightX, y, p2RightW, 31);

    y = 58;
    sectionHeader('Taxes and Other Fees', p2RightX, y, p2RightW, 8, 10);
    feeItems.forEach((item, i) => row(item.description, formatCurrency(item.amount), p2RightX, y + 13 + i * 5, p2RightW));
    const totalBarY = y + 11 + feeItems.length * 5;
    doc.setFillColor(...lightBlue);
    doc.rect(p2RightX, totalBarY, p2RightW, 8, 'F');
    setText(10, 'bold');
    doc.text('Total Current Charges', p2RightX + 3, totalBarY + 5.5);
    doc.text(formatCurrency(bill.amountDue), rightMargin - 3, totalBarY + 5.5, { align: 'right' });
    boxBorder(p2RightX, y, p2RightW, totalBarY + 8 - y);

    let ny = paragraph(`The average price you paid for electric service this month was ${avgCents} cents / kWh.`, p2RightX, totalBarY + 13, p2RightW, 8.5);
    paragraph(settings.autopay
        ? 'AutoPay is active on your account. No action is needed; your payment will be drafted on the due date.'
        : 'Never miss a due date. Enroll in AutoPay through the customer portal.',
    p2RightX, ny, p2RightW, 8.5, 'bold');

    // ===== UNDERSTANDING YOUR BILL =====
    y = 135;
    setText(12, 'bold');
    doc.text('Understanding Your Bill', leftMargin, y);
    y += 6;
    [
        ['Customer Charge', 'A fixed monthly amount that covers the cost of meter reading, billing, and maintaining service to your home, regardless of how much energy you use.'],
        ['Energy Charge', 'The cost of the electricity you used during the billing period, calculated by multiplying your kWh usage by the current rate.'],
        ['Regulatory Assessment Fee', 'A fee collected on behalf of state regulators to fund utility oversight and consumer protection programs.'],
        ['Franchise Fee & Taxes', 'Amounts collected for local municipalities and state taxing authorities. These are passed through to you without markup.']
    ].forEach(([term, text]) => {
        setText(9, 'bold');
        doc.text(term, leftMargin, y);
        y = paragraph(text, leftMargin + 48, y, rightMargin - leftMargin - 48, 8.5) + 1.5;
    });

    // ===== ADDITIONAL INFORMATION =====
    y += 5;
    setText(10, 'bolditalic');
    doc.text('Additional Information', leftMargin, y);
    y = paragraph(`Your satisfaction is our top priority. Do you have feedback? Email us at ${companyInfo.email} or write to us at ${companyInfo.name} Customer Feedback, ${remitAddress.join(', ')}. The amount billed may include rate changes approved by regulatory authorities. See an unauthorized charge on your bill? Call us toll-free at ${companyInfo.phone} (${companyInfo.hours}) and we will work to resolve any issue.`,
        leftMargin, y + 4.5, rightMargin - leftMargin, 7.5, 'bold');
    paragraph('If you are not satisfied with the resolution, you may file a complaint with your state public utility commission. Hearing and speech-impaired customers may contact us through the 711 relay service.',
        leftMargin, y, rightMargin - leftMargin, 7.5);

    dashedLine(212);

    // ===== ENERGY ASSISTANCE =====
    y = 224;
    setText(12, 'bold');
    doc.text('Need Help Paying Your Bill?', leftMargin, y);
    ny = paragraph('Assistance may be available for eligible customers through the Low Income Home Energy Assistance Program (LIHEAP), local community action agencies, and our Neighbor-to-Neighbor fund.',
        leftMargin, y + 6, 80, 8.5);
    ny = paragraph(`${energyTips[0].title}: ${energyTips[0].text}`, leftMargin, ny + 2, 80, 8.5);
    paragraph(`Call ${companyInfo.phone} to learn about payment arrangements.`, leftMargin, ny + 2, 80, 8.5, 'bold');

    // ===== WAYS TO PAY =====
    y = 224;
    setText(12, 'bold');
    doc.text('Ways to Pay Your Bill', p2RightX, y);
    [
        ['AutoPay', 'Log in to the customer portal and sign up for automatic payments.'],
        ['Online', `${website}/pay`],
        ['Phone', `${companyInfo.phone} (${companyInfo.hours})`],
        ['Mail', `${companyInfo.name}, ${remitAddress.join(', ')}`],
        ['In Person', `Visit an authorized payment location. Find one at ${website}/locations`]
    ].forEach(([title, text], i) => {
        const iy = y + 7 + i * 10;
        doc.setFillColor(30, 64, 175);
        doc.circle(p2RightX + 2, iy - 1, 1.5, 'F');
        setText(9, 'bold');
        doc.text(title, p2RightX + 6, iy);
        paragraph(text, p2RightX + 6, iy + 3.8, p2RightW - 6, 7.5, 'normal', 60);
    });

    setText(11, 'bold', 90);
    doc.text('Ofrecemos asistencia en español.', p2RightX, 289);

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
