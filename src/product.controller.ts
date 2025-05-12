import { Response } from 'express'

import {
  BaseController,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Middleware,
  Param,
  Patch,
  Post,
  Res,
  ResError,
} from 'reef-framework'

import { isInstance } from 'class-validator'

import { resolveOrg } from '../middlewares/oauth'
import oauthModel from '../lib/oauthModel'

import { OrgId, RootOrgId, UserId } from '../reef-extends/aq-param.decorators'

import {
  PRODUCT_ERRORS,
  PUBLIC_PRODUCT_CONTROLLER,
} from '../../imports/lib/DTO/products/public-api/controller.common-vars'

import {
  UPDATE_PRODUCT_SUBPATH,
  UpdateProductDTO,
} from '../../imports/lib/DTO/products/public-api/list/update-product-list.dto'
import {
  DELETE_PRODUCT_SUBPATH,
  DeleteProductDTO,
} from '../../imports/lib/DTO/products/public-api/list/delete-product-list.dto'

import {
  CREATE_PRODUCT_METHOD,
  CREATE_PRODUCT_SUBPATH,
  CREATE_PRODUCT_URI,
  CreateProductDTOReq,
  type CreateProductDTORes,
} from '../../imports/lib/DTO/products/public-api/list/create-product-list.dto'

import { AQLogger } from '../helpers/logger.helper'
import ProductService from '../services/product.service'
import { LogCode } from '../helpers/log-code.class'
import { AQValidate } from '../reef-extends/aq-pre-exec-hook.decorators'
import SnsService from '../services/snsService'
import sequelize from '../database/sequelize'

import { API_BASE_ROUTES } from '../server'
import {
  GetProductListDTO as GetProductDTO,
  GET_PRODUCT_SUBPATH,
} from '../../imports/lib/DTO/products/public-api/list/get-product-list.dto'

const oauthSrv = new OAuthServer({ model: oauthModel, useErrorHandler: true })

const logPrefix = 'Public API product -'
const getLogPrefix = `${logPrefix} GET >>`
const updateLogPrefix = `${logPrefix} PATCH >> `
const deleteLogPrefix = `${logPrefix} DELETE >>`
const createPrefix = `${logPrefix} POST >>`

import {
  OpenApiJsonController,
  OpenApiGet,
  OpenApiPost,
  OpenApiPut,
  OpenApiDelete,
  OpenApiBody,
  OpenApiParam,
  OpenApiReq,
  OpenApiRes,
  OpenAPI,
  OpenApiResponseSchema
} from '../openapi/openapi.decorators'

@OpenApiJsonController()
@Controller(PUBLIC_PRODUCT_CONTROLLER)
export default class PublicDataSourceController extends BaseController {
  // @Middleware(oauthSrv.authenticate(), resolveOrg)
  // @AQValidate(CreateProductDTOReq)
  @Post(CREATE_PRODUCT_SUBPATH, false)
  async createProduct(
    @RootOrgId() rootOrgId: string,
    @Res() res: Response,
    @Body() productKey: string,
    @Body() name: string,
    @Body() declaredUnit: string,
    @Body() weightUnit: string,
    @Body() weightPerDeclaredUnit: number,
    @Logger() log: AQLogger,
    @Body() category?: string,
    @Body() description?: string,
  ): Promise<Response<CreateProductDTORes>> {
    const products = [{ productKey, name, declaredUnit, weightUnit, weightPerDeclaredUnit, category, description }]

    const extraLogs = {
      rootOrgId,
      products,
    }

    try {
      log.info(`${createPrefix} Attempting to create product`, extraLogs)

      const { ids } = await ProductService.createProducts({ rootOrgId, products })

      log.info(`${createPrefix} Created product`, { extraLogs, ids })

      const event = {
        eventLifecycle: SnsService.LIFECYCLES.COMPLETED,
        eventName: SnsService.EVENTS.PRODUCT_CREATED,
        eventData: { rootOrgId, orgId: rootOrgId, recordIds: ids, action: SnsService.EVENTS.PRODUCT_CREATED },
      }

      log.info(`${createPrefix} Publishing create SNS event `, { ...extraLogs, ...event })

      await SnsService.publishEvent(event)

      log.info(`${createPrefix} Published create SNS event `, extraLogs)

      return res.status(200).json({ id: ids[0] })
    } catch (err) {
      log.error(
        `${logPrefix}: ${CREATE_PRODUCT_METHOD} ${API_BASE_ROUTES.PUBLIC}/${CREATE_PRODUCT_URI}`,
        { rootOrgId },
        new LogCode(LogCode.APP_CODES.PRODUCT_LIST_CANNOT_CREATE_PRODUCT),
        err,
      )

      if (isInstance(err, ResError)) throw err

      return res.status(500).json({ error: PRODUCT_ERRORS.UNABLE_TO_CREATE })
    }
  }
}
