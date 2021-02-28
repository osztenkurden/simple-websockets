import Socket from 'ws';
import { getEnvironment, convertEventToMessage, convertMessageToEvent } from './util.js';
class SimpleWebSocket {
    constructor(data, options) {
        this.handleData = (data) => {
            const dataObject = convertMessageToEvent(data);
            if (!dataObject)
                return;
            return this.execute(dataObject.eventName, dataObject.values);
        };
        this.events = new Map();
        this._socket = data;
        const environment = getEnvironment();
        if (typeof data === 'string') {
            if (environment === 'unknown') {
                throw new Error('Unknown environment');
            }
            if (environment === 'browser') {
                this._socket = new WebSocket(data, options);
            }
            else {
                this._socket = new Socket(data, options);
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
        this._socket.send(convertEventToMessage(eventName, ...values));
        return true;
    }
    execute(eventName, args = []) {
        const listeners = this.events.get(eventName) || [];
        listeners.forEach(listener => {
            listener(...args);
        });
    }
}
export { getEnvironment, convertMessageToEvent, convertEventToMessage };
export { SimpleWebSocket };
