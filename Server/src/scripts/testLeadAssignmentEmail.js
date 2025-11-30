import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/user.model.js';
import Lead from '../models/lead.model.js';
import emailService from '../utils/emailService.js';
import logger from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const testLeadAssignmentEmail = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Find a sales rep
    const salesRep = await User.findOne({ role: 'salesRep' }).select('name email');
    
    if (!salesRep) {
      console.error('❌ No sales rep found in database!');
      process.exit(1);
    }

    if (!salesRep.email) {
      console.error(`❌ Sales rep ${salesRep.name} has no email address!`);
      process.exit(1);
    }

    console.log(`✓ Found sales rep: ${salesRep.name} (${salesRep.email})\n`);

    // Find a lead
    const lead = await Lead.findOne().lean();
    
    if (!lead) {
      console.error('❌ No lead found in database!');
      process.exit(1);
    }

    console.log(`✓ Found lead: ${lead.name || lead._id}\n`);

    // Test email sending
    console.log('📧 Sending test lead assignment email...');
    
    try {
      await emailService.sendLeadAssignmentEmail({
        salesRep: {
          name: salesRep.name,
          email: salesRep.email,
        },
        lead: lead,
        assignedBy: {
          name: 'Admin User',
        },
        assignmentMode: 'manual',
      });

      console.log('✅ Lead assignment email sent successfully!');
      console.log(`   Sent to: ${salesRep.email}`);
      console.log(`   Lead: ${lead.name || lead._id}\n`);
    } catch (error) {
      console.error('❌ Failed to send lead assignment email:');
      console.error(`   Error: ${error.message}`);
      console.error(`   Stack: ${error.stack}\n`);
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(`Stack: ${error.stack}`);
    process.exit(1);
  }
};

testLeadAssignmentEmail();

