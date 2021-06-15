"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleWebSocket = exports.convertEventToMessage = exports.convertMessageToEvent = exports.getEnvironment = void 0;
const ws_1 = __importDefault(require("ws"));
const util_js_1 = require("./util.js");
Object.defineProperty(exports, "getEnvironment", { enumerable: true, get: function () { return util_js_1.getEnvironment; } });
Object.defineProperty(exports, "convertEventToMessage", { enumerable: true, get: function () { return util_js_1.convertEventToMessage; } });
Object.defineProperty(exports, "convertMessageToEvent", { enumerable: true, get: function () { return util_js_1.convertMessageToEvent; } });
class SimpleWebSocket {
    constructor(data, options) {
        this.eventNames = () => {
            const listeners = this.events.entries();
            const nonEmptyEvents = [];
            for (const entry of listeners) {
                if (entry[1] && entry[1].length > 0) {
                    nonEmptyEvents.push(entry[0]);
                }
            }
            return nonEmptyEvents;
        };
        this.getMaxListeners = () => this.maxListeners;
        this.listenerCount = (eventName) => {
            const listeners = this.listeners(eventName);
            return listeners.length;
        };
        this.listeners = (eventName) => {
            const descriptors = this.events.get(eventName) || [];
            return descriptors.map(descriptor => descriptor.listener);
        };
        this.removeListener = (eventName, listener) => {
            return this.off(eventName, listener);
        };
        this.off = (eventName, listener) => {
            const descriptors = this.events.get(eventName) || [];
            this.events.set(eventName, descriptors.filter(descriptor => descriptor.listener !== listener));
            this.emit('removeListener', eventName, listener);
            return this;
        };
        this.addListener = (eventName, listener) => {
            return this.on(eventName, listener);
        };
        this.on = (eventName, listener) => {
            const listOfListeners = [...(this.events.get(eventName) || [])];
            listOfListeners.push({ listener, once: false });
            this.events.set(eventName, listOfListeners);
            return this;
        };
        this.once = (eventName, listener) => {
            const listOfListeners = [...(this.events.get(eventName) || [])];
            listOfListeners.push({ listener, once: true });
            this.events.set(eventName, listOfListeners);
            return this;
        };
        this.prependListener = (eventName, listener) => {
            const listOfListeners = [...(this.events.get(eventName) || [])];
            listOfListeners.unshift({ listener, once: false });
            this.events.set(eventName, listOfListeners);
            return this;
        };
        this.emit = (eventName, ...args) => {
            const listeners = this.events.get(eventName);
            if (!listeners || listeners.length === 0)
                return false;
            listeners.forEach(listener => {
                if (listener.once) {
                    this.events.set(eventName, listeners.filter(listenerInArray => listenerInArray !== listener));
                }
                listener.listener(...args);
            });
            return true;
        };
        this.prependOnceListener = (eventName, listener) => {
            const listOfListeners = [...(this.events.get(eventName) || [])];
            listOfListeners.unshift({ listener, once: true });
            this.events.set(eventName, listOfListeners);
            return this;
        };
        this.removeAllListeners = (eventName) => {
            this.events.set(eventName, []);
            return this;
        };
        this.setMaxListeners = (n) => {
            this.maxListeners = n;
            return this;
        };
        this.rawListeners = (eventName) => {
            return this.events.get(eventName) || [];
        };
        this.handleData = (data) => {
            const dataObject = util_js_1.convertMessageToEvent(data);
            if (!dataObject)
                return;
            return this.emit(dataObject.eventName, ...dataObject.values);
        };
        this.events = new Map();
        this._socket = data;
        this.maxListeners = 10;
        const environment = util_js_1.getEnvironment();
        if (typeof data === 'string') {
            if (environment === 'unknown') {
                throw new Error('Unknown environment');
            }
            if (environment === 'browser') {
                this._socket = new WebSocket(data, options);
            }
            else {
                this._socket = new ws_1.default(data, options);
            }
        }
        const addEventListener = this._socket.addEventListener.bind(this._socket);
        addEventListener('open', () => {
            this.emit('connection');
        });
        addEventListener('message', event => {
            this.handleData(event.data);
        });
        addEventListener('close', () => {
            this.emit('disconnect');
        });
    }
    send(eventName, ...values) {
        if (this._socket.readyState !== 1)
            return false;
        this._socket.send(util_js_1.convertEventToMessage(eventName, ...values));
        return true;
    }
}
exports.SimpleWebSocket = SimpleWebSocket;
