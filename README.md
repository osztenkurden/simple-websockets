![Statements](https://img.shields.io/badge/Coverage-98.41%25-brightgreen.svg) 
![CI](https://img.shields.io/github/workflow/status/osztenkurden/simple-websockets/CI)
![Dependencies](https://img.shields.io/david/osztenkurden/simple-websockets)
![Downloads](https://img.shields.io/npm/dm/simple-websockets)
![Version](https://img.shields.io/npm/v/simple-websockets)
# Simple Websockets

## What is it for?
It's super easy, super thin client package for event systems in WebSockets to work with `simple-websockets/server` (inspired by socket.io but with no bloat).

# Client

## API example #1 - browser & node

```javascript
import { SimpleWebSocket } from 'simple-websockets';

const socket = new SimpleWebSocket("ws://localhost:123");

socket._socket // Instance of native WebSocket in browser, or ws in node

socket.on("event name", (arg1, arg2, arg3) => {
    // Listen for custom event from server
});

socket.send("event name to send to server", 1, 2, 3, "fourth argument");

```

## API example #2 - browser

```javascript
import { SimpleWebSocket } from 'simple-websockets';

const webSocket = new WebSocket("ws://localhost:123");

const socket = new SimpleWebSocket(webSocket);

```
## API example #3 - node

```javascript
import { SimpleWebSocket } from 'simple-websockets';
import WebSocket from 'ws';

const webSocket = new WebSocket("ws://localhost:123");

const socket = new SimpleWebSocket(webSocket);

```

## Documentation

To constructor you can pass the same options as for `ws` (node) or `WebSocket` (browser) or the sockets themselves.


`socket.send` sends to server stringified JSON object

```javascript
{
    eventName: "event name is the first argument",
    values: []
}
```

where `values` is the array of arguments after first argument of `send` method.

`socket.on` listens for incoming data that fits the scheme and calls listener.

You can send events without values.

Event name must be non-empty string.

By default socket calls `connection` and `disconnect` events on its own (without any arguments)

This package is for now considered feature-complete - probably will not add any features, only bugfixes.

# Server

## Example

```typescript
import { SimpleWebSocketServer } from 'simple-websockets/server';

const server = new SimpleWebSocketServer({ port: 1234 });

server.onConnection((socket: SimpleWebSocket, request: http.IncomingRequest) => {
    socket.on("some event from socket", (someData) => {
        socket.send("some response", someResponseData);
    });
});

server.send("event name to send to all clients", 1, 2, 3, "fourth argument");

```

## Documentation

SimpleWebSocketServer extends from `ws.Server`, so constructor is precisely the same. SimpleWebSocketServer has 2 additional methods:
 - onConnection(socket => void) - connection listener. `socket` is an instance of SimpleWebSocket
 - send(eventName, data) - sends event and specified data to all connected sockets


`server.send` sends to server stringified JSON object

```javascript
{
    eventName: "event name is the first argument",
    values: []
}
```

where `values` is the array of arguments after first argument of `send` method.

`socket.on` listens for incoming data that fits the object and calls listener.

You can send events without values.

Event name must be non-empty string.