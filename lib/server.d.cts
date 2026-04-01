import ws, { WebSocketServer } from 'ws';
import http from 'http';
import { SimpleWebSocket } from './index.cjs';
import 'events';
import 'reconnecting-websocket';

type ListenerCallback = (socket: SimpleWebSocket<any>, request: http.IncomingMessage) => void;
declare class SimpleWebSocketServer<T extends Record<string, any[]> = any> extends WebSocketServer {
    connectionListeners: ListenerCallback[];
    constructor(options?: ws.ServerOptions, callback?: () => void);
    onConnection(listener: (socket: SimpleWebSocket<T>, request: http.IncomingMessage) => void): void;
    send(eventName: string, ...values: any[]): void;
}

export { SimpleWebSocketServer };
