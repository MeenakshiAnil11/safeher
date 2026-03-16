/**
 * Complete ML Testing Script
 * SafeHer Project - Women's Health & Safety App
 * 
 * This script tests all ML implementations at once
 */

const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const APIs = [
    { name: 'KNN Health Risk', port: 5002, endpoint: '/health' },
    { name: 'Bayesian Symptom', port: 5003, endpoint: '/health' },
    { name: 'Decision Tree Pregnancy', port: 5004, endpoint: '/health' },
    { name: 'SVM Mood', port: 5005, endpoint: '/health' }
];

const MODEL_FILES = [
    'python/models/health_risk_knn_models.pkl',
    'python/models/symptom_bayesian_models.pkl',
    'python/models/pregnancy_decision_tree_models.pkl',
    'python/models/mood_svm_models.pkl'
];

async function checkModelFiles() {
    console.log('🔍 Checking Model Files...\n');
    
    const results = {};
    
    for (const modelFile of MODEL_FILES) {
        const exists = fs.existsSync(modelFile);
        const modelName = path.basename(modelFile, '.pkl').replace('_models', '');
        results[modelName] = exists;
        
        console.log(`${exists ? '✅' : '❌'} ${modelName}: ${exists ? 'Found' : 'Missing'}`);
    }
    
    return results;
}

async function testFlaskAPIs() {
    console.log('\n🌐 Testing Flask APIs...\n');
    
    const results = {};
    
    for (const api of APIs) {
        try {
            const response = await axios.get(`http://localhost:${api.port}${api.endpoint}`, {
                timeout: 5000
            });
            
            results[api.name] = response.data.status === 'healthy';
            console.log(`${results[api.name] ? '✅' : '❌'} ${api.name}: ${response.data.status}`);
            
        } catch (error) {
            results[api.name] = false;
            console.log(`❌ ${api.name}: ${error.message}`);
        }
    }
    
    return results;
}

async function testPredictions() {
    console.log('\n🧪 Testing Predictions...\n');
    
    const testData = {
        knn: {
            age: 30, bmi: 25, systolic: 120, diastolic: 80,
            heart_rate: 70, blood_sugar: 90, cholesterol: 180, iron_level: 15
        },
        bayesian: {
            symptoms: ['fatigue', 'headache'],
            mood: 'anxious',
            severity: 7
        },
        decisionTree: {
            week: 25, age: 32, weight: 68, systolic: 135,
            diastolic: 85, blood_sugar: 120
        },
        svm: {
            age: 28, sleep_hours: 8, work_stress: 4,
            exercise_duration: 45, cycle_phase: 'ovulation'
        }
    };
    
    const results = {};
    
    // Test KNN
    try {
        const response = await axios.post('http://localhost:5002/predict_health_risk', testData.knn);
        results.knn = response.data.success;
        console.log(`✅ KNN Prediction: ${response.data.prediction.health_risk} (${response.data.prediction.confidence}%)`);
    } catch (error) {
        results.knn = false;
        console.log(`❌ KNN Prediction: ${error.message}`);
    }
    
    // Test Bayesian
    try {
        const response = await axios.post('http://localhost:5003/predict_symptom', testData.bayesian);
        results.bayesian = response.data.success;
        console.log(`✅ Bayesian Prediction: ${response.data.prediction.symptom_category} (${response.data.prediction.confidence}%)`);
    } catch (error) {
        results.bayesian = false;
        console.log(`❌ Bayesian Prediction: ${error.message}`);
    }
    
    // Test Decision Tree
    try {
        const response = await axios.post('http://localhost:5004/predict_health_risk', testData.decisionTree);
        results.decisionTree = response.data.success;
        console.log(`✅ Decision Tree Prediction: ${response.data.prediction.health_risk} (${response.data.prediction.confidence}%)`);
    } catch (error) {
        results.decisionTree = false;
        console.log(`❌ Decision Tree Prediction: ${error.message}`);
    }
    
    // Test SVM
    try {
        const response = await axios.post('http://localhost:5005/predict_mood', testData.svm);
        results.svm = response.data.success;
        console.log(`✅ SVM Prediction: ${response.data.prediction.mood} (${response.data.prediction.confidence}%)`);
    } catch (error) {
        results.svm = false;
        console.log(`❌ SVM Prediction: ${error.message}`);
    }
    
    return results;
}

async function runPythonTraining() {
    console.log('\n🚀 Training Python Models...\n');
    
    const pythonScripts = [
        'health_risk_knn.py',
        'symptom_bayesian_classifier.py',
        'pregnancy_decision_tree.py',
        'mood_svm_prediction.py'
    ];
    
    const results = {};
    
    for (const script of pythonScripts) {
        console.log(`Training ${script}...`);
        
        try {
            await new Promise((resolve, reject) => {
                const pythonProcess = spawn('python', [script], {
                    cwd: 'backend/python/ml_models',
                    stdio: 'pipe'
                });
                
                let output = '';
                let errorOutput = '';
                
                pythonProcess.stdout.on('data', (data) => {
                    output += data.toString();
                });
                
                pythonProcess.stderr.on('data', (data) => {
                    errorOutput += data.toString();
                });
                
                pythonProcess.on('close', (code) => {
                    if (code === 0) {
                        results[script] = true;
                        console.log(`✅ ${script}: Training completed`);
                        resolve();
                    } else {
                        results[script] = false;
                        console.log(`❌ ${script}: Training failed - ${errorOutput}`);
                        reject(new Error(errorOutput));
                    }
                });
            });
        } catch (error) {
            results[script] = false;
            console.log(`❌ ${script}: Training error - ${error.message}`);
        }
    }
    
    return results;
}

async function startFlaskAPIs() {
    console.log('\n🌐 Starting Flask APIs...\n');
    
    const apiScripts = [
        { script: 'knn_api.py', port: 5002, name: 'KNN' },
        { script: 'bayesian_api.py', port: 5003, name: 'Bayesian' },
        { script: 'decision_tree_api.py', port: 5004, name: 'Decision Tree' },
        { script: 'svm_api.py', port: 5005, name: 'SVM' }
    ];
    
    const processes = [];
    
    for (const api of apiScripts) {
        console.log(`Starting ${api.name} API on port ${api.port}...`);
        
        const process = spawn('python', [api.script], {
            cwd: 'backend/python/ml_models',
            stdio: 'pipe'
        });
        
        processes.push({ process, name: api.name, port: api.port });
        
        // Wait a bit for the API to start
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    return processes;
}

async function stopFlaskAPIs(processes) {
    console.log('\n🛑 Stopping Flask APIs...\n');
    
    for (const { process, name } of processes) {
        console.log(`Stopping ${name} API...`);
        process.kill();
    }
}

async function runCompleteTest() {
    console.log('=' * 70);
    console.log('🧪 Complete ML Testing Suite');
    console.log('SafeHer Project - Women\'s Health & Safety App');
    console.log('=' * 70);
    
    const results = {
        modelFiles: {},
        training: {},
        apis: {},
        predictions: {}
    };
    
    try {
        // Step 1: Check model files
        results.modelFiles = await checkModelFiles();
        
        // Step 2: Train models if needed
        const missingModels = Object.entries(results.modelFiles).filter(([_, exists]) => !exists);
        if (missingModels.length > 0) {
            console.log(`\n⚠️  Missing models detected. Training ${missingModels.length} models...`);
            results.training = await runPythonTraining();
        } else {
            console.log('\n✅ All model files found!');
        }
        
        // Step 3: Start Flask APIs
        const processes = await startFlaskAPIs();
        
        // Step 4: Test APIs
        results.apis = await testFlaskAPIs();
        
        // Step 5: Test predictions
        results.predictions = await testPredictions();
        
        // Step 6: Stop APIs
        await stopFlaskAPIs(processes);
        
    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
    }
    
    // Summary
    console.log('\n' + '=' * 70);
    console.log('📊 Test Results Summary');
    console.log('=' * 70);
    
    const allModelFiles = Object.values(results.modelFiles).every(exists => exists);
    const allAPIs = Object.values(results.apis).every(healthy => healthy);
    const allPredictions = Object.values(results.predictions).every(success => success);
    
    console.log(`Model Files: ${allModelFiles ? '✅ ALL FOUND' : '❌ SOME MISSING'}`);
    console.log(`Flask APIs: ${allAPIs ? '✅ ALL HEALTHY' : '❌ SOME UNHEALTHY'}`);
    console.log(`Predictions: ${allPredictions ? '✅ ALL WORKING' : '❌ SOME FAILED'}`);
    
    const overallSuccess = allModelFiles && allAPIs && allPredictions;
    console.log(`\nOverall Status: ${overallSuccess ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    if (overallSuccess) {
        console.log('\n🎉 ALL ML IMPLEMENTATIONS WORKING CORRECTLY!');
        console.log('\n📝 Next Steps:');
        console.log('1. Integrate with frontend dashboard');
        console.log('2. Test with real user data');
        console.log('3. Deploy to production');
        console.log('4. Create model comparison dashboard');
    } else {
        console.log('\n⚠️  Please check the failed tests and fix any issues');
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Check Python dependencies: pip install scikit-learn pandas numpy joblib flask');
        console.log('2. Train missing models: python backend/python/ml_models/[model_name].py');
        console.log('3. Check port availability: netstat -ano | findstr :500[2-5]');
        console.log('4. Check logs for specific error messages');
    }
    
    console.log('=' * 70);
}

// Run the complete test if this script is executed directly
if (require.main === module) {
    runCompleteTest().catch(console.error);
}

module.exports = {
    checkModelFiles,
    testFlaskAPIs,
    testPredictions,
    runPythonTraining,
    startFlaskAPIs,
    stopFlaskAPIs,
    runCompleteTest
};
