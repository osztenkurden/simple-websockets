import Socket from 'ws';
import { getEnvironment, convertEventToMessage, convertMessageToEvent } from './util.js';
import EventEmitter from 'events';
import url from 'url';
import http from 'http';
import ReconnectingWebSocket from 'reconnecting-websocket';

type AddEventListener = <K extends 'message' | 'close' | 'error' | 'open'>(
	type: K,
	listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any,
	options?: boolean | AddEventListenerOptions | undefined
) => void;

type NativeOptions = Socket.ClientOptions | http.ClientRequestArgs;
type AutoReconnectOption = { autoReconnect?: boolean };

export type Options = NativeOptions & AutoReconnectOption;
export { getEnvironment, convertMessageToEvent, convertEventToMessage };

type DefaultEvents = {
	connection: [],
	disconnect: []
}

export class SimpleWebSocket<T extends Record<string, any[]> = any> extends EventEmitter<T & DefaultEvents> {
	_socket: Socket | WebSocket | ReconnectingWebSocket;

	constructor(address: string, options?: AutoReconnectOption, protocols?: string | string[]);
	constructor(address: string | url.URL, options?: Options);
	constructor(socket: Socket | WebSocket);
	constructor(socket: ReconnectingWebSocket);
	constructor(data: string | url.URL | Socket | WebSocket | ReconnectingWebSocket, options?: Options, protocols?: string | string[]) {
		super();
		this._socket = data as any;

		const environment = getEnvironment();

		if (typeof data === 'string') {
			if (environment === 'unknown') {
				throw new Error('Unknown environment');
			}
			if (environment === 'browser') {
				if (options?.autoReconnect) {
					this._socket = new ReconnectingWebSocket(data, protocols, { ...(options || {}), WebSocket: WebSocket });
				} else {
					this._socket = new WebSocket(data, protocols);
				}
			} else {
				if (options?.autoReconnect) {
					this._socket = new ReconnectingWebSocket(data, protocols, { ...(options || {}), WebSocket: Socket });
				} else {
					this._socket = new Socket(data, options);
				}
			}
		}

		const addEventListener = this._socket.addEventListener.bind(this._socket) as AddEventListener;

		addEventListener('open', () => {
			(this.emit as any)('connection');
		});
		addEventListener('message', event => {
			this.handleData(event.data);
		});
		addEventListener('close', () => {
			(this.emit as any)('disconnect');
		});
	}

	send<K extends keyof T>(eventName: K, ...values: T[K]) {
		if (this._socket.readyState !== 1) return false;
		this._socket.send(convertEventToMessage(eventName as string, ...values));
		return true;
	}

	private handleData = (data: any) => {
		const dataObject = convertMessageToEvent(data);
		if (!dataObject) return;
		return this.emit(dataObject.eventName as any, ...dataObject.values as any);
	};
}
