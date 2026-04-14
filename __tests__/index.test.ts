import { SimpleWebSocket } from './../src/index.ts';
import { SimpleWebSocketServer } from '../src/server.ts';
import { before, test, mock, after } from 'node:test';
import assert from 'node:assert/strict';

let server: SimpleWebSocketServer;
let socket: SimpleWebSocket;
let socketToError: SimpleWebSocket;
let socketWithWs: SimpleWebSocket;

const mockConnectionCallback = mock.fn();

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
before(
	() =>
		new Promise<void>(resolve => {
			server = new SimpleWebSocketServer({ port: 7689 }, () => {
				socket = new SimpleWebSocket('ws://localhost:7689/');
				socket._socket.binaryType = 'arraybuffer';
				socket.on('connection', mockConnectionCallback);
				socketToError = new SimpleWebSocket('ws://localhost:7689/');
				socketToError.on('connection', mockConnectionCallback);
				socketToError._socket.binaryType = 'arraybuffer';
				socketWithWs = new SimpleWebSocket('ws://localhost:7689/', { autoReconnect: true });
				socketWithWs.on('connection', mockConnectionCallback);
				socketWithWs._socket.binaryType = 'arraybuffer';
				resolve();
			});
		})
);
test('SimpleWebSocket > create an instance', () => {
	assert.ok(socket instanceof SimpleWebSocket);
});
test('SimpleWebSocket > register listener', async () => {
	await wait(300);

	assert.strictEqual(mockConnectionCallback.mock.calls.length, 3);
});
test('SimpleWebSocket > register listener', () => {
	assert.doesNotThrow(() => {
		server.send('unregistered event');
	});
});

test('SimpleWebSocket > sends data to server', () => {
	assert.strictEqual(socket.send('test event'), true);
});

test('event listener > gets event names', () => {
	const callback = mock.fn(() => {});
	socket.addListener('mvp', callback);

	socket.on('matchEnd', callback);

	socket.on('roundEnd', callback);

	socket.on('kill', callback);

	socket.off('kill', callback);
	socket.off('kill2', callback);

	const eventNames = socket.eventNames();

	assert.ok(eventNames.includes('mvp'));
	assert.ok(eventNames.includes('matchEnd'));
	assert.ok(eventNames.includes('roundEnd'));
	assert.strictEqual(eventNames.length, 4);
});

test('event listener > gets max listeners', () => {
	const getRandomArbitrary = (min: number, max: number) => {
		return Math.random() * (max - min) + min;
	};

	const newMax = getRandomArbitrary(1, 10000);

	socket.setMaxListeners(newMax);

	assert.strictEqual(socket.getMaxListeners(), newMax);
});

test('event listener > gets listener count', () => {
	const callback = mock.fn(() => {});

	socket.on('defuseStartRandomName', callback);

	assert.strictEqual(socket.listenerCount('defuseStartRandomName'), 1);
	assert.strictEqual(socket.listenerCount('mvpRandomName'), 0);
});

test('event listener > gets descriptors', () => {
	const callback = mock.fn(() => {});

	socket.on('defuseStartRandomName2', callback);
	socket.on('defuseStartRandomName2', callback);

	assert.strictEqual(socket.rawListeners('defuseStartRandomName2').length, 2);
	assert.strictEqual(socket.rawListeners('mvpRandomName2').length, 0);
});

test('event listener > calls once listeners only once', () => {
	const callback = mock.fn(() => {});

	socket.once('defuseStart', callback);
	socket.emit('defuseStart');
	socket.emit('defuseStart');
	socket.emit('defuseStart');

	assert.strictEqual(callback.mock.calls.length, 1);
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
	const callback = mock.fn(() => {});

	socket.on('defuseStart', callbackOne);

	socket.prependListener('defuseStart', callbackPrepended);
	socket.prependListener('defuseStop', callback);

	socket.emit('defuseStart');
	socket.emit('defuseStop');

	assert.strictEqual(i, 2);
	assert.strictEqual(callback.mock.calls.length, 1);
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
	const callback = mock.fn(() => {});

	socket.prependOnceListener('defuseStart2', callbackOne);

	socket.prependOnceListener('defuseStart2', callbackPrepended);
	socket.prependOnceListener('defuseStop2', callback);

	socket.emit('defuseStart2');
	socket.emit('defuseStop2');

	assert.strictEqual(i, 2);
	assert.strictEqual(callback.mock.calls.length, 1);
});

test('event listener > remove all listeners from specific event', () => {
	const callback = mock.fn(() => {});
	socket.on('datainc', callback);
	socket.removeAllListeners('datainc');
	socket.removeAllListeners('datainc2');

	socket.emit('datainc');
	socket.emit('datainc2');

	assert.strictEqual(callback.mock.calls.length, 0);
});
/*
test("SimpleWebSocket > fails when unconnected", () => {
    const socket = new SimpleWebSocket('ws://localhost:7689/');

    const result = socket.send("foo","bar");
    expect(result).toBe(false);

});*/
test('SimpleWebSocket > handles bad data gracefully', async () => {
	assert.doesNotThrow(() => {
		server.clients.forEach(socket => {
			socket.send('absolutely random data');
		});
	});

	await wait(300);
});

test('SimpleWebSocket > gets data correctly', async () => {
	const eventCallback = mock.fn();
	socket.on('event', eventCallback);

	server.send('event', 1, 2, 3);

	await wait(300);

	assert.strictEqual(eventCallback.mock.calls[0]?.arguments[0], 1);
	assert.strictEqual(eventCallback.mock.calls[0]?.arguments[1], 2);
	assert.strictEqual(eventCallback.mock.calls[0]?.arguments[2], 3);
});

test('SimpleWebSocket > handle disconnect gracefully', async () => {
	const mockCloseCallback = mock.fn();
	socket.on('disconnect', mockCloseCallback);
	socketWithWs.on('disconnect', mockCloseCallback);
	socket._socket.close();
	socketWithWs._socket.close();
	await wait(300);

	assert.strictEqual(mockCloseCallback.mock.calls.length, 2);
});

test('SimpleWebSocket > dont throw when not connected', () => {
	assert.strictEqual(socket.send(':)'), false);
});

after(
	() =>
		new Promise<void>(resolve => {
			server.clients.forEach(socket => {
				socket.close();
			});
			server.close(() => {
				socket._socket.close();
				resolve();
			});
		})
);
