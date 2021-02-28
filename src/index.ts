import Socket from 'ws';
import { getEnvironment, convertEventToMessage, convertMessageToEvent } from './util.js';
import url from 'url';
import http from 'http';

type AddEventListener = <K extends 'message' | 'close' | 'error' | 'open'>(
	type: K,
	listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any,
	options?: boolean | AddEventListenerOptions | undefined
) => void;
class SimpleWebSocket {
	_socket: WebSocket | Socket;

	private events: Map<string, ((...args: any[]) => void)[]>;

	constructor(address: string, protocols?: string | string[]);
	constructor(address: string | url.URL, options?: Socket.ClientOptions | http.ClientRequestArgs);
	constructor(socket: WebSocket | Socket);
	constructor(data: any, options?: any) {
		this.events = new Map();
		this._socket = data;

		const environment = getEnvironment();

		if (typeof data === 'string') {
			if (environment === 'unknown') {
				throw new Error('Unknown environment');
			}
			if (environment === 'browser') {
				this._socket = new WebSocket(data, options);
			} else {
				this._socket = new Socket(data, options);
			}
		}

		const addEventListener = this._socket.addEventListener.bind(this._socket) as AddEventListener;

		addEventListener('open', () => {
			this.execute('connection');
		});
		addEventListener('message', event => {
			this.handleData(event.data);
		});
		addEventListener('close', () => {
			this.execute('disconnect');
		});
	}

	on(eventName: string, listener: (...args: any) => void) {
		const existingListeners = this.events.get(eventName) || [];
		existingListeners.push(listener);
		this.events.set(eventName, existingListeners);
	}

	send(eventName: string, ...values: any[]) {
		if (this._socket.readyState !== 1) return false;
		this._socket.send(convertEventToMessage(eventName, ...values));
		return true;
	}

	private execute(eventName: string, args: any[] = []) {
		const listeners = this.events.get(eventName) || [];
		listeners.forEach(listener => {
			listener(...args);
		});
	}
	private handleData = (data: any) => {
		const dataObject = convertMessageToEvent(data);
		if (!dataObject) return;
		return this.execute(dataObject.eventName, dataObject.values);
	};
}

export { getEnvironment, convertMessageToEvent, convertEventToMessage };
export { SimpleWebSocket };
