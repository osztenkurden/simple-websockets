/// <reference types="node" />
import Socket from 'ws';
import { getEnvironment, convertEventToMessage, convertMessageToEvent } from './util.js';
import url from 'url';
import http from 'http';
declare class SimpleWebSocket {
    _socket: WebSocket | Socket;
    private events;
    constructor(address: string, protocols?: string | string[]);
    constructor(address: string | url.URL, options?: Socket.ClientOptions | http.ClientRequestArgs);
    constructor(socket: WebSocket | Socket);
    on(eventName: string, listener: (...args: any) => void): void;
    send(eventName: string, ...values: any[]): boolean;
    private execute;
    private handleData;
}
export { getEnvironment, convertMessageToEvent, convertEventToMessage };
export { SimpleWebSocket };
