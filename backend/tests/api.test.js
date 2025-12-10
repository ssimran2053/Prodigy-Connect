/**
 * Manual API Testing Script
 * Run this file with: node tests/api.test.js
 * 
 * Make sure the server is running before executing this script.
 */

const PORT = process.env.PORT || 5001;
const API_URL = `http://localhost:${PORT}/api`;
let authToken = null;
let testUserId = null;
let testServiceId = null;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
  console.log('\n' + '='.repeat(60));
  log(`Testing: ${name}`, 'cyan');
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue');
}

async function makeRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (authToken && options.auth !== false) {
    defaultOptions.headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  const data = await response.json();
  return { response, data };
}

// Test 1: Health Check
async function testHealthCheck() {
  logTest('Health Check');
  
  try {
    const { response, data } = await makeRequest('/health', { auth: false });
    
    if (response.ok && data.success) {
      logSuccess('Server is running');
      logInfo(`Message: ${data.message}`);
      logInfo(`Timestamp: ${data.timestamp}`);
      if (data.endpoints) {
        logInfo('Available endpoints:');
        Object.entries(data.endpoints).forEach(([key, value]) => {
          console.log(`  - ${key}: ${value}`);
        });
      }
      return true;
    } else {
      logError('Health check failed');
      return false;
    }
  } catch (error) {
    logError(`Health check error: ${error.message}`);
    return false;
  }
}

// Test 2: User Registration
async function testRegistration() {
  logTest('User Registration');
  
  const userData = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'Test123!@#',
    role: 'provider',
    location: 'Sacramento, CA'
  };

  try {
    const { response, data } = await makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      auth: false
    });

    if (response.ok && data.success) {
      authToken = data.token;
      testUserId = data.user._id;
      
      logSuccess('User registered successfully');
      logInfo(`User ID: ${testUserId}`);
      logInfo(`Email: ${userData.email}`);
      logInfo(`Role: ${userData.role}`);
      logInfo(`Token received: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      logError(`Registration failed: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Registration error: ${error.message}`);
    return false;
  }
}

// Test 3: Get Current User
async function testGetMe() {
  logTest('Get Current User');
  
  try {
    const { response, data } = await makeRequest('/auth/me');

    if (response.ok && data.success) {
      logSuccess('User data retrieved');
      logInfo(`Name: ${data.data.name}`);
      logInfo(`Email: ${data.data.email}`);
      logInfo(`Role: ${data.data.role}`);
      return true;
    } else {
      logError(`Get user failed: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Get user error: ${error.message}`);
    return false;
  }
}

// Test 4: Create Service
async function testCreateService() {
  logTest('Create Service');
  
  const serviceData = {
    title: 'Professional Plumbing Services',
    description: 'Expert plumbing repairs and installations',
    category: 'Home Services',
    price: {
      amount: 75,
      type: 'hourly'
    },
    location: { city: 'Sacramento', state: 'CA' },
    availability: 'available',
  };

  try {
    const { response, data } = await makeRequest('/services', {
      method: 'POST',
      body: JSON.stringify(serviceData)
    });

    if (response.ok && data.success) {
      testServiceId = data.data._id;
      
      logSuccess('Service created successfully');
      logInfo(`Service ID: ${testServiceId}`);
      logInfo(`Title: ${data.data.title}`);
      logInfo(`Price: $${data.data.price.amount}/${data.data.price.type}`);
      return true;
    } else {
      logError(`Create service failed: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Create service error: ${error.message}`);
    return false;
  }
}

// Test 5: Get All Services
async function testGetServices() {
  logTest('Get All Services');
  
  try {
    const { response, data } = await makeRequest('/services', { auth: false });

    if (response.ok && data.success) {
      logSuccess('Services retrieved successfully');
      logInfo(`Total services: ${data.count}`);
      
      if (data.data && data.data.length > 0) {
        logInfo('Sample services:');
        data.data.slice(0, 2).forEach((service, index) => {
          console.log(`  ${index + 1}. ${service.title} - $${service.price.amount}`);
        });
      }
      return true;
    } else {
      logError(`Get services failed: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Get services error: ${error.message}`);
    return false;
  }
}

// Test 6: Get Single Service
async function testGetService() {
  logTest('Get Single Service');
  
  if (!testServiceId) {
    logError('No service ID available for testing');
    return false;
  }

  try {
    const { response, data } = await makeRequest(`/services/${testServiceId}`, {
      auth: false
    });

    if (response.ok && data.success) {
      logSuccess('Service retrieved successfully');
      logInfo(`Title: ${data.data.title}`);
      logInfo(`Provider: ${data.data.provider.name}`);
      logInfo(`Rating: ${data.data.rating || 'No ratings yet'}`);
      return true;
    } else {
      logError(`Get service failed: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Get service error: ${error.message}`);
    return false;
  }
}

// Test 7: Update Service
async function testUpdateService() {
  logTest('Update Service');
  
  if (!testServiceId) {
    logError('No service ID available for testing');
    return false;
  }

  const updateData = {
    price: { amount: 85 },
    description: 'Updated: Expert plumbing repairs and installations with 10+ years experience'
  };

  try {
    const { response, data } = await makeRequest(`/services/${testServiceId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });

    if (response.ok && data.success) {
      logSuccess('Service updated successfully');
      logInfo(`New price: $${data.data.price.amount}`);
      logInfo(`Updated description: ${data.data.description.substring(0, 50)}...`);
      return true;
    } else {
      logError(`Update service failed: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Update service error: ${error.message}`);
    return false;
  }
}

// Test 8: Get User Bookings
async function testGetBookings() {
  logTest('Get User Bookings');
  
  try {
    const { response, data } = await makeRequest('/bookings');

    if (response.ok && data.success) {
      logSuccess('Bookings retrieved successfully');
      logInfo(`Total bookings: ${data.count}`);
      return true;
    } else {
      logError(`Get bookings failed: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Get bookings error: ${error.message}`);
    return false;
  }
}

// Test 9: Get Messages
async function testGetMessages() {
  logTest('Get Messages');
  
  try {
    const { response, data } = await makeRequest('/messages/conversations');

    if (response.ok && data.success) {
      logSuccess('Messages retrieved successfully');
      logInfo(`Total conversations: ${data.count}`);
      return true;
    } else {
      logError(`Get messages failed: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Get messages error: ${error.message}`);
    return false;
  }
}

// Test 10: Search Services
async function testSearchServices() {
  logTest('Search Services');
  
  try {
    const { response, data } = await makeRequest('/services?category=Home Services&minPrice=50&maxPrice=100', {
      auth: false
    });

    if (response.ok && data.success) {
      logSuccess('Service search successful');
      logInfo(`Matching services: ${data.count}`);
      return true;
    } else {
      logError(`Search failed: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Search error: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log('\n' + '═'.repeat(60), 'yellow');
  log('🚀 PRODIGY CONNECT API TEST SUITE', 'yellow');
  log('═'.repeat(60) + '\n', 'yellow');

  logInfo(`Testing API at: ${API_URL}`);
  logInfo(`Timestamp: ${new Date().toISOString()}\n`);

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'User Registration', fn: testRegistration },
    { name: 'Get Current User', fn: testGetMe },
    { name: 'Create Service', fn: testCreateService },
    { name: 'Get All Services', fn: testGetServices },
    { name: 'Get Single Service', fn: testGetService },
    { name: 'Update Service', fn: testUpdateService },
    { name: 'Get User Bookings', fn: testGetBookings },
    { name: 'Get Messages', fn: testGetMessages },
    { name: 'Search Services', fn: testSearchServices },
  ];

  const results = [];

  for (const test of tests) {
    try {
      const success = await test.fn();
      results.push({ name: test.name, success });
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      logError(`Test "${test.name}" threw an error: ${error.message}`);
      results.push({ name: test.name, success: false });
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  log('📊 TEST SUMMARY', 'yellow');
  console.log('═'.repeat(60));

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  results.forEach(result => {
    if (result.success) {
      logSuccess(`${result.name}`);
    } else {
      logError(`${result.name}`);
    }
  });

  console.log('\n' + '-'.repeat(60));
  log(`Total Tests: ${results.length}`, 'blue');
  logSuccess(`Passed: ${passed}`);
  if (failed > 0) {
    logError(`Failed: ${failed}`);
  }
  console.log('-'.repeat(60) + '\n');

  if (failed === 0) {
    log('🎉 All tests passed!', 'green');
  } else {
    log('⚠️  Some tests failed. Check the output above for details.', 'yellow');
  }
}

// Run the tests
runAllTests().catch(error => {
  logError(`Fatal error: ${error.message}`);
  process.exit(1);
});
