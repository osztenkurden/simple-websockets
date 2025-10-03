import { isBrowser } from 'browser-or-node';

const getEnvironment = () => {
	if (isBrowser) {
		return 'browser';
	}

	return 'node';
};

const convertEventToMessage = (eventName: string, ...values: any[]) => {
	return JSON.stringify({ eventName, values });
};

const convertMessageToEvent = (data: string | Buffer): { eventName: string; values: any[] } | null => {
	if (!data) return null;
	if (typeof data !== 'string' && !Buffer.isBuffer(data)) return null;
	try {
		const dataObject = JSON.parse(typeof data === 'string' ? data : data.toString());
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
