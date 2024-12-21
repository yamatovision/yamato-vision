export const createLogger = (service: string) => {
  return {
    info: (message: string, ...args: any[]) => {
      console.log(`[${service}] INFO:`, message, ...args);
    },
    error: (message: string, ...args: any[]) => {
      console.error(`[${service}] ERROR:`, message, ...args);
    },
    warn: (message: string, ...args: any[]) => {
      console.warn(`[${service}] WARN:`, message, ...args);
    }
  };
};
