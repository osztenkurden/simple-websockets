import EventEmitter from 'events';
import WsWebSocket from 'ws';
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
type AvailableInputs = string | URL | WebSocket | ReconnectingWebSocket | WsWebSocket;
type OutputSocket<T extends AvailableInputs, B extends boolean> = T extends string ? (B extends true ? ReconnectingWebSocket : WebSocket) : (T extends URL ? (B extends true ? ReconnectingWebSocket : WebSocket) : T);
declare class SimpleWebSocket<T extends Record<string, any[]> = {}, W extends AvailableInputs = "", B extends boolean = false> extends EventEmitter<ExtendDefaultEvents<T>> {
    _socket: OutputSocket<W, B>;
    constructor(address: string | URL, options?: Options, protocols?: string | string[]);
    constructor(socket: WsWebSocket);
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
    static fromAddress<T extends Record<string, any[]>>(address: string | URL, options: Options & {
        autoReconnect: true;
    }, protocols?: string | string[]): SimpleWebSocket<T, string, true>;
    static fromAddress<T extends Record<string, any[]>>(address: string | URL, options?: Options, protocols?: string | string[]): SimpleWebSocket<T, string, false>;
    static fromWsSocket<T extends Record<string, any[]>>(socket: WsWebSocket): SimpleWebSocket<T, WsWebSocket>;
    static fromWebSocket<T extends Record<string, any[]>>(socket: WebSocket): SimpleWebSocket<T, WebSocket>;
    static fromReconnecting<T extends Record<string, any[]>>(socket: ReconnectingWebSocket): SimpleWebSocket<T, ReconnectingWebSocket>;
}

export { type Options, SimpleWebSocket, convertEventToMessage, convertMessageToEvent, getEnvironment };
