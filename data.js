// Mock Data for Utility Company App

// Sample Users (for authentication)
const users = [
    { username: 'johndoe', password: 'password123', accountId: 'ACC001' },
    { username: 'janesmith', password: 'utility2024', accountId: 'ACC002' },
    { username: 'demo', password: 'demo', accountId: 'ACC001' }
];

// Account Information
const accounts = {
    'ACC001': {
        accountId: 'ACC001',
        accountNumber: '4521-8834-7712',
        name: 'John & Amanda Pham',
        email: 'ja.pham131@gmail.com',
        phone: '(832) 213-7682',
        serviceAddress: '1234 Oak Street',
        city: 'Orlando',
        state: 'FL',
        zip: '62701',
        meterNumber: 'MTR-88421',
        rateType: 'Residential',
        serviceStartDate: '2019-03-15'
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
        serviceStartDate: '2020-08-22'
    }
};

// Utility Bills (6 months of data)
const bills = {
    'ACC001': [
        {
            billId: 'BILL001-001',
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
            isPaid: false,
            dailyUsage: [28, 32, 25, 30, 35, 29, 27, 31, 33, 26, 28, 30, 32, 29, 27, 31, 34, 28, 26, 30, 33, 29, 27, 25, 32, 30, 28, 31, 29, 27, 33]
        },
        {
            billId: 'BILL001-002',
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
            billId: 'BILL001-003',
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
            billId: 'BILL001-004',
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
            billId: 'BILL001-005',
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
            billId: 'BILL001-006',
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
            billId: 'BILL002-001',
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
            isPaid: false,
            dailyUsage: [21, 23, 20, 22, 24, 21, 23, 22, 20, 24, 21, 23, 22, 21, 24, 20, 23, 22, 21, 24, 22, 20, 23, 21, 24, 22, 23, 21, 20, 24, 22]
        },
        {
            billId: 'BILL002-002',
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
            billId: 'BILL002-003',
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
            billId: 'BILL002-004',
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
            billId: 'BILL002-005',
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
            billId: 'BILL002-006',
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
