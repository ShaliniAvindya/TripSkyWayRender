import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/user.model.js';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, '../../.env') });

/**
 * Emergency Script to Reset Admin Password
 * 
 * Use this when you:
 * - Accidentally forced password reset on your admin account
 * - Can't remember the temporary password
 * - Need to restore access to admin panel
 * 
 * Run: node src/scripts/resetAdminPassword.js
 */

const resetAdminPassword = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    console.log('🔍 Finding admin user...');
    const admin = await User.findOne({ email: 'admin@tripskyway.com' });
    
    if (!admin) {
      console.error('❌ Admin user not found!');
      console.error('   Email: admin@tripskyway.com\n');
      process.exit(1);
    }

    console.log(`✓ Found admin: ${admin.name}\n`);

    console.log('🔐 Resetting password...');
    // Reset password and clear temporary flags
    admin.password = 'Admin@123456';
    admin.isTempPassword = false;
    admin.mustChangePassword = false;
    admin.passwordChangedAt = Date.now();
    
    await admin.save();

    console.log('✅ Admin password reset successfully!\n');
    console.log('═══════════════════════════════════════════');
    console.log('  LOGIN CREDENTIALS');
    console.log('═══════════════════════════════════════════');
    console.log('📧 Email:    admin@tripskyway.com');
    console.log('🔑 Password: Admin@123456');
    console.log('═══════════════════════════════════════════\n');
    console.log('✓ You can now log in to the admin panel at:');
    console.log('  http://localhost:5174\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting admin password:', error.message);
    process.exit(1);
  }
};

resetAdminPassword();
