export default {
	preset: 'ts-jest',
	testEnvironment: 'node',
	modulePathIgnorePatterns: [
		'<rootDir>/setup/',
		'<rootDir>/__tests__/index.test.ts',
		'<rootDir>/__tests__/utils.test.ts',
		'<rootDir>/__tests__/browser.test.ts'
	],
	coverageReporters: ['json-summary', 'text', 'lcov'],
	resolver: 'jest-ts-webcompat-resolver',
	globals: {
		window: {}
	},
	setupFiles: ['<rootDir>/setup/unknown.setup.ts'],
	rootDir: '../'
};
