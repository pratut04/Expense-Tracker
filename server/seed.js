require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';

const demoUsers = [
  {
    name: 'Alice Demo',
    email: 'alice@demo.com',
    password: 'demo123',
    isDemo: true,
  },
  {
    name: 'Bob Demo',
    email: 'bob@demo.com',
    password: 'demo123',
    isDemo: true,
  },
];

const generateTransactions = (userId) => {
  const today = new Date();
  const fmt = (d) => d.toISOString().split('T')[0];
  const ago = (days) => { const d = new Date(today); d.setDate(d.getDate() - days); return fmt(d); };

  return [
    { user_id: userId, type: 'income', amount: 55000, category: 'Salary', description: 'Monthly salary - June', payment_method: 'bank_transfer', date: ago(1) },
    { user_id: userId, type: 'expense', amount: 1800, category: 'Food', description: 'Grocery shopping at D-Mart', payment_method: 'card', date: ago(0) },
    { user_id: userId, type: 'expense', amount: 450, category: 'Transportation', description: 'Ola cab to office', payment_method: 'digital_wallet', date: ago(1) },
    { user_id: userId, type: 'expense', amount: 2500, category: 'Shopping', description: 'New clothes from Myntra', payment_method: 'card', date: ago(3) },
    { user_id: userId, type: 'income', amount: 8000, category: 'Freelance', description: 'React dashboard project', payment_method: 'bank_transfer', date: ago(5) },
    { user_id: userId, type: 'expense', amount: 999, category: 'Entertainment', description: 'Netflix + Hotstar subscription', payment_method: 'card', date: ago(7) },
    { user_id: userId, type: 'expense', amount: 320, category: 'Food', description: 'Zomato dinner order', payment_method: 'digital_wallet', date: ago(8) },
    { user_id: userId, type: 'expense', amount: 5000, category: 'Bills', description: 'Electricity bill', payment_method: 'bank_transfer', date: ago(10) },
    { user_id: userId, type: 'expense', amount: 1200, category: 'Health', description: 'Doctor consultation + medicines', payment_method: 'cash', date: ago(12) },
    { user_id: userId, type: 'income', amount: 2000, category: 'Investment', description: 'Dividend from stocks', payment_method: 'bank_transfer', date: ago(15) },
    { user_id: userId, type: 'expense', amount: 800, category: 'Education', description: 'Udemy courses', payment_method: 'card', date: ago(18) },
    { user_id: userId, type: 'expense', amount: 650, category: 'Transportation', description: 'Monthly metro card recharge', payment_method: 'digital_wallet', date: ago(20) },
    { user_id: userId, type: 'expense', amount: 3200, category: 'Bills', description: 'Internet + Mobile recharge', payment_method: 'bank_transfer', date: ago(22) },
    { user_id: userId, type: 'income', amount: 55000, category: 'Salary', description: 'Monthly salary - May', payment_method: 'bank_transfer', date: ago(31) },
    { user_id: userId, type: 'expense', amount: 4500, category: 'Shopping', description: 'Amazon purchases', payment_method: 'card', date: ago(33) },
    { user_id: userId, type: 'expense', amount: 1500, category: 'Food', description: 'Restaurant dinner with family', payment_method: 'card', date: ago(35) },
    { user_id: userId, type: 'expense', amount: 8000, category: 'Bills', description: 'House rent contribution', payment_method: 'bank_transfer', date: ago(38) },
    { user_id: userId, type: 'income', amount: 5000, category: 'Freelance', description: 'Logo design project', payment_method: 'cash', date: ago(40) },
  ];
};

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    for (const demoData of demoUsers) {
      const existing = await User.findOne({ email: demoData.email });
      if (existing) {
        console.log(`⚡ Demo user ${demoData.email} already exists — skipping creation`);
        // Ensure demo transactions exist
        const txCount = await Transaction.countDocuments({ user_id: existing._id });
        if (txCount === 0) {
          await Transaction.insertMany(generateTransactions(existing._id));
          console.log(`  ✅ Added ${18} sample transactions for ${demoData.email}`);
        }
        continue;
      }

      const user = await User.create(demoData);
      console.log(`✅ Created demo user: ${user.email}`);

      const transactions = generateTransactions(user._id);
      await Transaction.insertMany(transactions);
      console.log(`  ✅ Added ${transactions.length} sample transactions`);
    }

    console.log('\n🎉 Seeding complete!');
    console.log('Demo accounts:');
    console.log('  📧 alice@demo.com  🔑 demo123');
    console.log('  📧 bob@demo.com    🔑 demo123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seed();
