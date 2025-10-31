/**
 * Simple script to activate a specific user
 * Run: node testActivateUser.js
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const USER_EMAIL = 'hosen1433@gmail.com';

async function activateUser() {
  let client;
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db('Yummy_Go');
    const usersCollection = db.collection('users');

    // First, check current status
    console.log(`🔍 Checking user: ${USER_EMAIL}`);
    const user = await usersCollection.findOne({ email: USER_EMAIL });
    
    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log('📊 Current user data:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Status: ${user.status}`);
    console.log('');

    // Update status to active
    if (user.status === 'active') {
      console.log('ℹ️  User is already active!');
    } else {
      console.log(`🔄 Updating status from '${user.status}' to 'active'...`);
      
      const result = await usersCollection.updateOne(
        { email: USER_EMAIL },
        { 
          $set: { 
            status: 'active',
            updated_at: new Date().toISOString()
          } 
        }
      );

      if (result.modifiedCount > 0) {
        console.log('✅ User activated successfully!');
        
        // Verify the update
        const updatedUser = await usersCollection.findOne({ email: USER_EMAIL });
        console.log('\n📊 Updated user data:');
        console.log(`   Status: ${updatedUser.status}`);
        console.log(`   Updated at: ${updatedUser.updated_at}`);
      } else {
        console.log('⚠️  No changes made');
      }
    }

    // Also activate ALL pending users with role 'user'
    console.log('\n🔄 Activating all pending users with role "user"...');
    const bulkResult = await usersCollection.updateMany(
      { role: 'user', status: 'pending' },
      { 
        $set: { 
          status: 'active',
          updated_at: new Date().toISOString()
        } 
      }
    );
    
    console.log(`✅ Activated ${bulkResult.modifiedCount} pending users`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 MongoDB connection closed');
    }
  }
}

activateUser();
