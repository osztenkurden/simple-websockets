import {
  SimpleWebSocket,
  convertEventToMessage
} from "./chunk-EPO27WKL.js";

// src/server.ts
import { WebSocketServer } from "ws";
var SimpleWebSocketServer = class extends WebSocketServer {
  connectionListeners;
  constructor(options, callback) {
    super(options, callback);
    this.connectionListeners = [];
    super.on("connection", (socket, request) => {
      const simpleSocket = new SimpleWebSocket(socket);
      this.connectionListeners.forEach((listener) => {
        listener(simpleSocket, request);
      });
    });
  }
  onConnection(listener) {
    this.connectionListeners.push(listener);
  }
  send(eventName, ...values) {
    this.clients.forEach((socket) => {
      socket.send(convertEventToMessage(eventName, ...values));
    });
  }
};
export {
  SimpleWebSocketServer
};
