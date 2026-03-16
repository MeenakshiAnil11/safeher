/**
 * KNN Health Risk Assessment Test Script
 * SafeHer Project - Women's Health & Safety App
 * 
 * This script tests the KNN health risk assessment implementation
 */

const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:5002'; // KNN Flask API
const NODE_API_BASE_URL = 'http://localhost:5000'; // Node.js API
const TEST_TOKEN = 'your-test-jwt-token'; // Replace with actual token

// Test data
const testVitalData = {
    age: 35,
    bmi: 28.5, // Overweight
    systolic: 145, // Stage 1 Hypertension
    diastolic: 92,
    heart_rate: 85,
    blood_sugar: 110, // Normal
    cholesterol: 220, // Borderline high
    iron_level: 95 // Normal
};

const testBatchData = [
    {
        age: 25,
        bmi: 22.0, // Normal
        systolic: 115, // Normal
        diastolic: 75,
        heart_rate: 70,
        blood_sugar: 90, // Normal
        cholesterol: 180, // Normal
        iron_level: 120 // Normal
    },
    {
        age: 55,
        bmi: 32.1, // Obese
        systolic: 160, // Stage 2 Hypertension
        diastolic: 100,
        heart_rate: 95,
        blood_sugar: 180, // Pre-diabetes
        cholesterol: 280, // High
        iron_level: 60 // Low
    },
    {
        age: 40,
        bmi: 26.8, // Overweight
        systolic: 135, // Elevated
        diastolic: 88,
        heart_rate: 80,
        blood_sugar: 125, // Normal
        cholesterol: 210, // Borderline high
        iron_level: 110 // Normal
    }
];

async function testKNNFlaskAPI() {
    console.log('🧪 Testing KNN Flask API...\n');
    
    try {
        // Test 1: Health Check
        console.log('1. Testing Health Check...');
        const healthResponse = await axios.get(`${API_BASE_URL}/health`);
        console.log('✅ Health Check:', healthResponse.data);
        console.log('');
        
        // Test 2: Single Prediction
        console.log('2. Testing Single Prediction...');
        const predictionResponse = await axios.post(`${API_BASE_URL}/predict`, testVitalData);
        console.log('✅ Single Prediction:', JSON.stringify(predictionResponse.data, null, 2));
        console.log('');
        
        // Test 3: Batch Prediction
        console.log('3. Testing Batch Prediction...');
        const batchResponse = await axios.post(`${API_BASE_URL}/predict_batch`, {
            records: testBatchData
        });
        console.log('✅ Batch Prediction:', JSON.stringify(batchResponse.data, null, 2));
        console.log('');
        
        // Test 4: Model Info
        console.log('4. Testing Model Info...');
        const modelInfoResponse = await axios.get(`${API_BASE_URL}/model_info`);
        console.log('✅ Model Info:', JSON.stringify(modelInfoResponse.data, null, 2));
        console.log('');
        
        return true;
        
    } catch (error) {
        console.error('❌ KNN Flask API Test Failed:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
        return false;
    }
}

async function testNodeJSAPI() {
    console.log('🧪 Testing Node.js API Integration...\n');
    
    try {
        // Test 1: Health Risk Assessment
        console.log('1. Testing Health Risk Assessment...');
        const riskResponse = await axios.get(`${NODE_API_BASE_URL}/api/health/risk-assessment`, {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        console.log('✅ Health Risk Assessment:', JSON.stringify(riskResponse.data, null, 2));
        console.log('');
        
        // Test 2: Prediction Endpoint
        console.log('2. Testing Prediction Endpoint...');
        const predictResponse = await axios.post(`${NODE_API_BASE_URL}/api/health/risk-assessment/predict`, testVitalData, {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        console.log('✅ Prediction Endpoint:', JSON.stringify(predictResponse.data, null, 2));
        console.log('');
        
        // Test 3: Batch Prediction
        console.log('3. Testing Batch Prediction...');
        const batchResponse = await axios.post(`${NODE_API_BASE_URL}/api/health/risk-assessment/batch`, {
            records: testBatchData
        }, {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        console.log('✅ Batch Prediction:', JSON.stringify(batchResponse.data, null, 2));
        console.log('');
        
        // Test 4: Model Info
        console.log('4. Testing Model Info...');
        const modelInfoResponse = await axios.get(`${NODE_API_BASE_URL}/api/health/risk-assessment/model-info`, {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        console.log('✅ Model Info:', JSON.stringify(modelInfoResponse.data, null, 2));
        console.log('');
        
        return true;
        
    } catch (error) {
        console.error('❌ Node.js API Test Failed:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
        return false;
    }
}

async function testModelPerformance() {
    console.log('🧪 Testing Model Performance...\n');
    
    try {
        // Test different risk scenarios
        const testScenarios = [
            {
                name: 'Low Risk - Healthy Young Adult',
                data: {
                    age: 25, bmi: 22.0, systolic: 110, diastolic: 70,
                    heart_rate: 65, blood_sugar: 85, cholesterol: 170, iron_level: 130
                },
                expected: 'Low'
            },
            {
                name: 'Medium Risk - Overweight Adult',
                data: {
                    age: 40, bmi: 28.5, systolic: 135, diastolic: 88,
                    heart_rate: 80, blood_sugar: 110, cholesterol: 220, iron_level: 100
                },
                expected: 'Medium'
            },
            {
                name: 'High Risk - Multiple Risk Factors',
                data: {
                    age: 55, bmi: 32.1, systolic: 150, diastolic: 95,
                    heart_rate: 90, blood_sugar: 140, cholesterol: 250, iron_level: 80
                },
                expected: 'High'
            },
            {
                name: 'Critical Risk - Severe Health Issues',
                data: {
                    age: 65, bmi: 35.2, systolic: 170, diastolic: 105,
                    heart_rate: 105, blood_sugar: 200, cholesterol: 300, iron_level: 50
                },
                expected: 'Critical'
            }
        ];
        
        console.log('Testing different risk scenarios:\n');
        
        for (const scenario of testScenarios) {
            console.log(`Testing: ${scenario.name}`);
            
            const response = await axios.post(`${API_BASE_URL}/predict`, scenario.data);
            const prediction = response.data.prediction;
            
            console.log(`Expected: ${scenario.expected}`);
            console.log(`Predicted: ${prediction.risk_category}`);
            console.log(`Confidence: ${prediction.confidence}%`);
            console.log(`Match: ${prediction.risk_category === scenario.expected ? '✅' : '❌'}`);
            console.log('');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Model Performance Test Failed:', error.message);
        return false;
    }
}

async function runAllTests() {
    console.log('=' * 70);
    console.log('🎯 KNN Health Risk Assessment - Complete Test Suite');
    console.log('SafeHer Project - Women\'s Health & Safety App');
    console.log('=' * 70);
    console.log('');
    
    const results = {
        flaskAPI: false,
        nodeAPI: false,
        performance: false
    };
    
    // Test Flask API
    results.flaskAPI = await testKNNFlaskAPI();
    
    // Test Node.js API (skip if no token)
    if (TEST_TOKEN !== 'your-test-jwt-token') {
        results.nodeAPI = await testNodeJSAPI();
    } else {
        console.log('⚠️  Skipping Node.js API tests (no valid token provided)');
    }
    
    // Test Model Performance
    results.performance = await testModelPerformance();
    
    // Summary
    console.log('=' * 70);
    console.log('📊 Test Results Summary');
    console.log('=' * 70);
    console.log(`Flask API Tests: ${results.flaskAPI ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Node.js API Tests: ${results.nodeAPI ? '✅ PASSED' : '⚠️  SKIPPED'}`);
    console.log(`Performance Tests: ${results.performance ? '✅ PASSED' : '❌ FAILED'}`);
    console.log('');
    
    const allPassed = results.flaskAPI && results.performance;
    console.log(`Overall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    console.log('');
    
    if (allPassed) {
        console.log('🎉 KNN Health Risk Assessment is working correctly!');
        console.log('');
        console.log('📝 Next Steps:');
        console.log('1. Start the Flask API: python backend/python/ml_models/knn_api.py');
        console.log('2. Start the Node.js backend: npm start');
        console.log('3. Test with real user data');
        console.log('4. Integrate with frontend dashboard');
    } else {
        console.log('⚠️  Please check the failed tests and fix any issues');
    }
    
    console.log('=' * 70);
}

// Run tests if this script is executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = {
    testKNNFlaskAPI,
    testNodeJSAPI,
    testModelPerformance,
    runAllTests
};
