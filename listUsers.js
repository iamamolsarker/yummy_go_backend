/**
 * List all users in database
 * Run: node listUsers.js
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

async function listUsers() {
  let client;
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db('Yummy_Go');
    const usersCollection = db.collection('users');

    // Get all users
    const users = await usersCollection.find({}).toArray();
    
    console.log(`📊 Total users: ${users.length}\n`);
    
    if (users.length === 0) {
      console.log('ℹ️  No users found in database');
    } else {
      console.log('👥 Users list:\n');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Status: ${user.status}`);
        console.log(`   Created: ${user.created_at}`);
        console.log('');
      });

      // Count by status
      const pendingCount = users.filter(u => u.status === 'pending').length;
      const activeCount = users.filter(u => u.status === 'active').length;
      
      console.log('📈 Summary:');
      console.log(`   Pending: ${pendingCount}`);
      console.log(`   Active: ${activeCount}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 MongoDB connection closed');
    }
  }
}

listUsers();
