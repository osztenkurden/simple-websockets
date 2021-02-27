import { getEnvironment, SimpleWebSocket } from './../src';

test('util > detect unknown environment', () => {
	expect(getEnvironment()).toBe('unknown');
});

test('util > throw', () => {
	expect(() => {
		new SimpleWebSocket('ws://localhsot:7869');
	}).toThrow();
});
