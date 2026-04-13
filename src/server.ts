import ws, { WebSocketServer } from 'ws';
import http from 'http';
import { SimpleWebSocket } from './';
import { convertEventToMessage } from './util';

type ListenerCallback = (socket: SimpleWebSocket<any>, request: http.IncomingMessage) => void;

class SimpleWebSocketServer<T extends Record<string, any[]> = any> extends WebSocketServer {
	connectionListeners: ListenerCallback[];
	constructor(options?: ws.ServerOptions, callback?: () => void) {
		super(options, callback);
		this.connectionListeners = [];
		super.on('connection', (socket, request) => {
			const simpleSocket = new SimpleWebSocket<T>(socket);
			this.connectionListeners.forEach(listener => {
				listener(simpleSocket, request);
			});
		});
	}
	onConnection(listener: (socket: SimpleWebSocket<T>, request: http.IncomingMessage) => void) {
		this.connectionListeners.push(listener);
	}
	send(eventName: string, ...values: any[]) {
		this.clients.forEach(socket => {
			socket.send(convertEventToMessage(eventName, ...values));
		});
	}
}
export { SimpleWebSocketServer };
