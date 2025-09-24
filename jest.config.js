module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'tests/reports/coverage-html',
  coverageReporters: ['json', 'html', 'text', 'json-summary'],
  reporters: [
    'default'
  ],
  testPathIgnorePatterns: ['/node_modules/', '/tests/load/', '/tests/reports/', '/tests/logs/'],
};
