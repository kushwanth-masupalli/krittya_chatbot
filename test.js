const assert = require('assert');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function logResult(name, passed, error = null) {
  results.tests.push({ name, passed, error });
  if (passed) {
    results.passed++;
    console.log(`✓ ${name}`);
  } else {
    results.failed++;
    console.log(`✗ ${name}`);
    if (error) console.log(`  Error: ${error.message || error}`);
  }
}

// Test 1: Health endpoint
async function testHealthEndpoint() {
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.status, 'ok');
    assert(data.timestamp);

    logResult('Health endpoint returns ok', true);
  } catch (error) {
    logResult('Health endpoint returns ok', false, error);
  }
}

// Test 2: Missing query
async function testMissingQuery() {
  try {
    const response = await fetch(`${BASE_URL}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const data = await response.json();

    assert.strictEqual(response.status, 400);
    assert.strictEqual(data.error, 'Query is required');

    logResult('Returns 400 for missing query', true);
  } catch (error) {
    logResult('Returns 400 for missing query', false, error);
  }
}

// Test 3: Query must be a string
async function testNonStringQuery() {
  try {
    const response = await fetch(`${BASE_URL}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 123 })
    });
    const data = await response.json();

    assert.strictEqual(response.status, 400);
    assert.strictEqual(data.error, 'Query must be a string');

    logResult('Returns 400 for non-string query', true);
  } catch (error) {
    logResult('Returns 400 for non-string query', false, error);
  }
}

// Test 4: Query too long
async function testQueryTooLong() {
  try {
    const longQuery = 'a'.repeat(1001);
    const response = await fetch(`${BASE_URL}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: longQuery })
    });
    const data = await response.json();

    assert.strictEqual(response.status, 400);
    assert(data.error.includes('maximum length'));

    logResult('Returns 400 for query exceeding max length', true);
  } catch (error) {
    logResult('Returns 400 for query exceeding max length', false, error);
  }
}

// Test 5: Valid query returns answer
async function testValidQuery() {
  try {
    const response = await fetch(`${BASE_URL}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'What is Krittya?' })
    });
    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert(data.answer);
    assert(typeof data.answer === 'string');

    logResult('Valid query returns answer', true);
  } catch (error) {
    logResult('Valid query returns answer', false, error);
  }
}

// Test 6: Empty query string
async function testEmptyQuery() {
  try {
    const response = await fetch(`${BASE_URL}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '' })
    });
    const data = await response.json();

    assert.strictEqual(response.status, 400);
    assert.strictEqual(data.error, 'Query is required');

    logResult('Returns 400 for empty query string', true);
  } catch (error) {
    logResult('Returns 400 for empty query string', false, error);
  }
}

// Run all tests
async function runTests() {
  console.log('Running tests against', BASE_URL);
  console.log('================================');

  await testHealthEndpoint();
  await testMissingQuery();
  await testNonStringQuery();
  await testQueryTooLong();
  await testEmptyQuery();
  await testValidQuery();

  console.log('================================');
  console.log(`Results: ${results.passed} passed, ${results.failed} failed`);

  if (results.failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test suite failed:', err.message);
  process.exit(1);
});
