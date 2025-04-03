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

/**
 * The `setAbortableTimeout` function in TypeScript React sets a timeout that can be aborted using an
 * AbortSignal.
 * @param  - The `setAbortableTimeout` function takes an object as a parameter with the following
 * properties:
 */
export const setAbortableTimeout = ({ callback, delay, signal }: {
  callback: (args?: any) => any;
  delay: number;
  signal?: AbortSignal | null | undefined;
}) => {

  const timeoutId = setTimeout(() => {
    signal?.removeEventListener("abort", onAbort);
    callback();
  }, (!!delay ? delay : 1000));


  const onAbort = () => {
    clearTimeout(timeoutId);
    console.warn("Timer canceled via AbortController");
  };

  signal?.addEventListener("abort", onAbort);
  return timeoutId;
}

export default useDebounce;
