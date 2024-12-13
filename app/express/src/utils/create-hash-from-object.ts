import crypto from 'crypto';

/**
 * Canonicalize an object by sorting its keys and creating a consistent string representation.
 * @param obj - The object to canonicalize.
 * @returns A canonical string representation of the object.
 */
const canonicalize = (obj: any): string => {
  if (typeof obj !== 'object' || obj === null) {
    return JSON.stringify(obj); // Base case for primitives or null
  }

  if (Array.isArray(obj)) {
    return `[${obj.map(canonicalize).join(',')}]`; // Recursively canonicalize array elements
  }

  // Sort keys and canonicalize each value
  const sortedKeys = Object.keys(obj).sort();
  const normalizedEntries = sortedKeys.map(
    (key) => `"${key}":${canonicalize(obj[key])}`
  );
  return `{${normalizedEntries.join(',')}}`;
};

/**
 * Create a hash from an object, ensuring consistent results regardless of key order.
 * @param obj - The object to hash.
 * @param algorithm - The hash algorithm (e.g., 'sha256').
 * @returns The resulting hash as a hexadecimal string.
 */
const createHashFromObject = (
  obj: any,
  algorithm: string = 'sha256'
): string => {
  const canonicalString = canonicalize(obj);
  const hash = crypto
    .createHash(algorithm)
    .update(canonicalString)
    .digest('hex');
  return hash;
};

export { createHashFromObject };
