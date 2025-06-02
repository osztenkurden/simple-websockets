"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  SimpleWebSocket: () => SimpleWebSocket,
  convertEventToMessage: () => convertEventToMessage,
  convertMessageToEvent: () => convertMessageToEvent,
  getEnvironment: () => getEnvironment
});
module.exports = __toCommonJS(index_exports);
var import_ws = __toESM(require("ws"), 1);

// src/util.ts
var import_browser_or_node = require("browser-or-node");
var getEnvironment = () => {
  if (import_browser_or_node.isBrowser) {
    return "browser";
  } else if (import_browser_or_node.isNode) {
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
var import_events = __toESM(require("events"), 1);
var import_reconnecting_websocket = __toESM(require("reconnecting-websocket"), 1);
var SimpleWebSocket = class extends import_events.default {
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
          this._socket = new import_reconnecting_websocket.default(data, protocols, { ...options || {}, WebSocket });
        } else {
          this._socket = new WebSocket(data, protocols);
        }
      } else {
        if (options?.autoReconnect) {
          this._socket = new import_reconnecting_websocket.default(data, protocols, { ...options || {}, WebSocket: import_ws.default });
        } else {
          this._socket = new import_ws.default(data, options);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SimpleWebSocket,
  convertEventToMessage,
  convertMessageToEvent,
  getEnvironment
});
