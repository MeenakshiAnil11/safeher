const mongoose = require('mongoose');
const Symptom = require('./backend/models/Symptom.js');

async function checkSymptoms() {
  try {
    await mongoose.connect('mongodb://localhost:27017/safeher-project3');
    const symptoms = await Symptom.find({}).limit(5).lean();
    console.log('Sample symptoms:', JSON.stringify(symptoms, null, 2));
    console.log('Total symptoms count:', await Symptom.countDocuments());
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkSymptoms();
