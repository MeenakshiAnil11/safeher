// Test script to verify ML API endpoints
import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

async function testEndpoints() {
  console.log('🧪 Testing ML API Endpoints...\n');

  // Test Health Risk Prediction
  try {
    console.log('1. Testing Health Risk Prediction...');
    const healthRiskData = {
      age: 30,
      bmi: 25,
      systolic: 120,
      diastolic: 80,
      heart_rate: 70,
      blood_sugar: 90,
      cholesterol: 180,
      iron_level: 15
    };
    
    const response = await axios.post(`${BASE_URL}/api/health-risk/prediction`, healthRiskData);
    console.log('✅ Health Risk Prediction:', response.data.success ? 'SUCCESS' : 'FAILED');
    if (response.data.prediction) {
      console.log('   Risk Level:', response.data.prediction.health_risk);
      console.log('   Confidence:', response.data.prediction.confidence + '%');
    }
  } catch (error) {
    console.log('❌ Health Risk Prediction Error:', error.response?.status || error.message);
  }

  console.log('');

  // Test Mood Prediction
  try {
    console.log('2. Testing Mood Prediction...');
    const moodData = {
      age: 28,
      sleep_hours: 8,
      work_stress: 4,
      exercise_duration: 45,
      cycle_phase: 'ovulation',
      weather: 'sunny',
      social_interaction: 6,
      meditation_time: 20
    };
    
    const response = await axios.post(`${BASE_URL}/api/mood/prediction/mood`, moodData);
    console.log('✅ Mood Prediction:', response.data.success ? 'SUCCESS' : 'FAILED');
    if (response.data.prediction) {
      console.log('   Predicted Mood:', response.data.prediction.mood);
      console.log('   Confidence:', response.data.prediction.confidence + '%');
    }
  } catch (error) {
    console.log('❌ Mood Prediction Error:', error.response?.status || error.message);
  }

  console.log('');

  // Test Symptom Classification
  try {
    console.log('3. Testing Symptom Classification...');
    const symptomData = {
      symptoms: ['headache', 'fatigue'],
      mood: 'tired',
      severity: 4,
      notes: 'Feeling unwell'
    };
    
    const response = await axios.post(`${BASE_URL}/api/symptom-classification/classify`, symptomData);
    console.log('✅ Symptom Classification:', response.data.success ? 'SUCCESS' : 'FAILED');
    if (response.data.classification) {
      console.log('   Category:', response.data.classification.category);
      console.log('   Confidence:', response.data.classification.confidence + '%');
    }
  } catch (error) {
    console.log('❌ Symptom Classification Error:', error.response?.status || error.message);
  }

  console.log('');

  // Test Pregnancy Health Prediction
  try {
    console.log('4. Testing Pregnancy Health Prediction...');
    const pregnancyData = {
      week: 20,
      trimester: 2,
      weight: 65,
      symptoms: ['morning sickness'],
      blood_pressure_systolic: 120,
      blood_pressure_diastolic: 80,
      blood_sugar: 95,
      mood: 'happy',
      energy: 7,
      sleep_hours: 8,
      nutrition_score: 8,
      exercise_minutes: 30
    };
    
    const response = await axios.post(`${BASE_URL}/api/pregnancy/health-prediction/prediction`, pregnancyData);
    console.log('✅ Pregnancy Health Prediction:', response.data.success ? 'SUCCESS' : 'FAILED');
    if (response.data.prediction) {
      console.log('   Health Status:', response.data.prediction.health_status);
      console.log('   Confidence:', response.data.prediction.confidence + '%');
    }
  } catch (error) {
    console.log('❌ Pregnancy Health Prediction Error:', error.response?.status || error.message);
  }

  console.log('\n🎉 API Testing Complete!');
}

// Run the test
testEndpoints().catch(console.error);
