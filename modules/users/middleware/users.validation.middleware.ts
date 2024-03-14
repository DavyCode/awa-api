import express from 'express';
import Joi from 'joi';
import ServerResponseStatus from '../../../common/constant/responseStatus';
import { BadRequestError } from '../../../common/utils/errors';

class UserValidationMiddleware {
  async CreateUserValidator(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) {

    let schema: any = {};
    
    if (!req.body.accountType) {
      throw new BadRequestError('Provide a valid account type')
    }

    if (req.body.accountType === 'Individual') {
      schema = Joi.object()
        .keys({
          email: Joi.string().email().required(),
          password: Joi.string().min(8).required(),
          firstName: Joi.string().min(2).max(50).required(),
          lastName: Joi.string().min(2).max(50).required(),
          howDidYouHearAboutUs: Joi.string().required(),
          referredBy: Joi.string(),
          country: Joi.string().required(),
          phoneNumber: Joi.string()
            .pattern(new RegExp("^[0-9]"))
            .min(5)
            .max(20)
            .required(),
          phoneCountryCode: Joi.string().min(2).required(),
          accountType: Joi.string().required(),
        })
        .with('phoneNumber', 'password');
    } 
    else if (req.body.accountType === 'Business') {
      schema = Joi.object()
        .keys({
          email: Joi.string().email().required(),
          password: Joi.string().min(8).required(),
          firstName: Joi.string().min(2).max(50).required(),
          lastName: Joi.string().min(2).max(50).required(),
          howDidYouHearAboutUs: Joi.string().required(),
          referredBy: Joi.string(),
          country: Joi.string().required(),
          businessName: Joi.string().required(),
          businessLocation: Joi.string().required(),
          phoneNumber: Joi.string()
            .pattern(new RegExp("^[0-9]"))
            .min(5)
            .max(20)
            .required(),
          phoneCountryCode: Joi.string().min(2).required(),
          accountType: Joi.string().required(),
        })
        .with('phoneNumber', 'password');
    }
    else {
      throw new BadRequestError(`Provide a valid account type ['Individual', 'Business']`)
    }

    try {
      await schema.validateAsync(req.body);
      return next();
    } catch (err: any) {
      return res
        .status(400)
        .json({ status: 'error', message: `${err.details[0].message}` });
    }
  }

  async CreateBusinessValidator(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) {
    const schema = Joi.object()
      .keys({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        firstName: Joi.string().min(2).max(50).required(),
        lastName: Joi.string().min(2).max(50).required(),
				howDidYouHearAboutUs: Joi.string().required(),
				referredBy: Joi.string(),
        country: Joi.string().required(),
        businessName: Joi.string().required(),
        businessLocation: Joi.string().required(),
				phoneNumber: Joi.string()
					.pattern(new RegExp("^[0-9]"))
					.min(5)
					.max(20)
					.required(),
				phoneCountryCode: Joi.string().min(2).required(),
      })
      .with('phoneNumber', 'password');

    try {
      await schema.validateAsync(req.body);
      return next();
    } catch (err: any) {
      return res
        .status(400)
        .json({ status: 'error', message: `${err.details[0].message}` });
    }
  }

  async emailValidator(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) {
    const schema = Joi.object().keys({
      email: Joi.string().email().required(),
    });

    try {
      await schema.validateAsync(req.body);
      return next();
    } catch (err: any) {
      return res.status(400).json({
        status: ServerResponseStatus.RESPONSE_STATUS_FAILURE,
        errors: [`${err.details[0].message}`],
      });
    }
  }

  async emailParamsValidator(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) {
    const schema = Joi.object().keys({
      email: Joi.string().email().required(),
    });

    try {
      await schema.validateAsync(req.params);
      return next();
    } catch (err: any) {
      return res.status(400).json({
        status: ServerResponseStatus.RESPONSE_STATUS_FAILURE,
        errors: [`${err.details[0].message}`],
      });
    }
  }

  async passwordResetConfirmValidator(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) {
    const schema = Joi.object().keys({
      otp: Joi.string().min(4).max(10).pattern(new RegExp('^[0-9]')).required(),
      password: Joi.string().min(8).required(),
    });

    try {
      await schema.validateAsync(req.body);
      return next();
    } catch (err: any) {
      return res.status(400).json({
        status: ServerResponseStatus.RESPONSE_STATUS_FAILURE,
        errors: [`${err.details[0].message}`],
      });
    }
  }

}

export default new UserValidationMiddleware();
