/**
 * Decision Tree Pregnancy Health Prediction Test Script
 * SafeHer Project - Women's Health & Safety App
 * 
 * This script tests the Decision Tree pregnancy health prediction implementation
 */

const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:5004'; // Decision Tree Flask API
const NODE_API_BASE_URL = 'http://localhost:5000'; // Node.js API
const TEST_TOKEN = 'your-test-jwt-token'; // Replace with actual token

// Test data
const testPregnancyData = {
    week: 25,
    age: 32,
    weight: 68,
    weight_gain: 8,
    systolic: 135,
    diastolic: 85,
    blood_sugar: 120,
    mood: 'anxious',
    energy: 4,
    stress: 7,
    sleep_hours: 6,
    sleep_quality: 'fair',
    meals_eaten: 3,
    water_intake: 2.5,
    exercise: true,
    exercise_duration: 30,
    kick_count: 5,
    symptoms: {
        fatigue: true,
        back_pain: true,
        heartburn: true,
        swelling: false
    }
};

const testBatchData = [
    {
        week: 20,
        age: 28,
        weight: 65,
        systolic: 120,
        diastolic: 80,
        blood_sugar: 85,
        mood: 'happy',
        energy: 6,
        stress: 4
    },
    {
        week: 30,
        age: 35,
        weight: 70,
        systolic: 140,
        diastolic: 90,
        blood_sugar: 140,
        mood: 'anxious',
        energy: 3,
        stress: 8
    },
    {
        week: 15,
        age: 25,
        weight: 60,
        systolic: 110,
        diastolic: 70,
        blood_sugar: 90,
        mood: 'excited',
        energy: 7,
        stress: 3
    }
];

async function testDecisionTreeFlaskAPI() {
    console.log('🧪 Testing Decision Tree Flask API...\n');
    
    try {
        // Test 1: Health Check
        console.log('1. Testing Health Check...');
        const healthResponse = await axios.get(`${API_BASE_URL}/health`);
        console.log('✅ Health Check:', healthResponse.data);
        console.log('');
        
        // Test 2: Health Risk Prediction
        console.log('2. Testing Health Risk Prediction...');
        const healthRiskResponse = await axios.post(`${API_BASE_URL}/predict_health_risk`, testPregnancyData);
        console.log('✅ Health Risk Prediction:', JSON.stringify(healthRiskResponse.data, null, 2));
        console.log('');
        
        // Test 3: Complications Prediction
        console.log('3. Testing Complications Prediction...');
        const complicationsResponse = await axios.post(`${API_BASE_URL}/predict_complications`, testPregnancyData);
        console.log('✅ Complications Prediction:', JSON.stringify(complicationsResponse.data, null, 2));
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
        
        // Test 6: Feature Importance
        console.log('6. Testing Feature Importance...');
        const featureImportanceResponse = await axios.get(`${API_BASE_URL}/feature_importance?model_type=health_risk`);
        console.log('✅ Feature Importance:', JSON.stringify(featureImportanceResponse.data, null, 2));
        console.log('');
        
        return true;
        
    } catch (error) {
        console.error('❌ Decision Tree Flask API Test Failed:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
        return false;
    }
}

async function testNodeJSAPI() {
    console.log('🧪 Testing Node.js API Integration...\n');
    
    try {
        // Test 1: Pregnancy Health Prediction
        console.log('1. Testing Pregnancy Health Prediction...');
        const predictionResponse = await axios.get(`${NODE_API_BASE_URL}/api/pregnancy/health-prediction`, {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        console.log('✅ Pregnancy Health Prediction:', JSON.stringify(predictionResponse.data, null, 2));
        console.log('');
        
        // Test 2: Health Risk Prediction
        console.log('2. Testing Health Risk Prediction...');
        const healthRiskResponse = await axios.post(`${NODE_API_BASE_URL}/api/pregnancy/health-prediction/health-risk`, testPregnancyData, {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        console.log('✅ Health Risk Prediction:', JSON.stringify(healthRiskResponse.data, null, 2));
        console.log('');
        
        // Test 3: Complications Prediction
        console.log('3. Testing Complications Prediction...');
        const complicationsResponse = await axios.post(`${NODE_API_BASE_URL}/api/pregnancy/health-prediction/complications`, testPregnancyData, {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        console.log('✅ Complications Prediction:', JSON.stringify(complicationsResponse.data, null, 2));
        console.log('');
        
        // Test 4: Batch Prediction
        console.log('4. Testing Batch Prediction...');
        const batchResponse = await axios.post(`${NODE_API_BASE_URL}/api/pregnancy/health-prediction/batch`, {
            records: testBatchData
        }, {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        console.log('✅ Batch Prediction:', JSON.stringify(batchResponse.data, null, 2));
        console.log('');
        
        // Test 5: Model Info
        console.log('5. Testing Model Info...');
        const modelInfoResponse = await axios.get(`${NODE_API_BASE_URL}/api/pregnancy/health-prediction/model-info`, {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        console.log('✅ Model Info:', JSON.stringify(modelInfoResponse.data, null, 2));
        console.log('');
        
        // Test 6: Feature Importance
        console.log('6. Testing Feature Importance...');
        const featureImportanceResponse = await axios.get(`${NODE_API_BASE_URL}/api/pregnancy/health-prediction/feature-importance?model_type=health_risk`, {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        console.log('✅ Feature Importance:', JSON.stringify(featureImportanceResponse.data, null, 2));
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
        // Test different pregnancy scenarios
        const testScenarios = [
            {
                name: 'Low Risk - Healthy Second Trimester',
                data: {
                    week: 20, age: 28, weight: 65, systolic: 115, diastolic: 75,
                    blood_sugar: 85, mood: 'happy', energy: 6, stress: 4,
                    symptoms: { fatigue: false, back_pain: false }
                },
                expected_risk: 'Low Risk',
                expected_complications: 'No Complications'
            },
            {
                name: 'Moderate Risk - High Blood Pressure',
                data: {
                    week: 25, age: 32, weight: 68, systolic: 135, diastolic: 85,
                    blood_sugar: 100, mood: 'anxious', energy: 4, stress: 7,
                    symptoms: { fatigue: true, back_pain: true }
                },
                expected_risk: 'Moderate Risk',
                expected_complications: 'High Blood Pressure'
            },
            {
                name: 'High Risk - Gestational Diabetes',
                data: {
                    week: 30, age: 35, weight: 70, systolic: 140, diastolic: 90,
                    blood_sugar: 150, mood: 'worried', energy: 3, stress: 8,
                    symptoms: { fatigue: true, swelling: true }
                },
                expected_risk: 'High Risk',
                expected_complications: 'Gestational Diabetes'
            },
            {
                name: 'Critical Risk - Multiple Complications',
                data: {
                    week: 35, age: 40, weight: 75, systolic: 160, diastolic: 100,
                    blood_sugar: 180, mood: 'anxious', energy: 2, stress: 9,
                    symptoms: { fatigue: true, swelling: true, back_pain: true }
                },
                expected_risk: 'Critical Risk',
                expected_complications: 'Preeclampsia'
            }
        ];
        
        console.log('Testing different pregnancy scenarios:\n');
        
        for (const scenario of testScenarios) {
            console.log(`Testing: ${scenario.name}`);
            
            // Test health risk prediction
            const healthRiskResponse = await axios.post(`${API_BASE_URL}/predict_health_risk`, scenario.data);
            const healthRiskPrediction = healthRiskResponse.data.prediction;
            
            // Test complications prediction
            const complicationsResponse = await axios.post(`${API_BASE_URL}/predict_complications`, scenario.data);
            const complicationsPrediction = complicationsResponse.data.prediction;
            
            console.log(`Expected Health Risk: ${scenario.expected_risk}`);
            console.log(`Predicted Health Risk: ${healthRiskPrediction.health_risk}`);
            console.log(`Health Risk Confidence: ${healthRiskPrediction.confidence}%`);
            console.log(`Health Risk Match: ${healthRiskPrediction.health_risk === scenario.expected_risk ? '✅' : '❌'}`);
            
            console.log(`Expected Complications: ${scenario.expected_complications}`);
            console.log(`Predicted Complications: ${complicationsPrediction.complications}`);
            console.log(`Complications Confidence: ${complicationsPrediction.confidence}%`);
            console.log(`Complications Match: ${complicationsPrediction.complications === scenario.expected_complications ? '✅' : '❌'}`);
            console.log('');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Model Performance Test Failed:', error.message);
        return false;
    }
}

async function testFeatureImportance() {
    console.log('🧪 Testing Feature Importance...\n');
    
    try {
        // Test health risk feature importance
        const healthRiskImportanceResponse = await axios.get(`${API_BASE_URL}/feature_importance?model_type=health_risk`);
        const healthRiskImportance = healthRiskImportanceResponse.data.feature_importance;
        
        console.log('Health Risk Feature Importance (Top 10):');
        healthRiskImportance.slice(0, 10).forEach(([feature, importance], index) => {
            console.log(`${index + 1}. ${feature}: ${importance.toFixed(4)}`);
        });
        console.log('');
        
        // Test complications feature importance
        const complicationsImportanceResponse = await axios.get(`${API_BASE_URL}/feature_importance?model_type=complications`);
        const complicationsImportance = complicationsImportanceResponse.data.feature_importance;
        
        console.log('Complications Feature Importance (Top 10):');
        complicationsImportance.slice(0, 10).forEach(([feature, importance], index) => {
            console.log(`${index + 1}. ${feature}: ${importance.toFixed(4)}`);
        });
        console.log('');
        
        return true;
        
    } catch (error) {
        console.error('❌ Feature Importance Test Failed:', error.message);
        return false;
    }
}

async function testDecisionTreeInterpretability() {
    console.log('🧪 Testing Decision Tree Interpretability...\n');
    
    try {
        // Test with simple, interpretable data
        const interpretableData = {
            week: 25,
            age: 30,
            weight: 65,
            systolic: 120,
            diastolic: 80,
            blood_sugar: 85,
            mood: 'happy',
            energy: 5,
            stress: 5,
            sleep_hours: 8,
            sleep_quality: 'good',
            meals_eaten: 3,
            water_intake: 2.5,
            exercise: true,
            exercise_duration: 30,
            kick_count: 5,
            symptoms: {
                fatigue: false,
                back_pain: false,
                heartburn: false,
                swelling: false
            }
        };
        
        console.log('Testing Decision Tree Interpretability with simple data:');
        console.log('Input Data:', JSON.stringify(interpretableData, null, 2));
        console.log('');
        
        const healthRiskResponse = await axios.post(`${API_BASE_URL}/predict_health_risk`, interpretableData);
        const healthRiskPrediction = healthRiskResponse.data.prediction;
        
        const complicationsResponse = await axios.post(`${API_BASE_URL}/predict_complications`, interpretableData);
        const complicationsPrediction = complicationsResponse.data.prediction;
        
        console.log('Health Risk Prediction:');
        console.log(`  Risk Level: ${healthRiskPrediction.health_risk}`);
        console.log(`  Confidence: ${healthRiskPrediction.confidence}%`);
        console.log('  Risk Probabilities:');
        Object.entries(healthRiskPrediction.risk_probabilities).forEach(([risk, prob]) => {
            console.log(`    ${risk}: ${prob}%`);
        });
        console.log('');
        
        console.log('Complications Prediction:');
        console.log(`  Complications: ${complicationsPrediction.complications}`);
        console.log(`  Confidence: ${complicationsPrediction.confidence}%`);
        console.log('  Complication Probabilities:');
        Object.entries(complicationsPrediction.complication_probabilities).forEach(([comp, prob]) => {
            console.log(`    ${comp}: ${prob}%`);
        });
        console.log('');
        
        return true;
        
    } catch (error) {
        console.error('❌ Decision Tree Interpretability Test Failed:', error.message);
        return false;
    }
}

async function runAllTests() {
    console.log('=' * 70);
    console.log('🎯 Decision Tree Pregnancy Health Prediction - Complete Test Suite');
    console.log('SafeHer Project - Women\'s Health & Safety App');
    console.log('=' * 70);
    console.log('');
    
    const results = {
        flaskAPI: false,
        nodeAPI: false,
        performance: false,
        featureImportance: false,
        interpretability: false
    };
    
    // Test Flask API
    results.flaskAPI = await testDecisionTreeFlaskAPI();
    
    // Test Node.js API (skip if no token)
    if (TEST_TOKEN !== 'your-test-jwt-token') {
        results.nodeAPI = await testNodeJSAPI();
    } else {
        console.log('⚠️  Skipping Node.js API tests (no valid token provided)');
    }
    
    // Test Model Performance
    results.performance = await testModelPerformance();
    
    // Test Feature Importance
    results.featureImportance = await testFeatureImportance();
    
    // Test Decision Tree Interpretability
    results.interpretability = await testDecisionTreeInterpretability();
    
    // Summary
    console.log('=' * 70);
    console.log('📊 Test Results Summary');
    console.log('=' * 70);
    console.log(`Flask API Tests: ${results.flaskAPI ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Node.js API Tests: ${results.nodeAPI ? '✅ PASSED' : '⚠️  SKIPPED'}`);
    console.log(`Performance Tests: ${results.performance ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Feature Importance Tests: ${results.featureImportance ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Interpretability Tests: ${results.interpretability ? '✅ PASSED' : '❌ FAILED'}`);
    console.log('');
    
    const allPassed = results.flaskAPI && results.performance && results.featureImportance && results.interpretability;
    console.log(`Overall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    console.log('');
    
    if (allPassed) {
        console.log('🎉 Decision Tree Pregnancy Health Prediction is working correctly!');
        console.log('');
        console.log('📝 Next Steps:');
        console.log('1. Start the Flask API: python backend/python/ml_models/decision_tree_api.py');
        console.log('2. Start the Node.js backend: npm start');
        console.log('3. Test with real pregnancy data');
        console.log('4. Integrate with frontend dashboard');
        console.log('5. Implement SVM and Neural Networks');
        console.log('6. Create model comparison dashboard');
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
    testDecisionTreeFlaskAPI,
    testNodeJSAPI,
    testModelPerformance,
    testFeatureImportance,
    testDecisionTreeInterpretability,
    runAllTests
};
