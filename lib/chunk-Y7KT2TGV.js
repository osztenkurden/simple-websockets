// src/util.ts
import { isBrowser } from "browser-or-node";
var getEnvironment = () => {
  if (isBrowser) {
    return "browser";
  }
  return "node";
};
var convertEventToMessage = (eventName, ...values) => {
  return JSON.stringify({ eventName, values });
};
var convertMessageToEvent = (data) => {
  if (!data) return null;
  if (typeof data !== "string" && !Buffer.isBuffer(data)) return null;
  try {
    const dataObject = JSON.parse(typeof data === "string" ? data : data.toString());
    if (!dataObject.eventName && typeof dataObject.eventName !== "string") return null;
    if (dataObject.values && !Array.isArray(dataObject.values)) return null;
    return {
      eventName: dataObject.eventName,
      values: dataObject.values || []
    };
  } catch {
    return null;
  }
};

// src/index.ts
import EventEmitter from "events";
import ReconnectingWebSocket from "reconnecting-websocket";
var SimpleWebSocket = class extends EventEmitter {
  _socket;
  constructor(data, options, protocols) {
    super();
    this._socket = data;
    if (typeof data === "string" || data instanceof URL) {
      if (options?.autoReconnect) {
        this._socket = new ReconnectingWebSocket(data.toString(), protocols, { ...options, WebSocket });
      } else {
        this._socket = new WebSocket(data, protocols);
      }
    }
    const addEventListener = this._socket.addEventListener.bind(this._socket);
    addEventListener("open", () => {
      this.emit("connection");
    });
    addEventListener("message", (event) => {
      this.handleData(event.data);
    });
    addEventListener("close", (data2) => {
      this.emit("disconnect", data2);
    });
    addEventListener("error", (err) => {
      if (this.listenerCount("error") > 0) {
        this.emit("error", err);
      }
    });
  }
  on(eventName, listener) {
    return super.on(eventName, listener);
  }
  addListener(eventName, listener) {
    return super.addListener(eventName, listener);
  }
  prependListener(eventName, listener) {
    return super.prependListener(eventName, listener);
  }
  prependOnceListener(eventName, listener) {
    return super.prependOnceListener(eventName, listener);
  }
  once(eventName, listener) {
    return super.once(eventName, listener);
  }
  off(eventName, listener) {
    return super.off(eventName, listener);
  }
  removeListener(eventName, listener) {
    return super.removeListener(eventName, listener);
  }
  //@ts-expect-error We are aware of the signature mismatch, we want to only allow string-based events
  emit(eventName, ...values) {
    return super.emit(eventName, ...values);
  }
  //@ts-expect-error We are aware of the signature mismatch, we want to only allow string-based events
  eventNames() {
    return super.eventNames();
  }
  send(eventName, ...values) {
    if (this._socket.readyState !== 1) return false;
    this._socket.send(convertEventToMessage(eventName, ...values));
    return true;
  }
  handleData = (data) => {
    const dataObject = convertMessageToEvent(data);
    if (!dataObject) return;
    return this.emit(dataObject.eventName, ...dataObject.values);
  };
};

export {
  getEnvironment,
  convertEventToMessage,
  convertMessageToEvent,
  SimpleWebSocket
};
