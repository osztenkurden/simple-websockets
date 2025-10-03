import Socket from 'ws';
import EventEmitter from 'events';
import url from 'url';
import http from 'http';
import ReconnectingWebSocket from 'reconnecting-websocket';

declare const getEnvironment: () => "browser" | "node";
declare const convertEventToMessage: (eventName: string, ...values: any[]) => string;
declare const convertMessageToEvent: (data: string | Buffer) => {
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
    disconnect: [close: {
        code: number;
        reason: string;
        wasClean: boolean;
    }];
    error: [err: {
        message: string;
        error: any;
    }];
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
    addListener<K>(eventName: Key<K, ExtendDefaultEvents<T>>, listener: Listener1<K, ExtendDefaultEvents<T>>): this;
    prependListener<K>(eventName: Key<K, ExtendDefaultEvents<T>>, listener: Listener1<K, ExtendDefaultEvents<T>>): this;
    prependOnceListener<K>(eventName: Key<K, ExtendDefaultEvents<T>>, listener: Listener1<K, ExtendDefaultEvents<T>>): this;
    once<K>(eventName: Key<K, ExtendDefaultEvents<T>>, listener: Listener1<K, ExtendDefaultEvents<T>>): this;
    off<K>(eventName: Key<K, ExtendDefaultEvents<T>>, listener: Listener1<K, ExtendDefaultEvents<T>>): this;
    removeListener<K>(eventName: Key<K, ExtendDefaultEvents<T>>, listener: Listener1<K, ExtendDefaultEvents<T>>): this;
    emit<K extends keyof T | string & {}>(eventName: K, ...values: T[K]): boolean;
    eventNames<K extends keyof T | string & {}>(): (K | symbol)[];
    send<K extends keyof T | string & {}>(eventName: K, ...values: T[K]): boolean;
    private handleData;
}

export { type Options, SimpleWebSocket, convertEventToMessage, convertMessageToEvent, getEnvironment };
