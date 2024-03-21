import express from 'express';
import { CommonRoutesConfig } from '../../common/common.routes.config';
import { API_BASE_URI } from '../../config/env';
import ValidationMiddleware from './middleware/plan.validation.middleware';
import planController from './controllers/plans.controller';

export class PlanRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, 'PlanRoutes');
  }

  configureRoutes(): express.Application {
    this.app
      .post(`${API_BASE_URI}/plans`, [
        ValidationMiddleware.createPlanValidator,
        planController.create,
      ])
      .get(`${API_BASE_URI}/plans`, [planController.findAll]);

    this.app.get(`${API_BASE_URI}/plans/:id`, [planController.findById]);

    this.app.patch(`${API_BASE_URI}/plans/:id`, [planController.update]);

    this.app.delete(`${API_BASE_URI}/plans/:id`, [planController.delete]);

    return this.app;
  }
}
