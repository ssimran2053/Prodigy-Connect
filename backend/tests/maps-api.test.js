/**
 * Google Maps API Testing Script
 * Run this file with: node tests/maps-api.test.js
 * 
 * Make sure:
 * 1. Server is running
 * 2. GOOGLE_MAPS_API_KEY is set in .env
 */

const PORT = process.env.PORT || 5001;
const API_URL = `http://localhost:${PORT}/api`;

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

// Test 1: Geocode Address
async function testGeocodeAddress() {
  logTest('Geocode Address');
  
  try {
    const { response, data } = await makeRequest('/maps/geocode', {
      method: 'POST',
      body: JSON.stringify({
        address: 'Sacramento, CA'
      })
    });

    if (response.ok && data.success) {
      logSuccess('Address geocoded successfully');
      logInfo(`Address: ${data.data.address}`);
      logInfo(`Latitude: ${data.data.location.lat}`);
      logInfo(`Longitude: ${data.data.location.lng}`);
      logInfo(`Place ID: ${data.data.placeId}`);
      return true;
    } else {
      logError(`Geocoding failed: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Geocoding error: ${error.message}`);
    return false;
  }
}

// Test 2: Reverse Geocode
async function testReverseGeocode() {
  logTest('Reverse Geocode');
  
  try {
    const { response, data } = await makeRequest('/maps/reverse-geocode', {
      method: 'POST',
      body: JSON.stringify({
        lat: 38.5816,
        lng: -121.4944
      })
    });

    if (response.ok && data.success) {
      logSuccess('Coordinates reverse geocoded successfully');
      logInfo(`Address: ${data.data.address}`);
      logInfo(`Place ID: ${data.data.placeId}`);
      return true;
    } else {
      logError(`Reverse geocoding failed: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Reverse geocoding error: ${error.message}`);
    return false;
  }
}

// Test 3: Calculate Distance
async function testCalculateDistance() {
  logTest('Calculate Distance');
  
  try {
    const { response, data } = await makeRequest('/maps/distance', {
      method: 'POST',
      body: JSON.stringify({
        origins: 'Sacramento, CA',
        destinations: 'San Francisco, CA',
        mode: 'driving'
      })
    });

    if (response.ok && data.success) {
      logSuccess('Distance calculated successfully');
      const element = data.data.rows[0].elements[0];
      if (element.status === 'OK') {
        logInfo(`Distance: ${element.distance.text}`);
        logInfo(`Duration: ${element.duration.text}`);
      }
      return true;
    } else {
      logError(`Distance calculation failed: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Distance calculation error: ${error.message}`);
    return false;
  }
}

// Test 4: Get Directions
async function testGetDirections() {
  logTest('Get Directions');
  
  try {
    const { response, data } = await makeRequest('/maps/directions', {
      method: 'POST',
      body: JSON.stringify({
        origin: 'Sacramento, CA',
        destination: 'San Francisco, CA',
        mode: 'driving'
      })
    });

    if (response.ok && data.success && data.data.routes.length > 0) {
      logSuccess('Directions retrieved successfully');
      const route = data.data.routes[0];
      const leg = route.legs[0];
      logInfo(`Route: ${route.summary}`);
      logInfo(`Distance: ${leg.distance.text}`);
      logInfo(`Duration: ${leg.duration.text}`);
      logInfo(`Steps: ${leg.steps.length}`);
      return true;
    } else {
      logError(`Directions failed: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Directions error: ${error.message}`);
    return false;
  }
}

// Test 5: Validate Address
async function testValidateAddress() {
  logTest('Validate Address');
  
  try {
    const { response, data } = await makeRequest('/maps/validate-address', {
      method: 'POST',
      body: JSON.stringify({
        address: '1600 amphitheatre pkwy mountain view'
      })
    });

    if (response.ok && data.success && data.valid) {
      logSuccess('Address validated successfully');
      logInfo(`Original: 1600 amphitheatre pkwy mountain view`);
      logInfo(`Formatted: ${data.data.formattedAddress}`);
      logInfo(`City: ${data.data.components.city}`);
      logInfo(`State: ${data.data.components.state}`);
      logInfo(`ZIP: ${data.data.components.zipCode}`);
      return true;
    } else {
      logError(`Address validation failed: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Address validation error: ${error.message}`);
    return false;
  }
}

// Test 6: Search Places
async function testSearchPlaces() {
  logTest('Search Places');
  
  try {
    const { response, data } = await makeRequest('/maps/search-places', {
      method: 'POST',
      body: JSON.stringify({
        query: 'coffee shops in Sacramento',
        location: '38.5816,-121.4944',
        radius: 5000
      })
    });

    if (response.ok && data.success) {
      logSuccess('Places search completed');
      logInfo(`Results found: ${data.count}`);
      if (data.data && data.data.length > 0) {
        logInfo(`Sample: ${data.data[0].name}`);
        logInfo(`Address: ${data.data[0].address}`);
        if (data.data[0].rating) {
          logInfo(`Rating: ${data.data[0].rating}/5`);
        }
      }
      return true;
    } else {
      logError(`Places search failed: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Places search error: ${error.message}`);
    return false;
  }
}

// Test 7: Multiple Destinations
async function testMultipleDestinations() {
  logTest('Multiple Destinations Distance');
  
  try {
    const { response, data } = await makeRequest('/maps/distance', {
      method: 'POST',
      body: JSON.stringify({
        origins: ['Sacramento, CA', 'San Jose, CA'],
        destinations: ['San Francisco, CA', 'Oakland, CA'],
        mode: 'driving'
      })
    });

    if (response.ok && data.success) {
      logSuccess('Multiple destinations calculated');
      logInfo(`Origins: ${data.data.origins.length}`);
      logInfo(`Destinations: ${data.data.destinations.length}`);
      logInfo(`Routes calculated: ${data.data.rows.length * data.data.rows[0].elements.length}`);
      return true;
    } else {
      logError(`Multiple destinations failed: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Multiple destinations error: ${error.message}`);
    return false;
  }
}

// Test 8: Transit Mode
async function testTransitMode() {
  logTest('Transit Mode Directions');
  
  try {
    const { response, data } = await makeRequest('/maps/directions', {
      method: 'POST',
      body: JSON.stringify({
        origin: 'Downtown Sacramento',
        destination: 'Sacramento Airport',
        mode: 'transit'
      })
    });

    if (response.ok && data.success) {
      logSuccess('Transit directions retrieved');
      if (data.data.routes.length > 0) {
        const leg = data.data.routes[0].legs[0];
        logInfo(`Duration: ${leg.duration.text}`);
        logInfo(`Steps: ${leg.steps.length}`);
      }
      return true;
    } else {
      logError(`Transit mode failed: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Transit mode error: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log('\n' + '═'.repeat(60), 'yellow');
  log('🗺️  GOOGLE MAPS API TEST SUITE', 'yellow');
  log('═'.repeat(60) + '\n', 'yellow');

  logInfo(`Testing API at: ${API_URL}`);
  logInfo(`Timestamp: ${new Date().toISOString()}\n`);

  const tests = [
    { name: 'Geocode Address', fn: testGeocodeAddress },
    { name: 'Reverse Geocode', fn: testReverseGeocode },
    { name: 'Calculate Distance', fn: testCalculateDistance },
    { name: 'Get Directions', fn: testGetDirections },
    { name: 'Validate Address', fn: testValidateAddress },
    { name: 'Search Places', fn: testSearchPlaces },
    { name: 'Multiple Destinations', fn: testMultipleDestinations },
    { name: 'Transit Mode', fn: testTransitMode },
  ];

  const results = [];

  for (const test of tests) {
    try {
      const success = await test.fn();
      results.push({ name: test.name, success });
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
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
    log('\n✅ Google Maps API is working correctly!', 'green');
  } else {
    log('⚠️  Some tests failed.', 'yellow');
    log('\nPossible issues:', 'yellow');
    log('  1. GOOGLE_MAPS_API_KEY not set in .env', 'yellow');
    log('  2. Required APIs not enabled in Google Cloud Console', 'yellow');
    log('  3. API key restrictions preventing access', 'yellow');
    log('  4. Billing not enabled (required even for free tier)', 'yellow');
    log('\nSee GOOGLE_MAPS_SETUP_GUIDE.md for help', 'cyan');
  }
}

// Run the tests
runAllTests().catch(error => {
  logError(`Fatal error: ${error.message}`);
  process.exit(1);
});
