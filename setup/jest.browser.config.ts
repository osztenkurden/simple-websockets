export default {
	preset: 'ts-jest',
	testEnvironment: 'node',
	modulePathIgnorePatterns: [
		'<rootDir>/setup/',
		'<rootDir>/__tests__/index.test.ts',
		'<rootDir>/__tests__/utils.test.ts',
		'<rootDir>/__tests__/unknown.test.ts'
	],
	coverageReporters: ['json-summary', 'text', 'lcov'],
	resolver: 'jest-ts-webcompat-resolver',
	globals: {
		window: {
			document: {}
		}
	},
	setupFiles: ['<rootDir>/setup/browser.setup.ts'],
	rootDir: '../'
};
