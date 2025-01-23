import urlJoin from "url-join";

export const getApiEndpoint = (path: string) => {
  return urlJoin(import.meta.env.VITE_API_ENDPOINT, path);
};
