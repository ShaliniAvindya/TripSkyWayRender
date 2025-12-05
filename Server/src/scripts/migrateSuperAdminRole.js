import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
import logger from '../config/logger.js';

dotenv.config();

/**
 * Migration script to update super admin roles
 * Previously, the system normalized 'superAdmin' role to 'admin' in the database
 * This script ensures all users with isSuperAdmin=true have role='superAdmin'
 */
const migrateSuperAdminRole = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('MongoDB Connected');

    // Find all users with isSuperAdmin flag set to true
    const superAdminsToUpdate = await User.find({ isSuperAdmin: true, role: { $ne: 'superAdmin' } });

    if (superAdminsToUpdate.length === 0) {
      console.log('✅ No migration needed. All super admins already have role=superAdmin');
      process.exit(0);
    }

    console.log(`\n📋 Found ${superAdminsToUpdate.length} super admin(s) to migrate:`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Update all super admins
    for (const superAdmin of superAdminsToUpdate) {
      console.log(`Updating: ${superAdmin.email}`);
      superAdmin.role = 'superAdmin';
      await superAdmin.save();
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Successfully migrated ${superAdminsToUpdate.length} super admin role(s)!`);

    // Display all current super admins
    const allSuperAdmins = await User.find({ role: 'superAdmin' }).select('name email role isSuperAdmin permissions');
    console.log('\n📊 Current Super Admins:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    allSuperAdmins.forEach((admin) => {
      console.log(`✓ ${admin.name} (${admin.email}) - Permissions: ${admin.permissions.length}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    logger.error(`Migration error: ${error.message}`);
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
};

migrateSuperAdminRole();
