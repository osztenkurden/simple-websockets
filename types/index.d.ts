/// <reference types="node" />
import Socket from 'ws';
import { getEnvironment, convertEventToMessage, convertMessageToEvent } from './util.js';
import url from 'url';
import http from 'http';
import ReconnectingWebSocket from 'reconnecting-websocket';
declare type Listener = (...args: any[]) => void;
interface EventDescriptor {
	listener: Listener;
	once: boolean;
}
declare type NativeOptions = Socket.ClientOptions | http.ClientRequestArgs;
export declare type Options = NativeOptions & {
	native?: boolean;
};
declare class SimpleWebSocket {
	_socket: Socket | WebSocket | ReconnectingWebSocket;
	private events;
	private maxListeners;
	constructor(address: string, protocols?: string | string[]);
	constructor(address: string | url.URL, options?: Options);
	constructor(socket: Socket | WebSocket);
	constructor(socket: ReconnectingWebSocket);
	eventNames: () => string[];
	getMaxListeners: () => number;
	listenerCount: (eventName: string) => number;
	listeners: (eventName: string) => Listener[];
	removeListener: (eventName: string, listener: Listener) => this;
	off: (eventName: string, listener: Listener) => this;
	send(eventName: string, ...values: any[]): boolean;
	addListener: (eventName: string, listener: Listener) => this;
	on: (eventName: string, listener: Listener) => this;
	once: (eventName: string, listener: Listener) => this;
	prependListener: (eventName: string, listener: Listener) => this;
	emit: (eventName: string, ...args: any[]) => boolean;
	prependOnceListener: (eventName: string, listener: Listener) => this;
	removeAllListeners: (eventName: string) => this;
	setMaxListeners: (n: number) => this;
	rawListeners: (eventName: string) => EventDescriptor[];
	private handleData;
}
export { getEnvironment, convertMessageToEvent, convertEventToMessage };
export { SimpleWebSocket };
