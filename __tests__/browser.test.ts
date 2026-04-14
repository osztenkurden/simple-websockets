import '../setup/browser.preload.ts';
import { getEnvironment, SimpleWebSocket } from './../src/index.ts';
import { SimpleWebSocketServer } from '../src/server.ts';
import { before, after, test, mock } from 'node:test';
import assert from 'node:assert/strict';

let server: SimpleWebSocketServer;
let socket: SimpleWebSocket;
let socketWithWs: SimpleWebSocket;

const mockConnectionCallback = mock.fn();

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
before(
	() =>
		new Promise<void>(resolve => {
			server = new SimpleWebSocketServer({ port: 7698 }, () => {
				socket = new SimpleWebSocket('ws://localhost:7698/');
				socket._socket.binaryType = 'arraybuffer';
				socket.on('connection', mockConnectionCallback);
				socketWithWs = new SimpleWebSocket('ws://localhost:7698/', { autoReconnect: true });
				socketWithWs._socket.binaryType = 'arraybuffer';
				socketWithWs.on('connection', mockConnectionCallback);
				delete (socketWithWs as any)._socket.on;
				resolve();
			});
		})
);

test('util > detect browser environment', () => {
	assert.strictEqual(getEnvironment(), 'browser');
});
test('SimpleWebSocket > create an instance', () => {
	assert.ok(socketWithWs instanceof SimpleWebSocket);
});
test('SimpleWebSocket > register listener', async () => {
	await wait(500);

	assert.strictEqual(mockConnectionCallback.mock.calls.length, 2);
});
test('SimpleWebSocket > register listener', () => {
	assert.doesNotThrow(() => {
		server.send('unregistered event');
		server.clients.forEach(socket => {
			socket.send('');
		});
	});
});

test('SimpleWebSocket > sends data to server', () => {
	assert.strictEqual(socketWithWs.send('test event'), true);
});

test('SimpleWebSocket > handle disconnect gracefully', async () => {
	const mockCloseCallback = mock.fn();
	socket.on('disconnect', mockCloseCallback);
	socketWithWs.on('disconnect', mockCloseCallback);
	socket._socket.close();
	socketWithWs._socket.close();
	await wait(500);

	assert.strictEqual(mockCloseCallback.mock.calls.length, 2);
});

test('SimpleWebSocket > dont throw when not connected', () => {
	assert.strictEqual(socketWithWs.send(':)'), false);
});

after(
	() =>
		new Promise<void>(resolve => {
			server.clients.forEach(socket => {
				socket.close();
			});
			server.close(() => {
				resolve();
			});
		})
);
