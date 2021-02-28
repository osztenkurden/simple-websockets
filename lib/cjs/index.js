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
        this.handleData = (data) => {
            const dataObject = util_js_1.convertMessageToEvent(data);
            if (!dataObject)
                return;
            return this.execute(dataObject.eventName, dataObject.values);
        };
        this.events = new Map();
        this._socket = data;
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
        addEventListener("open", () => {
            this.execute("connection");
        });
        addEventListener("message", event => {
            this.handleData(event.data);
        });
        addEventListener("close", () => {
            this.execute('disconnect');
        });
    }
    on(eventName, listener) {
        const existingListeners = this.events.get(eventName) || [];
        existingListeners.push(listener);
        this.events.set(eventName, existingListeners);
    }
    send(eventName, ...values) {
        if (this._socket.readyState !== 1)
            return false;
        this._socket.send(util_js_1.convertEventToMessage(eventName, ...values));
        return true;
    }
    execute(eventName, args = []) {
        const listeners = this.events.get(eventName) || [];
        listeners.forEach(listener => {
            listener(...args);
        });
    }
}
exports.SimpleWebSocket = SimpleWebSocket;
