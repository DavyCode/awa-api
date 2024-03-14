import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {
  JWT_SECRET,
  JWT_EXPIRATION_MINUTES,
  JWT_REFRESH_TIME,
  JWT_REFRESH_TYPE
} from '../../../config/env';
import { Jwt } from '../../../common/types/jwt';
import { UserDto } from '../../users/dto/user.dto';
import CacheService from '../../../setup/cache.service';

// @ts-expect-error
const jwtSecret: string = JWT_SECRET;
const tokenExpirationInSeconds = JWT_EXPIRATION_MINUTES;
const refreshExpirationInSeconds = JWT_REFRESH_TIME;

class JwtMiddleware {
  validJWTNeeded(req: Request, res: Response, next: NextFunction) {
    if (req.headers['authorization']) {
      try {
        const authorization = req.headers['authorization'].split(' ');
        if (authorization[0] !== 'Bearer') {
          return res
            .status(401)
            .send({ status: 'error', error: 'Unauthorized' });
        } else {
          res.locals.jwt = jwt.verify(authorization[1], jwtSecret) as any;
          next();
        }
      } catch (err: any) {
        return res.status(403).send({
          status: 'error',
          error: 'Unauthorized! something went wrong',
          message: err,
        });
      }
    } else {
      return res.status(401).send({
        status: 'error',
        error: 'Unauthorized! Authorization Header missing',
      });
    }
  }

  genToken(user: UserDto) {
    const token = jwt.sign(
      {
        role: user.role,
        userId: user._id,
        iat: Date.now(),
      },
      jwtSecret,
      { expiresIn: tokenExpirationInSeconds, subject: user.phoneNumber },
    );

    const refresh = jwt.sign(
      {
        types: JWT_REFRESH_TYPE,
        role: user.role,
        userId: user._id,
        iat: Date.now(),
      },
      jwtSecret,
      {
        expiresIn: refreshExpirationInSeconds,
        subject: user.phoneNumber,
      },
    );

    return { token, refresh };
  }

  /**
   * verifyToken
   * @param token
   * @returns
   */
  async verifyAuthToken(accessToken: string) {
    const token = accessToken.split(' ')[1];
    if (token) {
      try {
        const decode = jwt.verify(token, jwtSecret);

        return decode;
      } catch (err) {
        return undefined;
      }
    } else {
      return undefined;
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    if (req.body.refreshToken) {
      try {
        const token = req.body.refreshToken;
        const decoded: any = jwt.verify(token, jwtSecret);

        if (decoded.types !== JWT_REFRESH_TYPE) {
          return res
            .status(403)
            .send({ status: 'error', error: 'Invalid token type' });
        }

        const value = await CacheService.getCacheAsync(token);
        if (value) {
          return res
            .status(400)
            .send({ status: 'error', error: 'Refresh token already used' });
        }
        
        res.locals.email = decoded.sub;
        next();
      } catch (err: any) {
        return res
          .status(403)
          .send({ status: 'error', error: 'Invalid refresh token' });
      }
    } else {
      return res.status(400).send({
        status: 'error',
        error: 'Refresh token is not present',
      });
    }
  }
}

export default new JwtMiddleware();
