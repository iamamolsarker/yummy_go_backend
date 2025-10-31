/**
 * Script to bulk activate all pending users with role 'user'
 * Run this once to fix existing users in the database
 * 
 * Usage: node activateUsers.js
 * 
 * Requirements:
 * - Admin user must be logged in to get Firebase JWT token
 * - Replace YOUR_ADMIN_FIREBASE_TOKEN with actual admin token
 */

const axios = require('axios');

const API_URL = 'https://yummy-go-server.vercel.app/api/users/bulk-activate';

// Get this token by logging in as admin user (saddamhosen1433@gmail.com)
// From browser console after login: await firebase.auth().currentUser.getIdToken()
const ADMIN_TOKEN = 'YOUR_ADMIN_FIREBASE_TOKEN';

async function activatePendingUsers() {
  try {
    console.log('🔄 Activating all pending users with role "user"...\n');
    
    const response = await axios.post(API_URL, {}, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Success!');
    console.log('📊 Response:', response.data);
    console.log(`\n✨ ${response.data.data.modifiedCount} users activated!`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n⚠️  Authentication failed. Please:');
      console.log('1. Login as admin user (saddamhosen1433@gmail.com)');
      console.log('2. Open browser console');
      console.log('3. Run: await firebase.auth().currentUser.getIdToken()');
      console.log('4. Copy the token and replace ADMIN_TOKEN in this script');
    } else if (error.response?.status === 403) {
      console.log('\n⚠️  Forbidden. Make sure you are using an ADMIN account token.');
    }
  }
}

// Check if token is provided
if (ADMIN_TOKEN === 'YOUR_ADMIN_FIREBASE_TOKEN') {
  console.log('⚠️  Please set ADMIN_TOKEN in the script first!\n');
  console.log('Steps to get admin token:');
  console.log('1. Login to your app as admin (saddamhosen1433@gmail.com)');
  console.log('2. Open browser DevTools Console');
  console.log('3. Run: await firebase.auth().currentUser.getIdToken()');
  console.log('4. Copy the token');
  console.log('5. Paste it in this script as ADMIN_TOKEN value');
  console.log('6. Run: node activateUsers.js\n');
} else {
  activatePendingUsers();
}
