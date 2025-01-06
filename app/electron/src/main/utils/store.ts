import Store from "electron-store";

const store = new Store<Record<string, string>>();

export const storeSet = (key: string, value: any) => {
  store.set(key, value);
};

export const storeGet = <TResult = any>(key: string) => {
  return store.get(key) as TResult;
};

export const storeDelete = (key: string) => {
  store.delete(key);
};
