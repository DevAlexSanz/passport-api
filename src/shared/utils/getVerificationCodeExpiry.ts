export const getVerificationCodeExpiry = (minutes: number = 1): Date => {
  const now = new Date();

  now.setMinutes(now.getMinutes() + minutes);

  return now;
};

export const isExpired = (date: Date): boolean => {
  return date.getTime() < Date.now();
};
