const { test, expect } = require('@playwright/test');

test.describe('API Testing', () => {
  const baseURL = 'http://localhost:5000/api';

  test('should test login API endpoint', async ({ request }) => {
    const response = await request.post(`${baseURL}/auth/login`, {
      data: {
        email: 'test@example.com',
        password: 'Test@1234'
      }
    });

    // API should respond (either success or error)
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(500);
  });

  test('should test register API endpoint', async ({ request }) => {
    const response = await request.post(`${baseURL}/auth/register`, {
      data: {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'Test@1234'
      }
    });

    // API should respond
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(500);
  });

  test('should test health risk prediction API', async ({ request }) => {
    const response = await request.post(`${baseURL}/health-risk/predict`, {
      data: {
        age: 25,
        bmi: 22.5,
        bloodPressure: 'normal',
        cholesterol: 'normal',
        exercise: 'moderate',
        diet: 'balanced'
      }
    });

    // API should respond
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(500);
  });

  test('should test mood prediction API', async ({ request }) => {
    const response = await request.post(`${baseURL}/mood/prediction`, {
      data: {
        symptoms: ['headache', 'fatigue'],
        mood: 'neutral',
        stressLevel: 5,
        sleepHours: 7
      }
    });

    // API should respond
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(500);
  });

  test('should test symptom classification API', async ({ request }) => {
    const response = await request.post(`${baseURL}/symptom-classification/predict`, {
      data: {
        symptoms: ['headache', 'dizziness'],
        mood: 'neutral',
        severity: 5
      }
    });

    // API should respond
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(500);
  });
});

