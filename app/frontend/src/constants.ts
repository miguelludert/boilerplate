import urlJoin from 'url-join';

export const getApiEndoint = (path: string) => {
  return urlJoin(import.meta.env.VITE_API_ENDPOINT, path);
};
