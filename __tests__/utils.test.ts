import { convertMessageToEvent, convertEventToMessage, getEnvironment } from './../src/index';


test("utils > properly convert message to event", () => {
    const event = convertMessageToEvent('{ "eventName": "test event name", "values": [12, "arg2", 420]}');


    expect(event?.eventName).toBe("test event name");
    expect(event?.values[0]).toBe(12);
    expect(event?.values[1]).toBe("arg2");
    expect(event?.values[2]).toBe(420);
});
test("utils > properly convert message to event #2", () => {
    const event = convertMessageToEvent('{ "eventName": "test  name", "values": []}');


    expect(event?.eventName).toBe("test  name");
    expect(event?.values.length).toBe(0);
});
test("utils > properly convert message to event #3", () => {
    const event = convertMessageToEvent('{ "eventName": "test  name"}');


    expect(event?.eventName).toBe("test  name");
    expect(event?.values.length).toBe(0);
});

test("utils > fail on lack of eventName", () => {
    const event = convertMessageToEvent('{ "eventNamme": "test event name", "values": [12, "arg2", 420]}');

    expect(event).toBeNull();
});
test("utils > fail on lack of message", () => {
    const event = (convertMessageToEvent as any)();

    expect(event).toBeNull();
});
test("utils > fail on wrong json", () => {
    const event = convertMessageToEvent('{ "eventNamme": "1337, "values": [12, "arg2", 420]}');

    expect(event).toBeNull();
});
test("utils > fail on wrong data type", () => {
    const event = (convertMessageToEvent as any)(12);

    expect(event).toBeNull();
});
test("utils > fail on wrong type of eventName", () => {
    const event = convertMessageToEvent('{ "eventNamme": 1337, "values": [12, "arg2", 420]}');

    expect(event).toBeNull();
});
test("utils > fail on wrong type of values", () => {
    const event = convertMessageToEvent('{ "eventName": "1337", "values": "notAnArray"}');

    expect(event).toBeNull();
});
test("utils > properly convert event to message #1", () => {
    const message = convertEventToMessage("testName");

    expect(message).toBe('{"eventName":"testName","values":[]}');
});
test("utils > properly convert event to message #2", () => {
    const message = convertEventToMessage("random name", "singular argument");

    expect(message).toBe('{"eventName":"random name","values":["singular argument"]}');
});

test("utils > properly convert event to message #3", () => {
    const message = convertEventToMessage("random name", "singular argument", null, 12);

    expect(message).toBe('{"eventName":"random name","values":["singular argument",null,12]}');
});

test("util > detect node environment", () => {
    expect(getEnvironment()).toBe("node");
});