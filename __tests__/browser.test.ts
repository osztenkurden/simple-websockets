import { getEnvironment, SimpleWebSocket } from './../src/index.js';
import WebSocket from 'ws';
import { SimpleWebSocketServer } from 'simple-websockets-server';

let server: SimpleWebSocketServer;
let socket: SimpleWebSocket;
let socketWithWs: SimpleWebSocket;

const mockConnectionCallback = jest.fn();

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
beforeAll(done => {
	server = new SimpleWebSocketServer({ port: 7698 }, () => {
		socket = new SimpleWebSocket('ws://localhost:7698/');
		socket.on('connection', mockConnectionCallback);
		socketWithWs = new SimpleWebSocket(new WebSocket('ws://localhost:7698/'));
		socketWithWs.on('connection', mockConnectionCallback);
		delete (socketWithWs as any)._socket.on;
		done();
	});
});

test('util > detect browser environment', () => {
	expect(getEnvironment()).toBe('browser');
});
test('SimpleWebSocket > create an instance', () => {
	expect(socketWithWs).toBeInstanceOf(SimpleWebSocket);
});
test('SimpleWebSocket > register listener', async () => {
	await wait(500);

	expect(mockConnectionCallback.mock.calls.length).toBe(2);
});
test('SimpleWebSocket > register listener', () => {
	expect(async () => {
		server.send('unregistered event');
		server.clients.forEach(socket => {
			socket.send(null);
		});
		await wait(500);
	}).not.toThrow();
});

test('SimpleWebSocket > sends data to server', () => {
	expect(socketWithWs.send('test event')).toBe(true);
});

test('SimpleWebSocket > handle disconnect gracefully', async () => {
	const mockCloseCallback = jest.fn();
	socket.on('disconnect', mockCloseCallback);
	socketWithWs.on('disconnect', mockCloseCallback);
	socket._socket.close();
	socketWithWs._socket.close();
	await wait(500);

	expect(mockCloseCallback.mock.calls.length).toBe(2);
});

test('SimpleWebSocket > dont throw when not connected', () => {
	expect(socketWithWs.send(':)')).toBe(false);
});

afterAll(done => {
	server.close(() => {
		done();
	});
});
