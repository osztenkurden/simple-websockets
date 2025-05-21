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

type ExtendDefaultEvents<T extends Record<string | number | symbol, any[]>> = T & {
    connection: [];
    disconnect: [];
};
type DefaultEventMap = [never];
type Key<K, T> = T extends DefaultEventMap ? string | symbol : K | keyof T;
type Listener<K, T, F> = T extends DefaultEventMap ? F : (K extends keyof T ? (T[K] extends unknown[] ? (...args: T[K]) => void : never) : F);
type Listener1<K, T> = Listener<K, T, (...args: any[]) => void>;
declare class SimpleWebSocket<T extends Record<string, any[]> = {}> extends EventEmitter<ExtendDefaultEvents<T>> {
    _socket: Socket | WebSocket | ReconnectingWebSocket;
    constructor(address: string, options?: AutoReconnectOption, protocols?: string | string[]);
    constructor(address: string | url.URL, options?: Options);
    constructor(socket: Socket | WebSocket);
    constructor(socket: ReconnectingWebSocket);
    on<K>(eventName: Key<K, ExtendDefaultEvents<T>>, listener: Listener1<K, ExtendDefaultEvents<T>>): this;
    send<K extends keyof T | string & {}>(eventName: K, ...values: T[K]): boolean;
    private handleData;
}

export { type Options, SimpleWebSocket, convertEventToMessage, convertMessageToEvent, getEnvironment };
