export const corsWhitelistValidator = (whitelist: string[]): {} => {
  return {
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void
    ): void => {
      if (!origin) {
        return callback(null, true);
      }

      if (whitelist.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
  };
};
