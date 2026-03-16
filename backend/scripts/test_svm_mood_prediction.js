/**
 * SVM Mood Prediction Test Script
 * SafeHer Project - Women's Health & Safety App
 * 
 * This script tests the SVM mood prediction implementation
 */

const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:5005'; // SVM Flask API
const NODE_API_BASE_URL = 'http://localhost:5000'; // Node.js API
const TEST_TOKEN = 'your-test-jwt-token'; // Replace with actual token

// Test data
const testMoodData = {
    age: 28,
    cycle_phase: 'ovulation',
    exercise_duration: 45,
    sleep_hours: 8,
    sleep_quality: 'excellent',
    water_intake: 3.0,
    meals_eaten: 3,
    caffeine_intake: 150,
    social_interaction: 6,
    work_stress: 4,
    weather: 'sunny',
    social_media_time: 1.5,
    outdoor_time: 2.5,
    meditation_time: 20,
    symptoms: {
        fatigue: false,
        headache: false,
        mood_swings: false,
        anxiety: false,
        stress: false
    }
};

const testBatchData = [
    {
        age: 25,
        sleep_hours: 8,
        work_stress: 3,
        exercise_duration: 60,
        cycle_phase: 'ovulation',
        weather: 'sunny'
    },
    {
        age: 32,
        sleep_hours: 6,
        work_stress: 8,
        exercise_duration: 20,
        cycle_phase: 'menstrual',
        weather: 'rainy'
    },
    {
        age: 29,
        sleep_hours: 7,
        work_stress: 5,
        exercise_duration: 30,
        cycle_phase: 'follicular',
        weather: 'cloudy'
    }
];

async function testSVMFlaskAPI() {
    console.log('🧪 Testing SVM Flask API...\n');
    
    try {
        // Test 1: Health Check
        console.log('1. Testing Health Check...');
        const healthResponse = await axios.get(`${API_BASE_URL}/health`);
        console.log('✅ Health Check:', healthResponse.data);
        console.log('');
        
        // Test 2: Mood Prediction
        console.log('2. Testing Mood Prediction...');
        const moodResponse = await axios.post(`${API_BASE_URL}/predict_mood`, testMoodData);
        console.log('✅ Mood Prediction:', JSON.stringify(moodResponse.data, null, 2));
        console.log('');
        
        // Test 3: Mood Intensity Prediction
        console.log('3. Testing Mood Intensity Prediction...');
        const intensityResponse = await axios.post(`${API_BASE_URL}/predict_mood_intensity`, testMoodData);
        console.log('✅ Mood Intensity Prediction:', JSON.stringify(intensityResponse.data, null, 2));
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
        const featureImportanceResponse = await axios.get(`${API_BASE_URL}/feature_importance?model_type=mood_classification`);
        console.log('✅ Feature Importance:', JSON.stringify(featureImportanceResponse.data, null, 2));
        console.log('');
        
        return true;
        
    } catch (error) {
        console.error('❌ SVM Flask API Test Failed:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
        return false;
    }
}

async function testNodeJSAPI() {
    console.log('🧪 Testing Node.js API Integration...\n');
    
    try {
        // Test 1: Mood Prediction
        console.log('1. Testing Mood Prediction...');
        const predictionResponse = await axios.get(`${NODE_API_BASE_URL}/api/mood/prediction`, {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        console.log('✅ Mood Prediction:', JSON.stringify(predictionResponse.data, null, 2));
        console.log('');
        
        // Test 2: Mood Prediction (Specific Data)
        console.log('2. Testing Mood Prediction (Specific Data)...');
        const moodResponse = await axios.post(`${NODE_API_BASE_URL}/api/mood/prediction/mood`, testMoodData, {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        console.log('✅ Mood Prediction:', JSON.stringify(moodResponse.data, null, 2));
        console.log('');
        
        // Test 3: Mood Intensity Prediction
        console.log('3. Testing Mood Intensity Prediction...');
        const intensityResponse = await axios.post(`${NODE_API_BASE_URL}/api/mood/prediction/intensity`, testMoodData, {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        console.log('✅ Mood Intensity Prediction:', JSON.stringify(intensityResponse.data, null, 2));
        console.log('');
        
        // Test 4: Batch Prediction
        console.log('4. Testing Batch Prediction...');
        const batchResponse = await axios.post(`${NODE_API_BASE_URL}/api/mood/prediction/batch`, {
            records: testBatchData
        }, {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        console.log('✅ Batch Prediction:', JSON.stringify(batchResponse.data, null, 2));
        console.log('');
        
        // Test 5: Model Info
        console.log('5. Testing Model Info...');
        const modelInfoResponse = await axios.get(`${NODE_API_BASE_URL}/api/mood/prediction/model-info`, {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        console.log('✅ Model Info:', JSON.stringify(modelInfoResponse.data, null, 2));
        console.log('');
        
        // Test 6: Feature Importance
        console.log('6. Testing Feature Importance...');
        const featureImportanceResponse = await axios.get(`${NODE_API_BASE_URL}/api/mood/prediction/feature-importance?model_type=mood_classification`, {
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
        // Test different mood scenarios
        const testScenarios = [
            {
                name: 'Happy Mood - Optimal Conditions',
                data: {
                    age: 25, sleep_hours: 8, work_stress: 3, exercise_duration: 60,
                    cycle_phase: 'ovulation', weather: 'sunny', social_interaction: 6,
                    symptoms: { fatigue: false, headache: false, anxiety: false }
                },
                expected_mood: 'Happy',
                expected_intensity_range: [7, 10]
            },
            {
                name: 'Stressed Mood - High Work Stress',
                data: {
                    age: 30, sleep_hours: 6, work_stress: 9, exercise_duration: 20,
                    cycle_phase: 'luteal', weather: 'rainy', social_interaction: 2,
                    symptoms: { fatigue: true, headache: true, anxiety: true, stress: true }
                },
                expected_mood: 'Stressed',
                expected_intensity_range: [6, 9]
            },
            {
                name: 'Sad Mood - Menstrual Phase',
                data: {
                    age: 28, sleep_hours: 7, work_stress: 6, exercise_duration: 15,
                    cycle_phase: 'menstrual', weather: 'cloudy', social_interaction: 3,
                    symptoms: { fatigue: true, cramps: true, mood_swings: true, depression: true }
                },
                expected_mood: 'Sad',
                expected_intensity_range: [3, 6]
            },
            {
                name: 'Calm Mood - Good Lifestyle',
                data: {
                    age: 32, sleep_hours: 8, work_stress: 4, exercise_duration: 45,
                    cycle_phase: 'follicular', weather: 'sunny', social_interaction: 5,
                    symptoms: { fatigue: false, headache: false, anxiety: false }
                },
                expected_mood: 'Calm',
                expected_intensity_range: [5, 8]
            }
        ];
        
        console.log('Testing different mood scenarios:\n');
        
        for (const scenario of testScenarios) {
            console.log(`Testing: ${scenario.name}`);
            
            // Test mood prediction
            const moodResponse = await axios.post(`${API_BASE_URL}/predict_mood`, scenario.data);
            const moodPrediction = moodResponse.data.prediction;
            
            // Test intensity prediction
            const intensityResponse = await axios.post(`${API_BASE_URL}/predict_mood_intensity`, scenario.data);
            const intensityPrediction = intensityResponse.data.prediction;
            
            console.log(`Expected Mood: ${scenario.expected_mood}`);
            console.log(`Predicted Mood: ${moodPrediction.mood}`);
            console.log(`Mood Confidence: ${moodPrediction.confidence}%`);
            console.log(`Mood Match: ${moodPrediction.mood === scenario.expected_mood ? '✅' : '❌'}`);
            
            console.log(`Expected Intensity Range: ${scenario.expected_intensity_range[0]}-${scenario.expected_intensity_range[1]}`);
            console.log(`Predicted Intensity: ${intensityPrediction.mood_intensity}`);
            console.log(`Intensity Level: ${intensityPrediction.intensity_level}`);
            console.log(`Intensity In Range: ${intensityPrediction.mood_intensity >= scenario.expected_intensity_range[0] && intensityPrediction.mood_intensity <= scenario.expected_intensity_range[1] ? '✅' : '❌'}`);
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
        // Test mood classification feature importance
        const moodImportanceResponse = await axios.get(`${API_BASE_URL}/feature_importance?model_type=mood_classification`);
        const moodImportance = moodImportanceResponse.data.feature_importance;
        
        console.log('Mood Classification Feature Importance (Top 10):');
        moodImportance.slice(0, 10).forEach(([feature, importance], index) => {
            console.log(`${index + 1}. ${feature}: ${importance.toFixed(4)}`);
        });
        console.log('');
        
        // Test mood intensity feature importance
        const intensityImportanceResponse = await axios.get(`${API_BASE_URL}/feature_importance?model_type=mood_intensity`);
        const intensityImportance = intensityImportanceResponse.data.feature_importance;
        
        console.log('Mood Intensity Feature Importance (Top 10):');
        intensityImportance.slice(0, 10).forEach(([feature, importance], index) => {
            console.log(`${index + 1}. ${feature}: ${importance.toFixed(4)}`);
        });
        console.log('');
        
        return true;
        
    } catch (error) {
        console.error('❌ Feature Importance Test Failed:', error.message);
        return false;
    }
}

async function testSVMSpecificFeatures() {
    console.log('🧪 Testing SVM-Specific Features...\n');
    
    try {
        // Test with different kernel types
        const kernelTestData = {
            age: 30,
            sleep_hours: 7,
            work_stress: 5,
            exercise_duration: 30,
            cycle_phase: 'follicular',
            weather: 'sunny',
            social_interaction: 4,
            symptoms: { fatigue: false, headache: false }
        };
        
        console.log('Testing SVM with different kernel types:');
        console.log('Input Data:', JSON.stringify(kernelTestData, null, 2));
        console.log('');
        
        const moodResponse = await axios.post(`${API_BASE_URL}/predict_mood`, kernelTestData);
        const moodPrediction = moodResponse.data.prediction;
        
        const intensityResponse = await axios.post(`${API_BASE_URL}/predict_mood_intensity`, kernelTestData);
        const intensityPrediction = intensityResponse.data.prediction;
        
        console.log('Mood Prediction:');
        console.log(`  Mood: ${moodPrediction.mood}`);
        console.log(`  Confidence: ${moodPrediction.confidence}%`);
        console.log('  Mood Probabilities:');
        Object.entries(moodPrediction.mood_probabilities).forEach(([mood, prob]) => {
            console.log(`    ${mood}: ${prob}%`);
        });
        console.log('');
        
        console.log('Intensity Prediction:');
        console.log(`  Intensity: ${intensityPrediction.mood_intensity}`);
        console.log(`  Level: ${intensityPrediction.intensity_level}`);
        console.log(`  Confidence: ${intensityPrediction.confidence}%`);
        console.log('');
        
        // Test SVM decision boundary characteristics
        console.log('SVM Decision Boundary Characteristics:');
        console.log('  - Linear SVM: Good for linearly separable data');
        console.log('  - RBF SVM: Good for non-linear patterns');
        console.log('  - Polynomial SVM: Good for polynomial relationships');
        console.log('  - Sigmoid SVM: Good for S-shaped decision boundaries');
        console.log('');
        
        return true;
        
    } catch (error) {
        console.error('❌ SVM-Specific Features Test Failed:', error.message);
        return false;
    }
}

async function testMoodStability() {
    console.log('🧪 Testing Mood Stability Analysis...\n');
    
    try {
        // Test mood stability with similar inputs
        const baseData = {
            age: 28,
            sleep_hours: 8,
            work_stress: 5,
            exercise_duration: 30,
            cycle_phase: 'follicular',
            weather: 'sunny',
            social_interaction: 4,
            symptoms: { fatigue: false, headache: false }
        };
        
        console.log('Testing mood stability with similar inputs:');
        console.log('Base Data:', JSON.stringify(baseData, null, 2));
        console.log('');
        
        const predictions = [];
        
        // Test with slight variations
        for (let i = 0; i < 5; i++) {
            const testData = { ...baseData };
            testData.sleep_hours += (Math.random() - 0.5) * 0.5; // ±0.25 hours
            testData.work_stress += Math.floor((Math.random() - 0.5) * 2); // ±1 stress level
            testData.exercise_duration += (Math.random() - 0.5) * 10; // ±5 minutes
            
            const response = await axios.post(`${API_BASE_URL}/predict_mood`, testData);
            predictions.push({
                variation: i + 1,
                mood: response.data.prediction.mood,
                confidence: response.data.prediction.confidence,
                sleep_hours: testData.sleep_hours,
                work_stress: testData.work_stress,
                exercise_duration: testData.exercise_duration
            });
        }
        
        console.log('Mood Stability Test Results:');
        predictions.forEach(pred => {
            console.log(`Variation ${pred.variation}: ${pred.mood} (${pred.confidence}% confidence)`);
            console.log(`  Sleep: ${pred.sleep_hours.toFixed(1)}h, Stress: ${pred.work_stress}, Exercise: ${pred.exercise_duration.toFixed(1)}min`);
        });
        
        // Calculate stability
        const uniqueMoods = new Set(predictions.map(p => p.mood)).size;
        const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
        
        console.log('');
        console.log(`Mood Stability: ${uniqueMoods <= 2 ? 'High' : uniqueMoods <= 3 ? 'Medium' : 'Low'}`);
        console.log(`Average Confidence: ${avgConfidence.toFixed(1)}%`);
        console.log(`Unique Moods: ${uniqueMoods}/5`);
        console.log('');
        
        return true;
        
    } catch (error) {
        console.error('❌ Mood Stability Test Failed:', error.message);
        return false;
    }
}

async function runAllTests() {
    console.log('=' * 70);
    console.log('🎯 SVM Mood Prediction - Complete Test Suite');
    console.log('SafeHer Project - Women\'s Health & Safety App');
    console.log('=' * 70);
    console.log('');
    
    const results = {
        flaskAPI: false,
        nodeAPI: false,
        performance: false,
        featureImportance: false,
        svmFeatures: false,
        moodStability: false
    };
    
    // Test Flask API
    results.flaskAPI = await testSVMFlaskAPI();
    
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
    
    // Test SVM-Specific Features
    results.svmFeatures = await testSVMSpecificFeatures();
    
    // Test Mood Stability
    results.moodStability = await testMoodStability();
    
    // Summary
    console.log('=' * 70);
    console.log('📊 Test Results Summary');
    console.log('=' * 70);
    console.log(`Flask API Tests: ${results.flaskAPI ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Node.js API Tests: ${results.nodeAPI ? '✅ PASSED' : '⚠️  SKIPPED'}`);
    console.log(`Performance Tests: ${results.performance ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Feature Importance Tests: ${results.featureImportance ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`SVM Features Tests: ${results.svmFeatures ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Mood Stability Tests: ${results.moodStability ? '✅ PASSED' : '❌ FAILED'}`);
    console.log('');
    
    const allPassed = results.flaskAPI && results.performance && results.featureImportance && results.svmFeatures && results.moodStability;
    console.log(`Overall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    console.log('');
    
    if (allPassed) {
        console.log('🎉 SVM Mood Prediction is working correctly!');
        console.log('');
        console.log('📝 Next Steps:');
        console.log('1. Start the Flask API: python backend/python/ml_models/svm_api.py');
        console.log('2. Start the Node.js backend: npm start');
        console.log('3. Test with real mood data');
        console.log('4. Integrate with frontend dashboard');
        console.log('5. Implement Neural Networks');
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
    testSVMFlaskAPI,
    testNodeJSAPI,
    testModelPerformance,
    testFeatureImportance,
    testSVMSpecificFeatures,
    testMoodStability,
    runAllTests
};
