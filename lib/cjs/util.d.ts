declare const getEnvironment: () => 'unknown' | 'browser' | 'node';
declare const convertEventToMessage: (eventName: string, ...values: any[]) => string;
declare const convertMessageToEvent: (
	data: string
) => {
	eventName: string;
	values: any[];
} | null;
export { getEnvironment, convertEventToMessage, convertMessageToEvent };
