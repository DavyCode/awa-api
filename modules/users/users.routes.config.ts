import express from 'express';
import { CommonRoutesConfig } from '../../common/common.routes.config';
import UsersController from './controllers/users.controller';
import UsersMiddleware from './middleware/users.middleware';
import ValidationMiddleware from './middleware/users.validation.middleware';
import JwtMiddleware from '../auth/middleware/jwt.middleware';
import AuthMiddleware from '../auth/middleware/auth.middleware';
import { API_BASE_URI } from '../../config/env';
import { cleanFullPhoneNumberMiddleware, cleanPhoneNumberMiddleware } from '../../common/utils/phone.utils';
import CommonValidationMiddleware from "../../common/middleware/common.validation.middleware";

export class UsersRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, 'UsersRoutes');
  }

  /**
   * Execute default abstract class from parent...
   */
  configureRoutes() {
    this.app
      .route(`${API_BASE_URI}/users`)
      .post(
        ValidationMiddleware.CreateUserValidator,
        cleanPhoneNumberMiddleware,
        UsersController.createUser,
      );

    // this.app
    //   .route(`${API_BASE_URI}/users/business`)
    //   .post(
    //     ValidationMiddleware.CreateBusinessValidator,
    //     cleanPhoneNumberMiddleware,
    //     UsersController.createUser,
    //   );

    this.app
      .route(`${API_BASE_URI}/users/:userId`)
      .all(
        AuthMiddleware.ensureAuth,
        UsersMiddleware.validateAuthUserExist,
        JwtMiddleware.validJWTNeeded,
      )
      .get(
        AuthMiddleware.grantRoleAccess('readOwn', 'User'),
        UsersController.getUserById,
      );
    // .put(
    //   AuthMiddleware.grantRoleAccess('updateOwn', 'User'),
    // 	ValidationMiddleware.UpdateUserValidator,
    // 	UsersController.updateUser
    // )
    // .patch(
    // 	AuthMiddleware.grantRoleAccess("updateOwn", "User"),
    // 	ValidationMiddleware.UpdateUserValidator,
    // 	UsersController.patchUser
    // );

    this.app.get(`${API_BASE_URI}/users/profile/fetch`, [
      AuthMiddleware.ensureAuth,
      UsersMiddleware.validateAuthUserExist,
      AuthMiddleware.grantRoleAccess('readOwn', 'User'),
      UsersController.getUserProfile,
    ]);

    // this.app
    //   .route(`${API_BASE_URI}/users/password/reset/:phoneNumber`)
    //   .all(CommonValidationMiddleware.validatePhoneParams, cleanFullPhoneNumberMiddleware)
    //   .get(UsersController.getPasswordResetOtp);

    this.app.get(`${API_BASE_URI}/users/password/reset/:email`, [
      ValidationMiddleware.emailParamsValidator,
      UsersController.getPasswordResetOtp,
    ]);

    this.app
      .route(`${API_BASE_URI}/users/password/reset`)
      .all(ValidationMiddleware.passwordResetConfirmValidator)
      .post(UsersController.resetPassword);

    /*************************
     * ADMIN SECTION
     ********************************/
    this.app
      .route(`${API_BASE_URI}/admin/users`)
      .get(
        AuthMiddleware.ensureAdmin,
        UsersMiddleware.validateAuthUserExist,
        AuthMiddleware.grantRoleAccess('readAny', 'User'),
        UsersController.getAllUsers,
      );

    return this.app;
  }
}
