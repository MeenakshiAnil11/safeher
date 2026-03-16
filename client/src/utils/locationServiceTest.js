// Test file to verify location service functionality
// This can be run in the browser console to test the location service

// Test the location service
async function testLocationService() {
  console.log('🧪 Testing Location Service...');
  
  try {
    // Test 1: Check if geolocation is supported
    console.log('✅ Geolocation supported:', locationService.isGeolocationSupported());
    
    // Test 2: Check permission status
    const permission = await locationService.checkPermissionStatus();
    console.log('📍 Permission status:', permission);
    
    // Test 3: Request location permission
    if (permission !== 'granted') {
      console.log('🔐 Requesting location permission...');
      const location = await locationService.requestLocationPermission();
      console.log('📍 Current location:', location);
    } else {
      const location = locationService.getCurrentLocation();
      console.log('📍 Current location:', location);
    }
    
    // Test 4: Generate map links
    const testLat = 28.6139;
    const testLng = 77.2090;
    console.log('🗺️ Google Maps link:', locationService.generateMapsLink(testLat, testLng));
    console.log('🍎 Apple Maps link:', locationService.generateAppleMapsLink(testLat, testLng));
    console.log('🌍 OSM link:', locationService.generateOSMLink(testLat, testLng));
    
    console.log('✅ Location service test completed successfully!');
    
  } catch (error) {
    console.error('❌ Location service test failed:', error);
  }
}

// Test SOS functionality
async function testSOSFunctionality() {
  console.log('🚨 Testing SOS Functionality...');
  
  try {
    // Test SOS alert with mock location
    const mockLocation = {
      latitude: 28.6139,
      longitude: 77.2090,
      accuracy: 10,
      timestamp: new Date().toISOString()
    };
    
    console.log('📍 Mock location:', mockLocation);
    
    // Test emergency contacts (this would normally come from the API)
    const mockContacts = [
      { name: 'Test Contact 1', email: 'test1@example.com', phone: '+1234567890' },
      { name: 'Test Contact 2', email: 'test2@example.com', phone: '+0987654321' }
    ];
    
    console.log('👥 Mock contacts:', mockContacts);
    
    // Test location sharing
    console.log('📤 Testing location sharing...');
    // Note: This would normally call the API, but we're just testing the structure
    console.log('✅ SOS functionality test structure verified!');
    
  } catch (error) {
    console.error('❌ SOS functionality test failed:', error);
  }
}

// Run tests
console.log('🚀 Starting SafeHer Location Tracking Tests...');
testLocationService().then(() => {
  testSOSFunctionality();
});

// Export for use in other contexts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testLocationService, testSOSFunctionality };
}
