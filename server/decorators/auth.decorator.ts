import { AuthMiddleware } from '../middleware/auth.middleware';
import { Request, Response } from 'express';
import { BaseController } from 'reef-framework';

// Extend BaseController to include req and res properties
interface ControllerWithReqRes extends BaseController {
  req: Request;
  res: Response;
}

export function Auth() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // In reef-framework, the request and response objects are passed as arguments
      // to the method, and they are decorated with @Req() and @Res()
      const req = args.find(arg => arg && typeof arg === 'object' && 'headers' in arg) as Request;
      const res = args.find(arg => arg && typeof arg === 'object' && 'status' in arg) as Response;

      if (!req || !res) {
        throw new Error('Request or response object not found. Make sure to use @Req() and @Res() decorators in your controller method.');
      }

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