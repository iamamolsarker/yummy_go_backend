// Test script to verify cold start fixes
// Run with: node testColdStart.js

const fetch = require('node-fetch'); // You may need to install: npm install node-fetch

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';

const testEndpoints = async () => {
    console.log('Testing API endpoints for cold start issues...\n');
    
    const endpoints = [
        { path: '/', method: 'GET', name: 'Root' },
        { path: '/api/health', method: 'GET', name: 'Health Check' },
        { path: '/api/warmup', method: 'GET', name: 'Warmup' },
        { path: '/api/users', method: 'GET', name: 'Users List' }
    ];
    
    for (const endpoint of endpoints) {
        console.log(`Testing ${endpoint.name} (${endpoint.method} ${endpoint.path})...`);
        
        try {
            const startTime = Date.now();
            const response = await fetch(`${API_BASE_URL}${endpoint.path}`, {
                method: endpoint.method,
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30 second timeout
            });
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            console.log(`✅ Status: ${response.status} | Duration: ${duration}ms`);
            
            if (!response.ok && response.status !== 404) {
                const errorText = await response.text();
                console.log(`❌ Error: ${errorText}`);
            }
            
        } catch (error) {
            console.log(`❌ Failed: ${error.message}`);
        }
        
        console.log('---');
    }
};

const testRetryLogic = async () => {
    console.log('\nTesting retry logic...');
    
    // Simulate multiple rapid requests
    const promises = [];
    for (let i = 0; i < 5; i++) {
        promises.push(
            fetch(`${API_BASE_URL}/api/health`)
                .then(res => ({ attempt: i + 1, status: res.status, ok: res.ok }))
                .catch(err => ({ attempt: i + 1, error: err.message }))
        );
    }
    
    const results = await Promise.all(promises);
    results.forEach(result => {
        if (result.error) {
            console.log(`Attempt ${result.attempt}: ❌ ${result.error}`);
        } else {
            console.log(`Attempt ${result.attempt}: ${result.ok ? '✅' : '❌'} Status ${result.status}`);
        }
    });
};

const main = async () => {
    console.log(`Testing API at: ${API_BASE_URL}\n`);
    
    await testEndpoints();
    await testRetryLogic();
    
    console.log('\n🎉 Cold start testing completed!');
    console.log('\nRecommendations:');
    console.log('1. Deploy to Vercel and test with the production URL');
    console.log('2. Use the warmup endpoint before critical operations');
    console.log('3. Implement the frontend retry logic from utils/apiUtils.js');
    console.log('4. Consider setting up periodic health checks');
};

main().catch(console.error);