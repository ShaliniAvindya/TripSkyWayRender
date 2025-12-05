/**
 * Super Admin Migration Script
 * 
 * This script helps create or promote users to Super Admin status in MongoDB
 * Run this script after deploying the Super Admin feature
 * 
 * Usage:
 * 1. Place this file in Server/scripts/
 * 2. Update the ADMIN_EMAIL variable below with the admin email
 * 3. Run: node scripts/promote-superadmin.js
 */

import mongoose from 'mongoose';
import User from '../src/models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

// ==========================================
// CONFIGURATION - UPDATE THIS SECTION
// ==========================================

const ADMIN_EMAIL = 'admin@tripskyway.com'; // CHANGE THIS to the admin email you want to promote

// ==========================================
// MIGRATION LOGIC
// ==========================================

async function promoteSuperAdmin() {
  try {
    console.log('\n🚀 Starting Super Admin Promotion Script...\n');

    // Connect to MongoDB
    console.log('📊 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tripskiway', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Find the admin user
    console.log(`🔍 Searching for admin with email: ${ADMIN_EMAIL}`);
    const adminUser = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

    if (!adminUser) {
      console.error(`❌ Error: User with email "${ADMIN_EMAIL}" not found`);
      console.log('\n📋 Here are existing admins:');
      const admins = await User.find({ role: { $in: ['admin', 'superAdmin'] } }).select('name email role');
      admins.forEach((admin) => {
        console.log(`   - ${admin.name} (${admin.email}) - Role: ${admin.role}`);
      });
      process.exit(1);
    }

    console.log(`✅ Found user: ${adminUser.name} (${adminUser.email})\n`);

    // Check if already a superAdmin
    if (adminUser.role === 'superAdmin' && adminUser.isSuperAdmin) {
      console.log('⚠️  User is already a Super Admin');
      console.log('   - Role:', adminUser.role);
      console.log('   - isSuperAdmin:', adminUser.isSuperAdmin);
      console.log('   - Permissions:', adminUser.permissions.length);
      process.exit(0);
    }

    // Check if user is an admin
    if (adminUser.role !== 'admin') {
      console.error(`❌ Error: User role is '${adminUser.role}', not 'admin'`);
      console.log('   Only admin users can be promoted to Super Admin');
      process.exit(1);
    }

    // Promote to superAdmin
    console.log('🔐 Promoting to Super Admin...\n');
    console.log('   Changes to be made:');
    console.log('   - role: "admin" → "superAdmin"');
    console.log('   - isSuperAdmin: false → true');
    console.log('   - canBeDeleted: true → false');
    console.log('   - permissions: (limited) → (all permissions)\n');

    adminUser.role = 'superAdmin';
    adminUser.isSuperAdmin = true;
    adminUser.canBeDeleted = false;
    adminUser.permissions = [
      'manage_users',
      'manage_sales_reps',
      'manage_vendors',
      'manage_admins',
      'view_reports',
      'manage_billing',
    ];

    await adminUser.save();

    console.log('✅ Successfully promoted to Super Admin!\n');
    console.log('📊 Updated User Details:');
    console.log(`   - Name: ${adminUser.name}`);
    console.log(`   - Email: ${adminUser.email}`);
    console.log(`   - Role: ${adminUser.role}`);
    console.log(`   - isSuperAdmin: ${adminUser.isSuperAdmin}`);
    console.log(`   - canBeDeleted: ${adminUser.canBeDeleted}`);
    console.log(`   - Permissions: ${adminUser.permissions.join(', ')}`);
    console.log('\n🎉 Super Admin creation complete!\n');

    // Show summary
    const superAdmins = await User.find({ role: 'superAdmin' }).select('name email');
    console.log(`📈 Total Super Admins in system: ${superAdmins.length}`);
    superAdmins.forEach((sa) => {
      console.log(`   - ${sa.name} (${sa.email})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during promotion:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the migration
promoteSuperAdmin();
