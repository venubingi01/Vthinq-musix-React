import { useState, useEffect } from 'react';

/**
 * Custom Hook: useDebounce
 * Delays updating the debounced value until after the specified delay has passed.
 * Used for search input to prevent firing network requests on every keystroke.
 */
export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Schedule a timer to update value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    // Cleanup: cancel the timer if value changes before delay expires (or component unmounts)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
