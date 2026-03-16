/**
 * Test script for TensorFlow.js predictor
 * Tests the ML model with sample data
 */

import { getOvulationPredictor } from '../services/ml/ovulationPredictor.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sample synthetic logs
const sampleLogs = [
  { bbt: 36.2, cervicalMucus: 'dry', ovulationTest: 'negative', cycleDay: 10 },
  { bbt: 36.25, cervicalMucus: 'dry', ovulationTest: 'negative', cycleDay: 11 },
  { bbt: 36.3, cervicalMucus: 'sticky', ovulationTest: 'negative', cycleDay: 12 },
  { bbt: 36.35, cervicalMucus: 'sticky', ovulationTest: 'negative', cycleDay: 13 },
  { bbt: 36.4, cervicalMucus: 'creamy', ovulationTest: 'negative', cycleDay: 14 },
  { bbt: 36.45, cervicalMucus: 'creamy', ovulationTest: 'negative', cycleDay: 15 },
  { bbt: 36.5, cervicalMucus: 'watery', ovulationTest: 'negative', cycleDay: 16 },
  { bbt: 36.55, cervicalMucus: 'egg-white', ovulationTest: 'peak', cycleDay: 17 },
  { bbt: 36.6, cervicalMucus: 'egg-white', ovulationTest: 'positive', cycleDay: 18 },
  { bbt: 36.65, cervicalMucus: 'watery', ovulationTest: 'positive', cycleDay: 19 },
  { bbt: 36.7, cervicalMucus: 'creamy', ovulationTest: 'negative', cycleDay: 20 },
  { bbt: 36.75, cervicalMucus: 'creamy', ovulationTest: 'negative', cycleDay: 21 }
];

async function testPredictor() {
  console.log("🧪 Testing TensorFlow.js Ovulation Predictor");
  console.log("=" .repeat(60));
  
  try {
    const predictor = getOvulationPredictor();
    
    console.log("\n📊 Test Data:");
    console.log(`   Logs: ${sampleLogs.length} days`);
    console.log(`   Cycle Days: ${sampleLogs[0].cycleDay} to ${sampleLogs[sampleLogs.length - 1].cycleDay}`);
    
    console.log("\n🔮 Making prediction...");
    const result = await predictor.predictFromRecentLogs(sampleLogs);
    
    console.log("\n✅ Prediction Result:");
    console.log(JSON.stringify(result, null, 2));
    
    console.log("\n📋 Summary:");
    console.log(`   Fertile: ${result.fertile ? 'Yes ✅' : 'No ❌'}`);
    console.log(`   Fertile Probability: ${result.fertile_probability}%`);
    console.log(`   Confidence: ${result.confidence}%`);
    console.log(`   Raw Probability: ${result.raw_probability.toFixed(4)}`);
    
    console.log("\n📊 Features Used:");
    console.log(`   BBT Mean (window): ${result.features[0].toFixed(2)}°C`);
    console.log(`   BBT Std (window): ${result.features[1].toFixed(2)}`);
    console.log(`   BBT Current: ${result.features[2].toFixed(2)}°C`);
    console.log(`   Cervical Mucus: ${result.features[3]}`);
    console.log(`   LH Test: ${result.features[4]}`);
    console.log(`   Cycle Day: ${result.features[5]}`);
    
    console.log("\n✅ Test completed successfully!");
    
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    console.error(error.stack);
    
    if (error.message.includes('Model not found')) {
      console.log("\n💡 Tip: Train and convert the model first:");
      console.log("   cd backend/python");
      console.log("   python train_ovulation_model.py");
      console.log("   python convert_to_tfjs.py");
    }
  }
}

// Run test
testPredictor().catch(console.error);

