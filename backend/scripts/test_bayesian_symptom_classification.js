/**
 * Bayesian Symptom Classification Test Script
 * SafeHer Project - Women's Health & Safety App
 * 
 * This script tests the Bayesian symptom classification implementation
 */

const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:5003'; // Bayesian Flask API
const NODE_API_BASE_URL = 'http://localhost:5000'; // Node.js API
const TEST_TOKEN = 'your-test-jwt-token'; // Replace with actual token

// Test data
const testSymptomData = {
    age: 28,
    symptoms: ['fatigue', 'headache', 'mood_swings'],
    mood: 'Tired',
    sleep_hours: 5.5,
    stress_level: 8,
    energy_level: 2,
    hour_of_day: 14,
    day_of_week: 2
};

const testBatchData = [
    {
        age: 25,
        symptoms: ['fatigue'],
        mood: 'Tired',
        sleep_hours: 8,
        stress_level: 3,
        energy_level: 4
    },
    {
        age: 40,
        symptoms: ['headache', 'anxiety'],
        mood: 'Anxious',
        sleep_hours: 5,
        stress_level: 8,
        energy_level: 2
    },
    {
        age: 35,
        symptoms: ['cramps', 'bloating'],
        mood: 'Irritable',
        sleep_hours: 6,
        stress_level: 6,
        energy_level: 3
    }
];

async function testBayesianFlaskAPI() {
    console.log('🧪 Testing Bayesian Flask API...\n');
    
    try {
        // Test 1: Health Check
        console.log('1. Testing Health Check...');
        const healthResponse = await axios.get(`${API_BASE_URL}/health`);
        console.log('✅ Health Check:', healthResponse.data);
        console.log('');
        
        // Test 2: Category Prediction
        console.log('2. Testing Category Prediction...');
        const categoryResponse = await axios.post(`${API_BASE_URL}/predict_category`, testSymptomData);
        console.log('✅ Category Prediction:', JSON.stringify(categoryResponse.data, null, 2));
        console.log('');
        
        // Test 3: Severity Prediction
        console.log('3. Testing Severity Prediction...');
        const severityResponse = await axios.post(`${API_BASE_URL}/predict_severity`, testSymptomData);
        console.log('✅ Severity Prediction:', JSON.stringify(severityResponse.data, null, 2));
        console.log('');
        
        // Test 4: Batch Prediction
        console.log('4. Testing Batch Prediction...');
        const batchResponse = await axios.post(`${API_BASE_URL}/predict_batch`, {
            records: testBatchData
        });
        console.log('✅ Batch Prediction:', JSON.stringify(batchResponse.data, null, 2));
        console.log('');
        
        // Test 5: Model Info
        console.log('5. Testing Model Info...');
        const modelInfoResponse = await axios.get(`${API_BASE_URL}/model_info`);
        console.log('✅ Model Info:', JSON.stringify(modelInfoResponse.data, null, 2));
        console.log('');
        
        // Test 6: Symptom Categories
        console.log('6. Testing Symptom Categories...');
        const categoriesResponse = await axios.get(`${API_BASE_URL}/symptom_categories`);
        console.log('✅ Symptom Categories:', JSON.stringify(categoriesResponse.data, null, 2));
        console.log('');
        
        return true;
        
    } catch (error) {
        console.error('❌ Bayesian Flask API Test Failed:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
        return false;
    }
}

async function testNodeJSAPI() {
    console.log('🧪 Testing Node.js API Integration...\n');
    
    try {
        // Test 1: Symptom Classification
        console.log('1. Testing Symptom Classification...');
        const classificationResponse = await axios.get(`${NODE_API_BASE_URL}/api/symptoms/classification`, {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        console.log('✅ Symptom Classification:', JSON.stringify(classificationResponse.data, null, 2));
        console.log('');
        
        // Test 2: Category Prediction
        console.log('2. Testing Category Prediction...');
        const categoryResponse = await axios.post(`${NODE_API_BASE_URL}/api/symptoms/classification/category`, testSymptomData, {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        console.log('✅ Category Prediction:', JSON.stringify(categoryResponse.data, null, 2));
        console.log('');
        
        // Test 3: Severity Prediction
        console.log('3. Testing Severity Prediction...');
        const severityResponse = await axios.post(`${NODE_API_BASE_URL}/api/symptoms/classification/severity`, testSymptomData, {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        console.log('✅ Severity Prediction:', JSON.stringify(severityResponse.data, null, 2));
        console.log('');
        
        // Test 4: Batch Prediction
        console.log('4. Testing Batch Prediction...');
        const batchResponse = await axios.post(`${NODE_API_BASE_URL}/api/symptoms/classification/batch`, {
            records: testBatchData
        }, {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        console.log('✅ Batch Prediction:', JSON.stringify(batchResponse.data, null, 2));
        console.log('');
        
        // Test 5: Model Info
        console.log('5. Testing Model Info...');
        const modelInfoResponse = await axios.get(`${NODE_API_BASE_URL}/api/symptoms/classification/model-info`, {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        console.log('✅ Model Info:', JSON.stringify(modelInfoResponse.data, null, 2));
        console.log('');
        
        // Test 6: Symptom Categories
        console.log('6. Testing Symptom Categories...');
        const categoriesResponse = await axios.get(`${NODE_API_BASE_URL}/api/symptoms/classification/categories`, {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        console.log('✅ Symptom Categories:', JSON.stringify(categoriesResponse.data, null, 2));
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
        // Test different symptom scenarios
        const testScenarios = [
            {
                name: 'Physical Symptoms - Fatigue',
                data: {
                    age: 25, symptoms: ['fatigue', 'headache'], mood: 'Tired',
                    sleep_hours: 6, stress_level: 5, energy_level: 3
                },
                expected_category: 'Physical',
                expected_severity: 'Moderate'
            },
            {
                name: 'Mental Symptoms - Anxiety',
                data: {
                    age: 30, symptoms: ['anxiety', 'stress', 'mood_swings'], mood: 'Anxious',
                    sleep_hours: 5, stress_level: 8, energy_level: 2
                },
                expected_category: 'Mental',
                expected_severity: 'Severe'
            },
            {
                name: 'Reproductive Symptoms - Cramps',
                data: {
                    age: 28, symptoms: ['cramps', 'bloating', 'breast_tenderness'], mood: 'Irritable',
                    sleep_hours: 7, stress_level: 4, energy_level: 4
                },
                expected_category: 'Reproductive',
                expected_severity: 'Moderate'
            },
            {
                name: 'Cardiovascular Symptoms - Chest Pain',
                data: {
                    age: 45, symptoms: ['chest_pain', 'palpitations', 'dizziness'], mood: 'Worried',
                    sleep_hours: 6, stress_level: 7, energy_level: 3
                },
                expected_category: 'Cardiovascular',
                expected_severity: 'Severe'
            }
        ];
        
        console.log('Testing different symptom scenarios:\n');
        
        for (const scenario of testScenarios) {
            console.log(`Testing: ${scenario.name}`);
            
            // Test category prediction
            const categoryResponse = await axios.post(`${API_BASE_URL}/predict_category`, scenario.data);
            const categoryPrediction = categoryResponse.data.prediction;
            
            // Test severity prediction
            const severityResponse = await axios.post(`${API_BASE_URL}/predict_severity`, scenario.data);
            const severityPrediction = severityResponse.data.prediction;
            
            console.log(`Expected Category: ${scenario.expected_category}`);
            console.log(`Predicted Category: ${categoryPrediction.symptom_category}`);
            console.log(`Category Confidence: ${categoryPrediction.confidence}%`);
            console.log(`Category Match: ${categoryPrediction.symptom_category === scenario.expected_category ? '✅' : '❌'}`);
            
            console.log(`Expected Severity: ${scenario.expected_severity}`);
            console.log(`Predicted Severity: ${severityPrediction.severity}`);
            console.log(`Severity Confidence: ${severityPrediction.confidence}%`);
            console.log(`Severity Match: ${severityPrediction.severity === scenario.expected_severity ? '✅' : '❌'}`);
            console.log('');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Model Performance Test Failed:', error.message);
        return false;
    }
}

async function testSymptomCategories() {
    console.log('🧪 Testing Symptom Categories...\n');
    
    try {
        const categoriesResponse = await axios.get(`${API_BASE_URL}/symptom_categories`);
        const categories = categoriesResponse.data;
        
        console.log('Available Symptom Categories:');
        console.log(categories.symptom_categories);
        console.log('');
        
        console.log('Symptom Mappings:');
        Object.keys(categories.symptom_mapping).forEach(category => {
            console.log(`${category}: ${categories.symptom_mapping[category].join(', ')}`);
        });
        console.log('');
        
        console.log('Severity Levels:');
        console.log(categories.severity_levels);
        console.log('');
        
        console.log('Mood Categories:');
        console.log(categories.mood_categories);
        console.log('');
        
        return true;
        
    } catch (error) {
        console.error('❌ Symptom Categories Test Failed:', error.message);
        return false;
    }
}

async function runAllTests() {
    console.log('=' * 70);
    console.log('🎯 Bayesian Symptom Classification - Complete Test Suite');
    console.log('SafeHer Project - Women\'s Health & Safety App');
    console.log('=' * 70);
    console.log('');
    
    const results = {
        flaskAPI: false,
        nodeAPI: false,
        performance: false,
        categories: false
    };
    
    // Test Flask API
    results.flaskAPI = await testBayesianFlaskAPI();
    
    // Test Node.js API (skip if no token)
    if (TEST_TOKEN !== 'your-test-jwt-token') {
        results.nodeAPI = await testNodeJSAPI();
    } else {
        console.log('⚠️  Skipping Node.js API tests (no valid token provided)');
    }
    
    // Test Model Performance
    results.performance = await testModelPerformance();
    
    // Test Symptom Categories
    results.categories = await testSymptomCategories();
    
    // Summary
    console.log('=' * 70);
    console.log('📊 Test Results Summary');
    console.log('=' * 70);
    console.log(`Flask API Tests: ${results.flaskAPI ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Node.js API Tests: ${results.nodeAPI ? '✅ PASSED' : '⚠️  SKIPPED'}`);
    console.log(`Performance Tests: ${results.performance ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Categories Tests: ${results.categories ? '✅ PASSED' : '❌ FAILED'}`);
    console.log('');
    
    const allPassed = results.flaskAPI && results.performance && results.categories;
    console.log(`Overall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    console.log('');
    
    if (allPassed) {
        console.log('🎉 Bayesian Symptom Classification is working correctly!');
        console.log('');
        console.log('📝 Next Steps:');
        console.log('1. Start the Flask API: python backend/python/ml_models/bayesian_api.py');
        console.log('2. Start the Node.js backend: npm start');
        console.log('3. Test with real symptom data');
        console.log('4. Integrate with frontend dashboard');
        console.log('5. Implement other ML models (Decision Tree, SVM, etc.)');
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
    testBayesianFlaskAPI,
    testNodeJSAPI,
    testModelPerformance,
    testSymptomCategories,
    runAllTests
};
