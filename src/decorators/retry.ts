import { Logger } from '@nestjs/common';

export function Retry(retries: number = 3, delay: number = 1000) {
  const logger = new Logger('RetryDecorator');

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      let attempts = 0;

      while (attempts < retries) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          attempts++;
          logger.warn(`Attempt ${attempts} failed. Retrying in ${delay}ms...`);
          if (attempts >= retries) {
            logger.error(`All ${retries} attempts failed.`);
            throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    };

    return descriptor;
  };
}
