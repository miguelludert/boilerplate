export const storeSet = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const storeGet = <TResult = any>(key: string): TResult | null => {
  const item = localStorage.getItem(key);
  return item ? (JSON.parse(item) as TResult) : null;
};

export const storeDelete = (key: string) => {
  localStorage.removeItem(key);
};
