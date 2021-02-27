import Server from 'ws';
(global as any).WebSocket = Server;
WebSocket = Server as any;
