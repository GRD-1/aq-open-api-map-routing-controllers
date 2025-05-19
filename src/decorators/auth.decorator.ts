import { AuthMiddleware } from '../middleware/auth.middleware';

export function Auth() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const [req, res] = args;
      
      // Apply auth middleware
      await new Promise((resolve, reject) => {
        AuthMiddleware(req, res, (err?: any) => {
          if (err) reject(err);
          else resolve(undefined);
        });
      });

      // Call the original method
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
} 