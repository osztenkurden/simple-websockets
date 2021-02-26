import Socket from 'ws';
import * as Utils from './util';
import url from 'url';
import http from 'http';
class SimpleSocket {
	_socket: WebSocket | Socket;

	private events: Map<string, ((...args: any[]) => void)[]>;

	constructor(address: string, protocols?: string | string[]);
	constructor(address: string | url.URL, options?: Socket.ClientOptions | http.ClientRequestArgs);
	constructor(socket: WebSocket | Socket);
	constructor(data: any, options?: any) {
		this.events = new Map();
		this._socket = data;

		const environment = Utils.getEnvironment();

		if (typeof data === 'string') {
			if (environment === 'unknown') {
				throw new Error('Unknown environment');
			}
			if (environment === 'browser') {
				this._socket = new WebSocket(data, options);
				return;
			} else {
				this._socket = new Socket(data, options);
			}
		}

		if ('on' in this._socket) {
			this._socket.on('message', (data: Socket.Data) => {
				this.handleData(data);
			});
		} else {
			this._socket.onmessage = ev => {
				this.handleData(ev?.data);
			};
		}

		this._socket.onclose = () => {
			this.execute('disconnect');
		};
	}

	on(eventName: string, listener: (...args: any[]) => void) {
		const existingListeners = this.events.get(eventName) || [];
		existingListeners.push(listener);
		this.events.set(eventName, existingListeners);
	}

	send(eventName: string, ...values: any[]) {
		if (this._socket.readyState !== 1) return false;
		this._socket.send(Utils.convertEventToMessage(eventName, values));
		return true;
	}

	private execute(eventName: string, ...args: any[]) {
		const listeners = this.events.get(eventName) || [];
		listeners.forEach(listener => {
			listener(...args);
		});
	}
	private handleData = (data: any) => {
		const dataObject = Utils.convertMessageToEvent(data);
		if (!dataObject) return;
		return this.execute(dataObject.eventName, ...dataObject.values);
	};
}

export { SimpleSocket };
