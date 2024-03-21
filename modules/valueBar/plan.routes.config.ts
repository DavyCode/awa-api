import express from 'express';
import { CommonRoutesConfig } from '../../common/common.routes.config';
import { API_BASE_URI } from '../../config/env';
import ValidationMiddleware from './middleware/plan.validation.middleware';
import PlansController from './controllers/plans.controller';
import AuthMiddleware from '../auth/middleware/auth.middleware';
import UsersMiddleware from '../users/middleware/users.middleware';
import JwtMiddleware from '../auth/middleware/jwt.middleware';

export class PlanRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, 'PlanRoutes');
  }

  configureRoutes(): express.Application {
    this.app
    .route(`${API_BASE_URI}/plans`)
    .all(
        AuthMiddleware.ensureAuth,
        UsersMiddleware.validateAuthUserExist,
        JwtMiddleware.validJWTNeeded,
    )
    .post( 
        ValidationMiddleware.createPlanValidator,
        PlansController.create,
      )
      .get(PlansController.findAll);

    this.app
    .route(`${API_BASE_URI}/plans/:id`)
    .all(
        AuthMiddleware.ensureAuth,
        UsersMiddleware.validateAuthUserExist,
        JwtMiddleware.validJWTNeeded,
    )
    .get(PlansController.findById)
    .patch(PlansController.update)
    .delete(PlansController.delete);

    return this.app;
  }
}
