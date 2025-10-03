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

type ExtendDefaultEvents<T extends Record<string | number | symbol, any[]>> = T & {
	connection: [],
	disconnect: [close: { code: number, reason: string, wasClean: boolean }],
	error: [err: { message: string, error: any }]
}

type DefaultEventMap = [never];
type Key<K, T> = T extends DefaultEventMap ? string | symbol : K | keyof T;
type Listener<K, T, F> = T extends DefaultEventMap ? F : (
	K extends keyof T ? (
		T[K] extends unknown[] ? (...args: T[K]) => void : never
	)
	: F
);
type Listener1<K, T> = Listener<K, T, (...args: any[]) => void>;

export class SimpleWebSocket<T extends Record<string, any[]> = {}> extends EventEmitter<ExtendDefaultEvents<T>> {
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
		addEventListener('close', (data) => {
			(this.emit as any)('disconnect', data);
		});
		addEventListener("error", err => {
			(this.emit as any)("error", err);
		})
	}
	override on<K>(eventName: Key<K, ExtendDefaultEvents<T>>, listener: Listener1<K, ExtendDefaultEvents<T>>): this {
		return super.on(eventName, listener as any);
	}
	override addListener<K>(eventName: Key<K, ExtendDefaultEvents<T>>, listener: Listener1<K, ExtendDefaultEvents<T>>): this {
		return super.addListener(eventName, listener as any);
	}
	override prependListener<K>(eventName: Key<K, ExtendDefaultEvents<T>>, listener: Listener1<K, ExtendDefaultEvents<T>>): this {
		return super.prependListener(eventName, listener as any);
	}
	override prependOnceListener<K>(eventName: Key<K, ExtendDefaultEvents<T>>, listener: Listener1<K, ExtendDefaultEvents<T>>): this {
		return super.prependOnceListener(eventName, listener as any);
	}
	override once<K>(eventName: Key<K, ExtendDefaultEvents<T>>, listener: Listener1<K, ExtendDefaultEvents<T>>): this {
		return super.once(eventName, listener as any);
	}
	override off<K>(eventName: Key<K, ExtendDefaultEvents<T>>, listener: Listener1<K, ExtendDefaultEvents<T>>): this {
		return super.off(eventName, listener as any);
	}
	override removeListener<K>(eventName: Key<K, ExtendDefaultEvents<T>>, listener: Listener1<K, ExtendDefaultEvents<T>>): this {
		return super.removeListener(eventName, listener as any);
	}
	//@ts-expect-error We are aware of the signature mismatch, we want to only allow string-based events
	override emit<K extends keyof T | string & {}>(eventName: K, ...values: T[K]) {
		//@ts-expect-error Same as above
		return super.emit(eventName, ...values);
	}

	//@ts-expect-error We are aware of the signature mismatch, we want to only allow string-based events
	override eventNames<K extends keyof T | string & {}>() {
		return super.eventNames() as (K | symbol)[];
	}

	send<K extends keyof T | string & {}>(eventName: K, ...values: T[K]) {
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