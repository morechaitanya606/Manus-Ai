const truthy = new Set(['1', 'true', 'yes', 'on']);

const flagEnabled = (value?: string | null) => {
  if (!value) return false;
  return truthy.has(value.trim().toLowerCase());
};

const getLogEnabled = () => {
  if (process.env.NODE_ENV !== 'development') return false;

  // Client side can only read NEXT_PUBLIC_* variables.
  if (typeof window !== 'undefined') {
    return flagEnabled(process.env.NEXT_PUBLIC_DEBUG_LOGS);
  }

  // Server side can use either explicit server flag or public flag.
  return (
    flagEnabled(process.env.DEBUG_LOGS) ||
    flagEnabled(process.env.NEXT_PUBLIC_DEBUG_LOGS)
  );
};

const isDebugLoggingEnabled = getLogEnabled();

export const logger = {
  debug: (...args: unknown[]) => {
    if (!isDebugLoggingEnabled) return;
    console.log('[DEBUG]', ...args);
  },
};
