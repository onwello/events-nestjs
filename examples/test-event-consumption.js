const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function testEventConsumption() {
  console.log('🧪 Testing Event Consumption...\n');

  try {
    // Test 1: Create a user and check if the order service receives the event
    console.log('1. Creating a user to trigger user.created event...');
    const userResponse = await axios.post(`${BASE_URL}/users`, {
      name: 'Event Test User',
      email: 'eventtest@example.com'
    });
    console.log('✅ User created:', userResponse.data);
    
    // Wait for event processing
    console.log('⏳ Waiting for event processing...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 2: Create an order and check if the order service receives its own event
    console.log('\n2. Creating an order to trigger order.created event...');
    const orderResponse = await axios.post(`${BASE_URL}/orders`, {
      userId: userResponse.data.id,
      items: ['Event Test Item'],
      total: 199.99
    });
    console.log('✅ Order created:', orderResponse.data);
    
    // Wait for event processing
    console.log('⏳ Waiting for event processing...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 3: Update user to trigger user.updated event
    console.log('\n3. Updating user to trigger user.updated event...');
    const updateResponse = await axios.put(`${BASE_URL}/users/${userResponse.data.id}`, {
      name: 'Updated Event Test User'
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
    
    console.log('\n🎉 Event consumption test completed!');
    console.log('\n📋 Check the server logs above for these event handler messages:');
    console.log('   - "User created event received" (from OrdersService)');
    console.log('   - "User updated event received" (from OrdersService)');
    console.log('   - "User deleted event received" (from OrdersService)');
    console.log('   - "Order created event received" (from OrdersService)');
    console.log('\n💡 If you see these messages, the automatic event handler discovery is working!');
    
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
  console.log('🚀 Starting Event Consumption Test...\n');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    process.exit(1);
  }
  
  await testEventConsumption();
}

main().catch(console.error);
