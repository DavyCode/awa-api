import express from 'express';
import { CommonRoutesConfig } from '../../common/common.routes.config';
import ValidationMiddleware from './middleware/auth.validation.middleware';
import AuthMiddleware from './middleware/auth.middleware';
import authController from './controllers/auth.controller';
import { API_BASE_URI } from '../../config/env';
import JwtMiddleware from './middleware/jwt.middleware';
import { cleanFullPhoneNumberMiddleware, cleanPhoneNumberMiddleware } from '../../common/utils/phone.utils';
import CommonValidationMiddleware from "../../common/middleware/common.validation.middleware";

export class AuthRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, 'AuthRoutes');
  }

  configureRoutes(): express.Application {
    this.app.post(`${API_BASE_URI}/auth`, [
      ValidationMiddleware.LoginValidator,
      // cleanFullPhoneNumberMiddleware,
      AuthMiddleware.verifyUserPassword,
      authController.createJWT,
    ]);

    this.app.post(`${API_BASE_URI}/auth/refresh`, [
      ValidationMiddleware.RefreshValidator,
      JwtMiddleware.refresh,
      authController.refreshToken,
    ]);

    this.app.get(`${API_BASE_URI}/auth/phone/verify/:phoneNumber`, [
      CommonValidationMiddleware.validatePhoneParams,
      cleanFullPhoneNumberMiddleware,
      authController.sendPhoneVerifyOtp
    ]);

    this.app.post(`${API_BASE_URI}/auth/phone/verify`, [
      ValidationMiddleware.verifyPhoneValidator,
      cleanFullPhoneNumberMiddleware,
      authController.verifyPhoneOtp
    ]);

    this.app.get(`${API_BASE_URI}/auth/email/verify/:email`, [
      ValidationMiddleware.emailParamsValidator,
      authController.sendEmailVerifyToken,
    ]);

    this.app.post(`${API_BASE_URI}/auth/email/verify`, [
      ValidationMiddleware.confirmEmailTokenValidator,
      authController.confirmEmailVerifyToken
    ]);

    return this.app;
  }
}
