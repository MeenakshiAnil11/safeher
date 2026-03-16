// backend/services/ml/ovulationPredictor.js
import * as tf from '@tensorflow/tfjs-node';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelDir = path.join(__dirname, '../../python/models/tfjs_model');
let model = null;
let scaler = null;

/**
 * OvulationPredictor - Loads TensorFlow.js model and makes predictions
 * This loads the model directly in Node.js (Option B from integration guide)
 */
export class OvulationPredictor {
  constructor() {
    this.modelLoaded = false;
  }

  async loadModel() {
    if (this.modelLoaded) return;
    
    const modelPath = `file://${modelDir}/model.json`;
    
    if (!fs.existsSync(modelDir)) {
      console.warn('TFJS model folder not found at', modelDir);
      throw new Error('Model not found. Train and convert your model first.');
    }
    
    try {
      model = await tf.loadLayersModel(modelPath);
      this.modelLoaded = true;
      console.log('✅ Loaded TFJS model from', modelPath);
      
      // Load scaler params from JSON
      const scalerPath = path.join(__dirname, '../../python/models/feature_scaler.json');
      if (fs.existsSync(scalerPath)) {
        const scalerJSON = JSON.parse(fs.readFileSync(scalerPath, 'utf8'));
        scaler = scalerJSON; // contains mean & scale arrays
        console.log('✅ Loaded feature scaler from JSON');
      } else {
        console.warn('⚠️  Scaler not found; predictions may be inaccurate.');
      }
    } catch (error) {
      console.error('❌ Error loading TFJS model:', error);
      throw error;
    }
  }

  /**
   * Helper to normalize features using saved mean & std arrays
   * @param {number[]} featuresArray - Raw feature values
   * @returns {number[]} - Normalized feature values
   */
  normalizeFeatures(featuresArray) {
    if (!scaler) return featuresArray;
    
    const mean = scaler.mean;
    const scale = scaler.scale;
    
    return featuresArray.map((val, i) => (val - mean[i]) / (scale[i] || 1e-6));
  }

  /**
   * Build features from recent logs (mirrors Python feature engineering)
   * Features: bbt_mean_window, bbt_std_window, bbt_current, mucus_current, lh_current, day_in_cycle
   * 
   * @param {Array} recentLogs - Array of fertility log objects
   * @returns {number[]} - Feature vector for the latest day
   */
  buildFeaturesFromLogs(recentLogs) {
    if (!recentLogs || recentLogs.length === 0) {
      // Return default features
      return [36.5, 0, 36.5, 0, 0, 14]; // [mean, std, current, mucus, lh, day]
    }

    const WINDOW = 7;
    
    // Extract arrays from logs
    const bbtArr = recentLogs.map(r => r.bbt ?? 36.5).filter(v => !isNaN(v));
    const mucusArr = recentLogs.map(r => {
      const map = {
        'none': 0,
        'dry': 1,
        'sticky': 2,
        'creamy': 3,
        'watery': 4,
        'egg-white': 5
      };
      return map[r.cervicalMucus || r.cervical_mucus] ?? 0;
    });
    
    const lhArr = recentLogs.map(r => {
      const test = r.ovulationTest || r.ovulation_test || 'negative';
      return (['positive', 'peak'].includes(test.toLowerCase())) ? 1 : 0;
    });
    
    // Use latest day's values
    const n = recentLogs.length;
    const start = Math.max(0, n - WINDOW);
    const window_bbt = bbtArr.slice(start, n);
    
    // Calculate statistics
    const bbt_mean_window = window_bbt.reduce((a, b) => a + b, 0) / window_bbt.length;
    const variance = window_bbt.reduce((sum, x) => sum + Math.pow(x - bbt_mean_window, 2), 0) / window_bbt.length;
    const bbt_std_window = Math.sqrt(variance);
    
    const bbt_current = bbtArr[n - 1] || 36.5;
    const mucus_current = mucusArr[n - 1] || 0;
    const lh_current = lhArr[n - 1] || 0;
    const day_in_cycle = recentLogs[n - 1].cycleDay || recentLogs[n - 1].cycle_day || 14;

    // Return features in same order as Python training
    return [bbt_mean_window, bbt_std_window, bbt_current, mucus_current, lh_current, day_in_cycle];
  }

  /**
   * Main predict function: returns probability that latest day is fertile
   * 
   * @param {Array} recentLogs - Array of recent fertility logs
   * @returns {Object} - Prediction result with probability and details
   */
  async predictFromRecentLogs(recentLogs) {
    await this.loadModel();
    
    try {
      // Build features
      const feat = this.buildFeaturesFromLogs(recentLogs);
      
      // Normalize features
      const normFeat = this.normalizeFeatures(feat);
      
      // Create tensor
      const input = tf.tensor2d([normFeat]); // shape [1, n_features]
      
      // Make prediction
      const output = model.predict(input);
      
      // Get probability
      const probTensor = Array.from(await output.data());
      const prob = probTensor[0];
      
      // Clean up tensors
      input.dispose();
      output.dispose();
      
      // Calculate confidence
      const confidence = Math.abs(prob - 0.5) * 2 * 100;
      const fertile = prob >= 0.5;
      
      return {
        fertile,
        fertile_probability: prob * 100,
        not_fertile_probability: (1 - prob) * 100,
        confidence,
        raw_probability: prob,
        features: feat,
        normalized_features: normFeat
      };
    } catch (error) {
      console.error('Prediction error:', error);
      throw error;
    }
  }

  /**
   * Check if model is loaded
   * @returns {boolean}
   */
  isModelLoaded() {
    return this.modelLoaded;
  }

  /**
   * Get model info
   * @returns {Object}
   */
  getModelInfo() {
    return {
      loaded: this.modelLoaded,
      modelPath: modelDir,
      scalerLoaded: scaler !== null
    };
  }
}

// Singleton instance
let predictorInstance = null;

/**
 * Get or create OvulationPredictor instance
 * @returns {OvulationPredictor}
 */
export function getOvulationPredictor() {
  if (!predictorInstance) {
    predictorInstance = new OvulationPredictor();
  }
  return predictorInstance;
}

// Default export
export default OvulationPredictor;

