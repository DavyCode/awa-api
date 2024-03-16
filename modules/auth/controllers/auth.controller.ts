import { Request, Response } from 'express';
import debug from 'debug';
import { JWT_SECRET, JWT_REFRESH_TIME } from '../../../config/env';
import JWTMiddleware from '../middleware/jwt.middleware';
import CacheService from '../../../setup/cache.service';
import UserService from '../../users/services/user.services';
import { apiOKResponse } from '../../../common/utils/apiResponses';
import AuthService from '../services/auth.services';
import Utils from '../../../common/utils/';
import { JWT_EXPIRATION_MINUTES, JWT_BEARER, CLIENT_HOST } from '../../../config/env';
import {
  BadRequestError,
  NotAcceptableError,
  UnauthorizedError,
} from '../../../common/utils/errors';
import UsersDao from "../../users/daos/users.dao";
import sendMail from '../../../common/services/sendMail';

const log: debug.IDebugger = debug('app:auth-controller');

// @ts-expect-error
const jwtSecret: string = JWT_SECRET;
const refreshExpiry: number | undefined = Number(JWT_REFRESH_TIME);

class AuthController {
  async createJWT(req: Request, res: Response) {
    const user = res.locals.user;

    // if (user && !user.emailVerified) {
    //   await AuthService.sendPhoneVerifyOtp(user.phoneNumber);

    //   throw new BadRequestError(
    //     'Account not verified. Check your phone for verification OTP',
    //   );
    // }

    if (user && !user.emailVerified) {
      user.emailVerificationToken = Utils.genRandomNum(0, 15)
      user.updatedAt = Date.now();
      const userEmailToken: any = await UsersDao.save(user)

      await sendMail.sendVerifyEmailToken(user.email, user.firstName, `${CLIENT_HOST}/email_verify?emailToken=${userEmailToken.emailVerificationToken}&email=${userEmailToken.email}`);

      throw new BadRequestError(
        'Email not verified. Check your email for verification link',
      );
    }

    try {
      const { token, refresh } = JWTMiddleware.genToken(user);
      const userData = Utils.cleanUserResponseData(user);

      return res.status(200).send({
        status: 'success',
        data: {
          user: userData,
          message: 'Login successful',
          access_token: token,
          refresh_token: refresh,
          token_type: JWT_BEARER,
          expiresIn: JWT_EXPIRATION_MINUTES,
        },
      });
    } catch (err: any) {
      log('createJWT error: %O', err);
      return res
        .status(500)
        .send({ status: 'error', message: 'Failed to generate Token' });
    }
  }

  async refreshToken(req: Request, res: Response) {
    const email = res.locals.email;
    try {
      const user: any = await UserService.getUserByPhone(email);
      if (!user) {
        return res.status(500).send({
          status: 'error',
          message: 'Refresh user does not exist',
        });
      }
      const refreshToken = req.body.refreshToken;
      await CacheService.setCache(refreshToken, '1', refreshExpiry);

      const { token, refresh } = JWTMiddleware.genToken(user);

      return res.status(200).send({
        status: 'success',
        data: { accessToken: token, refreshToken: refresh },
      });
    } catch (err: any) {
      log('createJWT error: %O', err);
      return res
        .status(500)
        .send({ status: 'error', message: 'Failed to generate refresh Token' });
    }
  }

  async sendEmailVerifyToken(req: Request, res: Response): Promise<void> {
    const { message, ...rest } = await AuthService.sendEmailVerifyOtp(
      req.params.email,
    );
    const controllerRes = new apiOKResponse(rest, message);
    res.status(controllerRes.statusCode).send(controllerRes);
  }

  async confirmEmailVerifyToken(req: Request, res: Response): Promise<void> {
    const { message, ...rest } = await AuthService.confirmEmailVerifyOtp(
      req.body.email,
      req.body.emailToken,
    );
    const controllerRes = new apiOKResponse(rest, message);
    res.status(controllerRes.statusCode).send(controllerRes);
  }

  async sendPhoneVerifyOtp(req: Request, res: Response) {
		const { message, ...rest } = await AuthService.sendPhoneVerifyOtp(
			req.params.phoneNumber
		);
		const controllerRes = new apiOKResponse(rest, message);
		res.status(controllerRes.statusCode).json(controllerRes);
	}

	async verifyPhoneOtp(req: Request, res: Response) {
		const { otp, phoneNumber } = req.body;
		const { message, ...rest } = await AuthService.confirmPhoneVerifyOtp(
			otp,
			phoneNumber
		);
		const controllerRes = new apiOKResponse(rest, message);
		res.status(controllerRes.statusCode).json(controllerRes);
	}
}

export default new AuthController();
