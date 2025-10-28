/**
 * Test script for Stripe Payment Integration
 * 
 * This script tests the Stripe payment endpoints
 * Run with: node testPayment.js
 */

require('dotenv').config();
const stripe = require('./config/stripe');

console.log('🧪 Testing Stripe Payment Integration...\n');

// Test 1: Verify Stripe connection
async function testStripeConnection() {
  try {
    console.log('✅ Test 1: Stripe Connection');
    
    // Try to list payment methods (requires API key)
    const paymentMethods = await stripe.paymentMethods.list({ limit: 1 });
    
    console.log('   ✓ Stripe API connected successfully');
    console.log(`   ✓ Stripe API Key: ${process.env.STRIPE_SECRET_KEY.substring(0, 20)}...`);
    console.log('');
    
    return true;
  } catch (error) {
    console.error('   ✗ Stripe connection failed:', error.message);
    console.log('');
    return false;
  }
}

// Test 2: Create test payment intent
async function testPaymentIntent() {
  try {
    console.log('✅ Test 2: Create Payment Intent');
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2550, // $25.50 in cents
      currency: 'usd',
      description: 'Test payment for Yummy Go',
      metadata: {
        orderId: 'test_order_123',
        orderNumber: 'YG_TEST_001',
        userEmail: 'test@example.com'
      }
    });
    
    console.log('   ✓ Payment Intent created successfully');
    console.log(`   ✓ Payment Intent ID: ${paymentIntent.id}`);
    console.log(`   ✓ Client Secret: ${paymentIntent.client_secret.substring(0, 30)}...`);
    console.log(`   ✓ Amount: $${(paymentIntent.amount / 100).toFixed(2)}`);
    console.log(`   ✓ Status: ${paymentIntent.status}`);
    console.log('');
    
    return paymentIntent;
  } catch (error) {
    console.error('   ✗ Payment Intent creation failed:', error.message);
    console.log('');
    return null;
  }
}

// Test 3: Retrieve payment intent
async function testRetrievePaymentIntent(paymentIntentId) {
  try {
    console.log('✅ Test 3: Retrieve Payment Intent');
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    console.log('   ✓ Payment Intent retrieved successfully');
    console.log(`   ✓ ID: ${paymentIntent.id}`);
    console.log(`   ✓ Status: ${paymentIntent.status}`);
    console.log(`   ✓ Amount: $${(paymentIntent.amount / 100).toFixed(2)}`);
    console.log('');
    
    return true;
  } catch (error) {
    console.error('   ✗ Payment Intent retrieval failed:', error.message);
    console.log('');
    return false;
  }
}

// Test 4: Cancel payment intent
async function testCancelPaymentIntent(paymentIntentId) {
  try {
    console.log('✅ Test 4: Cancel Payment Intent');
    
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    
    console.log('   ✓ Payment Intent cancelled successfully');
    console.log(`   ✓ Status: ${paymentIntent.status}`);
    console.log('');
    
    return true;
  } catch (error) {
    console.error('   ✗ Payment Intent cancellation failed:', error.message);
    console.log('');
    return false;
  }
}

// Test 5: Check webhook configuration
function testWebhookConfig() {
  console.log('✅ Test 5: Webhook Configuration');
  
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (webhookSecret && webhookSecret.length > 0) {
    console.log('   ✓ Webhook secret configured');
    console.log(`   ✓ Webhook Secret: ${webhookSecret.substring(0, 15)}...`);
  } else {
    console.log('   ⚠ Webhook secret not configured (optional for development)');
    console.log('   → Run: stripe listen --forward-to localhost:5000/api/payments/webhook');
  }
  console.log('');
}

// Run all tests
async function runTests() {
  console.log('═══════════════════════════════════════════════════════\n');
  
  // Test 1: Connection
  const connected = await testStripeConnection();
  if (!connected) {
    console.log('❌ Tests stopped due to connection failure\n');
    return;
  }
  
  // Test 2: Create payment intent
  const paymentIntent = await testPaymentIntent();
  if (!paymentIntent) {
    console.log('❌ Tests stopped due to payment intent creation failure\n');
    return;
  }
  
  // Test 3: Retrieve payment intent
  await testRetrievePaymentIntent(paymentIntent.id);
  
  // Test 4: Cancel payment intent
  await testCancelPaymentIntent(paymentIntent.id);
  
  // Test 5: Webhook config
  testWebhookConfig();
  
  console.log('═══════════════════════════════════════════════════════\n');
  console.log('🎉 All tests completed!\n');
  console.log('Next steps:');
  console.log('  1. Start server: npm run dev');
  console.log('  2. Test API: See STRIPE_SETUP_GUIDE.md');
  console.log('  3. Setup webhook: stripe listen --forward-to localhost:5000/api/payments/webhook');
  console.log('  4. Read docs: PAYMENT_API_DOCUMENTATION.md\n');
}

// Execute tests
runTests().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
