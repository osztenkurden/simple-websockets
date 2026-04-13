import { SimpleWebSocket } from '../src';
import { SimpleWebSocketServer } from '../src/server';
import { beforeAll, jest, test, expect, afterAll } from 'bun:test';

let server: SimpleWebSocketServer;
let socket: SimpleWebSocket;
let socket2: SimpleWebSocket;

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

test('create server instance', () => {
	expect(() => {
		server = new SimpleWebSocketServer({ port: 1234 });
		expect(server).toBeInstanceOf(SimpleWebSocketServer);
	}).not.toThrow();
});

test('fire connection listener', async () => {
	const onConnectMock = jest.fn();

	server.onConnection(onConnectMock);

	socket = new SimpleWebSocket('ws://localhost:1234');

	await wait(300);

	expect(onConnectMock.mock.calls.length).toBe(1);
	expect(socket._socket.readyState).toBe(1);
});

test('fire custom event listener to all sockets', async () => {
	const eventCallback = jest.fn();
	socket2 = new SimpleWebSocket('ws://localhost:1234');
	await wait(300);

	socket.on('test event', eventCallback);
	socket2.on('test event', eventCallback);

	server.send('test event', 1, 'two', '3');
	socket.send('event', 1, 2, 3);

	await wait(300);
	expect(eventCallback.mock.calls.length).toBe(2);

	expect(eventCallback.mock.calls.length).toBe(2);
	expect(eventCallback.mock.calls[0]?.[0]).toBe(1);
	expect(eventCallback.mock.calls[0]?.[1]).toBe('two');
	expect(eventCallback.mock.calls[0]?.[2]).toBe('3');
});

test('fire close event', async () => {
	const eventCallback = jest.fn();
	socket.on('disconnect', eventCallback);
	server.close();

	for (const ws of server.clients) {
		ws.terminate();
	}

	await wait(300);

	expect(eventCallback.mock.calls.length).toBe(1);
});

// afterAll(done => {
// 	socket._socket.close();
// 	socket2._socket.close();
// 	server.close(done);
// });
