import urlJoin from "url-join";

const { API_ENDPOINT } = process.env;

export const getApiEndpoint = (url: string) => urlJoin(API_ENDPOINT!, url);
