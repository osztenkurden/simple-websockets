import { SimpleWebSocket } from '../src/index.ts';
import { SimpleWebSocketServer } from '../src/server.ts';
import { test, mock } from 'node:test';
import assert from 'node:assert/strict';

let server: SimpleWebSocketServer;
let socket: SimpleWebSocket;
let socket2: SimpleWebSocket;

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

test('create server instance', () => {
	assert.doesNotThrow(() => {
		server = new SimpleWebSocketServer({ port: 1234 });
		assert.ok(server instanceof SimpleWebSocketServer);
	});
});

test('fire connection listener', async () => {
	const onConnectMock = mock.fn();

	server.onConnection(onConnectMock);

	socket = new SimpleWebSocket('ws://localhost:1234');

	await wait(300);

	assert.strictEqual(onConnectMock.mock.calls.length, 1);
	assert.strictEqual(socket._socket.readyState, 1);
});

test('fire custom event listener to all sockets', async () => {
	const eventCallback = mock.fn();
	socket2 = new SimpleWebSocket('ws://localhost:1234');
	await wait(300);

	socket.on('test event', eventCallback);
	socket2.on('test event', eventCallback);

	server.send('test event', 1, 'two', '3');
	socket.send('event', 1, 2, 3);

	await wait(300);
	assert.strictEqual(eventCallback.mock.calls.length, 2);

	assert.strictEqual(eventCallback.mock.calls.length, 2);
	assert.strictEqual(eventCallback.mock.calls[0]?.arguments[0], 1);
	assert.strictEqual(eventCallback.mock.calls[0]?.arguments[1], 'two');
	assert.strictEqual(eventCallback.mock.calls[0]?.arguments[2], '3');
});

test('fire close event', async () => {
	const eventCallback = mock.fn();
	socket.on('disconnect', eventCallback);
	server.close();

	for (const ws of server.clients) {
		ws.terminate();
	}

	await wait(300);

	assert.strictEqual(eventCallback.mock.calls.length, 1);
});

// afterAll(done => {
// 	socket._socket.close();
// 	socket2._socket.close();
// 	server.close(done);
// });
