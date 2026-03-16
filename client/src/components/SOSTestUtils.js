/**
 * SOS Test Utility Functions
 * 
 * This file provides utilities for testing the SOS functionality
 * including sample emergency contacts data.
 */

/**
 * Sample Emergency Contacts Data
 * Use this to populate your database for testing
 */
export const SAMPLE_EMERGENCY_CONTACTS = [
  {
    name: "John Doe",
    number: "+1234567890",
    relationship: "Family",
    email: "john.doe@example.com",
    notes: "Close family member, always available"
  },
  {
    name: "Jane Smith",
    number: "+1987654321",
    relationship: "Friend",
    email: "jane.smith@example.com",
    notes: "Best friend, lives nearby"
  },
  {
    name: "Emergency Services",
    number: "911",
    relationship: "Emergency",
    email: "",
    notes: "Local emergency services"
  },
  {
    name: "Mom",
    number: "+1555123456",
    relationship: "Family",
    email: "mom@example.com",
    notes: "Primary emergency contact"
  }
];

/**
 * Create sample contacts via API
 * Call this function to add test contacts to your database
 */
export const createSampleContacts = async (userId) => {
  const results = [];
  
  for (const contact of SAMPLE_EMERGENCY_CONTACTS) {
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(contact)
      });

      const data = await response.json();
      results.push({ success: true, contact: data });
    } catch (error) {
      results.push({ success: false, error: error.message });
    }
  }

  return results;
};

/**
 * Test location permission
 */
export const testLocationPermission = async () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ 
        supported: false, 
        message: 'Geolocation not supported' 
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          supported: true,
          permission: 'granted',
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          }
        });
      },
      (error) => {
        resolve({
          supported: true,
          permission: 'denied',
          error: error.message
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
};

/**
 * Validate contact data format
 */
export const validateContact = (contact) => {
  const errors = [];

  if (!contact.name || contact.name.trim() === '') {
    errors.push('Name is required');
  }

  if (!contact.number || contact.number.trim() === '') {
    errors.push('Phone number is required');
  }

  // Basic phone number validation (should start with + or be a number)
  if (contact.number && !/^\+?\d+$/.test(contact.number.replace(/[\s-]/g, ''))) {
    errors.push('Phone number format is invalid');
  }

  // Email validation if email is provided
  if (contact.email && contact.email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact.email)) {
      errors.push('Email format is invalid');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (number) => {
  if (!number) return '';
  
  // Remove all non-digit characters
  const digits = number.replace(/\D/g, '');
  
  // Format based on length
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length > 10) {
    // International format
    return `+${digits.slice(0, -10)} (${digits.slice(-10, -7)}) ${digits.slice(-7, -4)}-${digits.slice(-4)}`;
  }
  
  return number;
};

/**
 * Mock SOS response for testing
 */
export const mockSOSResponse = {
  success: true,
  message: "SOS alert sent successfully",
  data: {
    logId: "mock-log-id",
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      mapsLink: "https://maps.google.com/?q=40.7128,-74.0060"
    },
    timestamp: new Date().toLocaleString(),
    contactsNotified: {
      total: 3,
      emails: 2,
      sms: 2
    },
    results: {
      emails: {
        sent: 2,
        failed: 0,
        details: [
          { contact: "John Doe", email: "john@example.com", status: "sent" },
          { contact: "Jane Smith", email: "jane@example.com", status: "sent" }
        ]
      },
      sms: {
        sent: 2,
        failed: 0,
        details: [
          { contact: "John Doe", phone: "+1234567890", status: "sent" },
          { contact: "Jane Smith", phone: "+1987654321", status: "sent" }
        ]
      }
    }
  }
};

