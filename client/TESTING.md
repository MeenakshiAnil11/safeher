# SafeHer Project - Playwright Testing Guide

## 🧪 Overview

This project includes comprehensive end-to-end tests using Playwright to ensure the application works correctly across different browsers and devices.

## 📋 Test Categories

### 1. Authentication Tests (`tests/auth.spec.js`)
- Login page display
- Form validation
- Navigation to register page
- Forgot password functionality
- Login attempt with test credentials

### 2. Period Tracker Tests (`tests/period-tracker.spec.js`)
- Period tracker page display
- Cycle overview functionality
- Mood logging modal
- Calendar view
- Navigation between tabs
- Hormone chart display
- Common experiences section

### 3. Navigation Tests (`tests/navigation.spec.js`)
- Dashboard navigation
- Profile page navigation
- Health page navigation
- Period tracker navigation
- Location tracking navigation
- Helplines navigation
- Resources navigation
- Settings navigation
- Feedback navigation
- Quiz navigation
- Assessment navigation

### 4. Responsive Design Tests (`tests/responsive.spec.js`)
- Mobile viewport (375x667)
- Tablet viewport (768x1024)
- Desktop viewport (1920x1080)
- Navigation responsiveness
- Period tracker responsiveness
- Mood modal responsiveness

### 5. Accessibility Tests (`tests/accessibility.spec.js`)
- Heading structure
- Form labels
- Button text
- Navigation structure
- Modal structure
- Calendar structure
- Color contrast
- Focus management
- Alt text for images

### 6. Performance Tests (`tests/performance.spec.js`)
- Page load times
- Navigation speed
- Modal operations
- Tab switching
- Component rendering

## 🚀 Running Tests

### Prerequisites
1. Ensure the backend server is running on port 5000
2. Ensure the frontend server is running on port 3000
3. Install dependencies: `npm install`

### Basic Commands

```bash
# Run all tests
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

### Custom Test Runner

```bash
# Run all tests
node run-tests.js

# Run specific test categories
node run-tests.js auth
node run-tests.js period
node run-tests.js nav
node run-tests.js responsive
node run-tests.js accessibility
node run-tests.js performance

# Run with UI mode
node run-tests.js ui

# Run in headed mode
node run-tests.js headed

# Run in debug mode
node run-tests.js debug
```

### Individual Test Files

```bash
# Run authentication tests only
npx playwright test tests/auth.spec.js

# Run period tracker tests only
npx playwright test tests/period-tracker.spec.js

# Run navigation tests only
npx playwright test tests/navigation.spec.js

# Run responsive tests only
npx playwright test tests/responsive.spec.js

# Run accessibility tests only
npx playwright test tests/accessibility.spec.js

# Run performance tests only
npx playwright test tests/performance.spec.js
```

## 🔧 Configuration

### Playwright Configuration (`playwright.config.js`)
- **Test Directory**: `./tests`
- **Base URL**: `http://localhost:3000`
- **Browsers**: Chrome, Firefox, Safari
- **Mobile Testing**: Pixel 5, iPhone 12
- **Screenshots**: On failure
- **Videos**: On failure
- **Traces**: On retry

### Test Setup (`tests/setup.js`)
- Global test setup
- Helper functions
- Mock authentication
- Performance metrics
- Screenshot utilities

## 📊 Test Reports

After running tests, you can view detailed reports:

```bash
# View HTML report
npm run test:e2e:report

# Or directly
npx playwright show-report
```

## 🐛 Debugging Tests

### Debug Mode
```bash
npm run test:e2e:debug
```

### Headed Mode
```bash
npm run test:e2e:headed
```

### UI Mode
```bash
npm run test:e2e:ui
```

### Screenshots and Videos
- Screenshots are automatically taken on test failures
- Videos are recorded for failed tests
- All artifacts are saved in `test-results/` directory

## 📱 Browser Support

Tests run on:
- **Desktop**: Chrome, Firefox, Safari
- **Mobile**: Chrome (Pixel 5), Safari (iPhone 12)

## 🔍 Test Coverage

### Core Functionality
- ✅ Authentication flow
- ✅ Period tracking
- ✅ Navigation
- ✅ Responsive design
- ✅ Accessibility
- ✅ Performance

### Key Features Tested
- ✅ Login/Register forms
- ✅ Period tracker cycle overview
- ✅ Mood logging modal
- ✅ Calendar view with predictions
- ✅ Navigation between pages
- ✅ Mobile responsiveness
- ✅ Accessibility compliance
- ✅ Performance benchmarks

## 🚨 Troubleshooting

### Common Issues

1. **Tests fail with "Connection refused"**
   - Ensure backend server is running on port 5000
   - Ensure frontend server is running on port 3000

2. **Tests fail with "Element not found"**
   - Check if the page has loaded completely
   - Verify the element selectors are correct
   - Check if authentication is properly mocked

3. **Tests fail with "Timeout"**
   - Increase timeout in test configuration
   - Check if the page is loading slowly
   - Verify network connectivity

### Debug Steps

1. Run tests in headed mode to see what's happening
2. Check the test report for detailed error information
3. Take screenshots of failed tests
4. Check browser console for JavaScript errors
5. Verify that all required services are running

## 📈 Continuous Integration

For CI/CD pipelines, use:

```bash
# Install browsers
npx playwright install

# Run tests
npx playwright test --reporter=github
```

## 🎯 Best Practices

1. **Test Isolation**: Each test is independent
2. **Mock Data**: Use consistent mock data for testing
3. **Wait Strategies**: Use proper wait strategies for dynamic content
4. **Error Handling**: Implement proper error handling
5. **Performance**: Monitor test execution time
6. **Accessibility**: Ensure tests cover accessibility requirements

## 📝 Adding New Tests

1. Create new test file in `tests/` directory
2. Follow naming convention: `*.spec.js`
3. Use descriptive test names
4. Include proper setup and teardown
5. Add to test runner if needed
6. Update documentation

## 🔄 Maintenance

- Update tests when UI changes
- Review test results regularly
- Update browser versions as needed
- Monitor test performance
- Keep test data up to date
