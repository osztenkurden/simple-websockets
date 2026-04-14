import { convertMessageToEvent, convertEventToMessage, getEnvironment } from './../src/index.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
test('utils > properly convert message to event', () => {
	const event = convertMessageToEvent('{ "eventName": "test event name", "values": [12, "arg2", 420]}');

	assert.strictEqual(event?.eventName, 'test event name');
	assert.strictEqual(event?.values[0], 12);
	assert.strictEqual(event?.values[1], 'arg2');
	assert.strictEqual(event?.values[2], 420);
});
test('utils > properly convert message to event #2', () => {
	const event = convertMessageToEvent('{ "eventName": "test  name", "values": []}');

	assert.strictEqual(event?.eventName, 'test  name');
	assert.strictEqual(event?.values.length, 0);
});
test('utils > properly convert message to event #3', () => {
	const event = convertMessageToEvent('{ "eventName": "test  name"}');

	assert.strictEqual(event?.eventName, 'test  name');
	assert.strictEqual(event?.values.length, 0);
});

test('utils > properly convert message to event #4', () => {
	const text = '{ "eventName": "test  name"}';
	const buffer = Buffer.from(text, 'utf-8');
	const event = convertMessageToEvent(buffer);

	assert.strictEqual(event?.eventName, 'test  name');
	assert.strictEqual(event?.values.length, 0);
});

test('utils > fail on lack of eventName', () => {
	const event = convertMessageToEvent('{ "eventNamme": "test event name", "values": [12, "arg2", 420]}');

	assert.strictEqual(event, null);
});
test('utils > fail on lack of message', () => {
	const event = (convertMessageToEvent as any)();

	assert.strictEqual(event, null);
});
test('utils > fail on wrong json', () => {
	const event = convertMessageToEvent('{ "eventNamme": "1337, "values": [12, "arg2", 420]}');

	assert.strictEqual(event, null);
});
test('utils > fail on wrong data type', () => {
	const event = (convertMessageToEvent as any)(12);

	assert.strictEqual(event, null);
});
test('utils > fail on wrong type of eventName', () => {
	const event = convertMessageToEvent('{ "eventNamme": 1337, "values": [12, "arg2", 420]}');

	assert.strictEqual(event, null);
});
test('utils > fail on wrong type of values', () => {
	const event = convertMessageToEvent('{ "eventName": "1337", "values": "notAnArray"}');

	assert.strictEqual(event, null);
});
test('utils > properly convert event to message #1', () => {
	const message = convertEventToMessage('testName');

	assert.strictEqual(message, '{"eventName":"testName","values":[]}');
});
test('utils > properly convert event to message #2', () => {
	const message = convertEventToMessage('random name', 'singular argument');

	assert.strictEqual(message, '{"eventName":"random name","values":["singular argument"]}');
});

test('utils > properly convert event to message #3', () => {
	const message = convertEventToMessage('random name', 'singular argument', null, 12);

	assert.strictEqual(message, '{"eventName":"random name","values":["singular argument",null,12]}');
});

test('util > detect node environment', () => {
	assert.strictEqual(getEnvironment(), 'node');
});
