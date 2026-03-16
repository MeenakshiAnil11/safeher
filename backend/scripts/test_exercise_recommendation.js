import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

async function testExerciseRecommendation() {
  console.log('🧪 Testing Exercise Recommendation API...\n');

  // Test data
  const testData = {
    today: '2024-01-15',
    period_start_dates: ['2024-01-01', '2024-01-29', '2024-02-26'],
    period_lengths: [5, 5, 4],
    energy_level: 7,
    sleep_hours: 8.0,
    mood: 'happy',
    cramps: 2,
    fitness_level: 'intermediate'
  };

  try {
    console.log('📊 Test Data:');
    console.log(`  Today: ${testData.today}`);
    console.log(`  Period Start Dates: ${testData.period_start_dates.join(', ')}`);
    console.log(`  Period Lengths: ${testData.period_lengths.join(', ')}`);
    console.log(`  Energy Level: ${testData.energy_level}/10`);
    console.log(`  Sleep Hours: ${testData.sleep_hours}`);
    console.log(`  Mood: ${testData.mood}`);
    console.log(`  Cramps: ${testData.cramps}/10`);
    console.log(`  Fitness Level: ${testData.fitness_level}\n`);

    // Test Exercise Recommendation
    console.log('1. Testing Exercise Recommendation...');
    const response = await axios.post(`${BASE_URL}/api/exercise/recommend`, testData);
    
    if (response.data.success) {
      console.log('✅ Exercise Recommendation: SUCCESS');
      console.log(`   Phase: ${response.data.phase}`);
      console.log(`   Day in Cycle: ${response.data.day_in_cycle}`);
      console.log(`   Recommended Exercise: ${response.data.recommended_exercise}`);
      console.log(`   Confidence: ${Math.round(response.data.confidence * 100)}%`);
      console.log(`   Model Used: ${response.data.model_used}`);
      console.log(`   Explanation: ${response.data.explanation}`);
      
      if (response.data.safety_notes && response.data.safety_notes.length > 0) {
        console.log('   Safety Notes:');
        response.data.safety_notes.forEach(note => {
          console.log(`     - ${note}`);
        });
      }
      
      if (response.data.exercise_probabilities) {
        console.log('   Exercise Probabilities:');
        Object.entries(response.data.exercise_probabilities)
          .sort(([,a], [,b]) => b - a)
          .forEach(([exercise, probability]) => {
            console.log(`     ${exercise}: ${Math.round(probability * 100)}%`);
          });
      }
    } else {
      console.log('❌ Exercise Recommendation Failed:', response.data.message);
    }

  } catch (error) {
    console.log('❌ Exercise Recommendation Error:', error.response?.status || error.message);
    if (error.response?.data) {
      console.log('   Error Details:', error.response.data);
    }
  }

  console.log('\n' + '='.repeat(50));

  // Test Phase Detection
  try {
    console.log('\n2. Testing Phase Detection...');
    const phaseData = {
      today: '2024-01-15',
      period_start_dates: ['2024-01-01', '2024-01-29', '2024-02-26'],
      period_lengths: [5, 5, 4]
    };

    const phaseResponse = await axios.post(`${BASE_URL}/api/exercise/detect-phase`, phaseData);
    
    if (phaseResponse.data.success) {
      console.log('✅ Phase Detection: SUCCESS');
      console.log(`   Phase: ${phaseResponse.data.phase_info.phase}`);
      console.log(`   Day in Cycle: ${phaseResponse.data.phase_info.day_in_cycle}`);
      console.log(`   Average Cycle Length: ${phaseResponse.data.phase_info.avg_cycle_length}`);
      console.log(`   Average Period Length: ${phaseResponse.data.phase_info.avg_period_length}`);
      console.log(`   Days Until Next Period: ${phaseResponse.data.phase_info.days_until_period}`);
    } else {
      console.log('❌ Phase Detection Failed:', phaseResponse.data.message);
    }

  } catch (error) {
    console.log('❌ Phase Detection Error:', error.response?.status || error.message);
  }

  console.log('\n' + '='.repeat(50));

  // Test Feedback Submission
  try {
    console.log('\n3. Testing Feedback Submission...');
    const feedbackData = {
      user_id: 'test-user-123',
      recommended_exercise: 'cardio',
      actual_exercise: 'cardio',
      rating: 5,
      feedback_text: 'Great recommendation!',
      phase: 'follicular',
      symptoms: {
        energy_level: 7,
        cramps: 2,
        mood: 'happy'
      }
    };

    const feedbackResponse = await axios.post(`${BASE_URL}/api/exercise/feedback`, feedbackData);
    
    if (feedbackResponse.data.success) {
      console.log('✅ Feedback Submission: SUCCESS');
      console.log(`   Message: ${feedbackResponse.data.message}`);
    } else {
      console.log('❌ Feedback Submission Failed:', feedbackResponse.data.message);
    }

  } catch (error) {
    console.log('❌ Feedback Submission Error:', error.response?.status || error.message);
  }

  console.log('\n🎉 Exercise Recommendation API Testing Complete!');
}

// Test different scenarios
async function testMultipleScenarios() {
  console.log('\n🔄 Testing Multiple Scenarios...\n');

  const scenarios = [
    {
      name: 'Menstruation Phase - Low Energy',
      data: {
        today: '2024-01-03',
        period_start_dates: ['2024-01-01', '2024-01-29', '2024-02-26'],
        period_lengths: [5, 5, 4],
        energy_level: 3,
        sleep_hours: 6.5,
        mood: 'tired',
        cramps: 7,
        fitness_level: 'beginner'
      }
    },
    {
      name: 'Ovulation Phase - High Energy',
      data: {
        today: '2024-01-15',
        period_start_dates: ['2024-01-01', '2024-01-29', '2024-02-26'],
        period_lengths: [5, 5, 4],
        energy_level: 9,
        sleep_hours: 8.5,
        mood: 'energetic',
        cramps: 1,
        fitness_level: 'advanced'
      }
    },
    {
      name: 'Luteal Phase - Moderate Energy',
      data: {
        today: '2024-01-25',
        period_start_dates: ['2024-01-01', '2024-01-29', '2024-02-26'],
        period_lengths: [5, 5, 4],
        energy_level: 5,
        sleep_hours: 7.0,
        mood: 'irritable',
        cramps: 4,
        fitness_level: 'intermediate'
      }
    }
  ];

  for (const scenario of scenarios) {
    console.log(`\n📋 Testing: ${scenario.name}`);
    console.log('-'.repeat(40));
    
    try {
      const response = await axios.post(`${BASE_URL}/api/exercise/recommend`, scenario.data);
      
      if (response.data.success) {
        console.log(`✅ Phase: ${response.data.phase}`);
        console.log(`✅ Recommended: ${response.data.recommended_exercise}`);
        console.log(`✅ Confidence: ${Math.round(response.data.confidence * 100)}%`);
        console.log(`✅ Model: ${response.data.model_used}`);
      } else {
        console.log(`❌ Failed: ${response.data.message}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

// Run tests
async function runAllTests() {
  await testExerciseRecommendation();
  await testMultipleScenarios();
}

runAllTests().catch(console.error);
