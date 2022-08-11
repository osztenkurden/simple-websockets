import Socket from 'ws';
import { getEnvironment, convertEventToMessage, convertMessageToEvent } from './util.js';
import url from 'url';
import http from 'http';
import ReconnectingWebSocket from 'reconnecting-websocket';

type AddEventListener = <K extends 'message' | 'close' | 'error' | 'open'>(
	type: K,
	listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any,
	options?: boolean | AddEventListenerOptions | undefined
) => void;

type Listener = (...args: any[]) => void;

interface EventDescriptor {
	listener: Listener;
	once: boolean;
}
class SimpleWebSocket {
	_socket: Socket | WebSocket | ReconnectingWebSocket;

	private events: Map<string, EventDescriptor[]>;
	private maxListeners: number;

	constructor(address: string, protocols?: string | string[]);
	constructor(address: string | url.URL, options?: Socket.ClientOptions | http.ClientRequestArgs);
	constructor(socket: Socket | WebSocket);
	constructor(socket: ReconnectingWebSocket);
	constructor(data: any, options?: any) {
		this.events = new Map();
		this._socket = data;
		this.maxListeners = 10;

		const environment = getEnvironment();

		if (typeof data === 'string') {
			if (environment === 'unknown') {
				throw new Error('Unknown environment');
			}
			if (environment === 'browser') {
				this._socket = new ReconnectingWebSocket(data, [], { ...(options || {}), WebSocket: WebSocket });
			} else {
				this._socket = new ReconnectingWebSocket(data, [], { ...(options || {}), WebSocket: Socket });
			}
		}

		const addEventListener = this._socket.addEventListener.bind(this._socket) as AddEventListener;

		addEventListener('open', () => {
			this.emit('connection');
		});
		addEventListener('message', event => {
			this.handleData(event.data);
		});
		addEventListener('close', () => {
			this.emit('disconnect');
		});
	}

	eventNames = () => {
		const listeners = this.events.entries();
		const nonEmptyEvents: string[] = [];

		for (const entry of listeners) {
			if (entry[1] && entry[1].length > 0) {
				nonEmptyEvents.push(entry[0]);
			}
		}

		return nonEmptyEvents;
	};

	getMaxListeners = () => this.maxListeners;

	listenerCount = (eventName: string) => {
		const listeners = this.listeners(eventName);
		return listeners.length;
	};

	listeners = (eventName: string) => {
		const descriptors = this.events.get(eventName) || [];
		return descriptors.map(descriptor => descriptor.listener);
	};

	removeListener = (eventName: string, listener: Listener) => {
		return this.off(eventName, listener);
	};

	off = (eventName: string, listener: Listener) => {
		const descriptors = this.events.get(eventName) || [];

		this.events.set(
			eventName,
			descriptors.filter(descriptor => descriptor.listener !== listener)
		);
		this.emit('removeListener', eventName, listener);
		return this;
	};

	send(eventName: string, ...values: any[]) {
		if (this._socket.readyState !== 1) return false;
		this._socket.send(convertEventToMessage(eventName, ...values));
		return true;
	}

	addListener = (eventName: string, listener: Listener) => {
		return this.on(eventName, listener);
	};

	on = (eventName: string, listener: Listener) => {
		const listOfListeners = [...(this.events.get(eventName) || [])];
		listOfListeners.push({ listener, once: false });
		this.events.set(eventName, listOfListeners);

		return this;
	};

	once = (eventName: string, listener: Listener) => {
		const listOfListeners = [...(this.events.get(eventName) || [])];

		listOfListeners.push({ listener, once: true });
		this.events.set(eventName, listOfListeners);

		return this;
	};

	prependListener = (eventName: string, listener: Listener) => {
		const listOfListeners = [...(this.events.get(eventName) || [])];

		listOfListeners.unshift({ listener, once: false });
		this.events.set(eventName, listOfListeners);

		return this;
	};

	emit = (eventName: string, ...args: any[]) => {
		const listeners = this.events.get(eventName);
		if (!listeners || listeners.length === 0) return false;

		listeners.forEach(listener => {
			if (listener.once) {
				this.events.set(
					eventName,
					listeners.filter(listenerInArray => listenerInArray !== listener)
				);
			}
			listener.listener(...args);
		});
		return true;
	};

	prependOnceListener = (eventName: string, listener: Listener) => {
		const listOfListeners = [...(this.events.get(eventName) || [])];

		listOfListeners.unshift({ listener, once: true });
		this.events.set(eventName, listOfListeners);

		return this;
	};

	removeAllListeners = (eventName: string) => {
		this.events.set(eventName, []);
		return this;
	};

	setMaxListeners = (n: number) => {
		this.maxListeners = n;
		return this;
	};

	rawListeners = (eventName: string) => {
		return this.events.get(eventName) || [];
	};

	private handleData = (data: any) => {
		const dataObject = convertMessageToEvent(data);
		if (!dataObject) return;
		return this.emit(dataObject.eventName, ...dataObject.values);
	};
}

export { getEnvironment, convertMessageToEvent, convertEventToMessage };
export { SimpleWebSocket };
