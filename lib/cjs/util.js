"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertMessageToEvent = exports.convertEventToMessage = exports.getEnvironment = void 0;
const browser_or_node_1 = require("browser-or-node");
const getEnvironment = () => {
    if (browser_or_node_1.isBrowser) {
        return 'browser';
    }
    else if (browser_or_node_1.isNode) {
        return 'node';
    }
    return 'unknown';
};
exports.getEnvironment = getEnvironment;
const convertEventToMessage = (eventName, ...values) => {
    return JSON.stringify({ eventName, values });
};
exports.convertEventToMessage = convertEventToMessage;
const convertMessageToEvent = (data) => {
    if (!data)
        return null;
    if (typeof data !== 'string')
        return null;
    try {
        const dataObject = JSON.parse(data);
        if (!dataObject.eventName && typeof dataObject.eventName !== 'string')
            return null;
        if (dataObject.values && !Array.isArray(dataObject.values))
            return null;
        return {
            eventName: dataObject.eventName,
            values: dataObject.values || []
        };
    }
    catch {
        return null;
    }
};
exports.convertMessageToEvent = convertMessageToEvent;
