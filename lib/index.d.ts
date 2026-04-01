import EventEmitter from 'events';
import ReconnectingWebSocket from 'reconnecting-websocket';

declare const getEnvironment: () => "browser" | "node";
declare const convertEventToMessage: (eventName: string, ...values: any[]) => string;
declare const convertMessageToEvent: (data: string | Buffer) => {
    eventName: string;
    values: any[];
} | null;

type AutoReconnectOption = {
    autoReconnect?: boolean;
};
type Options = AutoReconnectOption;

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
    _socket: WebSocket | ReconnectingWebSocket;
    constructor(address: string | URL, options?: Options, protocols?: string | string[]);
    constructor(socket: WebSocket);
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
