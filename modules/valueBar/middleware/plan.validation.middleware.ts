import express from 'express';
import Joi from 'joi';
import ServerResponseStatus from '../../../common/constant/responseStatus';

class PlanValidationMiddleware {
  async createPlanValidator(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) {
    const schema = Joi.object()
      .keys({
        name: Joi.string().required(),
        description: Joi.string().required(),
        amount: Joi.number().required(),
        interval: Joi.string().required(),
      })

    try {
      await schema.validateAsync(req.body);
      return next();
    } catch (err: any) {
      return res
        .status(ServerResponseStatus.BAD_REQUEST)
        .json({ status: 'error', message: `${err.details[0].message}` });
    }
  }
}

export default new PlanValidationMiddleware();
