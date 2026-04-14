![CI](https://img.shields.io/github/actions/workflow/status/osztenkurden/simple-websockets/.github/workflows/main.yaml?branch=master)
![Dependencies](https://img.shields.io/librariesio/github/osztenkurden/simple-websockets)
![Downloads](https://img.shields.io/npm/dm/simple-websockets)
![Version](https://img.shields.io/npm/v/simple-websockets)

# Simple Websockets

> Requires **Node.js >= 22**

Super easy, super thin event-based WebSocket wrapper to work with `simple-websockets/server` (inspired by socket.io but with no bloat).

As of v3, the client uses the native global `WebSocket` available in both browsers and Node.js 22+, removing the need for the `ws` library on the client side.

# Client

## Basic usage

```typescript
import { SimpleWebSocket } from 'simple-websockets';

const socket = new SimpleWebSocket('ws://localhost:123');

socket._socket; // Instance of native WebSocket

socket.on('event name', (arg1, arg2, arg3) => {
	// Listen for custom event from server
});

socket.send('event name to send to server', 1, 2, 3, 'fourth argument');
```

## Wrapping an existing WebSocket

```typescript
import { SimpleWebSocket } from 'simple-websockets';

const webSocket = new WebSocket('ws://localhost:123');

const socket = new SimpleWebSocket(webSocket);
```

## Wrapping a `ws` socket

If you have a `ws` library socket (e.g. from a server connection callback), you can wrap it too:

```typescript
import { SimpleWebSocket } from 'simple-websockets';
import WebSocket from 'ws';

const wsSocket = new WebSocket('ws://localhost:123');

const socket = new SimpleWebSocket(wsSocket);
```

## Auto-reconnect

Pass `{ autoReconnect: true }` to automatically reconnect on disconnection (uses `reconnecting-websocket` under the hood):

```typescript
const socket = new SimpleWebSocket('ws://localhost:123', { autoReconnect: true });
```

## Static factory methods

For precise type inference on `_socket`, use the static factory methods:

```typescript
// From a URL string or URL object
const socket = SimpleWebSocket.fromAddress('ws://localhost:123');
const reconnecting = SimpleWebSocket.fromAddress('ws://localhost:123', { autoReconnect: true });

// From an existing native WebSocket
const socket = SimpleWebSocket.fromWebSocket(existingWebSocket);

// From a ws library socket
const socket = SimpleWebSocket.fromWsSocket(wsSocket);

// From a ReconnectingWebSocket
const socket = SimpleWebSocket.fromReconnecting(existingReconnectingSocket);
```

## Type-safe events

```typescript
type MyEvents = {
	'chat message': [message: string, sender: string];
	'user joined': [username: string];
};

const socket = new SimpleWebSocket<MyEvents>('ws://localhost:123');

socket.on('chat message', (message, sender) => {
	// message: string, sender: string
});

socket.send('chat message', 'hello', 'alice');
```

## Documentation

`socket.send` sends to server a stringified JSON object:

```javascript
{
    eventName: "event name is the first argument",
    values: []
}
```

where `values` is the array of arguments after the first argument of the `send` method.

`socket.on` listens for incoming data that fits the scheme and calls the listener.

You can send events without values.

Event name must be a non-empty string.

By default, the socket emits `connection` and `disconnect` events on its own.

This package is considered feature-complete - probably will not add any features, only bugfixes.

# Server

## Example

```typescript
import { SimpleWebSocketServer } from 'simple-websockets/server';

const server = new SimpleWebSocketServer({ port: 1234 });

server.onConnection((socket, request) => {
	socket.on('some event from socket', (someData) => {
		socket.send('some response', someResponseData);
	});
});

server.send('event name to send to all clients', 1, 2, 3, 'fourth argument');
```

## Documentation

`SimpleWebSocketServer` extends `ws.WebSocketServer`, so the constructor accepts the same options. It has 2 additional methods:

-   `onConnection(callback)` - connection listener. The callback receives a `SimpleWebSocket` instance and the `http.IncomingMessage` request
-   `send(eventName, ...values)` - sends an event with data to all connected sockets

`server.send` sends to all clients a stringified JSON object:

```javascript
{
    eventName: "event name is the first argument",
    values: []
}
```

where `values` is the array of arguments after the first argument of the `send` method.

`socket.on` listens for incoming data that fits the scheme and calls the listener.

You can send events without values.

Event name must be a non-empty string.
