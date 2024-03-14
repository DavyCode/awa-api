import express from "express";
import Joi from "joi";
import ServerResponseStatus from "../constant/responseStatus";

class CommonValidationMiddleware {
	async validatePhoneParams(
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) {
		const schema = Joi.object().keys({
			phoneNumber: Joi.string()
				// .pattern(new RegExp("^[0-9]"))
				.min(5)
				.max(25)
				.required(),
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
}

export default new CommonValidationMiddleware();
