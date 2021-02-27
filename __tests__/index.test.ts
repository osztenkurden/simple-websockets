import { SimpleWebSocket } from './../src';
import { SimpleWebSocketServer } from 'simple-websockets-server';
import Socket from 'ws';

let server: SimpleWebSocketServer;
let socket: SimpleWebSocket;
let socketWithWs: SimpleWebSocket;

const mockConnectionCallback = jest.fn();

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
beforeAll(done => {
	server = new SimpleWebSocketServer({ port: 7689 }, () => {
		socket = new SimpleWebSocket('ws://localhost:7689/');
		socket.on('connection', mockConnectionCallback);
		socketWithWs = new SimpleWebSocket(new Socket('ws://localhost:7689/'));
		socketWithWs.on('connection', mockConnectionCallback);
		done();
	});
});
test('SimpleWebSocket > create an instance', () => {
	expect(socket).toBeInstanceOf(SimpleWebSocket);
});
test('SimpleWebSocket > register listener', async () => {
	await wait(300);

	expect(mockConnectionCallback.mock.calls.length).toBe(2);
});
test('SimpleWebSocket > register listener', () => {
	expect(async () => {
		server.send('unregistered event');
		await wait(500);
	}).not.toThrow();
});

test('SimpleWebSocket > sends data to server', () => {
	expect(socket.send('test event')).toBe(true);
});
/*
test("SimpleWebSocket > fails when unconnected", () => {
    const socket = new SimpleWebSocket('ws://localhost:7689/');

    const result = socket.send("foo","bar");
    expect(result).toBe(false);

});*/
test('SimpleWebSocket > handles bad data gracefully', () => {
	expect(async () => {
		server.clients.forEach(socket => {
			socket.send('absolutely random data');
		});

		await wait(300);
	}).not.toThrow();
});

test("SimpleWebSocket > gets data correctly", async () => {
	const eventCallback = jest.fn();
	socket.on("event", eventCallback);

	server.send("event", 1, 2, 3);

	await wait(300);


	expect(eventCallback.mock.calls[0][0]).toBe(1);
	expect(eventCallback.mock.calls[0][0]).toBe(2);
	expect(eventCallback.mock.calls[0][0]).toBe(3);
});

test('SimpleWebSocket > handle disconnect gracefully', async () => {
	const mockCloseCallback = jest.fn();
	socket.on('disconnect', mockCloseCallback);
	socketWithWs.on('disconnect', mockCloseCallback);
	socket._socket.close();
	socketWithWs._socket.close();
	await wait(300);

	expect(mockCloseCallback.mock.calls.length).toBe(2);
});

test('SimpleWebSocket > dont throw when not connected', () => {
	expect(socket.send(':)')).toBe(false);
});

afterAll(done => {
	server.close(() => {
		done();
	});
});
