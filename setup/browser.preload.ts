
import Server from "ws";
(global as any).WebSocket = Server;
(global as any).window = { document: {} };