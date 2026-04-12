const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

const seedData = async () => {
  try {
    // Find or create an Admin user
    let adminUser = await prisma.user.findFirst({ where: { role: 'Admin' } });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('adminpassword123', 10);
      adminUser = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@example.com',
          password: hashedPassword,
          role: 'Admin',
          budget: 5000,
        },
      });
      console.log('Created missing Admin user.');
    }

    const userId = adminUser.id;

    const records = [
      { userId, amount: 5000, currency: '$', type: 'Income', category: 'Salary', date: new Date('2026-01-10'), notes: 'Jan Salary' },
      { userId, amount: 800,  currency: '$', type: 'Expense', category: 'Rent',   date: new Date('2026-01-15'), notes: 'Jan Rent' },
      { userId, amount: 120,  currency: '$', type: 'Expense', category: 'Food',   date: new Date('2026-01-20'), notes: 'Groceries' },

      { userId, amount: 5000, currency: '$', type: 'Income',  category: 'Salary', date: new Date('2026-02-10'), notes: 'Feb Salary' },
      { userId, amount: 200,  currency: '$', type: 'Income',  category: 'Other',  date: new Date('2026-02-12'), notes: 'Freelance work' },
      { userId, amount: 850,  currency: '$', type: 'Expense', category: 'Rent',   date: new Date('2026-02-15'), notes: 'Feb Rent' },
      { userId, amount: 150,  currency: '$', type: 'Expense', category: 'Food',   date: new Date('2026-02-18'), notes: 'Dinner out' },

      { userId, amount: 5000, currency: '$', type: 'Income',  category: 'Salary',    date: new Date('2026-03-10'), notes: 'Mar Salary' },
      { userId, amount: 850,  currency: '$', type: 'Expense', category: 'Rent',      date: new Date('2026-03-15'), notes: 'Mar Rent' },
      { userId, amount: 300,  currency: '$', type: 'Expense', category: 'Utilities', date: new Date('2026-03-25'), notes: 'Internet and Electricity' },
    ];

    await prisma.record.createMany({ data: records });
    console.log('Successfully inserted 10 records for data visualization!');

    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
};

seedData();
