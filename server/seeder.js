const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/UserModel');

dotenv.config();

async function seed() {
  try {
    await connectDB();

    console.log('Clearing users collection...');
    await User.deleteMany({});

    const hashedPassword = await bcrypt.hash('123456', 10);

    const adminUser = {
      name: 'Admin',
      email: 'admin@ieee.org',
      password: hashedPassword,
      role: 'admin',
    };

    await User.create(adminUser);

    console.log('Inserted Admin user: admin@ieee.org');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;