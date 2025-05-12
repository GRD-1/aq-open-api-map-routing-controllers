import { 
  JsonController,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  Res
} from 'routing-controllers';
import {
  OpenAPI,
  ResponseSchema
} from 'routing-controllers-openapi';

// Export routing-controllers decorators with OpenApi prefix
export const OpenApiJsonController = JsonController;
export const OpenApiGet = Get;
export const OpenApiPost = Post;
export const OpenApiPut = Put;
export const OpenApiDelete = Delete;
export const OpenApiBody = Body;
export const OpenApiParam = Param;
export const OpenApiReq = Req;
export const OpenApiRes = Res;

// Export routing-controllers-openapi decorators
export { OpenAPI };
export const OpenApiResponseSchema = ResponseSchema; 