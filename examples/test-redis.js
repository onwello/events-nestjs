const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function testRedisTransport() {
  console.log('🧪 Testing Redis Transport...\n');

  try {
    // Test 1: Create a user and verify the event handler is triggered
    console.log('1. Creating a user to trigger user.created event...');
    const userResponse = await axios.post(`${BASE_URL}/users`, {
      name: 'Redis Test User',
      email: 'redistest@example.com'
    });
    console.log('✅ User created:', userResponse.data);
    
    // Wait for event processing
    console.log('⏳ Waiting for event processing...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 2: Create an order and verify the event handler is triggered
    console.log('\n2. Creating an order to trigger order.created event...');
    const orderResponse = await axios.post(`${BASE_URL}/orders`, {
      userId: userResponse.data.id,
      items: ['Redis Test Item'],
      total: 299.99
    });
    console.log('✅ Order created:', orderResponse.data);
    
    // Wait for event processing
    console.log('⏳ Waiting for event processing...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 3: Update user to trigger user.updated event
    console.log('\n3. Updating user to trigger user.updated event...');
    const updateResponse = await axios.put(`${BASE_URL}/users/${userResponse.data.id}`, {
      name: 'Updated Redis Test User'
    });
    console.log('✅ User updated:', updateResponse.data);
    
    // Wait for event processing
    console.log('⏳ Waiting for event processing...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 4: Delete user to trigger user.deleted event
    console.log('\n4. Deleting user to trigger user.deleted event...');
    await axios.delete(`${BASE_URL}/users/${userResponse.data.id}`);
    console.log('✅ User deleted');
    
    // Wait for event processing
    console.log('⏳ Waiting for event processing...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n🎉 Redis transport test completed!');
    console.log('\n📋 Check the server logs above for these event handler messages:');
    console.log('   - "All user events received" (from pattern handler)');
    console.log('   - "User updated event received" (from specific handler)');
    console.log('   - "Order created event received" (from specific handler)');
    console.log('\n💡 If you see these messages, the Redis transport is working!');
    
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
  console.log('🚀 Starting Redis Transport Test...\n');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    process.exit(1);
  }
  
  await testRedisTransport();
}

main().catch(console.error);
