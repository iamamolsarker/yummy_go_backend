/**
 * Test user creation
 * Run: node testUserCreate.js
 */

const axios = require('axios');

const API_URL = 'https://yummy-go-server.vercel.app/api/users';

const testUser = {
  name: 'Test User',
  email: 'hosen1433@gmail.com',
  phone: '+8801234567890',
  role: 'user'
};

async function createUser() {
  try {
    console.log('🔄 Creating user...');
    console.log('📤 Request:', testUser);
    console.log('');

    const response = await axios.post(API_URL, testUser);

    console.log('✅ Success!');
    console.log('📥 Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    if (error.response) {
      console.error('❌ Error Response:', error.response.status, error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

createUser();
