// src/index.ts
import Socket from "ws";

// src/util.ts
import { isBrowser, isNode } from "browser-or-node";
var getEnvironment = () => {
  if (isBrowser) {
    return "browser";
  } else if (isNode) {
    return "node";
  }
  return "unknown";
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
    const environment = getEnvironment();
    if (typeof data === "string") {
      if (environment === "unknown") {
        throw new Error("Unknown environment");
      }
      if (environment === "browser") {
        if (options?.autoReconnect) {
          this._socket = new ReconnectingWebSocket(data, protocols, { ...options || {}, WebSocket });
        } else {
          this._socket = new WebSocket(data, protocols);
        }
      } else {
        if (options?.autoReconnect) {
          this._socket = new ReconnectingWebSocket(data, protocols, { ...options || {}, WebSocket: Socket });
        } else {
          this._socket = new Socket(data, options);
        }
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
      this.emit("error", err);
    });
  }
  on(eventName, listener) {
    return super.on(eventName, listener);
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
