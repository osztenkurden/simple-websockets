import Socket from 'ws';
import EventEmitter from 'events';
import url from 'url';
import http from 'http';
import ReconnectingWebSocket from 'reconnecting-websocket';

declare const getEnvironment: () => "browser" | "node" | "unknown";
declare const convertEventToMessage: (eventName: string, ...values: any[]) => string;
declare const convertMessageToEvent: (data: string) => {
    eventName: string;
    values: any[];
} | null;

type NativeOptions = Socket.ClientOptions | http.ClientRequestArgs;
type AutoReconnectOption = {
    autoReconnect?: boolean;
};
type Options = NativeOptions & AutoReconnectOption;

type DefaultEvents = {
    connection: [];
    disconnect: [];
};
declare class SimpleWebSocket<T extends Record<string, any[]> = any> extends EventEmitter<T & DefaultEvents> {
    _socket: Socket | WebSocket | ReconnectingWebSocket;
    constructor(address: string, options?: AutoReconnectOption, protocols?: string | string[]);
    constructor(address: string | url.URL, options?: Options);
    constructor(socket: Socket | WebSocket);
    constructor(socket: ReconnectingWebSocket);
    send<K extends keyof T>(eventName: K, ...values: T[K]): boolean;
    private handleData;
}

export { type Options, SimpleWebSocket, convertEventToMessage, convertMessageToEvent, getEnvironment };
