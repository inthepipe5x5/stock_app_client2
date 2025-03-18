import React, { useState, useEffect, useRef } from "react";
/**
 * Debounce Hook
 * Delays updating the value by a specified delay (ms).
 * @param {any} value - The input value.
 * @param {number} delay - The debounce delay in milliseconds.
 * @returns {any} - The debounced value.
 */
const useDebounce = (value: any, delay: number = 1000, ref = null, controller = undefined): any => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const controllerRef = useRef<AbortController | null>(ref ?? null);
  const abortController = !!controller ? controller : new AbortController();

  React.useEffect(() => {
    const handler = setTimeout(() => {
      //cancel the previous request
      if (!!controllerRef && !!controllerRef?.current) {
        controllerRef?.current.abort();
        clearTimeout(handler);
      }

      if (value === debouncedValue) {
        //stop the request if the value hasn't changed
        abortController.abort();
        clearTimeout(handler);
        return value;
      }
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return [debouncedValue, abortController, controllerRef];
};

export default useDebounce;
