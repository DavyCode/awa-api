import JWTMiddleware from "./jwt.middleware";
import { Request, Response, NextFunction } from "express";
import { JWT_BEARER } from "../../../config/env";

class checkHeaders {
	/**
	 * checkHeadersForAuthorization
	 * @param request
	 * @param response
	 * @param next
	 */
	async checkHeadersForAuthorization(
		request: Request,
		response: Response,
		next: NextFunction
	): Promise<void> {
		if (
			request.headers &&
			request.headers.authorization &&
			request.headers.authorization.split(" ")[0] === JWT_BEARER
		) {
			const userJWT = await JWTMiddleware.verifyAuthToken(
				request.headers.authorization
			);

			if (userJWT) {
				response.locals.jwt = userJWT;
				next();
			} else {
				response.locals.jwt = undefined;
				next();
			}
		} else {
			response.locals.jwt = undefined;
			next();
		}
	}
}

export default new checkHeaders();
