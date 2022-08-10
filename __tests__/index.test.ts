import { SimpleWebSocket } from './../src';
import { SimpleWebSocketServer } from 'simple-websockets-server';
import Socket from 'ws';
import ReconnectingWebSocket from 'reconnecting-websocket';

let server: SimpleWebSocketServer;
let socket: SimpleWebSocket;
let socketWithWs: SimpleWebSocket;

const mockConnectionCallback = jest.fn();

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
beforeAll(done => {
	server = new SimpleWebSocketServer({ port: 7689 }, () => {
		socket = new SimpleWebSocket('ws://localhost:7689/');
		socket.on('connection', mockConnectionCallback);
		socketWithWs = new SimpleWebSocket(
			new ReconnectingWebSocket('ws://localhost:7689/', [], { WebSocket: Socket })
		);
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

test('event listener > gets event names', () => {
	const callback = jest.fn(() => {});

	socket.addListener('mvp', callback);

	socket.addListener('matchEnd', callback);

	socket.addListener('roundEnd', callback);

	socket.addListener('kill', callback);

	socket.removeListener('kill', callback);
	socket.removeListener('kill2', callback);

	const eventNames = socket.eventNames();

	expect(eventNames.includes('mvp')).toBe(true);
	expect(eventNames.includes('matchEnd')).toBe(true);
	expect(eventNames.includes('roundEnd')).toBe(true);
	expect(eventNames.length).toBe(4);
});

test('event listener > gets max listeners', () => {
	const getRandomArbitrary = (min: number, max: number) => {
		return Math.random() * (max - min) + min;
	};

	const newMax = getRandomArbitrary(1, 10000);

	socket.setMaxListeners(newMax);

	expect(socket.getMaxListeners()).toBe(newMax);
});

test('event listener > gets listener count', () => {
	const callback = jest.fn(() => {});

	socket.on('defuseStartRandomName', callback);

	expect(socket.listenerCount('defuseStartRandomName')).toBe(1);
	expect(socket.listenerCount('mvpRandomName')).toBe(0);
});

test('event listener > gets descriptors', () => {
	const callback = jest.fn(() => {});

	socket.on('defuseStartRandomName2', callback);
	socket.on('defuseStartRandomName2', callback);

	expect(socket.rawListeners('defuseStartRandomName2').length).toBe(2);
	expect(socket.rawListeners('mvpRandomName2').length).toBe(0);
});

test('event listener > calls once listeners only once', () => {
	const callback = jest.fn(() => {});

	socket.once('defuseStart', callback);

	socket.emit('defuseStart');
	socket.emit('defuseStart');
	socket.emit('defuseStart');

	expect(callback.mock.calls.length).toBe(1);
});

test('event listener > prepend listener', () => {
	let i = 0;
	const callbackOne = () => {
		if (i === 0) {
			i = 1;
		}
	};
	const callbackPrepended = () => {
		if (i === 0) {
			i = 2;
		}
	};
	const callback = jest.fn(() => {});

	socket.on('defuseStart', callbackOne);

	socket.prependListener('defuseStart', callbackPrepended);
	socket.prependListener('defuseStop', callback);

	socket.emit('defuseStart');
	socket.emit('defuseStop');

	expect(i).toBe(2);
	expect(callback.mock.calls.length).toBe(1);
});
test('event listener > prepend once listener', () => {
	let i = 0;
	const callbackOne = () => {
		if (i === 0) {
			i = 1;
		}
	};
	const callbackPrepended = () => {
		if (i === 0) {
			i = 2;
		}
	};
	const callback = jest.fn(() => {});

	socket.prependOnceListener('defuseStart2', callbackOne);

	socket.prependOnceListener('defuseStart2', callbackPrepended);
	socket.prependOnceListener('defuseStop2', callback);

	socket.emit('defuseStart2');
	socket.emit('defuseStop2');

	expect(i).toBe(2);
	expect(callback.mock.calls.length).toBe(1);
});

test('event listener > remove all listeners from specific event', () => {
	const callback = jest.fn(() => {});
	socket.on('datainc', callback);
	socket.removeAllListeners('datainc');
	socket.removeAllListeners('datainc2');

	socket.emit('datainc');
	socket.emit('datainc2');

	expect(callback.mock.calls.length).toBe(0);
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

test('SimpleWebSocket > gets data correctly', async () => {
	const eventCallback = jest.fn();
	socket.on('event', eventCallback);

	server.send('event', 1, 2, 3);

	await wait(300);

	expect(eventCallback.mock.calls[0][0]).toBe(1);
	expect(eventCallback.mock.calls[0][1]).toBe(2);
	expect(eventCallback.mock.calls[0][2]).toBe(3);
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
