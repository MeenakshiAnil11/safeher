#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 SafeHer Project - Playwright Test Runner');
console.log('==========================================');

// Check if Playwright is installed
try {
  execSync('npx playwright --version', { stdio: 'pipe' });
  console.log('✅ Playwright is installed');
} catch (error) {
  console.log('❌ Playwright not found. Installing...');
  execSync('npm install @playwright/test', { stdio: 'inherit' });
  execSync('npx playwright install', { stdio: 'inherit' });
}

// Create test results directory
const resultsDir = path.join(__dirname, 'test-results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Test options
const testOptions = {
  'all': 'Run all tests',
  'auth': 'Run authentication tests only',
  'period': 'Run period tracker tests only',
  'nav': 'Run navigation tests only',
  'responsive': 'Run responsive design tests only',
  'accessibility': 'Run accessibility tests only',
  'performance': 'Run performance tests only',
  'ui': 'Run tests with UI mode',
  'headed': 'Run tests in headed mode',
  'debug': 'Run tests in debug mode'
};

// Get command line arguments
const args = process.argv.slice(2);
const testType = args[0] || 'all';

console.log(`\n🎯 Running tests: ${testOptions[testType] || testOptions['all']}`);

// Run tests based on type
let command = 'npx playwright test';

switch (testType) {
  case 'auth':
    command += ' tests/auth.spec.js';
    break;
  case 'period':
    command += ' tests/period-tracker.spec.js';
    break;
  case 'nav':
    command += ' tests/navigation.spec.js';
    break;
  case 'responsive':
    command += ' tests/responsive.spec.js';
    break;
  case 'accessibility':
    command += ' tests/accessibility.spec.js';
    break;
  case 'performance':
    command += ' tests/performance.spec.js';
    break;
  case 'ui':
    command = 'npx playwright test --ui';
    break;
  case 'headed':
    command += ' --headed';
    break;
  case 'debug':
    command += ' --debug';
    break;
  default:
    // Run all tests
    break;
}

// Add common options
command += ' --reporter=html --reporter=list';

console.log(`\n🚀 Executing: ${command}`);
console.log('==========================================');

try {
  execSync(command, { stdio: 'inherit' });
  console.log('\n✅ Tests completed successfully!');
  console.log('📊 View detailed report: npm run test:e2e:report');
} catch (error) {
  console.log('\n❌ Some tests failed. Check the output above for details.');
  console.log('📊 View detailed report: npm run test:e2e:report');
  process.exit(1);
}
