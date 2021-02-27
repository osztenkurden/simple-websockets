import { isBrowser, isNode } from 'browser-or-node';

const getEnvironment = () => {
	if (isBrowser) {
		return 'browser';
	} else if (isNode) {
		return 'node';
	}

	return 'unknown';
};

const convertEventToMessage = (eventName: string, ...values: any[]) => {
	return JSON.stringify({ eventName, values });
};

const convertMessageToEvent = (data: string) => {
	if (!data) return null;
	if (typeof data !== 'string') return null;
	try {
		const dataObject = JSON.parse(data);
		if (!dataObject.eventName && typeof dataObject.eventName !== 'string') return null;
		if (dataObject.values && !Array.isArray(dataObject.values)) return null;
		return {
			eventName: dataObject.eventName,
			values: dataObject.values || []
		};
	} catch {
		return null;
	}
};

export { getEnvironment, convertEventToMessage, convertMessageToEvent };
