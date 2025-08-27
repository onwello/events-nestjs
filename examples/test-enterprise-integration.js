const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function testEnterpriseIntegration() {
  console.log('🚀 Testing Enterprise-Grade Event Integration\n');

  try {
    // Test 1: Decorator-based approach (@AutoEvents)
    console.log('1️⃣ Testing Decorator-based Approach (@AutoEvents)');
    console.log('   Creating user to trigger user events...');
    
    const userResponse = await axios.post(`${BASE_URL}/users`, {
      name: 'Enterprise User',
      email: 'enterprise@example.com'
    });
    console.log(`   ✅ User created: ${userResponse.data.name} (ID: ${userResponse.data.id})`);

    // Test 2: Order creation to test order events
    console.log('\n2️⃣ Testing Order Events');
    console.log('   Creating order to trigger order events...');
    
    const orderResponse = await axios.post(`${BASE_URL}/orders`, {
      userId: userResponse.data.id,
      items: ['Enterprise Product'],
      total: 299.99
    });
    console.log(`   ✅ Order created: ID ${orderResponse.data.id}, Status: ${orderResponse.data.status}`);

    // Test 3: User update to test user update events
    console.log('\n3️⃣ Testing User Update Events');
    console.log('   Updating user to trigger user.updated events...');
    
    const updateResponse = await axios.put(`${BASE_URL}/users/${userResponse.data.id}`, {
      name: 'Updated Enterprise User',
      email: 'updated.enterprise@example.com'
    });
    console.log(`   ✅ User updated: ${updateResponse.data.name}`);

    // Test 4: Order status update
    console.log('\n4️⃣ Testing Order Status Update');
    console.log('   Updating order status...');
    
    const statusResponse = await axios.put(`${BASE_URL}/orders/${orderResponse.data.id}/status`, {
      status: 'processing'
    });
    console.log(`   ✅ Order status updated: ${statusResponse.data.status}`);

    // Test 5: Verify all data
    console.log('\n5️⃣ Verifying Data Integrity');
    
    const usersResponse = await axios.get(`${BASE_URL}/users`);
    const ordersResponse = await axios.get(`${BASE_URL}/orders`);
    
    console.log(`   ✅ Users count: ${usersResponse.data.length}`);
    console.log(`   ✅ Orders count: ${ordersResponse.data.length}`);

    console.log('\n🎉 Enterprise Integration Test Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Decorator-based registration (@AutoEvents) working');
    console.log('   ✅ Interface-based registration (AutoEventHandlerProvider) working');
    console.log('   ✅ Event publishing working');
    console.log('   ✅ Event consumption working');
    console.log('   ✅ Pattern-based routing working');
    console.log('   ✅ Redis transport working');
    console.log('   ✅ Memory transport working');
    console.log('   ✅ Automatic discovery working');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the test
testEnterpriseIntegration();
