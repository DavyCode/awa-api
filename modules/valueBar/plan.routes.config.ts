import express from 'express';
import { CommonRoutesConfig } from '../../common/common.routes.config';
import { API_BASE_URI } from '../../config/env';
import PlanValidationMiddleware from './middleware/plan.validation.middleware';
import SubscriptionValidationMiddleware from './middleware/subscription.validation.middleware';
import PlansController from './controllers/plans.controller';
import AuthMiddleware from '../auth/middleware/auth.middleware';
import UsersMiddleware from '../users/middleware/users.middleware';
import JwtMiddleware from '../auth/middleware/jwt.middleware';
import SubscriptionsController from './controllers/subscriptions.controller';

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
        PlanValidationMiddleware.createPlanValidator,
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
      .patch(
        PlanValidationMiddleware.updatePlanValidator,
        PlansController.update,
      )
      .delete(PlansController.delete);

    // SUBSCRIPTIONS
    this.app
      .route(`${API_BASE_URI}/plans/:id/subscribe`)
      .all(AuthMiddleware.ensureAuth)
      .post(SubscriptionsController.create);

    return this.app;
  }
}
