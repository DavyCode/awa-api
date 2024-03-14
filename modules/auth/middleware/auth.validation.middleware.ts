import express from 'express';
import Joi from 'joi';
import ServerResponseStatus from '../../../common/constant/responseStatus';

class AuthValidationMiddleware {
  async LoginValidator(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) {
    const schema = Joi.object()
      .keys({
        password: Joi.string().min(8).required(),
        email: Joi.string().email().required(),
        // phoneNumber: Joi.string()
        // // .pattern(new RegExp('^[0-9]'))
        // .min(5)
        // .max(25)
        // .required(),
      })
      .with('email', 'password');

    try {
      await schema.validateAsync(req.body);
      return next();
    } catch (err: any) {
      return res
        .status(400)
        .json({ status: 'error', message: `${err.details[0].message}` });
    }
  }
  
  async RefreshValidator(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) {
    const schema = Joi.object().keys({
      refreshToken: Joi.string().required(),
      // email: Joi.string().email().required(),
    });

    try {
      await schema.validateAsync(req.body);
      return next();
    } catch (err: any) {
      return res
        .status(400)
        .json({ status: 'error', message: `${err.details[0].message}` });
    }
  }

  async PhoneValidator(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) {
    const schema = Joi.object().keys({
      phoneNumber: Joi.string()
        .pattern(new RegExp('^[0-9]'))
        .min(5)
        .max(30)
        .required(),
    });

    try {
      await schema.validateAsync(req.body);
      return next();
    } catch (err: any) {
      return res
        .status(400)
        .json({ status: 'error', message: `${err.details[0].message}` });
    }
  }

  async emailTokenValidator(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) {
    const schema = Joi.object().keys({
      // emailToken: Joi.string().min(4).required(),
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

  async confirmEmailTokenValidator(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) {
    const schema = Joi.object().keys({
      emailToken: Joi.string().min(4).required(),
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

  async verifyPhoneValidator(
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) {
		const schema = Joi.object().keys({
			otp: Joi.string().min(4).max(5).required(),
			phoneNumber: Joi.string()
				// .pattern(new RegExp("^[0-9]"))
				.min(5)
				.max(20)
				.required(),
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

export default new AuthValidationMiddleware();
