import { getEnvironment, convertEventToMessage, convertMessageToEvent } from './util.js';
import EventEmitter from 'events';
import type WsWebSocket from 'ws';
import ReconnectingWebSocket from 'reconnecting-websocket';

type AddEventListener = <K extends 'message' | 'close' | 'error' | 'open'>(
	type: K,
	listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any,
	options?: boolean | AddEventListenerOptions | undefined
) => void;

type AutoReconnectOption = { autoReconnect?: boolean };

export type Options = AutoReconnectOption;
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

type AvailableInputs = string | URL | WebSocket | ReconnectingWebSocket | WsWebSocket;
type OutputSocket<T extends AvailableInputs, B extends boolean> = T extends string ? (B extends true ? ReconnectingWebSocket : WebSocket) : (T extends URL ? (B extends true ? ReconnectingWebSocket : WebSocket) : T);
export class SimpleWebSocket<
    T extends Record<string, any[]> = {},
    W extends AvailableInputs = "",
    B extends boolean = false,  // <-- new generic for autoReconnect
> extends EventEmitter<ExtendDefaultEvents<T>> {
    _socket: OutputSocket<W, B>;  // <-- now properly typed

	constructor(address: string | URL, options?: Options, protocols?: string | string[]);
	constructor(socket: WsWebSocket);
	constructor(socket: WebSocket);
	constructor(socket: ReconnectingWebSocket);
	constructor(data: W, options?: Options, protocols?: string | string[]) {
		super();
		this._socket = data as any;

		if (typeof data === 'string' || data instanceof URL) {
			if (options?.autoReconnect) {
				this._socket = new ReconnectingWebSocket(data.toString(), protocols, { ...options, WebSocket: WebSocket }) as OutputSocket<typeof data, boolean>;
			} else {
				this._socket = new WebSocket(data, protocols) as OutputSocket<typeof data, boolean>;
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
			if ((this.listenerCount as (e: string) => number)('error') > 0) {
				(this.emit as any)("error", err);
			}
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
    static fromAddress<T extends Record<string, any[]>>(address: string | URL, options: Options & { autoReconnect: true }, protocols?: string | string[]): SimpleWebSocket<T, string, true>;
    static fromAddress<T extends Record<string, any[]>>(address: string | URL, options?: Options, protocols?: string | string[]): SimpleWebSocket<T, string, false>;
    static fromAddress(address: string | URL, options?: Options, protocols?: string | string[]): SimpleWebSocket<{}, string, boolean> {
        return new SimpleWebSocket(address, options, protocols);
    }

    static fromWsSocket<T extends Record<string, any[]>>(socket: WsWebSocket): SimpleWebSocket<T, WsWebSocket> {
        return new SimpleWebSocket(socket);
    }

    static fromWebSocket<T extends Record<string, any[]>>(socket: WebSocket): SimpleWebSocket<T, WebSocket> {
        return new SimpleWebSocket(socket);
    }

    static fromReconnecting<T extends Record<string, any[]>>(socket: ReconnectingWebSocket): SimpleWebSocket<T, ReconnectingWebSocket> {
        return new SimpleWebSocket(socket);
    }
}