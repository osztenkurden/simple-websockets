import { SimpleSocket } from './../src';
import { SimpleSocketServer } from 'simple-sockets-server';

let server: SimpleSocketServer;
let socket: SimpleSocket;


const mockConnectionCallback = jest.fn();

const wait = (ms: number) => new Promise(r => setTimeout(r,ms));
beforeAll((done) => {
    server = new SimpleSocketServer({ port: 7689 }, () => {
        socket = new SimpleSocket('ws://localhost:7689/');
        socket.on("connection", mockConnectionCallback);
        done();
    });
});
test("SimpleSocket > create an instance", () => {
    expect(socket).toBeInstanceOf(SimpleSocket);
});
test("SimpleSocket > register listener",  async () => {
    await wait(300);

    expect(mockConnectionCallback.mock.calls.length).toBe(1)

});
test("SimpleSocket > register listener", () => {
    expect(async () => {
        server.send("unregistered event");
        await wait(500);
    }).not.toThrow();


});

test("SimpleSocket > sends data to server", () => {
    expect(socket.send("test event")).toBe(true);
});
/*
test("SimpleSocket > fails when unconnected", () => {
    const socket = new SimpleSocket('ws://localhost:7689/');

    const result = socket.send("foo","bar");
    expect(result).toBe(false);

});*/
test("SimpleSocket > handles bad data gracefully", () => {
    expect(async () => {
        server.clients.forEach(socket => {
            socket.send("absolutely random data");
        })

        await wait(300);
    
    }).not.toThrow();
})

test("SimpleSocket > handle disconnect gracefully", async () => {
    const mockCloseCallback = jest.fn();
    socket.on("disconnect", mockCloseCallback);
    socket._socket.close();
    await wait(300);

    expect(mockCloseCallback.mock.calls.length).toBe(1);
})

test("SimpleSocket > dont throw when not connected", () => {
    expect(socket.send(":)")).toBe(false);
})

afterAll((done) => {
    server.close(() => {
        done();
    });
});