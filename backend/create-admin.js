import { User } from './src/models/index.js';
import bcrypt from 'bcryptjs';
import { initDatabase } from './src/libs/db.js';

async function createAdminUser() {
  try {
    await initDatabase();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: { username: 'admin' }
    });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      username: 'admin',
      email: 'admin@bluemoon.vn',
      fullName: 'Admin User',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE'
    });
    console.log('Admin user created successfully:', admin.username);
    console.log('Username: admin');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error creating admin user:', error.message);
  }
  process.exit(0);
}

createAdminUser();