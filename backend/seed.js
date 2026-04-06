const mongoose = require('mongoose');
const User = require('./models/User');
const Record = require('./models/Record');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/finance', {});
    
    // Find an Admin user
    let adminUser = await User.findOne({ role: 'Admin' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'adminpassword123',
        role: 'Admin',
        budget: 5000
      });
      console.log('Created missing Admin user.');
    }

    const userId = adminUser._id;

    const records = [
      { user: userId, amount: 5000, currency: '$', type: 'Income', category: 'Salary', date: new Date('2026-01-10'), notes: 'Jan Salary' },
      { user: userId, amount: 800, currency: '$', type: 'Expense', category: 'Rent', date: new Date('2026-01-15'), notes: 'Jan Rent' },
      { user: userId, amount: 120, currency: '$', type: 'Expense', category: 'Food', date: new Date('2026-01-20'), notes: 'Groceries' },
      
      { user: userId, amount: 5000, currency: '$', type: 'Income', category: 'Salary', date: new Date('2026-02-10'), notes: 'Feb Salary' },
      { user: userId, amount: 200, currency: '$', type: 'Income', category: 'Other', date: new Date('2026-02-12'), notes: 'Freelance work' },
      { user: userId, amount: 850, currency: '$', type: 'Expense', category: 'Rent', date: new Date('2026-02-15'), notes: 'Feb Rent' },
      { user: userId, amount: 150, currency: '$', type: 'Expense', category: 'Food', date: new Date('2026-02-18'), notes: 'Dinner out' },
      
      { user: userId, amount: 5000, currency: '$', type: 'Income', category: 'Salary', date: new Date('2026-03-10'), notes: 'Mar Salary' },
      { user: userId, amount: 850, currency: '$', type: 'Expense', category: 'Rent', date: new Date('2026-03-15'), notes: 'Mar Rent' },
      { user: userId, amount: 300, currency: '$', type: 'Expense', category: 'Utilities', date: new Date('2026-03-25'), notes: 'Internet and Electricity' }
    ];

    await Record.insertMany(records);
    console.log('Successfully inserted 10 records for data visualization!');
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
