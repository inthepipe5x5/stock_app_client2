import React, { useState } from "react";
/**
 * Debounce Hook
 * Delays updating the value by a specified delay (ms).
 * @param {any} value - The input value.
 * @param {number} delay - The debounce delay in milliseconds.
 * @returns {any} - The debounced value.
 */
const useDebounce = (value: any, delay: number = 1000): any => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      // Call the handler function if provided
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
