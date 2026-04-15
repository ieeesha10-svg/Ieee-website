const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/UserModel'); // Ensure path is correct
const connectDB = require('./config/db'); // Ensure path is correct

dotenv.config();
connectDB();

const importData = async () => {
  try {
    // 1. Wipe everything first
    await User.deleteMany();
    console.log('🗑️  Old Data Destroyed...');

    // 2. Create Hash for "password123"
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 3. Define the Test Users
    const users = [
      // --- 1. THE SUPER ADMIN (XCom) ---
      {
        name: 'IEEE Chairman',
        email: 'xcom@ieee.org',
        password: hashedPassword,
        role: 'xcom',
        phone: '01000000000',
        university: 'Cairo University',
        committee: 'High Board',
        yearOfStudy: 4
      },
      
      // --- 2. THE BOARD MEMBER (Internal Creation) ---
      {
        name: 'Sara Youssef',
        email: 'sara@board.ieee.org',
        password: hashedPassword,
        role: 'board',
        phone: '01111111111',
        university: 'Ain Shams University',
        college: 'Engineering',
        committee: 'Human Resources',
        yearOfStudy: 3,
        interests: ['Management', 'Public Speaking']
      },

      // --- 3. THE MEMBER (Public Sign-up) ---
      {
        name: 'Omar Khaled',
        email: 'omar@member.com',
        password: hashedPassword,
        role: 'member',
        phone: '01222222222',
        university: 'Helwan University',
        college: 'Computer Science',
        committee: 'Technical',
        yearOfStudy: 2,
        age: 20,
        interests: ['Web Development', 'React']
      },

      // --- 4. THE STUDENT (Standard User) ---
      {
        name: 'Ali Ahmed',
        email: 'ali@student.edu',
        password: hashedPassword,
        role: 'user',
        phone: '01555555555',
        university: 'Cairo University',
        college: 'Engineering',
        yearOfStudy: 1,
        age: 18,
        interests: ['Robotics', 'Arduino'],
        optionalData: { referral: 'Facebook Ad' }
      },

      // --- 5. THE EVENT SCANNER (For Event Day) ---
      {
        name: 'Gate Volunteer',
        email: 'scanner@ieee.org',
        password: hashedPassword,
        role: 'scanner',
        phone: '01012341234',
        university: 'Cairo University',
        committee: 'Organization'
      }
    ];

    // 4. Insert All
    await User.insertMany(users);

    console.log('✅ All Test Data Imported!');
    console.log('-----------------------------------');
    console.log('👑 XCom:    xcom@ieee.org');
    console.log('👔 Board:   sara@board.ieee.org');
    console.log('⭐ Member:  omar@member.com');
    console.log('🎓 Student: ali@student.edu');
    console.log('📱 Scanner: scanner@ieee.org');
    console.log('🔑 Password (All): password123');
    console.log('-----------------------------------');
    
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    console.log('🟥 Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
