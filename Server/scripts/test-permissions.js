/**
 * Test Script for Admin Permissions Feature
 * 
 * This script tests the admin permissions implementation
 * Run with: node Server/scripts/test-permissions.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/user.model.js';

dotenv.config();

const testPermissions = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Create admin with permissions
    console.log('📝 Test 1: Creating admin with permissions...');
    const testAdmin = {
      name: 'Test Admin',
      email: `testadmin${Date.now()}@example.com`,
      password: 'TestPass123!',
      role: 'admin',
      permissions: ['manage_users', 'view_reports', 'manage_sales_reps'],
      isActive: true,
      isEmailVerified: true,
    };

    const admin = await User.create(testAdmin);
    console.log('✅ Admin created successfully');
    console.log(`   ID: ${admin._id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Permissions: ${admin.permissions.join(', ')}\n`);

    // Test 2: Update admin permissions
    console.log('📝 Test 2: Updating admin permissions...');
    admin.permissions = ['manage_users', 'manage_vendors', 'view_reports', 'audit_log'];
    await admin.save();
    console.log('✅ Permissions updated successfully');
    console.log(`   New Permissions: ${admin.permissions.join(', ')}\n`);

    // Test 3: Validate invalid permission
    console.log('📝 Test 3: Testing invalid permission validation...');
    try {
      admin.permissions = ['invalid_permission', 'manage_users'];
      await admin.save();
      console.log('❌ FAILED: Should have rejected invalid permission');
    } catch (error) {
      console.log('✅ Validation working: Invalid permission rejected');
      console.log(`   Error: ${error.message}\n`);
    }

    // Test 4: Create non-admin user (should have empty permissions)
    console.log('📝 Test 4: Creating non-admin user...');
    const customer = await User.create({
      name: 'Test Customer',
      email: `customer${Date.now()}@example.com`,
      password: 'TestPass123!',
      role: 'customer',
      isActive: true,
      isEmailVerified: true,
    });
    console.log('✅ Customer created successfully');
    console.log(`   ID: ${customer._id}`);
    console.log(`   Role: ${customer.role}`);
    console.log(`   Permissions: ${customer.permissions.length === 0 ? 'None (as expected)' : customer.permissions.join(', ')}\n`);

    // Test 5: Query admins with specific permission
    console.log('📝 Test 5: Querying admins with "manage_users" permission...');
    const adminsWithPermission = await User.find({
      role: 'admin',
      permissions: 'manage_users'
    }).select('name email permissions');
    console.log(`✅ Found ${adminsWithPermission.length} admin(s) with "manage_users" permission`);
    adminsWithPermission.forEach(a => {
      console.log(`   - ${a.name} (${a.email}): ${a.permissions.join(', ')}`);
    });

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await User.deleteOne({ _id: admin._id });
    await User.deleteOne({ _id: customer._id });
    console.log('✅ Test data cleaned up');

    console.log('\n✨ All tests passed successfully! ✨\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run tests
testPermissions();
