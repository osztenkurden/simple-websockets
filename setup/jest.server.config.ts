export default {
	preset: 'ts-jest',
	testEnvironment: 'node',
	modulePathIgnorePatterns: [
		'<rootDir>/setup/',
		'<rootDir>/__tests__/browser.test.ts',
		'<rootDir>/__tests__/node.test.ts',
		'<rootDir>/__tests__/index.test.ts',
		'<rootDir>/__tests__/utils.test.ts'
	],
	coverageReporters: ['json-summary', 'text', 'lcov'],
	resolver: 'jest-ts-webcompat-resolver',
	rootDir: '../'
};
