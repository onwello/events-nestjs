#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function testEventHandlers() {
  console.log('🧪 Testing Event Handler Registration...\n');

  try {
    // Test 1: Create a user and verify the event handler is triggered
    console.log('1. Creating a user...');
    const userResponse = await axios.post(`${BASE_URL}/users`, {
      name: 'Test User',
      email: 'test@example.com'
    });
    console.log('✅ User created:', userResponse.data);
    
    // Wait a moment for event processing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test 2: Create an order and verify the event handler is triggered
    console.log('\n2. Creating an order...');
    const orderResponse = await axios.post(`${BASE_URL}/orders`, {
      userId: userResponse.data.id,
      items: ['Test Item'],
      total: 99.99
    });
    console.log('✅ Order created:', orderResponse.data);
    
    // Wait a moment for event processing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test 3: Update user and verify the event handler is triggered
    console.log('\n3. Updating user...');
    const updateResponse = await axios.put(`${BASE_URL}/users/${userResponse.data.id}`, {
      name: 'Updated Test User'
    });
    console.log('✅ User updated:', updateResponse.data);
    
    // Wait a moment for event processing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test 4: Delete user and verify the event handler is triggered
    console.log('\n4. Deleting user...');
    await axios.delete(`${BASE_URL}/users/${userResponse.data.id}`);
    console.log('✅ User deleted');
    
    // Wait a moment for event processing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('Check the application logs to see the event handlers being triggered automatically.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Check if the server is running
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running');
    return true;
  } catch (error) {
    console.error('❌ Server is not running. Please start the server first:');
    console.error('   npm run start:dev');
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Event Handler Integration Test...\n');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    process.exit(1);
  }
  
  await testEventHandlers();
}

main().catch(console.error);
