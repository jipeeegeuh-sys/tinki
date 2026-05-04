export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.css$': '<rootDir>/src/__mocks__/styleMock.js',
  },
  setupFilesAfterFramework: ['@testing-library/jest-dom'],
  testMatch: ['**/__tests__/**/*.test.{js,jsx}'],
  collectCoverageFrom: ['src/client/components/**/*.{js,jsx}'],
  coverageThreshold: {
    global: { lines: 80, functions: 80 },
  },
};
