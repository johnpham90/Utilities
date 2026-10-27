// Mock Data for Utility Company App

// Sample Users (for authentication)
const users = [
    { username: 'johndoe', password: 'password123', accountId: 'ACC001' },
    { username: 'janesmith', password: 'utility2024', accountId: 'ACC002' },
    { username: 'Jpham131', password: 'demo', accountId: 'ACC001' }
];

// Account Information
const accounts = {
    'ACC001': {
        accountId: 'ACC001',
        accountNumber: '4521-8834-7712',
        name: 'John Pham',
        email: 'ja.pham131@gmail.com',
        phone: '(832) 213-7682',
        serviceAddress: '2417 Pine Ridge Road',
        city: 'Chipley',
        state: 'FL',
        zip: '32428',
        meterNumber: 'MTR-88421',
        rateType: 'Residential',
        serviceStartDate: '2019-03-15',
        secondaryName: 'Amanda Pham',
        secondaryEmail: 'amanda_orvis@yahoo.com',
        secondaryPhone: '(989) 493-3544'
    },
    'ACC002': {
        accountId: 'ACC002',
        accountNumber: '4521-9921-3345',
        name: 'Jane Smith',
        email: 'janesmith@email.com',
        phone: '(555) 987-6543',
        serviceAddress: '5678 Maple Avenue',
        city: 'Springfield',
        state: 'IL',
        zip: '62702',
        meterNumber: 'MTR-77239',
        rateType: 'Residential',
        serviceStartDate: '2020-08-22',
        secondaryName: '',
        secondaryEmail: '',
        secondaryPhone: ''
    }
};

// Utility Bills (8 months of data)
const bills = {
    'ACC001': [
        {
            billId: 'BILL001-0000',
            billingPeriod: 'October 2026',
            startDate: '2026-10-01',
            endDate: '2026-10-31',
            dueDate: '2026-11-20',
            usageKwh: 870,
            previousReading: 47902,
            currentReading: 48772,
            ratePerKwh: 0.12,
            baseCharge: 15.00,
            energyCharge: 104.40,
            taxes: 10.39,
            amountDue: 129.79,
            isPaid: false,
            dailyUsage: [28, 29, 27, 28, 28, 29, 27, 28, 28, 29, 27, 28, 28, 29, 27, 28, 28, 29, 27, 28, 28, 29, 27, 28, 28, 29, 27, 28, 28, 29, 29]
        },
        {
            billId: 'BILL001-000',
            billingPeriod: 'September 2026',
            startDate: '2026-09-01',
            endDate: '2026-09-30',
            dueDate: '2026-10-05',
            usageKwh: 900,
            previousReading: 47002,
            currentReading: 47902,
            ratePerKwh: 0.12,
            baseCharge: 15.00,
            energyCharge: 108.00,
            taxes: 10.70,
            amountDue: 133.70,
            isPaid: true,
            dailyUsage: [32, 30, 28, 35, 29, 31, 33, 27, 30, 30, 29, 31, 28, 30, 32, 29, 30, 28, 31, 30, 29, 30, 31, 28, 29, 30, 32, 29, 30, 24]
        },
        {
            billId: 'BILL001-001',
            billingPeriod: 'August 2026',
            startDate: '2026-08-01',
            endDate: '2026-08-31',
            dueDate: '2026-09-20',
            usageKwh: 880,
            previousReading: 46122,
            currentReading: 47002,
            ratePerKwh: 0.12,
            baseCharge: 15.00,
            energyCharge: 105.60,
            taxes: 10.49,
            amountDue: 131.09,
            isPaid: true,
            dailyUsage: [29, 32, 31, 30, 34, 28, 32, 30, 31, 29, 33, 31, 30, 32, 29, 31, 33, 30, 28, 32, 31, 29, 30, 32, 31, 28, 33, 31, 29, 32, 30]
        },
        {
            billId: 'BILL001-002',
            billingPeriod: 'July 2026',
            startDate: '2026-07-01',
            endDate: '2026-07-31',
            dueDate: '2026-08-20',
            usageKwh: 892,
            previousReading: 45230,
            currentReading: 46122,
            ratePerKwh: 0.12,
            baseCharge: 15.00,
            energyCharge: 107.04,
            taxes: 9.15,
            amountDue: 131.19,
            isPaid: true,
            dailyUsage: [28, 32, 25, 30, 35, 29, 27, 31, 33, 26, 28, 30, 32, 29, 27, 31, 34, 28, 26, 30, 33, 29, 27, 25, 32, 30, 28, 31, 29, 27, 33]
        },
        {
            billId: 'BILL001-003',
            billingPeriod: 'June 2026',
            startDate: '2026-06-01',
            endDate: '2026-06-30',
            dueDate: '2026-07-20',
            usageKwh: 756,
            previousReading: 44474,
            currentReading: 45230,
            ratePerKwh: 0.12,
            baseCharge: 15.00,
            energyCharge: 90.72,
            taxes: 7.93,
            amountDue: 113.65,
            isPaid: true,
            dailyUsage: [24, 26, 22, 28, 25, 23, 27, 24, 26, 25, 28, 24, 22, 26, 25, 27, 23, 28, 24, 26, 25, 27, 23, 24, 26, 28, 25, 24, 27, 26]
        },
        {
            billId: 'BILL001-004',
            billingPeriod: 'May 2026',
            startDate: '2026-05-01',
            endDate: '2026-05-31',
            dueDate: '2026-06-20',
            usageKwh: 645,
            previousReading: 43829,
            currentReading: 44474,
            ratePerKwh: 0.12,
            baseCharge: 15.00,
            energyCharge: 77.40,
            taxes: 6.93,
            amountDue: 99.33,
            isPaid: true,
            dailyUsage: [20, 22, 18, 21, 19, 23, 20, 22, 21, 19, 20, 22, 18, 21, 23, 20, 19, 22, 21, 20, 18, 23, 21, 19, 22, 20, 21, 19, 23, 20, 21]
        },
        {
            billId: 'BILL001-005',
            billingPeriod: 'April 2026',
            startDate: '2026-04-01',
            endDate: '2026-04-30',
            dueDate: '2026-05-20',
            usageKwh: 580,
            previousReading: 43249,
            currentReading: 43829,
            ratePerKwh: 0.12,
            baseCharge: 15.00,
            energyCharge: 69.60,
            taxes: 6.35,
            amountDue: 90.95,
            isPaid: true,
            dailyUsage: [18, 20, 17, 19, 21, 18, 20, 19, 17, 21, 18, 20, 19, 18, 21, 17, 20, 19, 18, 21, 19, 17, 20, 18, 21, 19, 20, 18, 17, 21]
        },
        {
            billId: 'BILL001-006',
            billingPeriod: 'March 2026',
            startDate: '2026-03-01',
            endDate: '2026-03-31',
            dueDate: '2026-04-20',
            usageKwh: 720,
            previousReading: 42529,
            currentReading: 43249,
            ratePerKwh: 0.12,
            baseCharge: 15.00,
            energyCharge: 86.40,
            taxes: 7.61,
            amountDue: 109.01,
            isPaid: true,
            dailyUsage: [22, 24, 21, 23, 25, 22, 24, 23, 21, 25, 22, 24, 23, 22, 25, 21, 24, 23, 22, 25, 23, 21, 24, 22, 25, 23, 24, 22, 21, 25, 23]
        },
        {
            billId: 'BILL001-007',
            billingPeriod: 'February 2026',
            startDate: '2026-02-01',
            endDate: '2026-02-28',
            dueDate: '2026-03-20',
            usageKwh: 815,
            previousReading: 41714,
            currentReading: 42529,
            ratePerKwh: 0.12,
            baseCharge: 15.00,
            energyCharge: 97.80,
            taxes: 8.46,
            amountDue: 121.26,
            isPaid: true,
            dailyUsage: [28, 30, 27, 29, 31, 28, 30, 29, 27, 31, 28, 30, 29, 28, 31, 27, 30, 29, 28, 31, 29, 27, 30, 28, 31, 29, 30, 28]
        }
    ],
    'ACC002': [
        {
            billId: 'BILL002-0000',
            billingPeriod: 'October 2026',
            startDate: '2026-10-01',
            endDate: '2026-10-31',
            dueDate: '2026-11-20',
            usageKwh: 640,
            previousReading: 34208,
            currentReading: 34848,
            ratePerKwh: 0.12,
            baseCharge: 15.00,
            energyCharge: 76.80,
            taxes: 7.34,
            amountDue: 99.14,
            isPaid: false,
            dailyUsage: [21, 20, 21, 20, 21, 20, 21, 20, 21, 20, 21, 20, 21, 20, 21, 20, 21, 20, 21, 20, 21, 20, 21, 20, 21, 20, 21, 20, 22, 21, 23]
        },
        {
            billId: 'BILL002-000',
            billingPeriod: 'September 2026',
            startDate: '2026-09-01',
            endDate: '2026-09-30',
            dueDate: '2026-10-05',
            usageKwh: 660,
            previousReading: 33548,
            currentReading: 34208,
            ratePerKwh: 0.12,
            baseCharge: 15.00,
            energyCharge: 79.20,
            taxes: 7.54,
            amountDue: 101.74,
            isPaid: true,
            dailyUsage: [24, 23, 22, 25, 21, 23, 22, 20, 23, 22, 21, 23, 20, 22, 21, 22, 23, 20, 21, 22, 21, 23, 20, 22, 21, 22, 21, 23, 20, 20]
        },
        {
            billId: 'BILL002-001',
            billingPeriod: 'August 2026',
            startDate: '2026-08-01',
            endDate: '2026-08-31',
            dueDate: '2026-09-20',
            usageKwh: 720,
            previousReading: 32828,
            currentReading: 33548,
            ratePerKwh: 0.12,
            baseCharge: 15.00,
            energyCharge: 86.40,
            taxes: 8.11,
            amountDue: 109.51,
            isPaid: true,
            dailyUsage: [23, 24, 22, 23, 25, 22, 24, 23, 21, 25, 22, 24, 23, 22, 25, 21, 24, 23, 22, 25, 23, 21, 24, 22, 25, 23, 24, 22, 23, 24, 22]
        },
        {
            billId: 'BILL002-002',
            billingPeriod: 'July 2026',
            startDate: '2026-07-01',
            endDate: '2026-07-31',
            dueDate: '2026-08-20',
            usageKwh: 678,
            previousReading: 32150,
            currentReading: 32828,
            ratePerKwh: 0.12,
            baseCharge: 15.00,
            energyCharge: 81.36,
            taxes: 7.23,
            amountDue: 103.59,
            isPaid: true,
            dailyUsage: [21, 23, 20, 22, 24, 21, 23, 22, 20, 24, 21, 23, 22, 21, 24, 20, 23, 22, 21, 24, 22, 20, 23, 21, 24, 22, 23, 21, 20, 24, 22]
        },
        {
            billId: 'BILL002-003',
            billingPeriod: 'June 2026',
            startDate: '2026-06-01',
            endDate: '2026-06-30',
            dueDate: '2026-07-20',
            usageKwh: 612,
            previousReading: 31538,
            currentReading: 32150,
            ratePerKwh: 0.12,
            baseCharge: 15.00,
            energyCharge: 73.44,
            taxes: 6.63,
            amountDue: 95.07,
            isPaid: true,
            dailyUsage: [19, 21, 18, 20, 22, 19, 21, 20, 18, 22, 19, 21, 20, 19, 22, 18, 21, 20, 19, 22, 20, 18, 21, 19, 22, 20, 21, 19, 18, 22]
        },
        {
            billId: 'BILL002-004',
            billingPeriod: 'May 2026',
            startDate: '2026-05-01',
            endDate: '2026-05-31',
            dueDate: '2026-06-20',
            usageKwh: 545,
            previousReading: 30993,
            currentReading: 31538,
            ratePerKwh: 0.12,
            baseCharge: 15.00,
            energyCharge: 65.40,
            taxes: 6.03,
            amountDue: 86.43,
            isPaid: true,
            dailyUsage: [17, 19, 16, 18, 17, 16, 19, 17, 18, 16, 17, 19, 18, 16, 17, 19, 18, 17, 16, 19, 17, 18, 16, 17, 19, 18, 17, 16, 19, 18, 17]
        },
        {
            billId: 'BILL002-005',
            billingPeriod: 'April 2026',
            startDate: '2026-04-01',
            endDate: '2026-04-30',
            dueDate: '2026-05-20',
            usageKwh: 498,
            previousReading: 30495,
            currentReading: 30993,
            ratePerKwh: 0.12,
            baseCharge: 15.00,
            energyCharge: 59.76,
            taxes: 5.61,
            amountDue: 80.37,
            isPaid: true,
            dailyUsage: [16, 17, 15, 17, 16, 15, 18, 16, 17, 15, 16, 18, 17, 15, 16, 18, 17, 16, 15, 18, 16, 17, 15, 16, 18, 17, 16, 15, 18, 17]
        },
        {
            billId: 'BILL002-006',
            billingPeriod: 'March 2026',
            startDate: '2026-03-01',
            endDate: '2026-03-31',
            dueDate: '2026-04-20',
            usageKwh: 589,
            previousReading: 29906,
            currentReading: 30495,
            ratePerKwh: 0.12,
            baseCharge: 15.00,
            energyCharge: 70.68,
            taxes: 6.43,
            amountDue: 92.11,
            isPaid: true,
            dailyUsage: [18, 20, 17, 19, 18, 17, 20, 18, 19, 17, 18, 20, 19, 17, 18, 20, 19, 18, 17, 20, 18, 19, 17, 18, 20, 19, 18, 17, 20, 19, 18]
        },
        {
            billId: 'BILL002-007',
            billingPeriod: 'February 2026',
            startDate: '2026-02-01',
            endDate: '2026-02-28',
            dueDate: '2026-03-20',
            usageKwh: 652,
            previousReading: 29254,
            currentReading: 29906,
            ratePerKwh: 0.12,
            baseCharge: 15.00,
            energyCharge: 78.24,
            taxes: 6.99,
            amountDue: 100.23,
            isPaid: true,
            dailyUsage: [22, 24, 21, 23, 25, 22, 24, 23, 21, 25, 22, 24, 23, 22, 25, 21, 24, 23, 22, 25, 23, 21, 24, 22, 25, 23, 24, 22]
        }
    ]
};

// Itemize each bill; the taxes/fees split sums to bill.taxes so amountDue is unchanged
Object.values(bills).flat().forEach(bill => {
    const cents = n => Math.round(n * 100);
    const taxCents = cents(bill.taxes);
    const regulatory = Math.round(taxCents * 0.20);
    const franchise = Math.round(taxCents * 0.25);
    const grossReceipts = Math.round(taxCents * 0.25);
    const salesTax = taxCents - regulatory - franchise - grossReceipts;
    bill.lineItems = [
        { description: 'Customer Charge', amount: bill.baseCharge },
        { description: `Energy Charge (${bill.usageKwh.toLocaleString()} kWh @ $${bill.ratePerKwh.toFixed(4)}/kWh)`, amount: bill.energyCharge },
        { description: 'Regulatory Assessment Fee', amount: regulatory / 100 },
        { description: 'Municipal Franchise Fee', amount: franchise / 100 },
        { description: 'Gross Receipts Tax', amount: grossReceipts / 100 },
        { description: 'State & Local Sales Tax', amount: salesTax / 100 }
    ];
});

// Saved payment methods and account preferences
const paymentMethods = {
    'ACC001': [
        { id: 'PM1', type: 'Visa', last4: '1405', expiry: '11/27', isDefault: true },
        { id: 'PM2', type: 'Checking', last4: '6021', expiry: '', isDefault: false }
    ],
    'ACC002': [
        { id: 'PM3', type: 'Mastercard', last4: '8832', expiry: '03/28', isDefault: true }
    ]
};

const accountSettings = {
    'ACC001': { autopay: true, paperless: true, emailAlerts: true, smsAlerts: false },
    'ACC002': { autopay: false, paperless: false, emailAlerts: true, smsAlerts: true }
};

// Payment history derived from paid bills
const payments = {};
Object.entries(bills).forEach(([accountId, list]) => {
    const method = paymentMethods[accountId][0];
    payments[accountId] = list.filter(b => b.isPaid).map((b, i) => {
        const paidOn = new Date(b.dueDate + 'T00:00:00Z');
        paidOn.setUTCDate(paidOn.getUTCDate() - 3 - (i % 4));
        return {
            paymentId: `PAY-${b.billId.slice(4)}`,
            billId: b.billId,
            billingPeriod: b.billingPeriod,
            date: paidOn.toISOString().slice(0, 10),
            amount: b.amountDue,
            method: `${method.type} ending ${method.last4}`,
            confirmation: `CNF${b.billId.replace(/\D/g, '')}${Math.round(b.amountDue * 100)}`,
            status: 'Completed'
        };
    });
});

// Outages by service area (matched to account city)
const outages = [
    { id: 'OUT-311', area: 'Chipley', type: 'Planned', status: 'Scheduled', start: '2026-10-28 09:00', end: '2026-10-28 13:00', description: 'Substation maintenance on Pine Ridge Road corridor.', customersAffected: 1200 },
    { id: 'OUT-305', area: 'Chipley', type: 'Unplanned', status: 'Restored', start: '2026-10-14 17:42', end: '2026-10-14 19:10', description: 'Storm-related line fault.', customersAffected: 430 },
    { id: 'OUT-312', area: 'Springfield', type: 'Planned', status: 'Scheduled', start: '2026-10-30 10:00', end: '2026-10-30 14:00', description: 'Transformer upgrade near Maple Avenue.', customersAffected: 650 },
    { id: 'OUT-298', area: 'Springfield', type: 'Unplanned', status: 'Restored', start: '2026-10-09 06:15', end: '2026-10-09 07:30', description: 'Equipment failure on feeder line.', customersAffected: 210 }
];

const serviceRequests = {
    'ACC001': [
        { id: 'SR-1042', type: 'Meter Issue', description: 'Meter display flickering.', date: '2026-10-02', status: 'Resolved' }
    ],
    'ACC002': [
        { id: 'SR-1051', type: 'Billing Dispute', description: 'Question about the gross receipts tax line.', date: '2026-10-15', status: 'In Progress' }
    ]
};

const notifications = {
    'ACC001': [
        { id: 'N1', title: 'October statement available', message: 'Your October 2026 bill is ready to view.', date: '2026-10-22', read: false },
        { id: 'N2', title: 'Planned outage', message: 'Maintenance on Oct 28, 9 AM - 1 PM in your area.', date: '2026-10-20', read: false },
        { id: 'N3', title: 'Payment received', message: 'We received your September payment.', date: '2026-10-02', read: true }
    ],
    'ACC002': [
        { id: 'N4', title: 'October statement available', message: 'Your October 2026 bill is ready to view.', date: '2026-10-22', read: false },
        { id: 'N5', title: 'Planned outage', message: 'Maintenance on Oct 30, 10 AM - 2 PM in your area.', date: '2026-10-21', read: true }
    ]
};

const energyTips = [
    { title: 'Budget Billing', text: 'Spread your costs evenly with a fixed monthly amount based on your yearly average.' },
    { title: 'Time-of-Use Rates', text: 'Run large appliances off-peak (9 PM - 6 AM) to lower your energy charge.' },
    { title: 'Smart Thermostat Rebate', text: 'Get a $75 rebate when you install an eligible smart thermostat.' },
    { title: 'Seal and Insulate', text: 'Sealing air leaks can cut heating and cooling costs by up to 15%.' }
];

// Company Information
const companyInfo = {
    name: 'Springfield Electric Utility',
    tagline: 'Powering Your Community Since 1952',
    address: '100 Energy Plaza',
    city: 'Springfield',
    state: 'IL',
    zip: '62701',
    phone: '1-800-555-POWER',
    email: 'support@springfieldelectric.com',
    hours: 'Monday - Friday: 8:00 AM - 6:00 PM',
    emergencyLine: '1-800-555-HELP (24/7)'
};
