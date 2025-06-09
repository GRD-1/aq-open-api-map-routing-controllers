declare module 'express-oauth-server' {
  import { RequestHandler } from 'express';
  class ExpressOAuthServer {
    constructor(options: any);
    authenticate(options?: any): RequestHandler;
    authorize(options?: any): RequestHandler;
    token(options?: any): RequestHandler;
  }
  export = ExpressOAuthServer;
} 